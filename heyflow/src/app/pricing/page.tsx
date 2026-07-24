"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./pricing.module.css";

export default function PricingPage() {
  return (
    <main className={styles.pricingSection}>
      <div className={styles.pricingContainer}>
        <div className={styles.pricingHeader}>
          <motion.h2 
            className={styles.sectionHeadlineCenter}
            initial={{ y: 40, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Pricing Plan
          </motion.h2>
          <motion.p 
            className={styles.pricingSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            복잡한 견적 조율 없이, 모든 비용은 정찰제로 투명하게 통제됩니다.
          </motion.p>
        </div>
        
        <div className={styles.pricingGrid}>
          {[
            { 
              title: "Standard", 
              type: "(랜딩/원페이지)", 
              price: "₩ 590,000", 
              desc: "핵심 가치를 한 페이지에 압축하는 입문 플랜", 
              features: ["기본 5개 섹션 반응형 원페이지", "비즈니스 분석 & 맞춤 카피라이팅", "브랜드 맞춤형 비주얼 디자인", "구글·AI 검색(SEO) 기본 세팅", "자체 관리자 페이지 및 운영 가이드 제공"] 
            },
            { 
              title: "Premium", 
              type: "(공식 홈페이지)", 
              price: "₩ 1,490,000", 
              desc: "브랜드 아이덴티티를 완벽히 구현하는 대표 플랜", 
              pop: true, 
              features: ["핵심 5개 페이지 (소개, 서비스, 포트폴리오 등)", "홈페이지 ↔ PDF 자동 변환 구축", "고감도 인터랙션 빌드", "초고속 글로벌 CDN 서버 배포", "Standard 플랜 혜택 모두 포함"] 
            },
            { 
              title: "Enterprise", 
              type: "(종합 브랜딩 패키지)", 
              price: "₩ 2,990,000", 
              desc: "스케일업을 위한 완전한 웹사이트를 구현하는 플랜", 
              features: ["대규모 10개 다중 페이지 마스터 빌드", "브랜드 맞춤형 하이엔드 인터랙션", "테크니컬 검색 엔진 최적화(SEO)", "Premium 플랜 혜택 모두 포함"] 
            }
          ].map((plan, idx) => (
            <motion.div 
              key={idx} 
              className={`${styles.pricingCard} ${plan.pop ? styles.pricingPopular : ''}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
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
        
        <motion.div 
          className={styles.pricingNotice}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p>※ 도메인 비용(연 약 2만 원대)은 고객 부담이며, 별도 대행 수수료는 없습니다.</p>
          <p>※ 현재 오픈 이벤트로 1년간 프리미엄 유지보수 혜택(서버 모니터링, 오류 수정, 도메인 연결 등)을 무상으로 지원해 드립니다.</p>
          <p>※ 이후 유지관리를 원하실 경우, 연간 99,000원의 비용으로 연장하여 이용하실 수 있습니다.</p>
        </motion.div>
      </div>
    </main>
  );
}
