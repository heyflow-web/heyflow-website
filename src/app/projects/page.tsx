import data from '../../data.json';
import Link from 'next/link';

export default function Projects() {
  return (
    <main className="container">
      <h1 className="page-title">PROJECT</h1>
      
      <div className="gallery">
        {data.map((item) => (
          <Link href={`/projects/${item.id}`} className="project-card" key={item.id}>
            <div className="project-image-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.title} className="project-image" />
            </div>
            <div className="project-info">
              <div>
                <h2 className="project-title">{item.title}</h2>
                {item.description && <p className="project-desc">{item.description}</p>}
              </div>
              <div className="project-arrow">&#8599;</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
