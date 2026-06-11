import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
import Link from "next/link";
import GlobalContact from "@/components/GlobalContact";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  metadataBase: new URL("https://heyflow.kr"),
  title: "heyflow | 잘 만들어진 웹사이트, 그 이상의 가치",
  description: "잘 만들어진 웹사이트와 잘 되는 웹사이트는 다릅니다. 전환율을 극대화하는 프리미엄 웹 에이전시 heyflow(헤이플로우)입니다. 기획, 디자인, 개발까지 완벽한 원스톱 프로세스를 제공합니다.",
  keywords: ["웹사이트 제작", "웹 에이전시", "헤이플로우", "heyflow", "반응형 웹", "프리미엄 웹사이트", "전환율 웹사이트", "기업 홈페이지", "브랜딩"],
  authors: [{ name: "heyflow" }],
  openGraph: {
    title: "heyflow | 프리미엄 비주얼 웹 에이전시",
    description: "잘 만들어진 웹사이트와 잘 되는 웹사이트는 다릅니다. 브랜드를 대변하는 강력한 무기, 헤이플로우에서 시작하세요.",
    url: "https://heyflow.kr",
    siteName: "heyflow",
    images: [
      {
        url: "/images/aurora_pc.png", // og:image에 띄울 대표 이미지 경로
        width: 1200,
        height: 630,
        alt: "heyflow premium web agency",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "heyflow | 프리미엄 웹 에이전시",
    description: "전환율을 극대화하는 하이엔드 웹사이트 제작. 헤이플로우와 함께하세요.",
    images: ["/images/aurora_pc.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.variable}>
        <nav className="navbar">
          <a href="/" className="nav-brand">
            heyflow
          </a>
          <div className="nav-links">
            <Link href="/projects" className="nav-link">Projects</Link>
          </div>
        </nav>
        <div className="main-content">
          {children}
        </div>
        <CustomCursor />
        <GlobalContact />
      </body>
    </html>
  );
}
