import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function setupHeroColumn() {
  console.log("Adding 'Hero' column to Notion DB...");
  try {
    await notion.databases.update({
      database_id: DATABASE_ID,
      properties: {
        'Hero': { checkbox: {} }
      }
    });
    console.log("✅ 'Hero' column added.");
    
    // Set all to true except YG Logis
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    
    for (const page of data.results) {
      const titleObj = page.properties['Name']?.title?.[0];
      const title = titleObj ? titleObj.plain_text : '';
      const isYG = title.toLowerCase().includes('yg');
      
      await notion.pages.update({
        page_id: page.id,
        properties: {
          'Hero': { checkbox: !isYG }
        }
      });
      console.log(`Updated ${title || page.id} -> Hero: ${!isYG}`);
    }
    console.log("✅ All pages updated.");
  } catch (e) {
    console.error("Error:", e);
  }
}

setupHeroColumn();
