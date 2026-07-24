import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

async function run() {
  const headers = {
    'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };

  // 1. Find the page
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers,
  });
  const data = await res.json();
  
  let targetPageId = null;
  for (const page of data.results) {
    const title = page.properties['Name']?.title?.[0]?.plain_text;
    if (title && (title === '프렌차이즈 홈페이지' || title.includes('프렌차이즈'))) {
      targetPageId = page.id;
      break;
    }
  }

  if (!targetPageId) {
    console.error('Page not found!');
    return;
  }

  // 2. Update properties
  const newTitle = '샐러드 프랜차이즈 반응형 웹사이트 구축 (Slow, Salady)';
  const newDesc = "건강한 F&B 프랜차이즈 'Slow, Salady'의 공식 웹사이트 제작 사례입니다. 식욕을 돋우는 그리너리(Greenery) 톤앤매너와 가맹점 찾기 및 모바일 주문 최적화 UI/UX를 설계했습니다.";

  const updateRes = await fetch(`https://api.notion.com/v1/pages/${targetPageId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      properties: {
        'Name': {
          title: [
            { text: { content: newTitle } }
          ]
        },
        'Description': {
          rich_text: [
            { text: { content: newDesc } }
          ]
        }
      }
    })
  });
  
  if (!updateRes.ok) {
    console.error('Failed to update properties:', await updateRes.text());
    return;
  }
  console.log('Properties updated!');

  // 3. Append blocks
  const appendRes = await fetch(`https://api.notion.com/v1/blocks/${targetPageId}/children`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      children: [
        {
          heading_2: {
            rich_text: [{ text: { content: '프로젝트 개요 (Overview)' } }]
          }
        },
        {
          paragraph: {
            rich_text: [{ text: { content: "신선한 샐러드와 웜볼 등 건강식 메뉴를 제공하는 F&B 프랜차이즈 'Slow, Salady'의 공식 웹사이트를 구축했습니다. 식욕을 돋우는 그리너리(Greenery) 톤앤매너를 바탕으로, 모바일 환경에 최적화된 앱 라이크(App-like) UI를 구현하여 사용자 경험을 극대화했습니다." } }]
          }
        },
        {
          heading_2: {
            rich_text: [{ text: { content: '주요 특징 및 해결 과제 (Key Features)' } }]
          }
        },
        {
          heading_3: {
            rich_text: [{ text: { content: '1. 직관적인 메뉴 쇼케이스' } }]
          }
        },
        {
          paragraph: {
            rich_text: [{ text: { content: '샐러드, 웜볼, 샌드위치 등 다채로운 메뉴를 고해상도 이미지와 함께 카드형 UI로 배치하여 시각적 만족도와 가독성을 높였습니다.' } }]
          }
        },
        {
          heading_3: {
            rich_text: [{ text: { content: '2. 모바일 친화적 주문 및 배달 연동' } }]
          }
        },
        {
          paragraph: {
            rich_text: [{ text: { content: '스마트폰 화면에서도 빠르고 쉽게 메뉴를 확인하고, 즉시 배달 주문 탭으로 넘어갈 수 있도록 하단 플로팅 탭바(Tab bar)를 활용한 앱 스타일 구조를 적용했습니다.' } }]
          }
        },
        {
          heading_3: {
            rich_text: [{ text: { content: '3. 매장 찾기(가맹점 맵) 기능 연동' } }]
          }
        },
        {
          paragraph: {
            rich_text: [{ text: { content: '전국 가맹점 위치를 직관적으로 찾을 수 있는 지도 기반 매장 찾기 기능을 도입하여, 오프라인 매장 방문을 유도하고 고객 편의성을 대폭 향상시켰습니다.' } }]
          }
        },
        {
          heading_2: {
            rich_text: [{ text: { content: '프로젝트 성과 (Result)' } }]
          }
        },
        {
          paragraph: {
            rich_text: [{ text: { content: '건강한 F&B 브랜드로서의 프리미엄 정체성을 확립하고, 온라인 트래픽을 오프라인 및 배달 매출로 연결하는 전환율 높은 세련된 반응형 웹사이트가 완성되었습니다.' } }]
          }
        }
      ]
    })
  });

  if (!appendRes.ok) {
    console.error('Failed to append blocks:', await appendRes.text());
    return;
  }
  console.log('Blocks appended successfully!');
}

run().catch(console.error);
