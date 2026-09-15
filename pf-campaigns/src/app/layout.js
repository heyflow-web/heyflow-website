import "./globals.css";
import PasswordGate from "@/components/PasswordGate";

export const metadata = {
  title: "체험단 캠페인 라운지",
  description: "익명 메디컬 케어 체험단 공식 플랫폼",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased font-sans">
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  );
}
