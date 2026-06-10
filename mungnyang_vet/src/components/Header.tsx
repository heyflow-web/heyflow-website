import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 backdrop-blur-md bg-white/30 border-b border-white/20">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-[#333333]">
          멍냥동물병원
          <span className="text-[#E07A5F]">.</span>
        </Link>
      </div>
      <nav className="hidden md:flex gap-8 text-[#8D7B68] font-medium">
        <Link href="#section2" className="hover:text-[#333333] transition-colors">원장님의 진심</Link>
        <Link href="#section3" className="hover:text-[#333333] transition-colors">병원 둘러보기</Link>
        <Link href="#section4" className="hover:text-[#333333] transition-colors">아이들 이야기</Link>
      </nav>
      <div>
        <Link 
          href="#section5" 
          className="inline-flex items-center justify-center px-6 py-3 bg-[#E07A5F] text-white rounded-full font-bold shadow-[0_4px_14px_0_rgba(224,122,95,0.39)] hover:shadow-[0_6px_20px_rgba(224,122,95,0.23)] hover:bg-[#d66a4e] transition-all duration-200"
        >
          다정하게 예약하기
        </Link>
      </div>
    </header>
  );
}
