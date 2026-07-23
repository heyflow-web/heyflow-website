'use client';
import React, { useState } from 'react';
import styles from './board.module.css';
import { dummyBoardData } from '@/lib/dummyBoardData';

const ITEMS_PER_PAGE = 15;

export default function BoardPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Split notices and regular posts
  const notices = dummyBoardData.filter(post => post.isNotice);
  const regularPosts = dummyBoardData.filter(post => !post.isNotice);

  const totalPages = Math.ceil(regularPosts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPosts = regularPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePostClick = () => {
    alert('비밀글입니다. 작성자만 열람할 수 있습니다.');
  };

  return (
    <div className={styles.boardContainer}>
      <h1 className={styles.boardTitle}>고객센터</h1>
      
      <div className={styles.tableWrapper}>
        <table className={styles.boardTable}>
          <thead>
            <tr>
              <th className={styles.colId}>번호</th>
              <th className={styles.colTitle}>제목</th>
              <th className={styles.colAuthor}>작성자</th>
              <th className={styles.colDate}>작성일</th>
              <th className={styles.colLikes}>추천</th>
              <th className={styles.colViews}>조회</th>
            </tr>
          </thead>
          <tbody>
            {/* 공지사항 렌더링 */}
            {notices.map(post => (
              <tr key={post.id} className={styles.noticeRow}>
                <td>공지사항</td>
                <td className={styles.titleCell}>
                  <span className={styles.noticeBadge}>{post.title}</span>
                </td>
                <td>{post.author}</td>
                <td>{post.date}</td>
                <td>{post.likes}</td>
                <td>{post.views}</td>
              </tr>
            ))}
            
            {/* 일반 게시글 렌더링 */}
            {currentPosts.map(post => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td className={styles.titleCell} onClick={handlePostClick}>
                  {post.isSecret && (
                    <svg className={styles.lockIcon} viewBox="0 0 24 24">
                      <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9V6a6 6 0 10-12 0v2H4v14h16V8h-2zM8 6a4 4 0 118 0v2H8V6z" />
                    </svg>
                  )}
                  {post.title}
                </td>
                <td>{post.author}</td>
                <td>{post.date}</td>
                <td>{post.likes}</td>
                <td>{post.views}</td>
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
    </div>
  );
}
