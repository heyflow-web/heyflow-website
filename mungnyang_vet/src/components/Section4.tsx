"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Section4.module.css";

interface Story {
  id: number;
  tag: string;
  title: string;
  image: string;
  desc: string;
  fullDesc: string;
}

const stories: Story[] = [
  {
    id: 1,
    tag: "CASE 01",
    title: "15살 노령견 보리의 활기찬 주말",
    image: "/images/dog_story.png",
    desc: "노령 종합 케어를 받고 다시 공원을 뛰놀게 된 보리의 이야기",
    fullDesc: "15살 보리는 며칠 전부터 밥을 잘 먹지 않고 구석에만 웅크려 있었습니다. 검사 결과 일시적인 관절 염증과 소화 불량. 맞춤형 진통제와 따뜻한 수액 처치 후 보리는 다시 꼬리를 흔들며 병원 문을 나섰습니다. 이제 보리는 주말마다 가장 좋아하는 공원에서 활기차게 산책을 즐기고 있답니다."
  },
  {
    id: 2,
    tag: "CASE 02",
    title: "예민한 삼색이 나비의 첫 건강검진",
    image: "/images/cat_story.png",
    desc: "하악질 대마왕 나비가 골골송을 부르게 된 마법 같은 하루",
    fullDesc: "낯선 사람만 보면 하악질을 하는 무척 예민한 고양이 나비. 고양이 전용 대기실에서 충분히 안정을 취하게 한 뒤 부드러운 담요로 감싸 진료를 진행했습니다. 스트레스 없는 환경 덕분에 나비는 검진 중에도 골골송을 부르며 편안하게 모든 과정을 마칠 수 있었습니다."
  }
];

export default function Section4() {
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  const handleCardClick = (story: Story) => {
    setActiveStory(story);
  };

  const closePopup = () => {
    setActiveStory(null);
  };

  return (
    <section id="section4" className="w-full py-32 bg-[#2C1E16] text-[#F8F5F0] relative">
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div className="text-center mb-16 border-b border-[#C9A66B]/30 pb-12">
          <h3 className="font-serif-title tracking-widest text-[#C9A66B] mb-4">OUR STORIES</h3>
          <h2 className="text-3xl md:text-5xl font-bold text-[#F8F5F0] leading-tight">
            건강을 되찾은<br/>작은 기적들
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stories.map((story) => (
            <div 
              key={story.id} 
              className="group cursor-pointer border border-[#C9A66B]/20 bg-[#1A1310] hover:border-[#C9A66B] transition-colors duration-500 flex flex-col"
              onClick={() => handleCardClick(story)}
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image 
                  src={story.image} 
                  alt={story.title} 
                  fill 
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                />
              </div>
              <div className="p-8 md:p-10 flex-1 flex flex-col">
                <span className="font-serif-title text-[#C9A66B] text-sm tracking-widest mb-4 block">
                  {story.tag}
                </span>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[#C9A66B] transition-colors">{story.title}</h3>
                <p className="text-[#EAE6DF]/70 font-light leading-relaxed mt-auto">{story.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sleek Popup */}
      {activeStory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={closePopup}>
          <div className="absolute inset-0 bg-[#1A1310]/90 backdrop-blur-sm" />
          <div 
            className={`relative bg-[#2C1E16] border border-[#C9A66B]/30 p-8 md:p-12 max-w-3xl w-full shadow-2xl flex flex-col md:flex-row gap-8 items-center ${styles.popupActive}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-6 right-6 w-10 h-10 text-[#C9A66B] font-serif-title text-xl flex items-center justify-center hover:text-[#F8F5F0] transition-colors"
              onClick={closePopup}
            >
              ✕
            </button>
            <div className="relative w-full md:w-1/2 aspect-[4/5] overflow-hidden">
              <Image src={activeStory.image} alt={activeStory.title} fill className="object-cover grayscale" />
            </div>
            <div className="flex flex-col text-center md:text-left md:w-1/2">
              <span className="font-serif-title text-sm tracking-widest text-[#C9A66B] mb-2">{activeStory.tag}</span>
              <h3 className="text-2xl font-bold text-[#F8F5F0] mb-6 leading-tight border-b border-[#C9A66B]/30 pb-6">{activeStory.title}</h3>
              <p className="text-[#EAE6DF] font-light leading-relaxed">{activeStory.fullDesc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
