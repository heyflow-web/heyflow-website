import fs from 'fs';

const tsxPath = 'src/components/GlobalContact.tsx';
let tsxContent = fs.readFileSync(tsxPath, 'utf-8');

// 1. Wrap modalHeader and modalBody with modalWrapper
tsxContent = tsxContent.replace(
  '<header className={styles.modalHeader}>',
  '<div className={styles.modalWrapper}>\n            <header className={styles.modalHeader}>'
);

// We need to close modalWrapper after modalBody
tsxContent = tsxContent.replace(
  '            </main>\n          </motion.div>',
  '            </main>\n            </div>\n          </motion.div>'
);

// 2. Change startButton to boxButton
tsxContent = tsxContent.replace(
  /className={\`\$\{styles\.startButton\} cursor-hover\`}/g,
  'className={`\${styles.boxButton} cursor-hover`}'
);

// 3. Remove step 6 auto-close useEffect
const useEffectAutoCloseRegex = /\/\/ 완료 후 닫기 처리[\s\S]*?\}, \[step\]\);/;
tsxContent = tsxContent.replace(useEffectAutoCloseRegex, `// 완료 후 닫기 처리
  useEffect(() => {
    // 자동 닫기 제거: 유저가 직접 닫거나 '문의 확인하기' 버튼을 클릭하도록 유도
    if (step === 6) {
      // 폼 초기화 로직은 모달 닫힐 때(isOPen === false) 수행되도록 별도 useEffect에서 처리하거나,
      // 문의 확인하기 링크 클릭 시 처리되도록 유도
    }
  }, [step]);
  
  // 모달이 완전히 닫힐 때 폼 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(0);
        setFormData({ name: "", brand: "", problem: "", budget: "", projectTypes: [], email: "", phone: "" });
        setIsConsentChecked(false);
        setShowPrivacy(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);`);

// 4. Update Step 6 Outro
const step6Regex = /\{step === 6 && \([\s\S]*?<\/motion\.div>\n\s*\)\}/;
tsxContent = tsxContent.replace(step6Regex, `{step === 6 && (
                  <motion.div 
                    key="step6"
                    className={styles.stepContainer}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <h2 className={styles.introTitle}>Thank you!</h2>
                    <p className={styles.introDesc}>
                      소중한 문의가 성공적으로 접수되었습니다.<br />
                      검토 후 입력해주신 연락처로 24시간 내에 회신드리겠습니다.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                      <Link 
                        href="/board" 
                        className={\`\${styles.boxButton} cursor-hover\`}
                        onClick={() => setIsOpen(false)}
                      >
                        문의 확인하기
                      </Link>
                      <button 
                        onClick={() => setIsOpen(false)} 
                        className={\`\${styles.boxButtonOutline} cursor-hover\`}
                      >
                        닫기
                      </button>
                    </div>
                  </motion.div>
                )}`);

fs.writeFileSync(tsxPath, tsxContent);

// 5. Update CSS
const cssPath = 'src/components/GlobalContact.module.css';
let cssContent = fs.readFileSync(cssPath, 'utf-8');

// Update modalOverlay and add modalWrapper
const overlayRegex = /\.modalOverlay \{[\s\S]*?\}/;
cssContent = cssContent.replace(overlayRegex, `.modalOverlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10vw;
}

.modalWrapper {
  background-color: var(--bg-main);
  color: var(--text-primary);
  width: 100%;
  max-width: 1800px;
  max-height: calc(100vh - 10vw);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}`);

// Add boxButton and boxButtonOutline
const buttonStyles = `
.boxButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  background-color: var(--text-primary);
  color: var(--bg-main);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}
.boxButton:hover {
  background-color: var(--text-secondary);
  color: var(--bg-main);
}
.boxButtonOutline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.boxButtonOutline:hover {
  border-color: var(--text-primary);
}`;
cssContent = cssContent + buttonStyles;

// Update mobile padding in media queries
const mediaRegex = /@media \(max-width: 768px\) \{[\s\S]*?\}/;
cssContent = cssContent.replace(mediaRegex, `@media (max-width: 768px) {
  .modalOverlay {
    padding: 5vw;
  }
  .modalWrapper {
    max-height: calc(100vh - 10vw);
  }
  .floatingButton {
    bottom: 1.5rem;
    right: 1.5rem;
    padding: 1rem 2rem;
  }
  .modalHeader {
    padding: 1.25rem 10vw !important;
  }
  .modalBody {
    padding: 20px 10vw !important;
  }
}`);

fs.writeFileSync(cssPath, cssContent);

console.log('Update completed.');
