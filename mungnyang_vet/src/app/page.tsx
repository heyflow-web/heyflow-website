import Section1 from "@/components/Section1";
import Section2 from "@/components/Section2";
import Section3 from "@/components/Section3";
import Section4 from "@/components/Section4";
import Section5 from "@/components/Section5";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#FDFBF7]">
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <footer className="bg-[#2C2825] text-[#8D7B68] py-8 text-center text-sm">
        <p>© 2026 멍냥동물병원. All rights reserved.</p>
        <p className="mt-2">서울특별시 강남구 테헤란로 123 멍냥타워 1층 | 02-1234-5678</p>
      </footer>
    </main>
  );
}
