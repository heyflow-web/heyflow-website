"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, MoveDown } from "lucide-react";
import styles from "./HomeClient.module.css";
import CustomCursor from "./CustomCursor";

const DUMMY_PROJECTS = [
  {
    id: "01",
    title: "Brand Commerce",
    category: "E-Commerce / Branding",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070",
    style: "scaleHover"
  },
  {
    id: "02",
    title: "Corporate / Tech",
    category: "IT / Tech Platform",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069",
    style: "gridLine"
  },
  {
    id: "03",
    title: "F&B / Culture",
    category: "Food & Beverage",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047",
    style: "objectFocus"
  },
  {
    id: "04",
    title: "Healthcare Special",
    category: "Medical Branding",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053",
    style: "heymediTrigger"
  }
];

export default function HomeClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // About 섹션 진입 시 배경 반전을 위한 옵저버
  const isAboutInView = useInView(aboutRef, { margin: "-40% 0px -40% 0px" });

  const [heymediOpen, setHeymediOpen] = useState(false);

  useEffect(() => {
    // 배경색 반전 로직: body 요소의 클래스를 토글
    if (isAboutInView) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    
    return () => {
      document.body.classList.remove("dark-theme");
    };
  }, [isAboutInView]);

  return (
    <div ref={containerRef} className={styles.homeContainer}>
      <CustomCursor />

      {/* Section 1: Hero */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTitle}>
            <div style={{ overflow: "hidden" }}>
              <motion.div 
                initial={{ y: "120%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                가장 강력한 메시지는
              </motion.div>
            </div>
            <div style={{ overflow: "hidden" }}>
              <motion.div 
                initial={{ y: "120%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              >
                언제나 가장 단순합니다.
              </motion.div>
            </div>
          </div>
          <motion.p 
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          >
            화려한 기교와 비주얼 소음은 브랜드의 본질을 가릴 뿐입니다.<br />
            헤이플로우는 10년의 내공으로 불필요한 모든 것을 덜어내고,<br />
            오직 고객의 시선과 움직임이 가치로 이어지는 완벽한 동선(Visual Flow)만을 남깁니다.
          </motion.p>
        </div>
        
        <motion.div 
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <span className={styles.scrollText}>scroll down</span>
          <motion.div 
            className={styles.scrollLine}
            animate={{ height: ["0px", "60px", "0px"], y: [0, 0, 60] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* Section 2: About & Core Value */}
      <section ref={aboutRef} className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <motion.h2 
            className={styles.aboutHeadline}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1 }}
          >
            기계적으로 찍어내는<br />
            공장형 템플릿은 브랜드의 가치를 훼손합니다.
          </motion.h2>
          
          <motion.p 
            className={styles.aboutDesc}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            우리는 화려한 기교나 불필요한 비주얼 소음(Noise)을 극도로 배제합니다.<br />
            사용자가 웹사이트에 진입한 순간부터 나갈 때까지,<br />
            시선이 머물고 움직이는 <strong>'유저 플로우(User Flow)'</strong>를 정교하게 설계합니다.
          </motion.p>
          
          <motion.p 
            className={styles.aboutDesc}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            가장 미니멀한 레이아웃과 깊이 있는 감도로<br />
            귀사의 비즈니스를 디지털 세상에 단단하게 뿌리내리게 합니다.
          </motion.p>
        </div>
      </section>

      {/* Section 3: Selected Work */}
      <section className={styles.workSection}>
        <div className={styles.workHeader}>
          <h2 className={styles.workTitle}>Selected Work.</h2>
          <p className={styles.workSubtitle}>우리가 설계한 시선의 흐름들</p>
        </div>

        <div className={styles.workGrid}>
          {DUMMY_PROJECTS.map((project, idx) => (
            <motion.div 
              key={project.id} 
              className={`${styles.projectCard} cursor-hover`}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              onClick={() => {
                if (project.style === "heymediTrigger") setHeymediOpen(true);
              }}
            >
              <div className={styles.imageWrapper}>
                <motion.img 
                  src={project.image} 
                  alt={project.title}
                  className={styles.projectImage}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                {project.style === "heymediTrigger" && (
                  <div className={styles.triggerOverlay}>
                    <span>Click to Reveal</span>
                  </div>
                )}
              </div>
              <div className={styles.projectInfo}>
                <span className={styles.projectNumber}>{project.id}</span>
                <h3 className={styles.projectName}>{project.title}</h3>
                <p className={styles.projectCategory}>{project.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HeyMedi Popup Overlay */}
      {heymediOpen && (
        <motion.div 
          className={styles.heymediPopup}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={styles.heymediPopupInner}>
            <button className={`${styles.closeButton} cursor-hover`} onClick={() => setHeymediOpen(false)}>✕</button>
            <h3 className={styles.heymediTitle}>Healthcare Special</h3>
            <p className={styles.heymediDesc}>
              병원 마케팅 및 특화 브랜딩은<br />
              <strong>[헤이메디(HeyMedi) 센터]</strong>에서 전담합니다.
            </p>
            <a href="#" className={`${styles.heymediLink} cursor-hover`}>
              헤이메디 채널 바로가기 <ArrowRight size={18} />
            </a>
          </div>
        </motion.div>
      )}

      {/* Section 4: Contact & Footer */}
      <footer className={styles.footerSection}>
        <div className={styles.contactContainer}>
          <h2 className={styles.contactTitle}>Let's flow together.</h2>
          <p className={styles.contactDesc}>귀사의 가치를 흐르게 할 준비가 되셨다면, 시작해 보세요.</p>
          <button className={`${styles.ctaButton} cursor-hover`}>
            START A PROJECT <ArrowRight className={styles.ctaIcon} />
          </button>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.copyright}>heyflow. All rights reserved.</p>
          <div className={styles.footerInfo}>
            <span>상호명: 아카이브헤이</span>
            <span className={styles.divider}>|</span>
            <span>비즈니스 디렉터: 김헤이</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
