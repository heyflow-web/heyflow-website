import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ArrowRight,
  Activity, 
  Stethoscope, 
  Bone, 
  ShieldCheck,
  Search,
  MapPin,
  Clock,
  Phone,
  Syringe,
  Waves,
  Calendar,
  User,
  CheckCircle,
  X
} from 'lucide-react';

// ==========================================
// 1. 예약 모달 (ReservationModal) - 프리미엄 인터랙티브 팝업
// ==========================================
const ReservationModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: 'spine',
    date: '',
    time: '09:30'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(2); // 완료 단계로 전환
  };

  const handleReset = () => {
    setStep(1);
    setFormData({ name: '', phone: '', department: 'spine', date: '', time: '09:30' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
        {/* 뒷배경 블러 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* 모달 박스 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl z-10"
        >
          {/* 닫기 버튼 */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors z-20"
          >
            <X size={20} />
          </button>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="p-8 sm:p-10">
              <div className="mb-8">
                <span className="text-xs font-bold text-[#00A8E8] tracking-widest uppercase block mb-2">BON TONTON RESERVATION</span>
                <h3 className="text-2xl font-black text-[#0A2342] tracking-tight">간편 진료 예약</h3>
                <p className="text-sm text-slate-500 mt-1">빠르고 정밀한 진료를 위해 간단한 정보를 입력해주세요.</p>
              </div>

              <div className="space-y-5">
                {/* 이름 입력 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <User size={14} className="text-[#00A8E8]" /> 환자 성함
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="성함을 입력하세요"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A8E8] focus:border-transparent text-sm transition-all"
                  />
                </div>

                {/* 연락처 입력 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Phone size={14} className="text-[#00A8E8]" /> 연락처
                  </label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A8E8] focus:border-transparent text-sm transition-all"
                  />
                </div>

                {/* 희망 진료 부위 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Activity size={14} className="text-[#00A8E8]" /> 진료 분야 선택
                  </label>
                  <select 
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A8E8] focus:border-transparent text-sm transition-all bg-white"
                  >
                    <option value="spine">머리/목 척추센터</option>
                    <option value="joint">무릎 관절/연골 클리닉</option>
                    <option value="pain">비수술 통증 클리닉</option>
                    <option value="rehab">도수/물리 재활 클리닉</option>
                  </select>
                </div>

                {/* 날짜 및 시간 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#00A8E8]" /> 예약 희망일
                    </label>
                    <input 
                      type="date" 
                      required 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A8E8] focus:border-transparent text-sm transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Clock size={14} className="text-[#00A8E8]" /> 희망 시간
                    </label>
                    <select 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A8E8] focus:border-transparent text-sm transition-all bg-white"
                    >
                      <option value="09:30">09:30</option>
                      <option value="10:30">10:30</option>
                      <option value="11:30">11:30</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full mt-8 py-4 rounded-2xl bg-[#00A8E8] hover:bg-[#0096D6] text-white font-bold text-base transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98]"
              >
                예약 신청하기
              </button>
            </form>
          ) : (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6"
              >
                <CheckCircle size={44} />
              </motion.div>
              <h3 className="text-2xl font-black text-[#0A2342] mb-2">예약 신청 완료!</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-8">
                <span className="font-bold text-[#0A2342]">{formData.name}</span> 환자님의 소중한 진료 예약이 접수되었습니다. 담당자가 확인 후 빠른 시간 내에 안내 전화를 드리겠습니다.
              </p>
              <button 
                onClick={handleReset}
                className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
              >
                확인
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ==========================================
// 2. 상단 네비게이션바 (Navbar)
// ==========================================
const Navbar = ({ onOpenModal }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: '의료진 소개', href: '#doctors' },
    { name: '차별화 시스템', href: '#diff' },
    { name: '진료 분야', href: '#clinic' },
    { name: '성과 증명', href: '#proof' },
    { name: '치료 방법', href: '#treatment' },
    { name: '오시는 길', href: '#location' },
  ];

  return (
    <nav className={`nav-fixed ${scrolled ? 'nav-scrolled' : 'nav-transparent'}`}>
      <div className="container flex items-center justify-between h-full" style={{ paddingTop: scrolled ? '0' : '20px', paddingBottom: scrolled ? '0' : '20px', transition: 'padding 0.3s' }}>
        <div className="flex items-center gap-16">
          <a href="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '20px' }}>B</div>
            <span className="nav-logo" style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', color: scrolled ? 'var(--primary)' : 'white' }}>
              본튼튼정형외과
            </span>
          </a>
          <div className="flex items-center gap-10 nav-menu">
            {menuItems.map((item) => (
              <a 
                key={item.name} 
                href={item.href} 
                className="nav-link"
                style={{ color: scrolled ? 'var(--text-main)' : 'white', fontWeight: '700', fontSize: '15px', opacity: 0.9, textDecoration: 'none', transition: 'var(--transition)' }}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 nav-actions">
          <div className="nav-link" style={{ cursor: 'pointer', color: scrolled ? 'var(--text-main)' : 'white' }}>
            <Search size={22} />
          </div>
          <button onClick={onOpenModal} className="btn-primary" style={{ padding: '12px 32px' }}>
            빠른 예약
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .nav-menu, .nav-actions { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

// ==========================================
// 3. 메인 히어로 섹션 (Hero) - 배경 이미지 버그 해결
// ==========================================
const Hero = ({ onOpenModal }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "통증만 지우지 않고,\n움직임을 되찾아 드립니다",
      desc: "0.1mm의 오차 없는 정밀 주사 시술과 1:1 전담 치료사의 맞춤 재활 솔루션.",
      bg: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2000" // 현대적인 모던 정형외과 대기실/복도
    },
    {
      title: "과잉 진료 없는 정직한 진단으로\n신뢰를 약속하는 본튼튼정형외과",
      desc: "환자의 마음까지 치유하는 1:1 맞춤 전담 케어 시스템.",
      bg: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000" // 최신 의료기기 및 정밀 치료 분위기
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black flex flex-col justify-center">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentSlide}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.08 }}
          exit={{ opacity: 0 }}
          transition={{ 
            opacity: { duration: 1.2 },
            scale: { duration: 6, ease: "linear" } 
          }}
          className="absolute inset-0 z-0"
        >
          <div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              background: `url("${slides[currentSlide].bg}") center/cover no-repeat`, 
              filter: 'brightness(0.45)' 
            }} 
          />
          <div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(to right, rgba(10,35,66,0.85) 0%, rgba(10,35,66,0.4) 50%, rgba(0,0,0,0.3) 100%)' 
            }} 
          />
        </motion.div>
      </AnimatePresence>

      <div className="container relative z-10 text-left">
        <div style={{ maxWidth: '850px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: '800', letterSpacing: '3px', display: 'block', marginBottom: '24px' }}>
              BON TONTON ORTHOPEDIC CLINIC
            </span>
          </motion.div>
          
          <div className="relative" style={{ minHeight: '280px' }}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0"
              >
                <h1 className="title-xl text-white" style={{ marginBottom: '32px', wordBreak: 'keep-all', whiteSpace: 'pre-line' }}>
                  {slides[currentSlide].title}
                </h1>
                <p style={{ color: 'white', opacity: 0.9, fontSize: '20px', lineHeight: '1.8', marginBottom: '48px', wordBreak: 'keep-all', maxWidth: '650px' }}>
                  {slides[currentSlide].desc}
                </p>
                <button onClick={onOpenModal} className="btn-primary" style={{ padding: '20px 40px', fontSize: '16px' }}>
                  진료 예약 <ArrowRight size={20} />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div 
        className="absolute bottom-12 z-20 flex items-center gap-8"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      >
        {slides.map((_, i) => (
          <div key={i} className="flex items-center gap-3 group cursor-pointer" onClick={() => setCurrentSlide(i)}>
            <span style={{ 
              color: currentSlide === i ? 'white' : 'rgba(255,255,255,0.4)', 
              fontSize: '12px', 
              fontWeight: '700',
              fontFamily: 'monospace'
            }}>
              0{i + 1}
            </span>
            <div style={{ 
              width: currentSlide === i ? '60px' : '30px', 
              height: '2px', 
              background: currentSlide === i ? 'var(--accent)' : 'rgba(255,255,255,0.2)', 
              transition: 'all 0.6s cubic-bezier(0.2, 0, 0, 1)',
              borderRadius: '2px'
            }} />
          </div>
        ))}
      </div>
    </section>
  );
};

// ==========================================
// 4. 의료진 소개 (MedicalStaff) - 진료분야 위쪽으로 배치!
// ==========================================
const MedicalStaff = ({ onOpenModal }) => {
  return (
    <section className="section bg-[#F8F9FA]" id="doctors">
      <div className="container">
        <div className="grid grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="section-subtitle">PREMIUM MEDICAL TEAM</span>
            <div style={{ marginBottom: '40px' }}>
               <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-sub)', marginBottom: '12px' }}>
                 한 사람의 건강한 삶, 시작부터 끝까지, 본튼튼정형외과가 함께합니다.
               </p>
               <h2 style={{ fontSize: '56px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-2px', lineHeight: 1.1 }}>
                 Dr. KIM WOO BIN
               </h2>
            </div>
            
            <h3 className="title-md text-main mb-6" style={{ wordBreak: 'keep-all', lineHeight: 1.4 }}>
              안녕하세요,<br/>대표원장 김우빈입니다.
            </h3>
            <p style={{ color: 'var(--text-body)', fontSize: '16px', lineHeight: '1.8', marginBottom: '32px', wordBreak: 'keep-all' }}>
              본튼튼정형외과에서는 풍부한 임상경험과 고도의 의학적 전문성을 지닌 의료진들이 환자 개개인의 증상에 가장 적합한 1:1 맞춤형 치료를 지향합니다. 불필요한 과잉진료는 배제하고 환자분들이 다시 건강한 일상을 온전히 되찾을 수 있도록 최선을 다할 것을 약속드립니다.
            </p>

            {/* 원장 약력 추가로 신뢰도 급상승 */}
            <div className="mb-10 bg-white p-6 rounded-2xl border border-slate-100 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-800"><Stethoscope size={16} className="text-[#00A8E8]" /> 주요 약력</div>
              <p>• 서울대학교 의과대학 졸업 및 의학석사 수료</p>
              <p>• 서울대학교병원 신경외과 전문의 및 외래교수</p>
              <p>• 대한정형외과학회 & 대한스포츠의학회 정회원</p>
              <p>• 前 국가대표 전담 주치의 및 물리치료 도수학회 전문강사</p>
            </div>
            
            <button onClick={onOpenModal} className="btn-primary">
              의료진 소개 더보기 <ChevronRight size={18} />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="img-hover-zoom relative"
            style={{ aspectRatio: '4/5', borderRadius: '32px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}
          >
            <img 
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000" // 매우 신뢰감 넘치는 훈남 대표원장님 이미지
              alt="대표원장 김우빈" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <span className="text-xs font-bold text-[#00A8E8] uppercase tracking-widest block mb-1">REPRESENTATIVE DIRECTOR</span>
              <h4 className="text-xl font-black text-[#0A2342]">김우빈 대표원장</h4>
              <p className="text-xs text-slate-500 mt-1">환자 맞춤형 통증 관리 및 비수술 척추 관절 치료 권위자</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 5. 차별화된 진료시스템 (Differentiation - Solution) - 진료분야 위쪽으로 순서 변경!
// ==========================================
const Differentiation = () => {
  const diffs = [
    { 
      title: '10만 환자를 치료한\n풍부한 임상 경험', 
      desc: '본튼튼은 오랜 기간 축적해온 수많은 임상데이터와 치료 노하우를 바탕으로, 복잡하고 까다로운 척추관절 질환도 정확하게 진단하고 치료합니다.',
      img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1200' // 정밀 진단 및 X-ray 판독
    },
    { 
      title: '대표원장이 직접 집도하는\n정밀 주사 클리닉', 
      desc: '모든 시술 and 주사치료는 다년간의 경험을 갖춘 대표원장이 직접 시행합니다. 미세한 오차까지 잡아내는 초정밀 진단 장비로 안전성을 극대화합니다.',
      img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200' // 정밀 의료 기기 및 주사 클리닉
    },
    { 
      title: '바쁜 직장인도 Ok\n365일 입원실 운영', 
      desc: '시간적 여유가 부족한 직장인 및 현대인들을 위해 365일 체계적으로 운영되는 입원실을 갖추었습니다. 집중적인 치료와 회복이 필요할 때 언제든 편안하게 입원 치료를 받으실 수 있습니다.',
      img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000' // 모던하고 프리미엄한 입원실 내부
    },
  ];

  return (
    <section className="section bg-white" id="diff">
      <div className="container">
        <div className="text-center mb-20">
          <span className="section-subtitle">DIFFERENTIATION SYSTEM</span>
          <h2 style={{ fontSize: '80px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-2px', lineHeight: 1 }}>Solution.</h2>
        </div>

        <div className="flex flex-col gap-32">
          {diffs.map((d, i) => (
            <div key={i} className={`flex items-center gap-20 ${i % 2 !== 0 ? 'flex-row-reverse' : 'flex-row'} responsive-flex`}>
              <motion.div 
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="w-1/2 img-hover-zoom"
                style={{ aspectRatio: '16/10', boxShadow: '0 30px 60px rgba(0,0,0,0.08)' }}
              >
                <img src={d.img} alt={d.title} />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-1/2"
              >
                <span className="section-subtitle">PREMIUM ORTHOPEDIC CLINIC</span>
                <h3 className="title-md text-primary mb-6" style={{ whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>{d.title}</h3>
                <p style={{ color: 'var(--text-body)', fontSize: '17px', lineHeight: '1.8', wordBreak: 'keep-all' }}>{d.desc}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .responsive-flex {
            flex-direction: column !important;
            gap: 32px !important;
          }
          .responsive-flex > div {
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
};

// ==========================================
// 6. 진료분야 (SpecialClinic) - 차별점 아래쪽으로 순서 변경!
// ==========================================
const SpecialClinic = () => {
  const clinics = [
    { title: '머리/목 척추센터', desc: '신경외과 전문의가 직접 집도하는\n안전하고 정밀한 비수술 척추 시술 시스템', icon: <Bone size={32} /> },
    { title: '무릎 관절/연골 클리닉', desc: '자가골수 줄기세포 및 연골 재생 치료\n본연의 관절을 최대한 보존합니다', icon: <Activity size={32} /> },
    { title: '비수술 통증 클리닉', desc: '대학병원급 첨단 장비를 적극 도입한\n1:1 맞춤 통증 집중 치료 시스템', icon: <ShieldCheck size={32} /> },
    { title: '도수/물리 재활 클리닉', desc: '풍부한 경험의 전문 물리치료사가 진행하는\n1:1 전담 맞춤 도수 재활 치료', icon: <Stethoscope size={32} /> },
  ];

  return (
    <section className="section bg-[#F8F9FA]" id="clinic">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="section-subtitle">PREMIUM ORTHOPEDIC CLINIC</span>
          <h2 className="title-lg text-primary">정밀 주사 치료 & 통합 재활 솔루션</h2>
        </motion.div>

        <div className="grid grid-cols-4 gap-6 clinic-grid">
          {clinics.map((clinic, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`clinic-card-item clinic-card-${i}`}
            >
              <div className="clinic-card-icon">
                {clinic.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '16px', wordBreak: 'keep-all', lineHeight: '1.4' }}>{clinic.title}</h3>
                <p style={{ fontSize: '14px', opacity: 0.85, lineHeight: '1.6', wordBreak: 'keep-all', whiteSpace: 'pre-line' }}>{clinic.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .clinic-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 640px) {
          .clinic-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

// ==========================================
// 7. 성과증명 (ProofOfPerformance) - 통계 카운팅 수치 연출
// ==========================================
const Counter = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // cubic easeOut
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const ProofOfPerformance = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('proof');
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) setIsVisible(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="section bg-white" id="proof">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="section-subtitle">PREMIUM ORTHOPEDIC CLINIC</span>
          <h2 className="title-lg text-primary">10만 환자를 치료한<br/>풍부한 임상 경험이 실력을 증명합니다.</h2>
        </motion.div>

        <div className="grid grid-cols-3 gap-12 text-center relative stat-grid">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 -z-10 stat-line" />
          
          {[
            { label: "무릎관절수술/연골재생술 등", value: 7000, suffix: "례" },
            { label: "수술 후 환자 만족도", value: 94, suffix: "%" },
            { label: "지인 추천 의향", value: 92, suffix: "%" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-white p-12" 
              style={{ borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}
            >
              <div className="text-primary mb-6" style={{ fontSize: '72px', fontWeight: '900', lineHeight: 1, letterSpacing: '-2px' }}>
                {isVisible ? <Counter end={item.value} /> : `0`}
                <span className="text-accent" style={{ fontSize: '32px', marginLeft: '4px' }}>{item.suffix}</span>
              </div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-sub)', fontWeight: '700' }}>{item.label}</h3>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .stat-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .stat-line {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

// ==========================================
// 8. 치료방법 제안 (SmartPain) - 인터랙티브 탭 시스템
// ==========================================
const SmartPain = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { 
      title: '주사치료', 
      desc: '통증 부위에 직접 약물을 주입하여 염증을 빠르게 가라앉히고 조직 재생을 돕는 정밀 치료입니다. 초음파 및 C-arm 장비를 활용하여 병변 부위를 정확하게 타겟팅하므로 안전하고 효과적입니다.',
      icon: <Syringe size={48} />
    },
    { 
      title: '물리치료 / 도수치료', 
      desc: '통증 완화, 근력 강화 및 관절 가동범위 회복을 위해 환자 개개인의 증상과 체형에 맞춰 1:1 맞춤형 치료를 제공합니다. 임상경험이 풍부한 전문 도수치료사진이 직접 시행하므로 안심하고 치료받으실 수 있습니다.',
      icon: <Activity size={48} />
    },
    { 
      title: '체외충격파 치료', 
      desc: '체외에서 강한 충격파를 통증 부위에 가해 혈관 재형성을 돕고 건 및 그 주위 조직과 뼈의 치유 과정을 자극하는 안전한 비수술 치료입니다.',
      icon: <Waves size={48} />
    }
  ];

  return (
    <section className="section bg-[#F8F9FA]" id="treatment">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="section-subtitle">POPULAR ORTHOPEDIC CLINIC</span>
          <h2 className="title-lg text-primary">개인 맞춤형<br/>다양한 치료방법을 제안합니다.</h2>
        </motion.div>

        <div className="grid grid-cols-12 gap-10 treatment-grid">
          <div className="col-span-4 flex flex-col gap-4 treatment-tabs">
            {tabs.map((tab, i) => (
              <button 
                key={i}
                className={`tab-btn ${activeTab === i ? 'active' : ''}`}
                onClick={() => setActiveTab(i)}
              >
                {tab.title}
                <ChevronRight size={20} style={{ opacity: activeTab === i ? 1 : 0.3 }} />
              </button>
            ))}
          </div>
          
          <div className="col-span-8 treatment-content">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="h-full flex flex-col justify-center"
                style={{ borderRadius: '32px', padding: '80px', backgroundColor: 'var(--primary)', color: 'white', boxShadow: '0 30px 60px rgba(10,35,66,0.1)' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                  {tabs[activeTab].icon}
                </div>
                <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '24px' }}>{tabs[activeTab].title}</h3>
                <p style={{ fontSize: '18px', lineHeight: '1.8', opacity: 0.85, wordBreak: 'keep-all' }}>
                  {tabs[activeTab].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .treatment-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 24px !important;
          }
          .treatment-tabs {
            flex-direction: row !important;
            overflow-x: auto !important;
            padding-bottom: 8px !important;
          }
          .tab-btn {
            white-space: nowrap !important;
            padding: 16px 24px !important;
            font-size: 15px !important;
          }
          .treatment-content > div {
            padding: 40px !important;
          }
        }
      `}</style>
    </section>
  );
};

// ==========================================
// 9. 찾아오시는 길 (LocationCTA)
// ==========================================
const LocationCTA = () => {
  return (
    <section className="section bg-white" id="location">
      <div className="container">
        <div className="grid grid-cols-12 gap-10 location-grid">
          {/* Map Side - LEFT */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="col-span-7"
          >
            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.05)' }}>
              <div style={{ position: 'absolute', inset: 0, background: '#F0F2F5', display: 'flex', alignItems: 'center', justifyItems: 'center', flexDirection: 'column' }}>
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200" alt="지도 배경" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                  <MapPin size={32} className="text-[#00A8E8]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Information Side - RIGHT */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="col-span-5"
          >
            <div className="bg-white p-12 h-full flex flex-col justify-between" style={{ borderRadius: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
              <div className="flex flex-col gap-10">
                <div className="flex items-start gap-6">
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(0,168,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>오시는 길</h4>
                    <p style={{ color: 'var(--text-body)', fontSize: '15px', lineHeight: '1.6' }}>서울특별시 강남구 청담동 123-45<br/>오로라 빌딩 3-5층 (청담역 9번 출구 도보 2분)</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(0,168,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>전화 및 예약 문의</h4>
                    <p style={{ color: 'var(--primary)', fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>02-123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(0,168,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>진료 시간</h4>
                    <div style={{ color: 'var(--text-body)', fontSize: '15px', lineHeight: '1.8' }}>
                      <p>평 일 <span className="font-bold ml-2">09:00 - 19:00</span></p>
                      <p>토/일/공휴일 <span className="font-bold ml-2">09:00 - 14:00</span></p>
                      <p>점심시간 <span className="font-bold ml-2">13:00 - 14:00</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12">
                <button className="py-4 px-4 rounded-xl flex items-center justify-center gap-2" style={{ background: '#FEE500', color: '#191919', fontWeight: '800', fontSize: '15px', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}>
                  카카오톡 상담
                </button>
                <button className="py-4 px-4 rounded-xl flex items-center justify-center gap-2" style={{ background: '#03C75A', color: 'white', fontWeight: '800', fontSize: '15px', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}>
                  네이버 예약
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .location-grid {
            display: flex !important;
            flex-direction: column !important;
          }
          .location-grid > div {
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
};

// ==========================================
// 10. 푸터 (Footer)
// ==========================================
const Footer = () => {
  return (
    <footer className="bg-primary py-20 text-white">
      <div className="container">
        <div className="flex justify-between items-start mb-16 border-b border-white/10 pb-16 footer-grid">
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '24px' }}>
              본튼튼정형외과
            </h2>
            <div style={{ fontSize: '15px', opacity: 0.7, lineHeight: '2' }}>
              <p>서울특별시 강남구 청담동 123-45 오로라 빌딩 3-5F</p>
              <p>사업자등록번호 : 123-45-67890 | 대표원장 : 김우빈</p>
              <p className="flex items-center gap-2 mt-6 text-white font-bold text-xl"><Phone size={24} /> 02-123-4567</p>
            </div>
          </div>
          <div className="flex gap-20 footer-links">
            <div>
              <h4 className="text-accent mb-8 font-bold" style={{ fontSize: '16px', letterSpacing: '1px' }}>CLINIC HOURS</h4>
              <ul className="flex flex-col gap-4 text-sm opacity-70" style={{ listStyle: 'none', padding: 0 }}>
                <li>평 일 : 09:00 - 19:00</li>
                <li>토/일/공휴일 : 09:00 - 14:00</li>
                <li>점심시간 : 13:00 - 14:00</li>
              </ul>
            </div>
            <div>
              <h4 className="text-accent mb-8 font-bold" style={{ fontSize: '16px', letterSpacing: '1px' }}>QUICK LINKS</h4>
              <ul className="flex flex-col gap-4 text-sm opacity-70" style={{ listStyle: 'none', padding: 0 }}>
                <li><a href="#doctors" style={{ color: 'inherit', textDecoration: 'none' }}>의료진 소개</a></li>
                <li><a href="#diff" style={{ color: 'inherit', textDecoration: 'none' }}>차별점 시스템</a></li>
                <li><a href="#clinic" style={{ color: 'inherit', textDecoration: 'none' }}>전문 진료 분야</a></li>
                <li><a href="#location" style={{ color: 'inherit', textDecoration: 'none' }}>오시는 길</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs opacity-50 footer-bottom">
          <div>© 2026 BON TONTON ORTHOPEDIC CLINIC. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-6">
            <span style={{ cursor: 'pointer' }}>이용약관</span>
            <span style={{ cursor: 'pointer', fontWeight: 'bold' }}>개인정보처리방침</span>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 40px !important;
          }
          .footer-links {
            gap: 40px !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            gap: 16px !important;
            text-align: center !important;
          }
        }
      `}</style>
    </footer>
  );
};

// ==========================================
// 11. 메인 App 컴포넌트
// ==========================================
const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="app">
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      
      {/* 1. 히어로 섹션 */}
      <Hero onOpenModal={() => setIsModalOpen(true)} />
      
      {/* 2. 의료진 소개 (진료분야 위로 올림) */}
      <MedicalStaff onOpenModal={() => setIsModalOpen(true)} />
      
      {/* 3. 차별화된 진료시스템 (Differentiation / Solution) */}
      <Differentiation />
      
      {/* 4. 전문 진료 분야 (차별화 아래로 내림) */}
      <SpecialClinic />
      
      {/* 5. 성과 증명 (Proof of Performance) */}
      <ProofOfPerformance />
      
      {/* 6. 치료 방법 제안 */}
      <SmartPain />
      
      {/* 7. 찾아오시는 길 */}
      <LocationCTA />
      
      {/* 8. 푸터 */}
      <Footer />

      {/* 대화형 프리미엄 예약 팝업 모달 */}
      <ReservationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default App;
