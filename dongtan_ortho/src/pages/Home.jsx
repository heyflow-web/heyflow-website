import { ArrowRight, Phone, Calendar, Award, ShieldCheck, Activity, Users, MapPin, ChevronRight } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Floating Action Buttons */}
      <div className="floating-actions">
        <a href="https://pf.kakao.com" target="_blank" rel="noreferrer" className="fab kakao">
          <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg" alt="Kakao" />
          <span>상담</span>
        </a>
        <button className="fab booking">
          <Calendar size={20} />
          <span>예약</span>
        </button>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content fade-in">
            <span className="badge">동탄 최고의 통증 치료 파트너</span>
            <h1>환자의 마음까지 치료하는<br /><span>동탄 정형외과</span></h1>
            <p>최신 장비와 숙련된 경험으로 통증의 원인을 정확히 찾아냅니다.<br />수술 걱정 없는 비수술 맞춤 치료 시스템을 경험하세요.</p>
            <div className="hero-btns">
              <button className="btn btn-primary">빠른 예약 상담 <ArrowRight size={18} /></button>
              <button className="btn btn-outline">진료 시간 안내</button>
            </div>
          </div>
        </div>
      </section>

      {/* Non-Surgical Center */}
      <section className="treatment-preview">
        <div className="container">
          <div className="section-title">
            <h2>비수술 통증 센터</h2>
            <p>통증의 근본적인 원인을 해결하는 1:1 맞춤형 비수술 솔루션</p>
          </div>
          <div className="treatment-grid">
            {[
              { icon: <Activity />, title: '도수 치료', desc: '숙련된 치료사가 직접 관절과 근육을 교정하여 통증을 완화합니다.' },
              { icon: <ShieldCheck />, title: '체외충격파', desc: '고에너지 충격파로 손상된 조직의 재생을 촉진하고 혈류를 개선합니다.' },
              { icon: <Activity />, title: '신경 차단술', desc: '특수 장비를 이용해 통증의 원인이 되는 신경을 정확히 찾아 치료합니다.' },
              { icon: <ShieldCheck />, title: '특수 물리치료', desc: '최신 레이저 및 고주파 장비를 활용하여 빠른 회복을 돕습니다.' },
            ].map((item, idx) => (
              <div key={idx} className="treatment-card">
                <div className="icon-wrapper">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <button className="card-btn">상세보기 <ChevronRight size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Experts */}
      <section className="experts bg-white">
        <div className="container">
          <div className="section-title">
            <h2>분야별 전문 의료진</h2>
            <p>대학병원 출신, 풍부한 임상 경험을 가진 의료진이 함께합니다.</p>
          </div>
          <div className="expert-grid">
            {[
              { name: '김동탄 원장', role: '정형외과 전문의', school: '서울대학교 의과대학 졸업', philosophy: '과잉 진료 없이 정직한 마음으로 치료합니다.' },
              { name: '이동탄 원장', role: '재활의학과 전문의', school: '연세대학교 세브란스병원 전문의', philosophy: '기능 회복을 넘어 삶의 질까지 고려합니다.' },
            ].map((doc, idx) => (
              <div key={idx} className="expert-card">
                <div className="expert-img-placeholder"></div>
                <div className="expert-info">
                  <span className="doc-role">{doc.role}</span>
                  <h3>{doc.name}</h3>
                  <p className="school">{doc.school}</p>
                  <p className="philosophy">"{doc.philosophy}"</p>
                  <button className="btn btn-outline btn-sm">약력 더보기</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="facilities">
        <div className="container">
          <div className="section-title">
            <h2>최첨단 의료 장비 & 시설</h2>
            <p>정밀한 진단과 쾌적한 환경을 위해 아낌없이 투자합니다.</p>
          </div>
          <div className="facility-gallery">
            {[
              { title: '대학병원급 MRI', img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400' },
              { title: '정밀 CT 시스템', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400' },
              { title: '프라이빗 도수치료실', img: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=400' },
              { title: '호텔급 대기 라운지', img: 'https://images.unsplash.com/photo-1533333464540-192934149265?auto=format&fit=crop&q=80&w=400' },
            ].map((f, idx) => (
              <div key={idx} className="facility-card">
                <div className="img-wrapper">
                  <img src={f.img} alt={f.title} />
                </div>
                <h4>{f.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials bg-white">
        <div className="container">
          <div className="section-title">
            <h2>환자 리얼 후기</h2>
            <p>환자분들이 직접 남겨주신 소중한 감동의 순간들</p>
          </div>
          <div className="testimonial-grid">
            {[
              { name: '박OO 님', text: '지긋지긋하던 허리 통증이 도수치료 3회 만에 몰라보게 좋아졌어요. 원장님이 정말 친절하세요!' },
              { name: '이OO 님', text: '병원이 너무 깨끗하고 장비가 좋아서 믿음이 갔습니다. 설명도 이해하기 쉽게 해주셔서 좋았어요.' },
              { name: '김OO 님', text: '운동하다 다쳐서 막막했는데, 재활 치료 덕분에 다시 코트로 돌아갈 수 있게 되었습니다.' },
            ].map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p>"{t.text}"</p>
                <span className="author">- {t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
