'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './detail.module.css';

export default function BoardDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNotice = searchParams.get('isNotice') === 'true';

  const [phoneInput, setPhoneInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [viewData, setViewData] = useState<any>(null);

  React.useEffect(() => {
    if (isNotice) {
      handleVerify();
    }
  }, [isNotice]);

  const handleVerify = async () => {
    if (!isNotice && !phoneInput) {
      setErrorMsg('연락처를 입력해 주세요.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/inquiry/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, phone: phoneInput })
      });
      const data = await res.json();
      
      if (data.success) {
        setViewData(data.data);
      } else {
        setErrorMsg(data.message || '인증에 실패했습니다.');
      }
    } catch (err) {
      setErrorMsg('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.detailContainer}>
      {!viewData ? (
        <div className={styles.authBox}>
          {isNotice ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <span className={styles.loader} style={{ borderColor: '#ddd', borderTopColor: '#111' }}></span>
              <p style={{ marginTop: '1rem', color: '#555' }}>공지사항을 불러오는 중입니다...</p>
            </div>
          ) : (
            <>
              <h1 className={styles.title}>비밀글 열람</h1>
              <p className={styles.desc}>
                작성자만 열람할 수 있는 비밀글입니다.<br/>
                글 작성 시 입력하셨던 <b>연락처(전화번호)</b>를 입력해 주세요.
              </p>
              <input 
                type="text" 
                className={styles.input}
                placeholder="예: 01012345678"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
              />
              {errorMsg && <p className={styles.error}>{errorMsg}</p>}
              <button 
                className={styles.btn} 
                onClick={handleVerify}
                disabled={isLoading}
              >
                {isLoading ? <span className={styles.loader}></span> : '확인'}
              </button>
            </>
          )}
          <div style={{ marginTop: '2rem' }}>
            <button className={styles.backBtn} onClick={() => router.push('/board')}>목록으로 돌아가기</button>
          </div>
        </div>
      ) : (
        <div className={styles.contentBox}>
          <h1 className={styles.title} style={{ textAlign: 'left', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>{isNotice ? '공지사항' : '문의 내용'}</h1>
          <div className={styles.content}>
            {viewData.content || '내용이 없습니다.'}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className={styles.backBtn} onClick={() => router.push('/board')}>목록으로 돌아가기</button>
          </div>
        </div>
      )}
    </div>
  );
}
