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
  
  if (data.results.length > 0) {
    console.log('Properties:', Object.keys(data.results[0].properties));
  }
}
run();
