import fs from 'fs';

const pagePath = 'src/app/projects/[id]/page.tsx';
const cssPath = 'src/app/projects/[id]/detail.module.css';

// 1. Rewrite page.tsx
const pageContent = `import { getProject } from '@/lib/notion';
import BackButton from '@/components/BackButton';
import { notFound } from 'next/navigation';
import styles from './detail.module.css';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import type { Metadata } from 'next';

export const revalidate = 60; // 1분 단위 재검증

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getProject(id);

  if (!item) {
    return {
      title: 'Not Found | heyflow',
      description: '페이지를 찾을 수 없습니다.'
    };
  }

  return {
    title: \`\${item.title} | heyflow 포트폴리오\`,
    description: item.description || \`헤이플로우의 \${item.title} 제작 포트폴리오입니다.\`,
    openGraph: {
      title: \`\${item.title} | heyflow 포트폴리오\`,
      description: item.description || \`헤이플로우의 \${item.title} 제작 포트폴리오입니다.\`,
      url: \`https://heyflow.kr/projects/\${id}\`,
      images: item.pcImage ? [{ url: item.pcImage }] : [],
    }
  };
}

export default async function PortfolioDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getProject(id);

  if (!item) {
    notFound();
  }

  return (
    <main className="container">
      <article className={styles.article}>
        <div className={styles.textContainer}>
          <BackButton className={styles.backBtn} />
          
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
          </div>
        </div>

        <div className={styles.imageGalleryWrapper}>
          <div className={styles.imageGallery}>
            <div className={styles.imageWrapperPc}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.pcImage} alt={\`\${item.title} PC\`} className={styles.image} />
            </div>
            {item.mobileImage && (
              <div className={styles.imageWrapperMobile}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.mobileImage} alt={\`\${item.title} Mobile\`} className={styles.image} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.textContainerCenter}>
          <div className={styles.longText}>
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>{item.content || ''}</ReactMarkdown>
          </div>
        </div>
      </article>
    </main>
  );
}
`;
fs.writeFileSync(pagePath, pageContent);

// 2. Rewrite detail.module.css
const cssContent = `.article {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.textContainer {
  max-width: 900px;
  width: 100%;
  margin-bottom: 4vw;
}

.textContainerCenter {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}

.backBtn {
  display: inline-block;
  margin-bottom: 3rem;
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--text-primary);
  padding-bottom: 0.2rem;
  transition: opacity 0.2s;
}

.backBtn:hover {
  opacity: 0.4;
}

.header {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
}

.title {
  font-size: clamp(3rem, 6vw, 5.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  margin: 0;
  line-height: 1.1;
  color: var(--text-primary);
  word-break: keep-all;
}

.externalLink {
  display: inline-block;
  background: var(--text-primary);
  color: var(--bg-main);
  padding: 0.8rem 1.6rem;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: opacity 0.2s;
  border-radius: var(--radius-sm);
}

.externalLink:hover {
  opacity: 0.8;
}

.content {
  margin-bottom: 2rem;
}

.desc {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 500;
  line-height: 1.6;
  color: var(--text-secondary);
  word-break: keep-all;
  max-width: 700px;
}

/* 스크린샷 래퍼 (미색 배경) */
.imageGalleryWrapper {
  width: 100%;
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 6vw;
  margin-bottom: 5rem;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
}

.imageGallery {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .imageGallery {
    flex-direction: row;
    align-items: flex-start;
    gap: 3rem;
  }
  .imageWrapperPc {
    flex: 3;
  }
  .imageWrapperMobile {
    flex: 1;
  }
}

.imageWrapperPc,
.imageWrapperMobile {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.05);
  background-color: var(--bg-main);
  border: 1px solid rgba(0,0,0,0.05);
}

.image {
  width: 100%;
  height: auto;
  display: block;
}

.longText {
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.8;
  color: var(--text-secondary);
}

.longText h1,
.longText h2,
.longText h3 {
  font-weight: 700;
  margin-top: 3rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  line-height: 1.3;
}

.longText p, 
.longText ul, 
.longText li {
  margin-bottom: 1rem;
}

.longText p:empty {
  display: none;
  margin: 0;
  padding: 0;
}
`;
fs.writeFileSync(cssPath, cssContent);

console.log('Update completed');
