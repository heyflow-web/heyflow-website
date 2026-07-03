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

const getPropertyValue = (property: any, type: string) => {
  if (!property) return '';
  switch (type) {
    case 'title':
      return property.title?.[0]?.plain_text || '';
    case 'rich_text':
      return property.rich_text?.[0]?.plain_text || '';
    case 'url':
      return property.url || '';
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

  return {
    id: page.id,
    title,
    description: getPropertyValue(page.properties['Description'], 'rich_text'),
    pcImage: `/images/projects/proj-${slug}-pc.png`,
    mobileImage: `/images/projects/proj-${slug}-mobile.png`,
    heroImage: `/images/projects/proj-${slug}-hero.png`,
    link: getPropertyValue(page.properties['Link'], 'url'),
    showInHero: page.properties['Hero'] ? getPropertyValue(page.properties['Hero'], 'checkbox') : true,
  };
};

export async function getProjects(): Promise<Project[]> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [{ property: 'Order', direction: 'ascending' }],
    });
    return response.results.map(mapPageToProject);
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
