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
      <footer className="bg-[#111111] text-[#EAE6DF]/50 py-12 text-center text-sm font-light">
        <p className="font-serif-title tracking-widest mb-4">MUNGNYANG CLINIC</p>
        <p>© 2026 Mungnyang Animal Clinic. All rights reserved.</p>
      </footer>
    </main>
  );
}
