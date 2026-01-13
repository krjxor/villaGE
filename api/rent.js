export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Use POST" });
  }

  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    const DB_ID = process.env.NOTION_DB_USERS_ID;

    if (!NOTION_TOKEN) {
      return res.status(500).json({ success: false, message: "Missing NOTION_TOKEN" });
    }
    if (!DB_ID) {
      return res.status(500).json({ success: false, message: "Missing NOTION_DB_USERS_ID" });
    }

    // Vercel will parse JSON automatically when content-type is application/json
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const name = (body?.name ?? "").trim();
    const studentIdRaw = body?.studentId ?? body?.student_id ?? "";
    const phone = (body?.phone ?? "").trim();

    // Basic validation
    if (!name) {
      return res.status(400).json({ success: false, message: "name is required" });
    }
    const studentId = Number(String(studentIdRaw).replace(/\D/g, ""));
    if (!Number.isFinite(studentId) || studentId <= 0) {
      return res.status(400).json({ success: false, message: "studentId must be a valid number" });
    }
    if (!phone) {
      return res.status(400).json({ success: false, message: "phone is required" });
    }

    // Create a new row(page) in Notion database
    // This assumes your "사용자 목록" DB has:
    // - 이름: title
    // - 학번: number
    // - 연락처: phone_number
    const payload = {
      parent: { database_id: DB_ID },
      properties: {
        "이름": {
          title: [{ text: { content: name } }],
        },
        "학번": {
          number: studentId,
        },
        "연락처": {
          phone_number: phone,
        },
      },
    };

    const notionResp = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await notionResp.json();

    if (!notionResp.ok) {
      return res.status(notionResp.status).json({
        success: false,
        message: "Notion API error",
        data,
      });
    }

    return res.status(200).json({
      success: true,
      notion_page_id: data.id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: String(err?.message ?? err),
    });
  }
}

