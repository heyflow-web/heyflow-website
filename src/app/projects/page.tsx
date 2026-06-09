import { getProjects } from '@/lib/notion';
import Link from 'next/link';

export const revalidate = 60; // 최신 프로젝트 반영을 위한 1분 단위 재검증

export default async function Projects() {
  const data = await getProjects();
  return (
    <main className="container">
      <h1 className="page-title">PROJECT</h1>
      
      <div className="gallery">
        {data.map((item) => (
          <Link href={`/projects/${item.id}`} className="project-card" key={item.id}>
            <div className="project-image-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.pcImage} alt={`${item.title} PC`} className="project-image-pc" />
              {item.mobileImage && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.mobileImage} alt={`${item.title} Mobile`} className="project-image-mobile" />
              )}
            </div>
            <div className="project-info">
              <div>
                <h2 className="project-title">{item.title}</h2>
              </div>
              <div className="project-arrow">&#8599;</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
