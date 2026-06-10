import Link from "next/link";

export default function Section5() {
  return (
    <section id="section5" className="w-full bg-[#1A1310] text-[#F8F5F0] relative overflow-hidden flex flex-col justify-between dark-section pt-32">
      <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center flex-1">
        <h3 className="font-serif-title tracking-widest text-[#C9A66B] mb-6">RESERVATION</h3>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          당신의 마음까지 치유하는 곳
        </h2>
        <p className="text-[#EAE6DF]/70 text-lg md:text-xl font-light mb-16 max-w-2xl mx-auto">
          멍냥동물병원은 아이들의 건강뿐만 아니라 보호자님의 불안까지 덜어드리는 프리미엄 진료 환경을 약속합니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-b border-[#C9A66B]/20 mb-16">
          <div className="p-8 md:border-r border-[#C9A66B]/20 text-left">
            <h3 className="font-serif-title tracking-widest text-[#C9A66B] text-sm mb-4">HOURS</h3>
            <ul className="space-y-3 font-light text-[#EAE6DF]">
              <li className="flex justify-between border-b border-[#C9A66B]/10 pb-2"><span>평일</span> <span>10:00 - 20:00</span></li>
              <li className="flex justify-between border-b border-[#C9A66B]/10 pb-2"><span>토요일</span> <span>10:00 - 17:00</span></li>
              <li className="flex justify-between border-b border-[#C9A66B]/10 pb-2"><span>일/공휴일</span> <span>휴진</span></li>
              <li className="flex justify-between text-[#C9A66B] pt-2"><span>점심시간</span> <span>13:00 - 14:00</span></li>
            </ul>
          </div>

          <div className="p-8 md:border-r border-[#C9A66B]/20 text-left border-t md:border-t-0 border-[#C9A66B]/20">
            <h3 className="font-serif-title tracking-widest text-[#C9A66B] text-sm mb-4">NIGHT CARE</h3>
            <p className="font-light text-[#EAE6DF] leading-relaxed">
              응급 상황을 대비해 밤 10시까지 불을 켜두고 있습니다.<br/><br/>
              <span className="text-[#C9A66B] block">내원 전 꼭 전화로 알려주세요.</span>
            </p>
          </div>

          <div className="p-8 text-left border-t md:border-t-0 border-[#C9A66B]/20">
            <h3 className="font-serif-title tracking-widest text-[#C9A66B] text-sm mb-4">LOCATION</h3>
            <p className="font-light text-[#EAE6DF] leading-relaxed mb-4">
              서울특별시 강남구 테헤란로 123 멍냥타워 1층
            </p>
            <p className="font-light text-[#EAE6DF]/70 text-sm">
              병원 건물 지하에 넓은 주차 공간이 마련되어 있습니다. (최대 2시간 무료)
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-32">
          <Link href="#" className="relative group inline-flex items-center justify-center px-12 py-5 border border-[#C9A66B] text-[#C9A66B] hover:text-[#1A1310] font-serif-title tracking-widest transition-colors duration-500 overflow-hidden">
            <span className="relative z-10">CALL NOW</span>
            <div className="absolute inset-0 bg-[#C9A66B] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0"></div>
          </Link>
          <Link href="#" className="relative group inline-flex items-center justify-center px-12 py-5 border border-[#F8F5F0] text-[#F8F5F0] hover:text-[#1A1310] font-serif-title tracking-widest transition-colors duration-500 overflow-hidden">
            <span className="relative z-10">KAKAO TALK</span>
            <div className="absolute inset-0 bg-[#F8F5F0] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0"></div>
          </Link>
        </div>
      </div>
    </section>
  );
}
