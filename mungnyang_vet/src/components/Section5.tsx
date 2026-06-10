import Link from "next/link";

export default function Section5() {
  return (
    <section id="section5" className="w-full py-32 bg-[#81B29A] text-[#FDFBF7] relative overflow-hidden">
      {/* Decorative SVG */}
      <svg className="absolute -top-24 -right-24 w-64 h-64 text-[#FDFBF7]/10" fill="currentColor" viewBox="0 0 100 100">
        <path d="M50 0 C75 0 100 25 100 50 C100 75 75 100 50 100 C25 100 0 75 0 50 C0 25 25 0 50 0 Z" />
      </svg>
      
      <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          편안한 마음으로,<br/> 언제든 이야기 들려주러 오세요.
        </h2>
        <p className="text-[#FDFBF7]/80 text-xl mb-16">
          멍냥동물병원의 문은 언제나 다정하게 열려 있습니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-left">
          <div className="bg-[#FDFBF7]/10 backdrop-blur-md rounded-3xl p-8 border border-[#FDFBF7]/20 hover:bg-[#FDFBF7]/20 transition-colors">
            <div className="w-12 h-12 bg-[#FDFBF7] rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm">
              ⏰
            </div>
            <h3 className="text-xl font-bold mb-4">진료 시간</h3>
            <ul className="space-y-2 text-[#FDFBF7]/90 text-sm">
              <li className="flex justify-between"><span>평일</span> <span>10:00 - 20:00</span></li>
              <li className="flex justify-between"><span>토요일</span> <span>10:00 - 17:00</span></li>
              <li className="flex justify-between"><span>일/공휴일</span> <span>휴진</span></li>
              <li className="flex justify-between text-[#FDFBF7] font-bold mt-2"><span>점심시간</span> <span>13:00 - 14:00</span></li>
            </ul>
          </div>

          <div className="bg-[#FDFBF7]/10 backdrop-blur-md rounded-3xl p-8 border border-[#FDFBF7]/20 hover:bg-[#FDFBF7]/20 transition-colors">
            <div className="w-12 h-12 bg-[#FDFBF7] rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm">
              🌙
            </div>
            <h3 className="text-xl font-bold mb-4">야간 응급 진료</h3>
            <p className="text-[#FDFBF7]/90 text-sm leading-relaxed">
              응급 상황을 대비해 <br/>
              밤 10시까지 불을 켜두고 있습니다.<br/>
              내원 전 꼭 전화로 알려주세요.
            </p>
          </div>

          <div className="bg-[#FDFBF7]/10 backdrop-blur-md rounded-3xl p-8 border border-[#FDFBF7]/20 hover:bg-[#FDFBF7]/20 transition-colors">
            <div className="w-12 h-12 bg-[#FDFBF7] rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm">
              🚗
            </div>
            <h3 className="text-xl font-bold mb-4">주차 안내</h3>
            <p className="text-[#FDFBF7]/90 text-sm leading-relaxed">
              병원 건물 지하에 넓은 주차 공간이 마련되어 있습니다. (최대 2시간 무료)
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="#" className="inline-flex items-center justify-center px-10 py-5 bg-[#FDFBF7] text-[#81B29A] rounded-full font-bold text-lg hover:shadow-[0_10px_30px_rgba(253,251,247,0.3)] hover:scale-105 transition-all duration-300">
            전화로 예약하기
          </Link>
          <Link href="#" className="inline-flex items-center justify-center px-10 py-5 bg-[#FAE100] text-[#371D1E] rounded-full font-bold text-lg hover:shadow-[0_10px_30px_rgba(250,225,0,0.3)] hover:scale-105 transition-all duration-300">
            카카오톡 상담하기
          </Link>
        </div>
      </div>
    </section>
  );
}
