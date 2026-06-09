import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import fallbackData from '../data.json';

// 환경 변수에서 API 키와 데이터베이스 ID 가져오기
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const n2m = new NotionToMarkdown({ notionClient: notion });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export interface Project {
  id: string;
  title: string;
  description: string;
  pcImage: string;
  mobileImage: string;
  link: string;
  content?: string;
}

// Notion 속성(Property) 값을 안전하게 추출하는 헬퍼 함수
const getPropertyValue = (property: any, type: string) => {
  if (!property) return '';
  switch (type) {
    case 'title':
      return property.title?.[0]?.plain_text || '';
    case 'rich_text':
      return property.rich_text?.[0]?.plain_text || '';
    case 'url':
      return property.url || '';
    case 'files':
      if (property.files && property.files.length > 0) {
        const file = property.files[0];
        // Notion에 직접 업로드한 파일은 file.url, 외부 링크는 external.url
        return file.type === 'external' ? file.external.url : file.file.url;
      }
      return '';
    default:
      return '';
  }
};

export async function getProjects(): Promise<Project[]> {
  if (!DATABASE_ID) {
    console.warn("NOTION_DATABASE_ID is not set. Using fallback data.json.");
    return fallbackData.map((p: any) => ({ ...p, id: String(p.id) }));
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sorts: [
          {
            timestamp: 'created_time',
            direction: 'descending',
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Notion API error: ${res.statusText}`);
    }

    const data = await res.json();

    return data.results.map((page: any) => {
      return {
        id: page.id,
        title: getPropertyValue(page.properties['Name'], 'title'),
        description: getPropertyValue(page.properties['Description'], 'rich_text'),
        pcImage: getPropertyValue(page.properties['PC Image'], 'files'),
        mobileImage: getPropertyValue(page.properties['Mobile Image'], 'files'),
        link: getPropertyValue(page.properties['Link'], 'url'),
      };
    });
  } catch (error) {
    console.error("Error fetching projects from Notion:", error);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  if (!DATABASE_ID) {
    const project = fallbackData.find((p: any) => String(p.id) === id);
    return project ? { ...project, id: String(project.id) } : null;
  }

  try {
    const page: any = await notion.pages.retrieve({ page_id: id });
    
    // Notion 페이지 내부의 블록(본문 내용)을 마크다운으로 변환
    const mdblocks = await n2m.pageToMarkdown(id);
    const mdString = n2m.toMarkdownString(mdblocks);

    return {
      id: page.id,
      title: getPropertyValue(page.properties['Name'], 'title'),
      description: getPropertyValue(page.properties['Description'], 'rich_text'),
      pcImage: getPropertyValue(page.properties['PC Image'], 'files'),
      mobileImage: getPropertyValue(page.properties['Mobile Image'], 'files'),
      link: getPropertyValue(page.properties['Link'], 'url'),
      content: mdString.parent || '',
    };
  } catch (error) {
    console.error(`Error fetching project ${id} from Notion:`, error);
    return null;
  }
}
