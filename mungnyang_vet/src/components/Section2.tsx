"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Section2.module.css";

export default function Section2() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="section2" className="relative w-full py-32 bg-[#FDFBF7] overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Image with Parallax */}
          <div className="w-full lg:w-1/2 relative" style={{ transform: `translateY(${scrollY * 0.1 - 50}px)` }}>
            <div className={`relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(141,123,104,0.3)] ${styles.imageWrapper}`}>
              <Image 
                src="/images/vet_profile.png" 
                alt="멍냥동물병원 원장님" 
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#FDFBF7] rounded-full flex items-center justify-center p-2 shadow-sm border border-[#E07A5F]/20">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#E07A5F] animate-spin-slow">
                <path id="curve" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent"/>
                <text className="text-[12px] font-bold tracking-widest" fill="currentColor">
                  <textPath href="#curve" startOffset="0%">
                    MUNGNYANG ANIMAL CLINIC • SINCE 2026 • 
                  </textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🐾</div>
            </div>
          </div>

          {/* Right: Text with Parallax */}
          <div className="w-full lg:w-1/2" style={{ transform: `translateY(${-scrollY * 0.05 + 50}px)` }}>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#333333] mb-8 leading-snug">
              "말 못 하는 아이들의 눈빛을 <br className="hidden lg:block"/>읽는 일은 기술이 아니라<br/> <span className="text-[#81B29A]">관심</span>에서 시작됩니다."
            </h2>
            
            <div className="space-y-6 text-[#8D7B68] text-lg leading-relaxed">
              <p>
                병원의 문을 열고 들어오는 순간부터 아이들은 긴장합니다. 
                낯선 냄새, 차가운 바닥, 그리고 불안해하는 보호자의 마음까지 아이들은 온몸으로 느끼죠.
              </p>
              <p>
                그래서 저희 멍냥동물병원은 서두르지 않습니다. 
                충분히 냄새를 맡게 해주고, 조심스럽게 인사를 건네며, 
                아이가 스스로 마음을 열 때까지 기다립니다.
              </p>
              <p>
                진심은 언제나 통한다는 것을 믿기에, 
                우리는 오늘도 가장 낮은 자세로 아이들과 눈을 맞춥니다.
              </p>
            </div>

            <div className="mt-12 flex items-center gap-4">
              <div className="font-writing text-3xl text-[#333333] transform -rotate-2">
                대표원장 이진심
              </div>
              <div className="w-20 h-px bg-[#8D7B68]/30"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
