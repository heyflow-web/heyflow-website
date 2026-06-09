"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useInView } from "framer-motion";
import { ArrowRight, Plus, Minus } from "lucide-react";
import Link from "next/link";
import styles from "./HomeClient.module.css";
import { Project } from "@/lib/notion";

export default function HomeClient({ projects = [] }: { projects?: Project[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // About 섹션 진입 시 배경 반전을 위한 옵저버
  const isAboutInView = useInView(aboutRef, { margin: "-40% 0px -40% 0px" });

  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleContactOpen = () => window.dispatchEvent(new Event("openContactModal"));

  return (
    <div ref={containerRef} className={styles.homeContainer}>
      {/* Section 01: Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTitle}>
            <div style={{ overflow: "hidden" }}>
              <motion.div 
                initial={{ y: "120%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                오프라인에서 증명된 브랜드의 가치,
              </motion.div>
            </div>
            <div style={{ overflow: "hidden" }}>
              <motion.div 
                initial={{ y: "120%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              >
                온라인에서도 동일한 밀도로.
              </motion.div>
            </div>
          </div>
          <motion.p 
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          >
            헤이플로우는 불필요한 비주얼 노이즈를 제어하고,<br />
            지금 비즈니스의 체급에 완벽히 동기화된 선명한 웹사이트를 빌딩합니다.
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

      {/* Section 02: Problem Section */}
      <section className={styles.problemSection}>
        <div className={styles.problemContainer}>
          <motion.h2 
            className={styles.sectionHeadline}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1 }}
          >
            브랜드가 겪고 있는 디지털 정체체
          </motion.h2>
          
          <div className={styles.problemList}>
            {[
              "01. 비즈니스의 실제 체급에 비해 너무 가벼워 보이는 공식 웹사이트",
              "02. 무료 빌더의 한계로 인해 지워지지 않는 아마추어 같은 레이아웃",
              "03. 본질을 가리는 화려한 기교와 불필요한 비주얼 소음(Noise)",
              "04. 비즈니스를 전혀 이해하지 못하는 대행사와의 소통으로 낭비된 시간",
              "05. 구글(SEO)과 인공지능(AEO) 시장의 표준을 따르지 못하는 낙후된 구조"
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                className={styles.problemItem}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <span className={styles.problemCheck}>!</span>
                <p>{item}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.p 
            className={styles.problemConclusion}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            하나라도 해당한다면, 현재 웹사이트는 브랜드를 대변하는 무기가 아니라 감점 요인입니다.
          </motion.p>
        </div>
      </section>

      {/* Section 03: Solution & Philosophy */}
      <section ref={aboutRef} className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <motion.h2 
            className={styles.aboutHeadline}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1 }}
          >
            우리는 불필요한 모든 장식을 덜어내는<br />
            '정제된 미니멀리즘'만을 지향합니다.
          </motion.h2>
          
          <motion.p 
            className={styles.aboutDesc}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            화려하기만 하고 정작 검색창에서 사라지는 웹사이트는 자산이 될 수 없습니다.<br />
            우리는 10년의 비주얼 안목으로 사용자의 시선이 머무는 세련된 동선을 설계합니다.
          </motion.p>
          
          <motion.p 
            className={styles.aboutDesc}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            동시에 구글 검색창과 차세대 AI 비서들이 가장 완벽하게 인식하는<br />
            최적화 구조로 웹사이트를 빌딩합니다.
          </motion.p>

          <motion.p 
            className={styles.aboutDesc}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            눈에 보이는 격조, 눈에 보이지 않는 강력한 생존 기술.<br />
            이것이 헤이플로우가 정의하는 새로운 디지털 표준입니다.
          </motion.p>
        </div>
      </section>

      {/* Selected Work (프로젝트 갤러리) */}
      <section className={styles.workSection}>
        <div className={styles.workHeader}>
          <h2 className={styles.workTitle}>Selected Work.</h2>
          <p className={styles.workSubtitle}>우리가 설계한 시선의 흐름들</p>
        </div>

        <div className={styles.workGrid}>
          {projects.map((project, idx) => (
            <Link href={`/projects/${project.id}`} key={project.id} className={`${styles.projectCard} cursor-hover`}>
              <motion.div 
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
              >
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.pcImage} alt={project.title} className={styles.projectImage} />
                </div>
                <div className={styles.projectInfo}>
                  <span className={styles.projectNumber}>0{idx + 1}</span>
                  <h3 className={styles.projectName}>{project.title}</h3>
                  <p className={styles.projectCategory}>{project.description || 'View Project'}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
        
        <div className={styles.viewAllWrapper}>
          <Link href="/projects" className={`${styles.ctaButton} cursor-hover`}>
            VIEW ALL PROJECTS <ArrowRight className={styles.ctaIcon} />
          </Link>
        </div>
      </section>

      {/* Section 04: Core Capabilities */}
      <section className={styles.capabilitiesSection}>
        <div className={styles.capaContainer}>
          <motion.h2 
            className={styles.sectionHeadline}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1 }}
          >
            압도적 차별점 5
          </motion.h2>
          
          <div className={styles.capaGrid}>
            {[
              { num: "01", title: "End-to-End Strategic Building", subtitle: "기획부터 제작까지, 완벽한 원스톱 프로세스", desc: "복잡한 기획안을 고민할 필요 없습니다. 기존의 회사소개서나 대략적인 사업 내용만 가볍게 전달해 주세요. 비즈니스 모델을 분석한 전략적 화면 구성부터 잠재 고객을 설득하는 카피라이팅, 그리고 고감도 프론트엔드 제작까지 모든 과정을 번거로움 없이 한 번에 완성합니다." },
              { num: "02", title: "Zero Server Cost & Full Ownership", subtitle: "월 고정 비용 0원, 완벽한 소유권", desc: "플랫폼에 종속되는 폐쇄형 웹 빌더를 거부합니다. 완성된 프로덕트의 원본 소스코드 소유권을 투명하게 인도합니다. 매월 지출되는 불필요한 호스팅 비용을 완전히 제거하고, 가벼우면서도 독립적인 운영 생태계를 제공합니다." },
              { num: "03", title: "One-Source Multi-Channel Sync", subtitle: "웹사이트와 제안서(PDF)의 동시 빌드", desc: "온라인의 선명함이 오프라인 미팅룸까지 그대로 동기화됩니다. 웹 빌딩 한 번으로 거래처 송부용 회사소개서와 제안서(PDF)가 동일한 밀도의 디자인 시스템으로 한 번에 빌드됩니다. 단 하나의 액션으로 비즈니스의 모든 터치포인트를 장악하세요." },
              { num: "04", title: "AI Visual Branding & Identity", subtitle: "컨셉에 맞는 AI 이미지로 브랜딩 완성", desc: "별도의 고비용 사진 촬영 없이도 브랜드 무드에 딱 맞는 비주얼을 구현합니다. 비즈니스의 페르소나를 정밀하게 반영한 독창적인 AI 아트워크를 직접 설계하고 배치하여, 리소스는 최소화하고 시각적 임팩트는 극대화합니다." },
              { num: "05", title: "Search Engine & AI Top-Tier Sync", subtitle: "검색 엔진 및 AI 최상위 동기화", desc: "단순한 비주얼을 넘어 디지털 세상의 생존 기술을 심습니다. 구글 검색창과 챗GPT, 제미나이 등 차세대 AI 비서들이 우리 브랜드를 가장 먼저 찾아내고 검색 최상위에 동기화할 수 있도록 표준 웹 가이드라인을 완벽히 준수해 설계합니다." }
            ].map((capa, idx) => (
              <motion.div 
                key={idx} 
                className={styles.capaCard}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              >
                <div className={styles.capaHeader}>
                  <span className={styles.capaNum}>{capa.num}</span>
                  <h3 className={styles.capaTitle}>{capa.title}</h3>
                </div>
                <h4 className={styles.capaSubtitle}>• {capa.subtitle}</h4>
                <p className={styles.capaDesc}>{capa.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 05: Ideal Clients */}
      <section className={styles.idealSection}>
        <div className={styles.idealContainer}>
          <motion.h2 
            className={styles.sectionHeadline}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1 }}
          >
            이런 비즈니스라면,<br/>헤이플로우가 가장 확실한 답안지입니다.
          </motion.h2>
          
          <div className={styles.idealList}>
            {[
              { tag: "The Scale Up", title: "체급 성장을 준비하는 스타트업 및 중소기업", desc: "오프라인 매출이나 기업의 실제 역량은 탄탄한데, 홈페이지가 그 수준을 따라가지 못해 대외적인 신뢰도 손해를 보고 계신 대표님" },
              { tag: "The Experts", title: "신뢰도가 생명인 전문 법인 및 메디컬 그룹", desc: "거래처 제안, 투자 미팅, 혹은 환자 내원 전 '첫인상 검증' 단계에서 압도적이고 정제된 프로의 인상을 심어주고 싶으신 분" },
              { tag: "The Resource Saver", title: "기획과 리소스 낭비를 원치 않는 경영자", desc: "바쁜 본업 때문에 스토리보드나 카피라이팅을 붙잡고 있을 시간이 없어, 텍스트 한 줄만 던져도 전략적으로 알아서 빌딩해 주길 원하시는 분" },
              { tag: "The Smart Investor", title: "불필요한 고정 지출을 혐오하는 경영자", desc: "매달 빠져나가는 폐쇄형 빌더의 유료 구독료와 호스팅 비용이 아깝고, 단 한 번의 제작으로 완벽한 독립 소유권을 확보하고 싶으신 분" },
              { tag: "The Omnichannel", title: "온·오프라인 브랜딩을 한 번에 끝내고 싶은 브랜드", desc: "웹사이트 따로, 회사소개서(PPT) 따로 만드느라 디자인 톤이 깨지는 게 지치신 분. 단 한 번의 빌드로 제안서(PDF)까지 완벽하게 동기화하고 싶으신 분" }
            ].map((ideal, idx) => (
              <motion.div 
                key={idx} 
                className={styles.idealItem}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <div className={styles.idealHeaderInner}>
                  <span className={styles.idealTag}>{ideal.tag}</span>
                  <h3 className={styles.idealTitle}>{ideal.title}</h3>
                </div>
                <p className={styles.idealDesc}>{ideal.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 06: Pricing Plan */}
      <section className={styles.pricingSection}>
        <div className={styles.pricingContainer}>
          <motion.div 
            className={styles.pricingHeader}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1 }}
          >
            <h2 className={styles.sectionHeadlineCenter}>Pricing Plan</h2>
            <p className={styles.pricingSubtitle}>복잡한 견적 조율 없이, 모든 비용은 정찰제로 투명하게 통제됩니다.</p>
          </motion.div>
          
          <div className={styles.pricingGrid}>
            {[
              { title: "Standard Flow", type: "(랜딩/원페이지)", price: "₩ 399,000", desc: "비즈니스의 핵심 가치를 한 페이지에 압도적인 밀도로 압축하는 플랜", features: ["기본 5개 섹션 내외 구성의 고감도 반응형 원페이지 빌드", "비즈니스 모델 분석 기반의 전략적 화면 구성 및 카피라이팅", "컨셉에 맞는 맞춤형 비주얼 브랜딩 셋업", "구글 & AI 검색 최상위 동기화 기본 세팅", "완벽한 소유권 이전 및 월 고정 서버비 0원"] },
              { title: "Premium Flow", type: "(공식 홈페이지)", price: "₩ 1,490,000", desc: "기업의 체급에 걸맞은 선명한 아이덴티티와 오프라인의 가치를 완벽히 동기화하는 플랜", pop: true, features: ["핵심 5개 페이지 구성 (회사소개, 서비스 안내, 포트폴리오, 문의 양식 등)", "One-Source Multi-Channel Sync (홈페이지 기반 PDF 동시 빌드)", "마우스 호버 및 스크롤 인터랙션 고도화 디렉팅", "초고속 글로벌 CDN 인프라 기반 배포 최적화", "Standard Flow의 모든 기본 혜택 포함"] },
              { title: "Enterprise Flow", type: "(종합 브랜딩 패키지)", price: "₩ 2,990,000", desc: "스케일업을 위한 대규모 아카이브와 강력한 디지털 무기를 완벽하게 장착하는 플랜", features: ["대규모 정보 구조를 담아내는 다중 10개 페이지 마스터 빌드", "브랜드 아이덴티티를 극대화하는 맞춤형 인터랙션 디자인 엔지니어링", "검색 엔진 최적화(SEO) 고도화 테크니컬 세팅", "Premium Flow의 모든 하이엔드 기능 포함"] }
            ].map((plan, idx) => (
              <motion.div 
                key={idx} 
                className={`${styles.pricingCard} ${plan.pop ? styles.pricingPopular : ''}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              >
                {plan.pop && <div className={styles.popBadge}>MOST POPULAR</div>}
                <div className={styles.planHeader}>
                  <h3 className={styles.planTitle}>{plan.title}</h3>
                  <span className={styles.planType}>{plan.type}</span>
                </div>
                <p className={styles.planDesc}>{plan.desc}</p>
                <div className={styles.planPrice}>{plan.price}</div>
                <ul className={styles.planFeatures}>
                  {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </motion.div>
            ))}
          </div>
          
          <p className={styles.pricingNotice}>
            ※ 모든 플랜에는 구매·연결 대행 수수료가 포함되어 있으며, '1년간 프리미엄 유지관리(도메인 관리+SSL+서버 모니터링)'가 무상으로 제공됩니다.<br/>
            ※ 2년 차부터는 안정적인 사이트 유지 및 전담 디렉터 마크 관리를 위해 연간 유지관리 비용(Standard 연 99,000원 / Premium 연 198,000원 *부가세 포함)이 청구됩니다.
          </p>
        </div>
      </section>

      {/* Section 07: FAQ */}
      <section className={styles.faqSection}>
        <div className={styles.faqContainer}>
          <motion.h2 
            className={styles.sectionHeadline}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1 }}
          >
            FAQ
          </motion.h2>
          
          <div className={styles.faqList}>
            {[
              { q: "완성된 웹사이트의 소스코드를 직접 소유할 수 있나요?", a: "네, 100% 가능합니다. 헤이플로우는 빌딩이 완료된 오리지널 소스코드(HTML/CSS/JS) 일체를 투명하게 파일로 인도해 드립니다. 플랫폼의 규격에 갇히는 폐쇄형 웹 빌더와 달리, 특정 솔루션에 절대 종속되지 않으므로 향후 언제 어디서나 귀사만의 자유로운 유지보수와 서버 이전이 가능합니다." },
              { q: "스마트폰이나 태블릿 등 모바일 환경에서도 잘 보이나요?", a: "네, 기본 스펙입니다. 헤이플로우가 빌딩하는 모든 페이지는 유연한 '반응형 웹사이트'로 제작됩니다. 접속하는 사용자의 기기(PC, 태블릿, 모바일) 디스플레이 환경을 실시간으로 감지하여 레이아웃이 가장 선명하고 세련된 형태로 자동 최적화됩니다." },
              { q: "제작 기간은 얼마나 걸리나요?", a: "헤이플로우는 비효율적인 소통 구조를 생략하고 브랜드의 핵심 동선과 시각적 밀도에만 집중합니다. 대표님께서 대략적인 자료와 피드백을 전달해 주신 시점부터, 평균 3~5일 이내에 완전히 작동하는 고감도 최종본을 마주하실 수 있습니다." },
              { q: "제작 비용 외에 추가로 발생하는 유지 비용이 있나요?", a: "기본적으로 헤이플로우는 매달 수만 원씩 유료 호스팅 월세를 내실 필요가 없도록 서버비 0원의 독립형 인프라 구조로 빌딩해 드립니다. 다만 도메인 갱신, 보안인증서(SSL) 관리, 정기 모니터링 등 신경 쓰이는 사이트 관리를 완벽하게 위임하고 싶으신 분들을 위해 2년 차부터 최소한의 연간 프리미엄 유지관리 패키지를 정찰제로 운영하고 있습니다." },
              { q: "도메인은 정확히 무엇이며 어떻게 준비해야 하나요?", a: "도메인은 홈페이지에 진입하기 위한 주소(예: .com, .co.kr)를 뜻하며, 공통적으로 연간 약 2만 원대의 필수 리소스 비용이 발생합니다. 헤이플로우는 이에 대한 별도의 대행 수수료를 취하지 않으며, 복잡한 네임서버 연결부터 도메인 매칭까지 전 과정을 알아서 완벽하게 세팅해 드리니 걱정하지 않으셔도 됩니다." },
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
                    <p>{faq.a}</p>
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
          <h2 className={styles.contactTitle}>링크 하나로 증명되는<br/>비즈니스의 첫인상.</h2>
          <p className={styles.contactDesc}>
            더 이상 주춤할 필요 없는 당당한 아이덴티티를 전달하세요.<br/>
            비주얼 소음을 걷어내고, 구글과 AI가 먼저 주목하는 브랜드 본질만 남길 준비가 되셨나요?<br/>
            몇 가지 질문에 답해주시면 24시간 이내에 디렉터가 직접 연락을 드립니다.
          </p>
          <button 
            className={`${styles.ctaButton} cursor-hover`}
            onClick={handleContactOpen}
          >
            START A PROJECT <ArrowRight className={styles.ctaIcon} />
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
              <span>이메일: travel202@naver.com</span>
              <span className={styles.divider}>|</span>
              <span>TEL: 0507-1395-1381</span>
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
