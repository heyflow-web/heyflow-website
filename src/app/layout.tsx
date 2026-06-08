import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
import Link from "next/link";

export const metadata: Metadata = {
  title: "STUDIO.",
  description: "Modern Industrial Design Studio Portfolio",
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
            STUDIO.
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/projects" className="nav-link">Projects</Link>
          </div>
        </nav>
        <div className="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
