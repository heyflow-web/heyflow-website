import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

const getTemplate = (title) => {
  const isMedical = title.includes('피부과') || title.includes('정형외과') || title.includes('치과') || title.includes('한의원');
  const isBeauty = title.includes('뷰티 디바이스');
  
  let keyword = '전문적인 서비스';
  let category = '브랜드';
  
  if (title.includes('피부과')) { keyword = '프리미엄 안티에이징 및 스킨케어'; category = '피부과'; }
  else if (title.includes('정형외과')) { keyword = '정확한 진단과 비수술적 치료'; category = '정형외과'; }
  else if (title.includes('치과')) { keyword = '임플란트 및 심미보철 특화 진료'; category = '치과'; }
  else if (title.includes('한의원')) { keyword = '근본을 치료하는 맞춤형 한방 진료'; category = '한의원'; }
  else if (title.includes('뷰티')) { keyword = '혁신적인 홈케어 솔루션'; category = '뷰티 브랜드'; }

  const desc = `고객에게 최고의 만족을 선사하는 ${category}의 웹사이트 제작 사례입니다. ${keyword}를 강조하여 브랜드 신뢰도를 높이고, 직관적인 정보 탐색과 문의 전환율을 극대화하는 맞춤형 UI/UX 디자인을 진행했습니다.`;

  const mdString = `# 1. 프로젝트 배경 및 기획 의도
${category} 비즈니스는 방문 고객에게 '신뢰감'과 '정확한 정보'를 제공하는 것이 핵심입니다. 다소 딱딱하고 복잡할 수 있는 기존 홈페이지 형태에서 벗어나, 트렌디하면서도 전문성을 강조할 수 있는 반응형 웹사이트를 기획했습니다. 사용자가 원하는 정보(진료/제품 안내, 상담 문의)에 최소한의 클릭으로 도달할 수 있도록 정보 구조(IA)를 개편하는 것에 중점을 두었습니다.

# 2. 해결 과제 및 디자인 전략 (UI/UX)
## 신뢰감을 압도하는 메인 비주얼 및 브랜딩
${category} 특유의 전문성과 안정성을 시각적으로 전달하기 위해, 메인 화면(Hero Section)에 신뢰감을 주는 브랜드 컬러와 고해상도 비주얼을 배치했습니다. 방문자에게 즉각적인 확신을 심어주도록 레이아웃을 디자인했습니다.

## 가독성을 극대화한 정보 전달 UI
방문 빈도가 높은 핵심 메뉴의 정보 전달력을 최우선으로 고려했습니다. 불필요한 시각적 요소를 덜어내고, 복잡한 텍스트 정보를 카드(Card)와 표(Table) 형태로 깔끔하게 정리하여 모바일 환경에서도 직관성을 높였습니다.

## 전환율(CVR)을 높이는 직관적인 문의 폼
웹사이트의 궁극적인 목표인 '리드(고객 문의) 확보'를 위해 사용자 동선을 단축했습니다. 사용자가 별도의 페이지로 이탈할 필요 없이 메인 페이지 내에서 즉시 필요한 내용을 입력하고 전송할 수 있는 직관적인 폼(Form)을 제공합니다.

# 3. 프로젝트 성과 및 기술 스펙
* **반응형 웹 디자인(Responsive Web):** PC, 태블릿, 모바일까지 기기 환경에 맞춰 이미지와 텍스트 레이아웃이 자연스럽게 변환되도록 구축하여 모바일 접근성을 크게 향상시켰습니다.
* **SEO 최적화:** ${category} 관련 핵심 키워드 검색 시 상위 노출이 유리하도록 체계적인 헤딩(H1~H3) 태그를 적용하고 가벼운 로딩 속도를 구현했습니다.`;

  return { desc, mdString };
};

const mdToBlocks = (mdString) => {
  const blocks = [];
  const lines = mdString.split('\\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      blocks.push({ heading_1: { rich_text: [{ text: { content: line.substring(2) } }] } });
    } else if (line.startsWith('## ')) {
      blocks.push({ heading_2: { rich_text: [{ text: { content: line.substring(3) } }] } });
    } else if (line.startsWith('* **')) {
      const parts = line.substring(4).split('**');
      const boldText = parts[0];
      const normalText = parts.slice(1).join('**');
      blocks.push({
        bulleted_list_item: {
          rich_text: [
            { text: { content: boldText }, annotations: { bold: true } },
            { text: { content: normalText } }
          ]
        }
      });
    } else if (line.trim() !== '') {
      blocks.push({ paragraph: { rich_text: [{ text: { content: line } }] } });
    }
  }
  return blocks;
};

async function updateAllSeo() {
  console.log("Fetching databases to update other portfolios...");
  
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
    
    if (title.toLowerCase().includes('yg')) {
      console.log(`Skipping YG Logis: ${title}`);
      continue;
    }

    console.log(`\n🔄 Updating: ${title} (${page.id})`);
    const { desc, mdString } = getTemplate(title);

    // 1. Update Description Property
    await notion.pages.update({
      page_id: page.id,
      properties: {
        'Description': {
          rich_text: [{ text: { content: desc } }]
        }
      }
    });

    // 2. Delete existing blocks
    let hasMore = true;
    let cursor = undefined;
    while (hasMore) {
      const blocksResponse = await notion.blocks.children.list({
        block_id: page.id,
        start_cursor: cursor
      });
      for (const block of blocksResponse.results) {
        await notion.blocks.delete({ block_id: block.id });
      }
      hasMore = blocksResponse.has_more;
      cursor = blocksResponse.next_cursor;
    }

    // 3. Append new SEO blocks
    const newBlocks = mdToBlocks(mdString);
    await notion.blocks.children.append({
      block_id: page.id,
      children: newBlocks
    });

    console.log(`✅ Updated ${title}`);
  }
  console.log("\n🎉 All other portfolios updated successfully.");
}

updateAllSeo().catch(console.error);
