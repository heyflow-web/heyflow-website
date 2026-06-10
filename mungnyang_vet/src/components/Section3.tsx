"use client";

import { useRef, useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import Image from "next/image";
import styles from "./Section3.module.css";

const spaces = [
  { id: 1, title: "따뜻한 마중이 있는 대기실", img: "/images/space_1.png" },
  { id: 2, title: "햇살이 드는 진료실", img: "/images/space_2.png" },
  { id: 3, title: "안정감을 주는 회복실", img: "/images/space_3.png" },
  { id: 4, title: "스트레스 없는 고양이 전용 입원실", img: "/images/space_1.png" },
];

export default function Section3() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const startDrag = (pageX: number) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  const onDrag = (pageX: number) => {
    if (!isDragging || !sliderRef.current) return;
    const x = pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section id="section3" className="w-full py-32 bg-[#FDFBF7] overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[#333333]">
          두려움을 지우는 다정한 공간
        </h2>
        <p className="text-[#8D7B68] mt-4 text-lg">
          마우스나 손가락으로 가볍게 스와이프해서 둘러보세요.
        </p>
      </div>

      <div 
        ref={sliderRef}
        className={`${styles.dragSlider} ${isDragging ? styles.active : ''} px-6 md:px-[10vw] flex gap-6 md:gap-10 pb-12`}
        onMouseDown={(e: ReactMouseEvent) => startDrag(e.pageX)}
        onMouseLeave={endDrag}
        onMouseUp={endDrag}
        onMouseMove={(e: ReactMouseEvent) => {
          e.preventDefault();
          onDrag(e.pageX);
        }}
        onTouchStart={(e: ReactTouchEvent) => startDrag(e.touches[0].pageX)}
        onTouchEnd={endDrag}
        onTouchMove={(e: ReactTouchEvent) => onDrag(e.touches[0].pageX)}
      >
        {spaces.map((space) => (
          <div key={space.id} className="relative flex-shrink-0 w-[80vw] md:w-[40vw] max-w-[500px] aspect-[4/3] rounded-[30px] overflow-hidden shadow-lg select-none group">
            <Image 
              src={space.img} 
              alt={space.title} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 pointer-events-none">
              <h3 className="text-white text-xl md:text-2xl font-bold">{space.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
