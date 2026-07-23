'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './board.module.css';
import { BoardPost } from '@/lib/dummyBoardData';

const ITEMS_PER_PAGE = 15;

export default function BoardClient({ initialData }: { initialData: BoardPost[] }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Split notices and regular posts
  const notices = initialData.filter(post => post.isNotice);
  const regularPosts = initialData.filter(post => !post.isNotice);

  const totalPages = Math.ceil(regularPosts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPosts = regularPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePostClick = (post: BoardPost) => {
    if (post.isNotice) {
      router.push(`/board/${post.id}?isNotice=true`);
    } else {
      setSelectedPost(post);
      setPhoneInput('');
      setErrorMsg('');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleVerify = async () => {
    if (!selectedPost) return;
    if (!phoneInput) {
      setErrorMsg('연락처를 입력해 주세요.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/inquiry/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPost.id, phone: phoneInput })
      });
      const data = await res.json();
      
      if (data.success) {
        closeModal();
        router.push(`/board/${selectedPost.id}?phone=${encodeURIComponent(phoneInput)}`);
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
    <main className="container">
      <h1 className="page-title">CUSTOMER CENTER</h1>
      
      <div className={styles.tableWrapper}>
        <table className={styles.boardTable}>
          <thead>
            <tr>
              <th className={styles.colId}>번호</th>
              <th className={styles.colTitle}>제목</th>
              <th className={styles.colAuthor}>브랜드명</th>
              <th className={styles.colDate}>작성일</th>
              <th className={styles.colViews}>조회</th>
            </tr>
          </thead>
          <tbody>
            {/* 공지사항 렌더링 */}
            {notices.map(post => (
              <tr key={post.id} className={styles.noticeRow}>
                <td>공지사항</td>
                <td className={styles.titleCell} onClick={() => handlePostClick(post)}>
                  <div className={styles.titleWrapper}>
                    <span className={styles.noticeBadge}>{post.title}</span>
                  </div>
                </td>
                <td>{post.author}</td>
                <td>{post.date}</td>
                <td>{post.views.toLocaleString()}</td>
              </tr>
            ))}
            
            {/* 일반 게시글 렌더링 */}
            {currentPosts.map(post => (
              <tr key={post.id}>
                <td>{post.displayId || post.id}</td>
                <td className={styles.titleCell} onClick={() => handlePostClick(post)}>
                  <div className={styles.titleWrapper}>
                    {post.isSecret && (
                      <svg className={styles.lockIcon} viewBox="0 0 24 24">
                        <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9V6a6 6 0 10-12 0v2H4v14h16V8h-2zM8 6a4 4 0 118 0v2H8V6z" />
                      </svg>
                    )}
                    {post.title}
                  </div>
                </td>
                <td>{post.author}</td>
                <td>{post.date}</td>
                <td>{post.views.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button 
          className={styles.pageBtn} 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button 
            key={page} 
            className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        <button 
          className={styles.pageBtn} 
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        >
          &gt;
        </button>
      </div>

      {/* Auth Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>비밀글 열람</h2>
            <p className={styles.modalDesc}>
              작성자만 열람할 수 있는 비밀글입니다.<br/>
              글 작성 시 입력하셨던 <b>연락처(전화번호)</b>를 입력해 주세요.
            </p>
            <input 
              type="text" 
              className={styles.modalInput}
              placeholder="예: 01012345678"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
            />
            {errorMsg && <p className={styles.modalError}>{errorMsg}</p>}
            
            <div className={styles.modalActions}>
              <button onClick={closeModal} className={styles.btnCancel}>취소</button>
              <button 
                onClick={handleVerify} 
                className={styles.btnConfirm}
                disabled={isLoading}
              >
                {isLoading ? '확인 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
