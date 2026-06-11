"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CornerDownLeft, ArrowLeft } from "lucide-react";
import styles from "./GlobalContact.module.css";

export default function GlobalContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    problem: "",
    budget: "",
    projectTypes: [] as string[],
    contact: "",
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // 전역 이벤트 리스너 (홈 버튼에서 모달 열기)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("openContactModal", handleOpen);
    return () => window.removeEventListener("openContactModal", handleOpen);
  }, []);

  // 모달이 열리거나 스텝이 변경될 때 인풋 포커스 & 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    if (isOpen && [1, 3, 5].includes(step)) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 600); // 애니메이션 대기 후 포커스
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, step]);

  // 엔터 키로 다음 스텝 넘어가기
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // 한글 IME 입력 중복 엔터 방지
    if (e.key === "Enter") {
      e.preventDefault();
      handleNext();
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return; // 전송 중 중복 입력 방지

    if (step === 1 && !formData.name) return;
    if (step === 2 && formData.projectTypes.length === 0) return;
    if (step === 3 && !formData.problem) return;
    
    // 마지막 제출 단계 (step 5)
    if (step === 5) {
      if (!formData.contact) return;
      
      setIsSubmitting(true);
      try {
        // 구글 Apps Script로 데이터 전송 (CORS 우회를 위해 text/plain 사용 및 no-cors 모드 강제)
        await fetch("https://script.google.com/macros/s/AKfycbzgrcYQRtwOw2vC1dtovbmGD36lFSZTrKCeIwHo9dPiG2ojhNqMXkrrjI0bY9IriHwS/exec", {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            ...formData,
            projectTypes: formData.projectTypes.join(", ") // 배열을 문자열로 변환하여 전송
          }),
        });
      } catch (error) {
        console.error("Submission failed:", error);
      } finally {
        setIsSubmitting(false);
        setStep(6); // 안전하게 Outro로 이동
      }
      return;
    }
    
    setStep((prev) => prev + 1);
  };

  const handleBudgetSelect = (val: string) => {
    setFormData((prev) => ({ ...prev, budget: val }));
    setStep((prev) => prev + 1);
  };

  const toggleProjectType = (type: string) => {
    setFormData((prev) => {
      const exists = prev.projectTypes.includes(type);
      if (exists) {
        return { ...prev, projectTypes: prev.projectTypes.filter((t) => t !== type) };
      } else {
        return { ...prev, projectTypes: [...prev.projectTypes, type] };
      }
    });
  };

  // 완료 후 닫기 처리
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 6) {
      // Outro 화면 4.5초 유지 후 모달 닫힘
      timer = setTimeout(() => {
        setIsOpen(false);
        // 모달 애니메이션 끝난 후 상태 초기화
        setTimeout(() => {
          setStep(0);
          setFormData({ name: "", problem: "", budget: "", projectTypes: [], contact: "" });
        }, 600);
      }, 4500);
    }
    return () => clearTimeout(timer);
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
        무료 상담하기
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
                      웹사이트를 만들기위한 준비가 되셨나요?<br />
                      아래의 몇 가지 질문에 답해주시면 24시간 이내에 디렉터가 직접 연락을 드립니다.
                    </p>
                    <button className={`${styles.startButton} cursor-hover`} onClick={() => setStep(1)}>
                      프로젝트 문의 시작하기 <ArrowRight size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '8px' }} />
                    </button>

                    <div className={styles.kakaoLinkWrapper}>
                      긴급한 프로젝트이거나 빠른 상담이 필요하신가요? 
                      <a href="http://pf.kakao.com/_xacxenX/chat" target="_blank" rel="noopener noreferrer" className={`${styles.kakaoLink} cursor-hover`}>카카오톡 문의</a>
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
                    <div className={styles.questionHighlight} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {step > 1 && (
                        <button onClick={() => setStep(prev => prev - 1)} className="cursor-hover" style={{ background: "none", border: "none", color: "inherit", display: "flex", alignItems: "center", padding: 0 }}>
                          <ArrowLeft size={24} />
                        </button>
                      )}
                      <span>01 / 05</span>
                    </div>
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

                {/* Step 2: Project Types */}
                {step === 2 && (
                  <motion.div 
                    key="step2"
                    className={styles.stepContainer}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className={styles.questionHighlight} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={() => setStep(prev => prev - 1)} className="cursor-hover" style={{ background: "none", border: "none", color: "inherit", display: "flex", alignItems: "center", padding: 0 }}>
                        <ArrowLeft size={24} />
                      </button>
                      <span>02 / 05</span>
                    </div>
                    <label className={styles.questionLabel}>
                      프로젝트의 형태를 선택해 주세요.<span className={styles.subLabel} style={{ fontSize: "1.5rem", color: "#777777", marginLeft: "12px", verticalAlign: "baseline" }}>(중복 가능)</span>
                    </label>
                    <div className={styles.budgetGrid} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {[
                        "반응형 웹사이트",
                        "랜딩페이지",
                        "제품 상세페이지",
                        "온라인 배너(SNS 에셋 등)"
                      ].map(type => {
                        const isSelected = formData.projectTypes.includes(type);
                        return (
                          <button 
                            key={type}
                            className={`${styles.budgetButton} cursor-hover`} 
                            style={{
                              background: isSelected ? "var(--text)" : "transparent",
                              color: isSelected ? "var(--bg)" : "var(--text)",
                              textAlign: "left",
                              padding: "1.2rem 1.5rem"
                            }}
                            onClick={() => toggleProjectType(type)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>{isSelected ? "✓ " : ""}{type}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button 
                       className={`${styles.startButton} cursor-hover`} 
                       style={{ marginTop: '2rem', opacity: formData.projectTypes.length > 0 ? 1 : 0.5 }}
                       onClick={handleNext}
                       disabled={formData.projectTypes.length === 0}
                    >
                      다음으로 <ArrowRight size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '8px' }} />
                    </button>
                  </motion.div>
                )}

                {/* Step 3: Problem */}
                {step === 3 && (
                  <motion.div 
                    key="step3"
                    className={styles.stepContainer}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className={styles.questionHighlight} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={() => setStep(prev => prev - 1)} className="cursor-hover" style={{ background: "none", border: "none", color: "inherit", display: "flex", alignItems: "center", padding: 0 }}>
                        <ArrowLeft size={24} />
                      </button>
                      <span>03 / 05</span>
                    </div>
                    <label className={styles.questionLabel}>우리가 함께 해결해야할 문제는 무엇인가요?</label>
                    <input 
                      ref={inputRef}
                      type="text" 
                      className={styles.textInput} 
                      placeholder="ex. 기존 사이트의 디자인 개선"
                      value={formData.problem}
                      onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                      onKeyDown={handleKeyDown}
                    />
                    <div className={styles.guideText}>
                      작성 후 Enter를 누르세요 <CornerDownLeft size={16} />
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Budget */}
                {step === 4 && (
                  <motion.div 
                    key="step4"
                    className={styles.stepContainer}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className={styles.questionHighlight} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={() => setStep(prev => prev - 1)} className="cursor-hover" style={{ background: "none", border: "none", color: "inherit", display: "flex", alignItems: "center", padding: 0 }}>
                        <ArrowLeft size={24} />
                      </button>
                      <span>04 / 05</span>
                    </div>
                    <label className={styles.questionLabel}>프로젝트의 예산 범위를 선택해 주세요.</label>
                    <div className={styles.budgetGrid}>
                      <button className={`${styles.budgetButton} cursor-hover`} style={{ fontSize: "1.5rem", padding: "1.2rem" }} onClick={() => handleBudgetSelect("100만 원 이하")}>
                        100만 원 이하
                      </button>
                      <button className={`${styles.budgetButton} cursor-hover`} style={{ fontSize: "1.5rem", padding: "1.2rem" }} onClick={() => handleBudgetSelect("100만 원 - 300만 원")}>
                        100만 원 - 300만 원
                      </button>
                      <button className={`${styles.budgetButton} cursor-hover`} style={{ fontSize: "1.5rem", padding: "1.2rem" }} onClick={() => handleBudgetSelect("300만 원 이상")}>
                        300만 원 이상
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Contact */}
                {step === 5 && (
                  <motion.div 
                    key="step5"
                    className={styles.stepContainer}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className={styles.questionHighlight} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={() => setStep(prev => prev - 1)} className="cursor-hover" style={{ background: "none", border: "none", color: "inherit", display: "flex", alignItems: "center", padding: 0 }}>
                        <ArrowLeft size={24} />
                      </button>
                      <span>05 / 05</span>
                    </div>
                    <label className={styles.questionLabel}>회신받으실 이메일과 연락처를 남겨주세요.</label>
                    <input 
                      ref={inputRef}
                      type="text" 
                      className={styles.textInput} 
                      placeholder="ex. hellow@flow.com / 010-0000-0000"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      onKeyDown={handleKeyDown}
                    />
                    <div className={styles.guideText}>
                      {isSubmitting ? (
                        "안전하게 암호화하여 전송 중입니다..."
                      ) : (
                        <>작성 완료 후 Enter를 누르시면 제출됩니다 <CornerDownLeft size={16} /></>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Outro */}
                {step === 6 && (
                  <motion.div 
                    key="step6"
                    className={`${styles.stepContainer} ${styles.outroContainer}`}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <h2 className={styles.outroTitle}>
                      불필요한 소음을 걷어내고,<br />브랜드의 본질을 마주할 준비를 시작합니다.
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
