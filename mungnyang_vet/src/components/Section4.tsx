"use client";

import { useState, useRef, MouseEvent } from "react";
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
    tag: "치료 수기",
    title: "15살 노령견 보리의 활기찬 주말",
    image: "/images/dog_story.png",
    desc: "노령 종합 케어를 받고 다시 공원을 뛰놀게 된 보리의 이야기",
    fullDesc: "15살 보리는 며칠 전부터 밥을 잘 먹지 않고 구석에만 웅크려 있었습니다. 보호자님은 노령견이라 어쩔 수 없는 일이라며 슬퍼하셨지만, 검사 결과 일시적인 관절 염증과 소화 불량이었습니다. 맞춤형 진통제와 따뜻한 수액 처치 후 보리는 다시 꼬리를 흔들며 병원 문을 나섰습니다. 이제 보리는 주말마다 가장 좋아하는 공원에서 활기차게 산책을 즐기고 있답니다."
  },
  {
    id: 2,
    tag: "고양이",
    title: "예민한 삼색이 나비의 첫 건강검진",
    image: "/images/cat_story.png",
    desc: "하악질 대마왕 나비가 골골송을 부르게 된 마법 같은 하루",
    fullDesc: "나비는 낯선 사람만 보면 하악질을 하는 무척 예민한 고양이였습니다. 건강검진을 위해 내원했을 때도 케이지 밖으로 나오지 않으려 했죠. 저희는 나비를 억지로 꺼내지 않고, 고양이 전용 대기실에서 충분히 안정을 취하게 한 뒤 부드러운 담요로 감싸 진료를 진행했습니다. 스트레스 없는 환경 덕분에 나비는 검진 중에도 골골송을 부르며 편안하게 모든 과정을 마칠 수 있었습니다."
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
    <section id="section4" className="w-full py-32 bg-[#F5EFE6] relative">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#333333]">
            아이들의 이야기
          </h2>
          <p className="text-[#8D7B68] mt-4 text-lg">
            딱딱한 진료 과목 대신, 멍냥동물병원을 거쳐 간 <br/>
            건강하고 행복한 아이들의 이야기를 들려드릴게요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {stories.map((story) => (
            <MagneticCard key={story.id} story={story} onClick={() => handleCardClick(story)} />
          ))}
        </div>
      </div>

      {/* Organic Popup */}
      {activeStory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={closePopup}>
          <div className="absolute inset-0 bg-[#333333]/20 backdrop-blur-sm" />
          <div 
            className={`relative bg-[#FDFBF7] rounded-[40px] p-8 md:p-12 max-w-2xl w-full shadow-2xl flex flex-col md:flex-row gap-8 items-center ${styles.popupActive}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-6 right-6 w-10 h-10 bg-[#E07A5F]/10 text-[#E07A5F] rounded-full flex items-center justify-center hover:bg-[#E07A5F] hover:text-white transition-colors"
              onClick={closePopup}
            >
              ✕
            </button>
            <div className="relative w-full md:w-1/2 aspect-square rounded-full overflow-hidden border-8 border-white shadow-lg flex-shrink-0">
              <Image src={activeStory.image} alt={activeStory.title} fill className="object-cover" />
            </div>
            <div className="flex flex-col text-center md:text-left">
              <span className="text-sm font-bold text-[#E07A5F] mb-2">{activeStory.tag}</span>
              <h3 className="text-2xl font-bold text-[#333333] mb-4 leading-tight">{activeStory.title}</h3>
              <p className="text-[#8D7B68] leading-relaxed">{activeStory.fullDesc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function MagneticCard({ story, onClick }: { story: Story, onClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    setPosition({ x: distanceX * 0.1, y: distanceY * 0.1 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={cardRef}
      className={`magnetic-card cursor-pointer ${styles.magneticWrapper}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
    >
      <div className="bg-[#FDFBF7] rounded-[40px] overflow-hidden shadow-soft group hover:shadow-xl transition-shadow duration-300">
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image 
            src={story.image} 
            alt={story.title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        </div>
        <div className="p-8">
          <span className="inline-block px-3 py-1 bg-[#81B29A]/10 text-[#81B29A] text-sm font-bold rounded-full mb-4">
            {story.tag}
          </span>
          <h3 className="text-2xl font-bold text-[#333333] mb-2 group-hover:text-[#E07A5F] transition-colors">{story.title}</h3>
          <p className="text-[#8D7B68]">{story.desc}</p>
        </div>
      </div>
    </div>
  );
}
