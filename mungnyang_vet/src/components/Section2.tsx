"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Section2() {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      // Only track scroll if section is in or near viewport
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setScrollY(window.scrollY - rect.top);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="section2" ref={sectionRef} className="w-full py-32 bg-[#F5EFE6] relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* Left: Image with Parallax */}
          <div className="relative">
            <div 
              className="relative aspect-square w-full max-w-md mx-auto rounded-full overflow-hidden shadow-2xl border-8 border-white"
              style={{ transform: `translateY(${scrollY * 0.15}px)` }}
            >
              <Image 
                src="/images/doctor.png" 
                alt="멍냥동물병원 원장" 
                fill 
                className="object-cover"
              />
            </div>
            
            {/* Rotating Text Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 animate-spin-slow hidden md:block">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#81B29A] fill-current">
                <path id="curve" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent" />
                <text className="text-[12px] font-bold tracking-[4px]">
                  <textPath href="#curve">
                    MUNGNYANG ANIMAL CLINIC ✨ WARM AND COZY ✨ 
                  </textPath>
                </text>
              </svg>
            </div>
          </div>

          {/* Right: Text with slight opposite Parallax */}
          <div 
            className="space-y-6"
            style={{ transform: `translateY(${-scrollY * 0.05}px)` }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#333333] leading-snug">
              "어느 날 문득 아플 때,<br/> 가장 먼저 생각나는 곳이길 바랍니다."
            </h2>
            <div className="w-12 h-1 bg-[#E07A5F] rounded-full" />
            <p className="text-[#8D7B68] leading-relaxed text-lg">
              말 못 하는 작은 아이들이 보내는 미세한 신호들.<br/>
              우리는 그 작은 목소리에 귀 기울이고, 보호자님의 불안한 마음까지 섬세하게 어루만집니다.
            </p>
            <p className="text-[#8D7B68] leading-relaxed text-lg">
              딱딱하고 차가운 진료실이 아닌, 따뜻한 햇살이 드는 거실처럼.
              가족의 마음으로 진심을 다하는 곳, 멍냥동물병원입니다.
            </p>
            <div className="pt-6">
              <span className="font-bold text-[#333333] text-xl">대표원장 김멍냥</span>
            </div>
          </div>

        </div>
      </div>
      
      {/* Background Decorative Circles */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-[#E07A5F]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#81B29A]/10 rounded-full blur-3xl" />
    </section>
  );
}
