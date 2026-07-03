import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function updateYGLogis() {
  console.log("Searching for YG Logis project...");
  
  // Find the page
  const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    }
  });

  const responseData = await response.json();

  const targetPage = responseData.results.find(page => {
    const titleObj = page.properties['Name']?.title?.[0];
    const url = page.properties['Link']?.url;
    const title = titleObj ? titleObj.plain_text : '';
    return title.toLowerCase().includes('yg') || (url && url.includes('yglogis'));
  });

  if (!targetPage) {
    console.error("❌ Could not find a page related to YG Logis. Please make sure you added the row.");
    
    // Let's print all titles to see what's there
    console.log("Available pages:");
    responseData.results.forEach(p => {
       const titleObj = p.properties['Name']?.title?.[0];
       console.log(" - ", titleObj ? titleObj.plain_text : 'Untitled');
    });
    return;
  }

  console.log(`Found page: ${targetPage.id}`);

  // Update Properties
  await notion.pages.update({
    page_id: targetPage.id,
    properties: {
      'Name': {
        title: [
          { text: { content: 'YG 로지스 물류 전문 B2B 반응형 웹사이트 제작' } }
        ]
      },
      'Description': {
        rich_text: [
          { text: { content: "국내 Top-Tier 물류 서비스를 제공하는 '와이지로지스틱스'의 B2B 반응형 웹사이트 제작 사례입니다. 대형 파트너사를 통한 브랜드 신뢰도 구축, 직관적인 매물 정보 게시판 설계, 견적 문의 전환율을 극대화하는 맞춤형 UI/UX 디자인을 진행했습니다." } }
        ]
      }
    }
  });
  console.log("✅ Updated Properties (Title & Description)");

  // Add Blocks (Content)
  // Blocks are already updated via MCP API, so we skip this
}
updateYGLogis().catch(console.error);
