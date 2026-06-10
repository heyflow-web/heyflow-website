"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Section1.module.css";

export default function Section1() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#FDFBF7]">
      {/* Background Image */}
      <div className={`absolute inset-0 z-0 ${styles.bgImageContainer}`}>
        <Image 
          src="/images/hero_bg.png" 
          alt="동화 같은 따뜻한 동물병원" 
          fill
          priority
          className="object-cover opacity-80"
        />
        {/* Glow Overlay */}
        <div className={`absolute inset-0 bg-[#FDFBF7]/40 ${mounted ? styles.glowActive : styles.glowInactive}`} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 mt-20 flex flex-col items-center text-center">
        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-[#333333] mb-6 leading-tight drop-shadow-sm ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
          겁이 많은 아이도,<br className="hidden md:block"/> 걱정 가득한 보호자도<br className="hidden md:block"/> 
          <span className="text-[#E07A5F]">편안하게 쉬어갈 수 있도록.</span>
        </h1>
        <p className={`text-lg md:text-xl text-[#8D7B68] max-w-2xl mt-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1s' }}>
          멍냥동물병원은 아이들의 눈높이에 맞춘 다정한 케어로<br/>
          병원에 대한 두려움을 따뜻함으로 바꿉니다.
        </p>

        {/* Handwriting SVG */}
        <div className={`mt-16 relative ${mounted ? styles.handwriting : 'opacity-0'}`}>
          <svg width="300" height="80" viewBox="0 0 300 80" fill="none" stroke="#E07A5F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 40 Q 50 10, 100 40 T 200 40 T 280 40" className={styles.pathAnim} />
          </svg>
          <p className="text-[#E07A5F] font-bold mt-2 rotate-[-5deg] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
            안녕하세요, 멍냥동물병원입니다 🐾
          </p>
        </div>
      </div>
    </section>
  );
}
