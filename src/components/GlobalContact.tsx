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

  // 모달이 열리거나 스텝이 변경될 때 인풋 포커스
  useEffect(() => {
    if (isOpen && [1, 2, 5].includes(step)) {
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
              {step > 0 && step < 6 && (
                <button 
                  onClick={() => setStep(prev => prev - 1)}
                  className={`cursor-hover`}
                  style={{
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                    background: "none",
                    border: "none",
                    color: "var(--gray)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.85rem",
                    zIndex: 10,
                    transform: "translateY(-40px)" // 로고 바로 아래에 위치하도록 조정
                  }}
                >
                  <ArrowLeft size={16} /> 뒤로가기
                </button>
              )}
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
                      비주얼 소음을 걷어내고, 브랜드 본질만 남길 준비가 되셨나요?<br />
                      아래의 몇 가지 질문에 답해주시면 24시간 이내에 디렉터가 직접 연락을 드립니다.
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
                    <span className={styles.questionHighlight}>01 / 05</span>
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
                    <span className={styles.questionHighlight}>02 / 05</span>
                    <label className={styles.questionLabel}>
                      프로젝트의 형태를 선택해 주세요.<span className={styles.subLabel}>(중복 가능)</span>
                    </label>
                    <div className={styles.budgetGrid} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {[
                        { title: "반응형 웹사이트", desc: "기업/브랜드/스타트업 등" },
                        { title: "랜딩페이지", desc: "마케팅 / 프로모션용 원페이지" },
                        { title: "디지털 제품 상세페이지", desc: "이커머스 제품 기획 및 비주얼 디자인" },
                        { title: "온·오프라인 그래픽/인쇄물", desc: "브로셔, 리플렛, 패키지, SNS 에셋 등" }
                      ].map(type => {
                        const typeId = type.title;
                        const isSelected = formData.projectTypes.includes(typeId);
                        return (
                          <button 
                            key={typeId}
                            className={`${styles.budgetButton} cursor-hover`} 
                            style={{
                              background: isSelected ? "var(--text)" : "transparent",
                              color: isSelected ? "var(--bg)" : "var(--text)",
                              textAlign: "left",
                              padding: "1.2rem 1.5rem"
                            }}
                            onClick={() => toggleProjectType(typeId)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600 }}>{isSelected ? "✓ " : ""}{type.title}</span>
                            </div>
                            <span className={styles.optionDesc} style={{ color: isSelected ? "var(--bg)" : "inherit" }}>
                              ({type.desc})
                            </span>
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
                    <span className={styles.questionHighlight}>03 / 05</span>
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
                    <span className={styles.questionHighlight}>04 / 05</span>
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

                {/* Step 4: Project Types */}
                {step === 4 && (
                  <motion.div 
                    key="step4"
                    className={styles.stepContainer}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <span className={styles.questionHighlight}>04 / 05</span>
                    <label className={styles.questionLabel}>우리가 함께 해결해야 할 브랜드의 프로젝트 형태를 선택해 주세요. (중복 가능)</label>
                    <div className={styles.budgetGrid} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {[
                        "반응형 웹사이트 (기업/브랜드/스타트업 등)", 
                        "랜딩페이지 (마케팅 / 프로모션용 원페이지)", 
                        "디지털 제품 상세페이지 (이커머스 제품 기획 및 비주얼 디자인)", 
                        "온·오프라인 그래픽/인쇄물 (브로셔, 리플렛, 패키지, SNS 에셋 등)"
                      ].map(type => (
                        <button 
                          key={type}
                          className={`${styles.budgetButton} cursor-hover`} 
                          style={{
                            background: formData.projectTypes.includes(type) ? "var(--text)" : "transparent",
                            color: formData.projectTypes.includes(type) ? "var(--bg)" : "var(--text)",
                            textAlign: "left",
                            paddingLeft: "1.5rem"
                          }}
                          onClick={() => toggleProjectType(type)}
                        >
                          {formData.projectTypes.includes(type) ? "✓ " : ""}{type}
                        </button>
                      ))}
                    </div>
                    <button 
                       className={`${styles.startButton} cursor-hover`} 
                       style={{ marginTop: '2.5rem', opacity: formData.projectTypes.length > 0 ? 1 : 0.5 }}
                       onClick={handleNext}
                       disabled={formData.projectTypes.length === 0}
                    >
                      다음으로 <ArrowRight size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '8px' }} />
                    </button>
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
                    <span className={styles.questionHighlight}>05 / 05</span>
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
