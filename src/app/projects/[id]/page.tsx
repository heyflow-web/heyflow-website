import data from '../../../data.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './detail.module.css';

export default async function PortfolioDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = data.find((d) => d.id.toString() === id);

  if (!item) {
    notFound();
  }

  return (
    <main className="container">
      <article className={styles.article}>
        <Link href="/projects" className={styles.backBtn}>
          &larr; Back to Projects
        </Link>
        
        <div className={styles.imageWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.title} className={styles.image} />
        </div>

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
            {item.content}
          </div>
        </div>
      </article>
    </main>
  );
}
