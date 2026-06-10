"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${scrolled ? 'bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#F5EFE6] shadow-sm py-3' : 'bg-transparent'}`}>
      <Link href="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-[#E07A5F] rounded-full flex items-center justify-center text-white font-bold text-xl">🐾</div>
        <span className="font-bold text-xl text-[#333333]">멍냥동물병원</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 font-bold text-[#8D7B68]">
        <Link href="#section2" className="hover:text-[#E07A5F] transition-colors">원장님 이야기</Link>
        <Link href="#section3" className="hover:text-[#E07A5F] transition-colors">병원 둘러보기</Link>
        <Link href="#section4" className="hover:text-[#E07A5F] transition-colors">아이들의 이야기</Link>
      </nav>

      <Link href="#section5" className="px-6 py-2 bg-[#81B29A] text-white rounded-full font-bold hover:bg-[#6c9a83] transition-colors shadow-sm">
        다정하게 예약하기
      </Link>
    </header>
  );
}
