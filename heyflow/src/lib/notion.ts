import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

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
