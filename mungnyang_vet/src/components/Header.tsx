"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center transition-all duration-300 ${menuOpen ? 'text-[#F8F5F0]' : 'text-[#1A1310] mix-blend-difference'}`}>
        <div className="flex items-center gap-2 relative z-50 mix-blend-normal text-[#F8F5F0]">
          <Link href="/" className="font-serif-title text-2xl tracking-widest" onClick={() => setMenuOpen(false)}>
            MUNGNYANG
            <span className="text-[#C9A66B]">.</span>
          </Link>
        </div>

        <div className="flex items-center relative z-50">
          <button 
            className={`${styles.menuBtn} ${menuOpen ? styles.open : ''} mix-blend-normal`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="bg-[#F8F5F0]"></span>
            <span className="bg-[#F8F5F0]"></span>
            <span className="bg-[#F8F5F0]"></span>
          </button>
        </div>
      </header>

      {/* Fullscreen Overlay Menu */}
      <div className={`fixed inset-0 z-40 bg-[#2C1E16] transition-transform duration-700 ease-in-out flex items-center justify-center ${menuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <nav className="flex flex-col items-center gap-10 text-center">
          <Link href="#section2" className="text-[#F8F5F0] hover:text-[#C9A66B] font-serif-title text-4xl md:text-6xl transition-colors duration-300" onClick={() => setMenuOpen(false)}>
            ABOUT US
          </Link>
          <Link href="#section3" className="text-[#F8F5F0] hover:text-[#C9A66B] font-serif-title text-4xl md:text-6xl transition-colors duration-300" onClick={() => setMenuOpen(false)}>
            FACILITIES
          </Link>
          <Link href="#section4" className="text-[#F8F5F0] hover:text-[#C9A66B] font-serif-title text-4xl md:text-6xl transition-colors duration-300" onClick={() => setMenuOpen(false)}>
            STORIES
          </Link>
          <Link href="#section5" className="text-[#C9A66B] hover:text-[#F8F5F0] font-serif-title text-4xl md:text-6xl transition-colors duration-300 mt-8" onClick={() => setMenuOpen(false)}>
            RESERVATION
          </Link>
        </nav>
      </div>
    </>
  );
}
