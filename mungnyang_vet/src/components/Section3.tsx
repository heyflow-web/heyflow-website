"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import styles from "./Section3.module.css";

const rooms = [
  {
    id: 1,
    image: "/images/room1.png",
    title: "스트레스 없는 고양이 전용 대기실",
    desc: "강아지 친구들과 마주치지 않도록 분리된 안락한 공간입니다.",
  },
  {
    id: 2,
    image: "/images/room2.png",
    title: "보호자와 함께 머무는 회복실",
    desc: "아이가 깨어날 때 가장 먼저 보호자의 냄새를 맡을 수 있습니다.",
  },
  {
    id: 3,
    image: "/images/room3.png",
    title: "햇살이 따뜻하게 드는 진료실",
    desc: "차가운 스텐레스 대신 따뜻한 나무 테이블에서 진료를 시작합니다.",
  },
];

export default function Section3() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    // Remove smooth scroll behavior during drag
    sliderRef.current.style.scrollBehavior = "auto";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const onPointerUp = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      // Restore smooth behavior for snap if needed
      sliderRef.current.style.scrollBehavior = "smooth";
    }
  };

  return (
    <section id="section3" className="w-full py-32 bg-[#FFFFFF] overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#333333]">
          다정한 공간 둘러보기
        </h2>
        <p className="text-[#8D7B68] mt-4 text-lg">
          우리 병원은 이렇게 아늑하고 안전한 곳이에요. <br className="hidden md:block"/>
          마우스로 사진을 밀어보세요.
        </p>
      </div>

      <div 
        ref={sliderRef}
        className={`flex gap-6 overflow-x-auto px-6 md:px-20 pb-16 pt-4 ${styles.sliderContainer} ${isDragging ? styles.dragging : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {rooms.map((room) => (
          <div key={room.id} className={`flex-shrink-0 w-[85vw] md:w-[60vw] lg:w-[45vw] ${styles.slideItem}`}>
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-soft mb-6 cursor-grab active:cursor-grabbing">
              <Image 
                src={room.image} 
                alt={room.title} 
                fill 
                className="object-cover select-none pointer-events-none" 
              />
            </div>
            <h3 className="text-2xl font-bold text-[#333333] mb-2">{room.title}</h3>
            <p className="text-[#8D7B68]">{room.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
