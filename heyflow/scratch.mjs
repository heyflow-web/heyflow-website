import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

async function run() {
  const headers = {
    'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };

  // Find page
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers,
  });
  const data = await res.json();
  
  let targetPageId = null;
  for (const page of data.results) {
    const title = page.properties['Name']?.title?.[0]?.plain_text;
    if (title && title.includes('Slow, Salady')) {
      targetPageId = page.id;
      break;
    }
  }

  if (!targetPageId) {
    console.error('Page not found!');
    return;
  }

  // Use raw github url
  const imgUrl = 'https://raw.githubusercontent.com/heyflow-web/heyflow-website/main/public/images/projects/proj-%EC%83%90%EB%9F%AC%EB%93%9C-%ED%94%84%EB%9E%9C%EC%B0%A8%EC%9D%B4%EC%A6%88-%EB%B0%98%EC%9D%91%ED%98%95-%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8-%EA%B5%AC%EC%B6%95-slow-salady-mobile.png';

  const updateRes = await fetch(`https://api.notion.com/v1/pages/${targetPageId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      properties: {
        'Mobile Image': {
          files: [
            {
              type: 'external',
              name: 'mobile-image.png',
              external: {
                url: imgUrl
              }
            }
          ]
        }
      }
    })
  });
  
  if (!updateRes.ok) {
    console.error('Failed to update image:', await updateRes.text());
    return;
  }
  console.log('Image added to Notion!');
}

run().catch(console.error);
