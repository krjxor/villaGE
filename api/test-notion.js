export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: {
          database_id: process.env.NOTION_DB_RENTALS_ID,
        },
        properties: {
          이름: {
            title: [
              {
                text: {
                  content: "API 테스트",
                },
              },
            ],
          },
        },
      }),
    });

    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
