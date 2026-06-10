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
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className={`absolute inset-0 z-0 ${styles.bgImageContainer}`}>
        <Image 
          src="/images/hero_bg.png" 
          alt="따뜻한 로비에서 아이들을 안아주는 원장님" 
          fill
          priority
          className="object-cover"
        />
        {/* Glow Effect Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/50 to-transparent ${mounted ? styles.glowActive : styles.glowInactive}`} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 mt-32 flex flex-col items-center text-center">
        {/* Handwriting SVG */}
        <div className="mb-6 h-12 flex justify-center items-center">
          <svg viewBox="0 0 400 50" className={styles.handwritingSvg}>
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className={styles.handwritingText}>
              안녕하세요, 멍냥동물병원입니다.
            </text>
          </svg>
        </div>

        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-[#333333] mb-6 leading-tight ${mounted ? styles.fadeInUp : 'opacity-0'}`} style={{ animationDelay: '1s' }}>
          겁이 많은 아이도,<br className="hidden md:block"/> 걱정 가득한 보호자도<br />
          <span className="text-[#E07A5F]">편안하게 쉬어갈 수 있도록.</span>
        </h1>

        <p className={`text-lg md:text-xl text-[#8D7B68] max-w-2xl mt-4 ${mounted ? styles.fadeInUp : 'opacity-0'}`} style={{ animationDelay: '1.2s' }}>
          말 못 하는 아이들의 눈빛을 읽고, 보호자의 불안을 덜어주는<br/>
          가장 따뜻한 주치의가 되겠습니다.
        </p>
      </div>
    </section>
  );
}
