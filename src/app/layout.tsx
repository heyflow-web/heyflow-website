import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
import Link from "next/link";
import GlobalContact from "@/components/GlobalContact";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "heyflow.",
  description: "Premium Visual Web Agency",
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
            <a href="/" className="nav-link">Home</a>
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
