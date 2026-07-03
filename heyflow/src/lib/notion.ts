import fallbackData from '../data.json';

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

export async function getProjects(): Promise<Project[]> {
  // 로컬에 동기화된 data.json에서 프로젝트 목록을 불러옵니다.
  // 로딩 속도 최적화를 위해 Notion API 실시간 호출을 제거했습니다.
  return fallbackData.map((p: any) => ({ ...p, id: String(p.id) }));
}

export async function getProject(id: string): Promise<Project | null> {
  const project = fallbackData.find((p: any) => String(p.id) === id);
  return project ? { ...project, id: String(project.id) } : null;
}
