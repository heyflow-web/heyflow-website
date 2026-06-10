import { getProject } from '@/lib/notion';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './detail.module.css';
import ReactMarkdown from 'react-markdown';

export const revalidate = 60; // 1분 단위 재검증

export default async function PortfolioDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getProject(id);

  if (!item) {
    notFound();
  }

  return (
    <main className="container">
      <article className={styles.article}>
        <Link href="/projects" className={styles.backBtn}>
          &larr; Back
        </Link>
        
        <header className={styles.header}>
          <h1 className={styles.title}>{item.title}</h1>
          {item.link && item.link !== "#" && (
            <a href={item.link} target="_blank" rel="noreferrer" className={styles.externalLink}>
              Visit Site &rarr;
            </a>
          )}
        </header>

        <div className={styles.content}>
          {item.description && <p className={styles.desc}>{item.description}</p>}
          <div className={styles.longText}>
            <ReactMarkdown>{item.content || ''}</ReactMarkdown>
          </div>
        </div>

        <div className={styles.imageGallery}>
          <div className={styles.imageWrapperPc}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.pcImage} alt={`${item.title} PC`} className={styles.image} />
          </div>
          {item.mobileImage && (
            <div className={styles.imageWrapperMobile}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.mobileImage} alt={`${item.title} Mobile`} className={styles.image} />
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
