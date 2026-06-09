"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../legal.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>
        <ArrowLeft size={16} /> 돌아가기
      </Link>
      
      <h1 className={styles.title}>개인정보처리방침</h1>
      <span className={styles.updatedDate}>최종 수정일: 2026년 6월 9일</span>

      <div className={styles.content}>
        <section>
          <h2>1. 개인정보의 수집 및 이용 목적</h2>
          <p>아카이브헤이(브랜드명: HeyFlow)는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 사전 동의를 구합니다.</p>
          <ul>
            <li>프로젝트 문의 접수, 상담 및 원활한 의사소통 경로 확보</li>
            <li>프로젝트 진행 시 계약 이행 및 서비스 제공</li>
          </ul>
        </section>

        <section>
          <h2>2. 수집하는 개인정보 항목</h2>
          <p>회사는 프로젝트 상담 및 의뢰를 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
          <ul>
            <li>필수항목: 이름(또는 브랜드명), 연락처(전화번호 또는 이메일)</li>
            <li>선택항목: 프로젝트 예산, 고민 및 목표 등 문의 폼 기재 내용</li>
          </ul>
        </section>

        <section>
          <h2>3. 개인정보의 보유 및 이용기간</h2>
          <p>원칙적으로, 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 아래와 같이 관계법령에서 정한 일정한 기간 동안 개인정보를 보관합니다.</p>
          <ul>
            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
            <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
          </ul>
        </section>

        <section>
          <h2>4. 개인정보의 파기절차 및 방법</h2>
          <p>이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다.</p>
          <ul>
            <li>파기절차: 수집된 정보는 목적이 달성된 후 파기됩니다.</li>
            <li>파기방법: 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
          </ul>
        </section>

        <section>
          <h2>5. 개인정보보호 책임자 및 연락처</h2>
          <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
          <ul>
            <li>책임자: 지원규 (대표)</li>
            <li>이메일: travel202@naver.com</li>
            <li>전화번호: 0507-1395-1381</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
