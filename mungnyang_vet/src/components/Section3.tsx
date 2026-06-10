import Image from "next/image";

const spaces = [
  { id: 1, title: "RECEPTION", subtitle: "따뜻한 마중이 있는 대기실", img: "/images/space_1.png" },
  { id: 2, title: "CLINIC", subtitle: "햇살이 드는 진료실", img: "/images/space_2.png" },
  { id: 3, title: "RECOVERY", subtitle: "안정감을 주는 회복실", img: "/images/space_3.png" },
];

export default function Section3() {
  return (
    <section id="section3" className="w-full py-32 bg-[#F8F5F0] border-t border-[#EAE6DF]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#EAE6DF] pb-8">
          <div>
            <h3 className="font-serif-title tracking-widest text-[#C9A66B] mb-4">FACILITIES</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1310]">
              두려움을 지우는<br/>다정한 공간
            </h2>
          </div>
          <p className="text-[#3E2723] mt-6 md:mt-0 max-w-md md:text-right font-light">
            차가운 백색소음 대신 따뜻한 햇살과 부드러운 음악이 흐릅니다.<br/>
            아이들이 본능적으로 안심할 수 있는 공간을 설계했습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {spaces.map((space) => (
            <div key={space.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] w-full overflow-hidden mb-6 bg-[#EAE6DF]">
                <Image 
                  src={space.img} 
                  alt={space.subtitle} 
                  fill 
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#2C1E16]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <span className="text-[#F8F5F0] border border-[#F8F5F0] px-6 py-2 uppercase tracking-widest text-sm font-serif-title">View</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4 group-hover:border-[#C9A66B] transition-colors duration-300">
                <div>
                  <h4 className="font-serif-title text-[#1A1310] text-xl font-bold tracking-wider">{space.title}</h4>
                  <p className="text-[#8D7B68] text-sm mt-1">{space.subtitle}</p>
                </div>
                <div className="text-[#C9A66B] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
