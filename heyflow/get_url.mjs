import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

async function run() {
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  
  for (const page of data.results) {
    const title = page.properties['Name']?.title?.[0]?.plain_text;
    if (title && (title.includes('프렌차이즈') || title.includes('프랜차이즈'))) {
      const link = page.properties['Link']?.url;
      console.log('Found URL:', link);
      return;
    }
  }
}
run();
