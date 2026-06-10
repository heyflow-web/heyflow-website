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
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#2C1E16]">
      {/* Background Image */}
      <div className={`absolute inset-0 z-0 ${styles.bgImageContainer}`}>
        <Image 
          src="/images/hero_bg.png" 
          alt="프리미엄 멍냥 동물병원" 
          fill
          priority
          className="object-cover opacity-60 mix-blend-luminosity"
        />
        {/* Dark Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#1A1310] via-transparent to-[#1A1310]/50 ${mounted ? styles.glowActive : styles.glowInactive}`} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 mt-32 flex flex-col items-center text-center">
        <h2 className={`font-serif-title text-[#C9A66B] text-xl md:text-2xl tracking-[0.2em] mb-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
          MUNGNYANG CLINIC
        </h2>
        
        <div className={`w-px h-16 bg-gradient-to-b from-[#C9A66B] to-transparent mb-8 ${mounted ? styles.lineGrow : 'opacity-0'}`} style={{ animationDelay: '1s' }} />

        <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-[#F8F5F0] mb-8 leading-tight tracking-tight ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1.2s' }}>
          진심을 다하는,<br className="hidden md:block"/> 
          <span className="text-[#E5CD9C]">프리미엄 주치의</span>
        </h1>

        <p className={`text-lg md:text-xl text-[#EAE6DF] font-light max-w-2xl mt-4 tracking-wide ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1.5s' }}>
          말 못 하는 아이들의 눈빛을 읽고, 보호자의 불안을 덜어주는<br/>
          가장 따뜻하고 전문적인 케어 시스템
        </p>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-[#C9A66B] font-serif-title text-xs tracking-widest uppercase">Scroll</span>
        <div className={styles.scrollLine}></div>
      </div>
    </section>
  );
}
