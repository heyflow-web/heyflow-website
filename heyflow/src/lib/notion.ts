import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { BoardPost } from './dummyBoardData';

export interface Project {
  id: string;
  title: string;
  description: string;
  pcImage: string;
  mobileImage: string;
  heroImage?: string;
  link: string;
  content?: string;
  showInHero?: boolean;
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const INQUIRY_DB_ID = process.env.NOTION_INQUIRY_DB_ID!;

// 사용자가 노션에서 엔터로 생성한 빈 단락을 보존하기 위한 커스텀 변환기
n2m.setCustomTransformer('paragraph', async (block) => {
  const { paragraph } = block as any;
  if (!paragraph.rich_text || paragraph.rich_text.length === 0) {
    return '&nbsp;';
  }
  return false;
});

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
        return file.type === 'external' ? file.external.url : file.file.url;
      }
      return '';
    case 'checkbox':
      return property.checkbox ?? true;
    case 'number':
      return property.number ?? 0;
    default:
      return '';
  }
};

const slugify = (title: string, id: string) => {
  return title ? title.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9가-힣\-]/g, '').toLowerCase() : id.replace(/-/g, '');
};

const mapPageToProject = (page: any): Project => {
  const id = page.id.replace(/-/g, '');
  const title = getPropertyValue(page.properties['Name'], 'title');
  const slug = slugify(title, id);

  const rawPcImage = getPropertyValue(page.properties['PC Image'], 'files');
  const rawMobileImage = getPropertyValue(page.properties['Mobile Image'], 'files');
  let rawHeroImage = getPropertyValue(page.properties['Hero Image'], 'files');
  if (!rawHeroImage && rawPcImage) rawHeroImage = rawPcImage;

  return {
    id: page.id,
    title,
    description: getPropertyValue(page.properties['Description'], 'rich_text'),
    pcImage: rawPcImage ? `/images/projects/proj-${slug}-pc.png` : '',
    mobileImage: rawMobileImage ? `/images/projects/proj-${slug}-mobile.png` : '',
    heroImage: rawHeroImage ? `/images/projects/proj-${slug}-hero.png` : '',
    link: getPropertyValue(page.properties['Link'], 'url'),
    showInHero: page.properties['Hero'] ? getPropertyValue(page.properties['Hero'], 'checkbox') : true,
  };
};

export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sorts: [{ property: 'Order', direction: 'ascending' }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Notion API error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.results.map(mapPageToProject);
  } catch (error) {
    console.error("Error fetching getProjects:", error);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    const project = mapPageToProject(page);
    
    const mdblocks = await n2m.pageToMarkdown(id);
    const mdString = n2m.toMarkdownString(mdblocks);
    project.content = mdString.parent || '';

    return project;
  } catch (error) {
    console.error(`Error fetching getProject(${id}):`, error);
    return null;
  }
}

// ==========================================
// 문의게시판 (Inquiry Board) 연동 로직
// ==========================================

export async function createInquiry(data: { name: string, company: string, contact: string, email: string, budget: string, schedule: string, inquiry: string }) {
  if (!INQUIRY_DB_ID) throw new Error("NOTION_INQUIRY_DB_ID is not set");

  const response = await notion.pages.create({
    parent: { database_id: INQUIRY_DB_ID },
    properties: {
      '이름': { title: [{ text: { content: data.name || '미상' } }] },
      '회사명': { rich_text: [{ text: { content: data.company || '' } }] },
      '연락처': { rich_text: [{ text: { content: data.contact || '' } }] },
      '이메일': { rich_text: [{ text: { content: data.email || '' } }] },
      '예산': { rich_text: [{ text: { content: data.budget || '' } }] },
      '일정': { rich_text: [{ text: { content: data.schedule || '' } }] },
      '문의내용': { rich_text: [{ text: { content: data.inquiry || '' } }] },
      '조회수': { number: Math.floor(Math.random() * 3) + 1 } // 초기 조회수 랜덤 1~3 부여
    }
  });
  return response;
}

export async function getInquiries(): Promise<BoardPost[]> {
  if (!INQUIRY_DB_ID) return [];

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${INQUIRY_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }, // 항상 최신 데이터 가져오기
    });

    if (!res.ok) {
      console.error(`Notion API error: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    
    return data.results.map((page: any, index: number) => {
      const name = getPropertyValue(page.properties['이름'], 'title');
      const company = getPropertyValue(page.properties['회사명'], 'rich_text');
      const views = getPropertyValue(page.properties['조회수'], 'number') || (Math.floor(Math.random() * 4) + 1);
      
      const createdDate = new Date(page.created_time);
      const dateStr = createdDate.toISOString().split('T')[0].replace(/-/g, '.');
      
      // 작성자 마스킹 로직 (예: 김** 또는 회사명(김**))
      const maskedName = name.length > 1 ? name.substring(0, 1) + '*'.repeat(name.length - 1) : name;
      let author = company ? `${company} (${maskedName})` : maskedName;
      if (!author) author = "고객";

      // 새 문의는 모두 홈페이지 제작 문의 등 임의의 제목 표시
      const title = company ? `${company} 홈페이지 제작 문의드립니다.` : "홈페이지 제작 문의드립니다.";

      return {
        id: page.id,
        isNotice: false,
        isSecret: true,
        title,
        author,
        date: dateStr,
        likes: 0,
        views
      };
    });
  } catch (error) {
    console.error("Error fetching getInquiries:", error);
    return [];
  }
}
