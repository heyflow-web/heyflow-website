import fs from 'fs';

const tsxPath = 'src/app/board/[id]/BoardDetailClient.tsx';
const cssPath = 'src/app/board/[id]/detail.module.css';

const tsxContent = `'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './detail.module.css';

export default function BoardDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNotice = searchParams.get('isNotice') === 'true';
  const phoneParam = searchParams.get('phone') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [viewData, setViewData] = useState<any>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!isNotice && !phoneParam) {
        setErrorMsg('잘못된 접근입니다. 게시판 목록에서 다시 선택해 주세요.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/inquiry/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, phone: phoneParam })
        });
        const data = await res.json();
        
        if (data.success) {
          setViewData(data.data);
        } else {
          setErrorMsg(data.message || '게시글을 불러올 수 없습니다.');
        }
      } catch (err) {
        setErrorMsg('서버 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, isNotice, phoneParam]);

  return (
    <main className="container">
      <article className={styles.article}>
        <div className={styles.textContainer}>
          <Link href="/board" className={styles.backBtn}>
            &larr; Back to List
          </Link>
          
          {isLoading ? (
            <div style={{ textAlign: 'center' }}>
              <span className={styles.loader}></span>
            </div>
          ) : errorMsg ? (
            <div className={styles.error}>{errorMsg}</div>
          ) : viewData ? (
            <>
              <header className={styles.header}>
                <h1 className={styles.title}>
                  {isNotice ? viewData.title || '공지사항' : viewData.title || '문의 내용'}
                </h1>
              </header>
              
              <div className={styles.content}>
                <p className={styles.desc}>
                  {viewData.content || '내용이 없습니다.'}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </article>
    </main>
  );
}
`;
fs.writeFileSync(tsxPath, tsxContent);

const cssContent = `.article {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 70vh;
}

.textContainer {
  max-width: 900px;
  width: 100%;
  margin-bottom: 4vw;
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
  align-self: flex-start;
  color: var(--text-primary);
  text-decoration: none;
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
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
  line-height: 1.2;
  color: var(--text-primary);
  word-break: keep-all;
}

.content {
  margin-bottom: 2rem;
}

.desc {
  font-size: clamp(1.1rem, 1.5vw, 1.25rem);
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary);
  word-break: keep-all;
  white-space: pre-wrap;
  max-width: 700px;
}

.loader {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #111;
  animation: spin 1s ease-in-out infinite;
  margin: 4rem auto;
}

.error {
  color: #e53e3e;
  font-size: 1rem;
  margin-top: 2rem;
  text-align: center;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
fs.writeFileSync(cssPath, cssContent);

console.log('Board detail update completed.');
