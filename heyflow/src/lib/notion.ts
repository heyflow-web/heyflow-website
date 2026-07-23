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
    case 'phone_number':
      return property.phone_number || '';
    case 'email':
      return property.email || '';
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

  const properties: any = {
    '작성자명': { title: [{ text: { content: data.name || '미상' } }] },
    '회사명': { rich_text: [{ text: { content: data.company || '' } }] },
    '예산': { rich_text: [{ text: { content: data.budget || '' } }] },
    '문의내용': { rich_text: [{ text: { content: data.inquiry || '' } }] },
    '조회수': { rich_text: [{ text: { content: String(Math.floor(Math.random() * 3) + 1) } }] }
  };

  if (data.contact) {
    properties['연락처'] = { phone_number: data.contact };
  }
  if (data.email) {
    properties['이메일'] = { email: data.email };
  }
  // 일정(date) 필드는 ISO 8601 포맷이 아닐 수 있으므로 오류를 피하기 위해 생략 (문의내용에 포함됨)

  const response = await notion.pages.create({
    parent: { database_id: INQUIRY_DB_ID },
    properties
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
      const name = getPropertyValue(page.properties['작성자명'], 'title');
      const company = getPropertyValue(page.properties['브랜드명'], 'rich_text');
      const isNotice = page.properties['공지사항']?.checkbox || false;
      
      const viewsStr = getPropertyValue(page.properties['조회수'], 'rich_text');
      let views = parseInt(viewsStr, 10);
      if (isNaN(views)) views = isNotice ? 724 : 0;
      
      const createdDate = new Date(page.created_time);
      const dateStr = createdDate.toISOString().split('T')[0].replace(/-/g, '.');
      
      // 작성자 브랜드명 기준 마스킹 로직 (두, 세 번째 글자를 ** 처리)
      const maskText = (text: string) => {
        if (!text) return "";
        if (text.length === 1) return text;
        if (text.length === 2) return text.substring(0, 1) + '*';
        if (text.length === 3) return text.substring(0, 1) + '**';
        return text.substring(0, 1) + '**' + text.substring(3);
      };

      let author = company ? maskText(company) : maskText(name);
      if (!author) author = "고객";

      const inquiryContent = getPropertyValue(page.properties['문의내용'], 'rich_text');
      
      let title = "";
      if (isNotice) {
        title = name || "공지사항입니다.";
        author = "heyflow";
      } else {
        let projectTypeStr = "홈페이지 제작"; // 기본값
        if (inquiryContent) {
          const match = inquiryContent.match(/프로젝트 타입:\s*(.+)/);
          if (match && match[1]) {
            const types = match[1].split(',');
            projectTypeStr = types[0].trim();
          }
        }
        title = `${projectTypeStr} 문의가 작성되었어요.`;
      }

      return {
        id: page.id,
        isNotice,
        isSecret: !isNotice, // 공지사항은 비밀글 아님
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

export async function verifyInquiry(id: string, phone: string) {
  if (!INQUIRY_DB_ID) return { success: false, message: "DB_ID not set" };

  if (id.length < 20) {
    return { 
      success: true, 
      data: { 
        content: "이 글은 홈페이지 시연 및 레이아웃 확인 용도로 작성된 임시 데이터입니다.\n(실제 문의 내용이 존재하지 않습니다.)",
        email: "test@heyflow.co.kr",
        budget: "해당 없음"
      } 
    };
  }

  try {
    const page = await notion.pages.retrieve({ page_id: id }) as any;
    const isNotice = page.properties['공지사항']?.checkbox || false;

    const viewsStr = getPropertyValue(page.properties['조회수'], 'rich_text');
    let currentViews = parseInt(viewsStr, 10);
    if (isNaN(currentViews)) currentViews = isNotice ? 724 : 0;

    const incrementViews = () => {
      notion.pages.update({
        page_id: id,
        properties: {
          '조회수': {
            rich_text: [{ text: { content: String(currentViews + 1) } }]
          }
        }
      }).catch(err => console.error("Failed to update view count:", err));
    };

    if (isNotice) {
      const content = getPropertyValue(page.properties['문의내용'], 'rich_text');
      incrementViews();
      return { success: true, data: { content, email: '', budget: '' } };
    }

    const savedPhone = getPropertyValue(page.properties['연락처'], 'phone_number');
    
    // Remove dashes and spaces for comparison
    const cleanSavedPhone = savedPhone.replace(/[^0-9]/g, '');
    const cleanInputPhone = phone.replace(/[^0-9]/g, '');

    if (cleanSavedPhone === cleanInputPhone && cleanSavedPhone !== '') {
      const content = getPropertyValue(page.properties['문의내용'], 'rich_text');
      const email = getPropertyValue(page.properties['이메일'], 'email');
      const budget = getPropertyValue(page.properties['예산'], 'rich_text');
      
      incrementViews();
      return { success: true, data: { content, email, budget } };
    } else {
      return { success: false, message: "입력하신 연락처가 일치하지 않습니다." };
    }
  } catch (error) {
    console.error("Error verifying inquiry:", error);
    return { success: false, message: "해당 글을 찾을 수 없거나 서버 오류가 발생했습니다." };
  }
}
