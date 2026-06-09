import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
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
      <body className={inter.className}>
        <nav className="navbar">
          <Link href="/" className="nav-brand">
            heyflow
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
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
