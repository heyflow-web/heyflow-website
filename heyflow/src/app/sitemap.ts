import { MetadataRoute } from 'next';
import { getProjects } from '@/lib/notion';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://heyflow.kr';

  // 노션에서 포트폴리오 목록을 불러와서 사이트맵에 추가
  const projects = await getProjects();
  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...projectUrls,
  ];
}
