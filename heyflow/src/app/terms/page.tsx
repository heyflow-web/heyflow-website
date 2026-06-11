"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../legal.module.css";

export default function TermsOfService() {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>
        <ArrowLeft size={16} /> 돌아가기
      </Link>
      
      <h1 className={styles.title}>이용약관</h1>
      <span className={styles.updatedDate}>최종 수정일: 2026년 6월 9일</span>

      <div className={styles.content}>
        <section>
          <h2>제 1 조 (목적)</h2>
          <p>이 약관은 아카이브헤이(이하 "회사")가 운영하는 웹사이트(heyflow)에서 제공하는 인터넷 관련 서비스(이하 "서비스")를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2>제 2 조 (정의)</h2>
          <ul>
            <li>"웹사이트"란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 서비스를 제공할 수 있도록 설정한 가상의 영업장을 말합니다.</li>
            <li>"이용자"란 웹사이트에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 받는 자를 말합니다.</li>
          </ul>
        </section>

        <section>
          <h2>제 3 조 (서비스의 제공 및 변경)</h2>
          <p>회사는 다음과 같은 업무를 수행합니다.</p>
          <ul>
            <li>웹사이트 및 브랜딩 제작 관련 포트폴리오 안내 및 상담 접수</li>
            <li>기타 회사가 정하는 업무</li>
          </ul>
        </section>

        <section>
          <h2>제 4 조 (서비스의 중단)</h2>
          <p>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
        </section>

        <section>
          <h2>제 5 조 (저작권의 귀속 및 이용제한)</h2>
          <ul>
            <li>회사가 작성한 저작물에 대한 저작권 및 기타 지적재산권은 회사에 귀속합니다.</li>
            <li>이용자는 웹사이트를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
          </ul>
        </section>

        <section>
          <h2>제 6 조 (분쟁해결)</h2>
          <p>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 최선을 다합니다. 서비스 이용과 관련하여 발생한 분쟁에 대해 회사의 연락처(0507-1395-1381 또는 travel202@naver.com)를 통해 원만히 해결할 수 있도록 합니다.</p>
        </section>
      </div>
    </div>
  );
}
