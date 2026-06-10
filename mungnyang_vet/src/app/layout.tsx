import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "멍냥동물병원 | 따뜻하고 다정한 우리 아이 주치의",
  description: "겁이 많은 아이도, 걱정 가득한 보호자도 편안하게 쉬어갈 수 있도록. 멍냥동물병원에서 진심을 다해 진료합니다.",
  openGraph: {
    title: "멍냥동물병원 | 따뜻하고 다정한 우리 아이 주치의",
    description: "겁이 많은 아이도, 걱정 가득한 보호자도 편안하게 쉬어갈 수 있도록. 멍냥동물병원에서 진심을 다해 진료합니다.",
    url: "https://mungnyang-vet.com",
    siteName: "멍냥동물병원",
    locale: "ko_KR",
    type: "website",
  },
};

import Header from "@/components/Header";
import CustomCursor from "@/components/CustomCursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable}`}>
      <body className="antialiased relative min-h-screen">
        <CustomCursor />
        <Header />
        {children}
      </body>
    </html>
  );
}
