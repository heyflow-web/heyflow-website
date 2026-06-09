"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CornerDownLeft } from "lucide-react";
import styles from "./GlobalContact.module.css";

export default function GlobalContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    problem: "",
    budget: "",
    contact: "",
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // 모달이 열리거나 스텝이 변경될 때 인풋 포커스
  useEffect(() => {
    if (isOpen && [1, 2, 4].includes(step)) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 600); // 애니메이션 대기 후 포커스
      return () => clearTimeout(timer);
    }
  }, [isOpen, step]);

  // 엔터 키로 다음 스텝 넘어가기
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNext();
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.name) return;
    if (step === 2 && !formData.problem) return;
    if (step === 4 && !formData.contact) return;
    
    setStep((prev) => prev + 1);
  };

  const handleBudgetSelect = (val: string) => {
    setFormData((prev) => ({ ...prev, budget: val }));
    setStep((prev) => prev + 1);
  };

  // 완료 후 닫기 처리
  useEffect(() => {
    if (step === 5) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        // 상태 초기화
        setTimeout(() => {
          setStep(0);
          setFormData({ name: "", problem: "", budget: "", contact: "" });
        }, 500);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const variants: any = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button 
        className={`${styles.floatingButton} cursor-hover`} 
        onClick={() => setIsOpen(true)}
      >
        Let's Talk
      </button>

      {/* 모달 영역 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <header className={styles.modalHeader}>
              <div className={styles.modalBrand}>heyflow</div>
              <button 
                className={`${styles.closeButton} cursor-hover`} 
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </header>

            <main className={styles.modalBody}>
              <AnimatePresence mode="wait">
                
                {/* Step 0: Intro */}
                {step === 0 && (
                  <motion.div 
                    key="step0"
                    className={styles.stepContainer}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <h2 className={styles.introTitle}>Let's flow together.</h2>
                    <p className={styles.introDesc}>
                      귀사의 가치를 디지털 공간에 본질만 남겨 흐르게 할 준비가 되셨나요?<br />
                      아래의 몇 가지 질문에 답해주시면 48시간 이내에 디렉터가 직접 연락을 드립니다.
                    </p>
                    <button className={`${styles.startButton} cursor-hover`} onClick={() => setStep(1)}>
                      프로젝트 문의 시작하기 <ArrowRight size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '8px' }} />
                    </button>

                    <div className={styles.kakaoLinkWrapper}>
                      긴급한 프로젝트이거나 빠른 상담이 필요하신가요? 
                      <a href="#" className={`${styles.kakaoLink} cursor-hover`}>카카오톡 디렉터 직통 채널</a>
                    </div>
                  </motion.div>
                )}

                {/* Step 1: Name & Brand */}
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    className={styles.stepContainer}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <span className={styles.questionHighlight}>01 / 04</span>
                    <label className={styles.questionLabel}>귀하의 성함과 브랜드(기업)명을 알려주세요.</label>
                    <input 
                      ref={inputRef}
                      type="text" 
                      className={styles.textInput} 
                      placeholder="ex. 김헤이 / 헤이플로우"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onKeyDown={handleKeyDown}
                    />
                    <div className={styles.guideText}>
                      작성 후 Enter를 누르세요 <CornerDownLeft size={16} />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Problem */}
                {step === 2 && (
                  <motion.div 
                    key="step2"
                    className={styles.stepContainer}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <span className={styles.questionHighlight}>02 / 04</span>
                    <label className={styles.questionLabel}>우리가 함께 해결해야 할 브랜드의 본질적인 문제는 무엇인가요?</label>
                    <input 
                      ref={inputRef}
                      type="text" 
                      className={styles.textInput} 
                      placeholder="ex. 기존 웹사이트의 감도가 떨어짐 / 신규 런칭"
                      value={formData.problem}
                      onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                      onKeyDown={handleKeyDown}
                    />
                    <div className={styles.guideText}>
                      작성 후 Enter를 누르세요 <CornerDownLeft size={16} />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Budget */}
                {step === 3 && (
                  <motion.div 
                    key="step3"
                    className={styles.stepContainer}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <span className={styles.questionHighlight}>03 / 04</span>
                    <label className={styles.questionLabel}>프로젝트의 예상 일정과 예산 범위를 선택해 주세요.</label>
                    <div className={styles.budgetGrid}>
                      <button className={`${styles.budgetButton} cursor-hover`} onClick={() => handleBudgetSelect("100만 원 이하")}>
                        100만 원 이하
                      </button>
                      <button className={`${styles.budgetButton} cursor-hover`} onClick={() => handleBudgetSelect("100만 원 - 300만 원")}>
                        100만 원 - 300만 원
                      </button>
                      <button className={`${styles.budgetButton} cursor-hover`} onClick={() => handleBudgetSelect("300만 원 이상")}>
                        300만 원 이상
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Contact */}
                {step === 4 && (
                  <motion.div 
                    key="step4"
                    className={styles.stepContainer}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <span className={styles.questionHighlight}>04 / 04</span>
                    <label className={styles.questionLabel}>회신받으실 이메일과 연락처를 남겨주세요.</label>
                    <input 
                      ref={inputRef}
                      type="text" 
                      className={styles.textInput} 
                      placeholder="ex. hello@heyflow.com / 010-0000-0000"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      onKeyDown={handleKeyDown}
                    />
                    <div className={styles.guideText}>
                      작성 완료 후 Enter를 누르시면 제출됩니다 <CornerDownLeft size={16} />
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Outro */}
                {step === 5 && (
                  <motion.div 
                    key="step5"
                    className={`${styles.stepContainer} ${styles.outroContainer}`}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <h2 className={styles.outroTitle}>
                      불필요한 소음을 걷어내고,<br />귀사의 본질을 마주할 준비를 시작합니다.
                    </h2>
                    <p className={styles.outroDesc}>
                      남겨주신 내용을 면밀히 검토 후, 곧 연결되겠습니다. 감사합니다.
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
