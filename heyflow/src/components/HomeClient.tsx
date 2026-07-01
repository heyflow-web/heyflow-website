"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Plus, Minus } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "./HomeClient.module.css";
import { Project } from "@/lib/notion";
import LottiePlayer from "./LottiePlayer";

export default function HomeClient({ projects = [] }: { projects?: Project[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // 섹션별 레퍼런스 (다크모드 교차 전환용)
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { margin: "0px" });

  const problemRef = useRef<HTMLDivElement>(null);
  const isProblemInView = useInView(problemRef, { margin: "-40% 0px -40% 0px" });

  const darkZoneRef = useRef<HTMLDivElement>(null);
  const isDarkZoneInView = useInView(darkZoneRef, { margin: "-20% 0px -20% 0px" });

  const workSectionRef = useRef<HTMLElement>(null);
  const isWorkSectionInView = useInView(workSectionRef, { margin: "0px" });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 앵커 메뉴 로직
  const [activeSection, setActiveSection] = useState("");
  const [showNav, setShowNav] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowNav(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: "-30% 0px -30% 0px", threshold: 0 });
    
    if (problemRef.current) observer.observe(problemRef.current);
    if (pricingRef.current) observer.observe(pricingRef.current);
    if (faqRef.current) observer.observe(faqRef.current);
    
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Hero 무한 롤링용 배열 복제 (최소 3세트 이상으로 끊김 없는 루프 보장)
  const marqueeSet = [...projects, ...projects, ...projects];


  // Conclusion Text Scroll 로직
  const conclusionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: cProgress } = useScroll({
    target: conclusionRef,
    offset: ["start end", "end start"]
  });
  const cScale = useTransform(cProgress, [0, 0.5, 1], [0.5, 1, 1.2]);
  const cOpacity = useTransform(cProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

  // About Headline Scroll 로직
  const aboutRef = useRef<HTMLElement>(null);
  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutRef,
    offset: ["start end", "center center"]
  });
  const aboutScale = useTransform(aboutProgress, [0, 1], [0.6, 1.2]);
  const aboutOpacity = useTransform(aboutProgress, [0, 0.5, 1], [0, 1, 1]);
  const aboutXLeft = useTransform(aboutProgress, [0, 1], ["-50vw", "0vw"]);
  const aboutXRight = useTransform(aboutProgress, [0, 1], ["50vw", "0vw"]);

  // Pricing Section 다크모드용 InView
  const isPricingInView = useInView(pricingRef, { margin: "-40% 0px -40% 0px" });

  useEffect(() => {
    // Hero, DarkZone, Pricing 섹션에서 글로벌 다크모드 적용
    if (isHeroInView || isDarkZoneInView || isPricingInView) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    
    return () => {
      document.body.classList.remove("dark-theme");
    };
  }, [isHeroInView, isDarkZoneInView, isPricingInView]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleContactOpen = () => window.dispatchEvent(new Event("openContactModal"));

  return (
    <div ref={containerRef} className={styles.homeContainer}>
      <AnimatePresence>
        {showNav && (
          <motion.nav 
            className={styles.anchorNav}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            <ul>
              <li className={activeSection === "problem" ? styles.anchorActive : ""} onClick={() => scrollToSection("problem")}>왜 헤이플로우일까요?</li>
              <li className={activeSection === "pricing" ? styles.anchorActive : ""} onClick={() => scrollToSection("pricing")}>가격안내</li>
              <li className={activeSection === "faq" ? styles.anchorActive : ""} onClick={() => scrollToSection("faq")}>자주묻는 질문</li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Section 01: Hero Section */}
      <section className={styles.heroSection}>
        {/* Trigger div for Hero Dark Mode (Top 10vh) */}
        <div ref={heroRef} style={{ position: "absolute", top: 0, height: "10vh", width: "100%", pointerEvents: "none" }} />
        <div className={styles.heroTopContent}>
          <div className={styles.heroTitle}>
            <div style={{ overflow: "hidden" }}>
              <motion.div 
                initial={{ y: "120%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                잘 되는 비즈니스엔,
              </motion.div>
            </div>
            <div style={{ overflow: "hidden" }}>
              <motion.div 
                initial={{ y: "120%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              >
                그에 맞는 웹사이트가 있어야 합니다.
              </motion.div>
            </div>
          </div>
          <motion.p 
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          >
            저희는 당신의 브랜드가 마땅히 받아야 할<br />
            첫인상을 선명하게 설계합니다.
          </motion.p>
        </div>
        
        {/* Infinite Carousel (Bottom 40%) */}
        <motion.div 
          className={styles.heroCarouselContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
        >
          <div className={styles.marqueeTrack}>
            <div className={styles.marqueeGroup}>
              {marqueeSet.map((proj, idx) => (
                <Link href={`/projects/${proj.id}`} key={`g1-${idx}`} className={`${styles.marqueeItem} cursor-hover`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proj.heroImage || proj.pcImage} alt={proj.title} className={styles.marqueeImage} />
                </Link>
              ))}
            </div>
            <div className={styles.marqueeGroup}>
              {marqueeSet.map((proj, idx) => (
                <Link href={`/projects/${proj.id}`} key={`g2-${idx}`} className={`${styles.marqueeItem} cursor-hover`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proj.heroImage || proj.pcImage} alt={proj.title} className={styles.marqueeImage} />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 02: Problem Section (Sticky Layout) */}
      <section ref={problemRef} id="problem" className={styles.problemSection}>
        <div className={styles.problemStickyContainer}>
          <div className={styles.problemStickyLeft}>
            <motion.h2 
              className={styles.problemStickyTitle}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1 }}
            >
              혹시,<br />이런 문제를 겪고<br />계시진 않나요?
            </motion.h2>
          </div>
          
          <div className={styles.problemScrollRight}>
            {[
              "실제 가치에 비해 너무 가벼워 보이는 공식 웹사이트",
              "네이버·구글에서 검색해도 내 홈페이지는 보이지 않는 상황",
              "브랜드를 이해 못 하는 대행사와 소통하며 낭비된 시간과 비용"
            ].map((text, idx) => (
              <motion.div 
                key={idx} 
                className={styles.problemHugeItem}
                initial={{ opacity: 0.1, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.8 }}
              >
                <span className={styles.problemHugeNum}>0{idx + 1}</span>
                <p>{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div ref={darkZoneRef}>
        {/* Section 02.5: Conclusion Section */}
        <section ref={conclusionRef} className={styles.conclusionSection}>
          <motion.h2 
            className={styles.conclusionText}
            style={{ scale: cScale, opacity: cOpacity }}
          >
            이 중 단 하나라도 해당한다면,<br />
            현재의 웹사이트는 브랜드의 무기가 아니라<br />
            <span className={styles.conclusionHighlight}>감점 요인입니다.</span>
          </motion.h2>
        </section>

        {/* Section 03: Difference (Big Numbers) */}
        <section className={styles.statsSection}>

        <div className={styles.statsGrid}>
          {[
            { num: "3회", desc: "웹어워드 코리아 수상" },
            { num: "0원", desc: "월 호스팅 서버비" },
            { num: "3일", desc: "평균 제작 완료" }
          ].map((stat, idx) => (
            <motion.div 
              key={idx} 
              className={styles.statCard}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
            >
              <h3 className={styles.statNum}>{stat.num}</h3>
              <p className={styles.statDesc}>{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 04: Solution & Philosophy (타이틀만 남기고 압도적 차별점 전으로 이동) */}
      <section ref={aboutRef} className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <motion.h2 
            className={styles.aboutHeadline} 
            style={isMobile ? { overflow: "visible" } : { overflow: "visible", opacity: aboutOpacity }}
            initial={isMobile ? "hidden" : undefined}
            whileInView={isMobile ? "visible" : undefined}
            viewport={{ once: true, margin: "-10%" }}
          >
            <motion.div
              style={isMobile ? undefined : { x: aboutXLeft }}
              variants={isMobile ? {
                hidden: { x: "-100vw", opacity: 0 },
                visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
              } : undefined}
            >
              잘 만든 웹사이트와
            </motion.div>
            <motion.div
              style={isMobile ? undefined : { x: aboutXRight }}
              variants={isMobile ? {
                hidden: { x: "100vw", opacity: 0 },
                visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
              } : undefined}
            >
              잘 되는 웹사이트는 다릅니다.
            </motion.div>
          </motion.h2>
        </div>
      </section>
      </div>

      {/* Section 05: Core Capabilities (Side-by-side Layout) */}
      <section ref={workSectionRef} className={styles.workSection}>
        <div className={styles.workContainer}>
          <div className={styles.workHeader}>
          <motion.h2 
            className={styles.workTitle}
            initial={{ y: 40, opacity: 0 }} 
            whileInView={{ y: 0, opacity: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            우리의 강점
          </motion.h2>
        </div>

        <div className={styles.capaList}>
          {[
            {
              id: "capa-1",
              title: "원스톱 프로세스",
              description: "기획부터 제작까지, 전략적으로 완성도를 높입니다.",
              image: "/images/difference1.json"
            },
            {
              id: "capa-2",
              title: "감도 높은 비주얼",
              description: "브랜드 무드에 맞는 이미지 생성으로 감각을 높입니다.",
              image: "/images/difference4.json"
            },
            {
              id: "capa-3",
              title: "SEO 검색엔진 최적화",
              description: "네이버·구글·AI 검색의 최적화로 성과를 높입니다.",
              image: "/images/difference5.json"
            }
          ].map((project, idx) => (
            <div key={project.id} className={`${styles.capaCard} ${idx % 2 === 1 ? styles.capaReverse : ''}`}>
              <motion.div 
                className={styles.capaImageWrapper}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                {project.image.endsWith('.json') ? (
                  <LottiePlayer src={project.image} />
                ) : project.image.endsWith('.mp4') || project.image.endsWith('.mov') ? (
                  <video 
                    src={project.image} 
                    className={styles.projectImage} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={project.image} alt={project.title} className={styles.projectImage} />
                )}
              </motion.div>
              
              <motion.div 
                className={styles.capaInfo}
                initial={{ opacity: 0, x: idx % 2 === 1 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className={styles.capaNumber}>0{idx + 1}</span>
                <h3 className={styles.capaName}>{project.title}</h3>
                <p className={styles.capaDesc}>{project.description}</p>
              </motion.div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Section 05: Ideal Clients */}
      <section className={styles.idealSection}>
        <div className={styles.idealContainer}>
          <motion.h2 
            className={styles.sectionHeadline}
            initial={{ y: 40, opacity: 0 }} 
            whileInView={{ y: 0, opacity: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            이런분께 추천합니다.
          </motion.h2>
          
          <div className={styles.idealList}>
            {[
              { en: "The Experts", ko: "병원, 법인, 전문직" },
              { en: "The Scale Up", ko: "성장 중인 소상공인/스타트업" },
              { en: "The Resource Saver", ko: "시간·비용 낭비 없이 한 번에 끝내고 싶은 분" }
            ].map((ideal, idx) => (
              <motion.div 
                key={idx} 
                className={styles.idealItem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <h3 className={styles.idealTitle}>
                  <span className={styles.idealTitleEn}>{ideal.en}</span>
                  <span className={styles.idealTitleKo}>{ideal.ko}</span>
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 06: Pricing Plan (다크모드 강제) */}
      <section ref={pricingRef} id="pricing" className={styles.pricingSection}>
        <motion.div 
          className={styles.pricingBg}
          initial={{ y: "100%" }}
          whileInView={{ y: "0%" }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className={styles.pricingContainer}>
          <div className={styles.pricingHeader}>
            <motion.h2 
              className={styles.sectionHeadlineCenter}
              initial={{ y: 40, opacity: 0 }} 
              whileInView={{ y: 0, opacity: 1 }} 
              viewport={{ once: true }} 
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Pricing Plan
            </motion.h2>
            <motion.p 
              className={styles.pricingSubtitle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              복잡한 견적 조율 없이, 모든 비용은 정찰제로 투명하게 통제됩니다.
            </motion.p>
          </div>
          
          <div className={styles.pricingGrid}>
            {[
              { title: "Standard", type: "(랜딩/원페이지)", price: "₩ 590,000", desc: "핵심 가치를 한 페이지에 압축하는 입문 플랜", features: ["기본 5개 섹션 반응형 원페이지", "비즈니스 분석 & 맞춤 카피라이팅", "브랜드 맞춤형 비주얼 디자인", "구글·AI 검색(SEO) 기본 세팅", "자체 관리자 페이지 및 운영 가이드 제공"] },
              { title: "Premium", type: "(공식 홈페이지)", price: "₩ 1,490,000", desc: "브랜드 아이덴티티를 완벽히 구현하는 대표 플랜", pop: true, features: ["핵심 5개 페이지 (소개, 서비스, 포트폴리오 등)", "홈페이지 ↔ PDF 자동 변환 구축", "고감도 인터랙션 빌드", "초고속 글로벌 CDN 서버 배포", "Standard 플랜 혜택 모두 포함"] },
              { title: "Enterprise", type: "(종합 브랜딩 패키지)", price: "₩ 2,990,000", desc: "스케일업을 위한 완전한 웹사이트를 구현하는 플랜", features: ["대규모 10개 다중 페이지 마스터 빌드", "브랜드 맞춤형 하이엔드 인터랙션", "테크니컬 검색 엔진 최적화(SEO)", "Premium 플랜 혜택 모두 포함"] }
            ].map((plan, idx) => (
              <motion.div 
                key={idx} 
                className={`${styles.pricingCard} ${plan.pop ? styles.pricingPopular : ''}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              >
                {plan.pop && <div className={styles.popBadge}>추천</div>}
                <div className={styles.planHeader}>
                  <h3 className={styles.planTitle}>{plan.title}</h3>
                  <span className={styles.planType}>{plan.type}</span>
                </div>
                <p className={styles.planDesc}>{plan.desc}</p>
                <div className={styles.planPrice}>
                  {plan.price}
                  <span className={styles.vatText}>(VAT 별도)</span>
                </div>
                <ul className={styles.planFeatures}>
                  {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </motion.div>
            ))}
          </div>
          
          <div className={styles.pricingNotice}>
            <p>※ 도메인 비용(연 약 2만 원대)은 고객 부담이며, 별도 대행 수수료는 없습니다.</p>
            <p>※ 현재 오픈 이벤트로 1년간 프리미엄 유지보수 혜택(서버 모니터링, 오류 수정, 도메인 연결 등)을 무상으로 지원해 드립니다.</p>
            <p>※ 이후 유지관리를 원하실 경우, 연간 99,000원의 비용으로 연장하여 이용하실 수 있습니다.</p>
          </div>
        </div>
      </section>

      {/* Section 07: FAQ */}
      <section ref={faqRef} id="faq" className={styles.faqSection}>
        <div className={styles.faqContainer}>
          <motion.h2 
            className={styles.sectionHeadline}
            initial={{ y: 40, opacity: 0 }} 
            whileInView={{ y: 0, opacity: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            FAQ
          </motion.h2>
          
          <div className={styles.faqList}>
            {[
              { q: "완성된 웹사이트의 소스코드를 직접 소유할 수 있나요?", a: "네, 100% 가능합니다. 헤이플로우는 빌딩이 완료된 오리지널 소스코드(HTML/CSS/JS) 일체를 투명하게 파일로 인도해 드립니다. 플랫폼의 규격에 갇히는 폐쇄형 웹 빌더와 달리, 특정 솔루션에 절대 종속되지 않으므로 향후 언제 어디서나 귀사만의 자유로운 유지보수와 서버 이전이 가능합니다." },
              { q: "스마트폰이나 태블릿 등 모바일 환경에서도 잘 보이나요?", a: "네, 기본 스펙입니다. 헤이플로우가 빌딩하는 모든 페이지는 유연한 '반응형 웹사이트'로 제작됩니다. 접속하는 사용자의 기기(PC, 태블릿, 모바일) 디스플레이 환경을 실시간으로 감지하여 레이아웃이 가장 선명하고 세련된 형태로 자동 최적화됩니다." },
              { q: "제작 비용 외에 추가로 발생하는 유지 비용이 있나요?", a: "호스팅 서버비는 별도로 발생하지 않습니다. 현재 오픈 이벤트로 호스팅·도메인 관리·SSL·서버 모니터링을 포함한 프리미엄 유지관리를 1년간 무상으로 제공해 드립니다.\n이후 유지관리를 원하실 경우, 연간 99,000원의 비용으로 연장하여 이용하실 수 있습니다.\n\n*호스팅\n쉽게 말해 온라인 빌딩의 월세입니다. 웹사이트가 24시간 인터넷에 켜져 있도록 서버에 올려두는 것으로, 일반적으로 매달 별도 비용이 발생합니다.\n\n*도메인\n홈페이지에 방문하기 위한 인터넷 주소(URL)를 의미합니다. 월간 약 2천 원의 비용이 발생합니다. .co.kr = 연 22,000원 / .com = 연 27,500원. 헤이플로우는 별도의 수수료를 취하지 않으며, 구매·연결을 대행해 드립니다.\n\n*SSL\n모든 웹사이트에 사실상 필수입니다. 주소창에 자물쇠 아이콘이 표시되는 보안 인증서로, 없으면 브라우저에서 '안전하지 않은 사이트'로 경고가 뜨며 검색 순위와 고객 신뢰도에 직접적인 영향을 줍니다." },
              { q: "구글 검색 엔진 및 AI 최상위 동기화는 정말 작동하나요?", a: "네, 확실하게 작동합니다. 단순히 눈에만 예쁜 사이트가 아니라, 구글 검색 로봇과 챗GPT, 제미나이 등 차세대 AI 비서들이 웹사이트의 정보를 가장 정확하고 빠르게 크롤링할 수 있도록 표준 시멘틱 마크업 가이드라인을 철저히 준수하여 빌딩합니다. 브랜드의 장기적인 디지털 자산 가치를 극대화하는 헤이플로우만의 핵심 기술입니다." }
            ].map((faq, idx) => (
              <div key={idx} className={`${styles.faqItem} ${openFaq === idx ? styles.faqOpen : ''}`}>
                <button className={`${styles.faqQuestion} cursor-hover`} onClick={() => toggleFaq(idx)}>
                  <span className={styles.faqQMark}>Q.</span>
                  {faq.q}
                  <span className={styles.faqIcon}>
                    {openFaq === idx ? <Minus size={20}/> : <Plus size={20}/>}
                  </span>
                </button>
                <motion.div 
                  className={styles.faqAnswerWrapper}
                  initial={false}
                  animate={{ height: openFaq === idx ? 'auto' : 0, opacity: openFaq === idx ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.faqAnswer}>
                    <span className={styles.faqAMark}>A.</span>
                    <p style={{ whiteSpace: "pre-line" }}>{faq.a}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 08: Contact & Footer */}
      <footer className={styles.footerSection}>
        <div className={styles.contactContainer}>
          <h2 className={styles.contactTitle}>
            <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
              잘 되는 비즈니스엔,
            </motion.div>
            <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}>
              그에 맞는 웹사이트가 있어야 합니다.
            </motion.div>
          </h2>
          <p className={styles.contactDesc}>
            몇 가지 질문에 답해주시면 24시간 이내에 디렉터가 직접 연락드립니다.
          </p>
          <button 
            className={`${styles.ctaButton} cursor-hover`}
            onClick={handleContactOpen}
          >
            프로젝트 시작하기 <ArrowRight className={styles.ctaIcon} />
          </button>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerLegal}>
            <div className={styles.legalRow}>
              <span>아카이브헤이</span>
              <span className={styles.divider}>|</span>
              <span>브랜드명: 헤이플로우</span>
              <span className={styles.divider}>|</span>
              <span>대표: 지원규</span>
              <span className={styles.divider}>|</span>
              <span>사업자등록번호: 151-47-01239</span>
            </div>
            <div className={styles.legalRow}>
              <span>주소: 경기도 화성시 동탄구 동탄중심상가2길 8, 4층 401-하46호</span>
              <span className={styles.divider}>|</span>
              <span>이메일: team.archivehey@gmail.com</span>
              <span className={styles.divider}>|</span>
              <span>TEL: 0507-1395-1381</span>
              <span className={styles.divider}>|</span>
              <a href="http://pf.kakao.com/_xacxenX/chat" target="_blank" rel="noopener noreferrer" className="cursor-hover" style={{ fontWeight: 600 }}>카카오톡 문의</a>
            </div>
            <div className={styles.legalPolicy}>
              <Link href="/privacy" className="cursor-hover">개인정보처리방침</Link>
              <span className={styles.divider}>|</span>
              <Link href="/terms" className="cursor-hover">이용약관</Link>
            </div>
          </div>
          <p className={styles.copyright}>© {new Date().getFullYear()} heyflow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
