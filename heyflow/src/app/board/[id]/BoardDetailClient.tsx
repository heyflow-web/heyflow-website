'use client';
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
                {isNotice ? '공지사항' : '문의 내용'}
              </h1>
            </header>
            
            <div className={styles.content}>
              <p className={styles.desc}>
                {viewData.content || '내용이 없습니다.'}
              </p>
            </div>
          </>
        ) : null}
      </article>
    </main>
  );
}
