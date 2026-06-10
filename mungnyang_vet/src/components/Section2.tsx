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
    <section id="section2" ref={sectionRef} className="w-full py-40 bg-[#F8F5F0] relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Thin Line Title area */}
          <div className="lg:col-span-4 flex flex-col justify-center border-t border-b border-[#EAE6DF] py-12 relative">
            <h3 className="font-serif-title tracking-widest text-[#C9A66B] mb-6">ABOUT US</h3>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1310] leading-snug">
              어느 날,<br/>
              문득 아플 때
            </h2>
            <div 
              className="absolute left-0 w-px bg-[#2C1E16] opacity-20"
              style={{ top: 0, height: '100%', transform: `translateY(${scrollY * 0.1}px)` }}
            />
          </div>

          {/* Right: Content & Image Parallax */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 order-2 md:order-1">
              <p className="text-xl font-bold text-[#2C1E16]">
                가장 먼저 생각나는<br/>
                따뜻하고 전문적인 공간이길 바랍니다.
              </p>
              <div className="w-8 h-px bg-[#C9A66B]" />
              <p className="text-[#3E2723] leading-relaxed font-light">
                말 못 하는 작은 아이들이 보내는 미세한 신호들.<br/>
                우리는 그 작은 목소리에 귀 기울이고, 보호자님의 불안한 마음까지 섬세하게 어루만집니다.<br/><br/>
                첨단 의료 장비와 수년간의 임상 경험을 바탕으로,
                정확한 진단과 꼭 필요한 치료만을 제안합니다.
                가족의 마음으로 진심을 다하는 곳, 멍냥동물병원입니다.
              </p>
              <div className="pt-8">
                <p className="font-serif-title tracking-widest text-[#1A1310] font-bold">REPRESENTATIVE DIRECTOR</p>
                <p className="text-[#C9A66B] font-bold mt-1">Dr. Kim Mung Nyang</p>
              </div>
            </div>

            <div className="relative aspect-[3/4] w-full order-1 md:order-2 overflow-hidden bg-[#EAE6DF]">
              <Image 
                src="/images/doctor.png" 
                alt="대표원장" 
                fill 
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                style={{ transform: `translateY(${scrollY * 0.05}px) scale(1.05)` }}
              />
            </div>

          </div>
        </div>
      </div>
      
      {/* Background Decorative Line */}
      <div className="absolute top-0 right-1/3 w-px h-full bg-[#EAE6DF]" />
    </section>
  );
}
