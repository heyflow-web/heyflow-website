import "./globals.css";

export const metadata = {
  title: "체험단 캠페인 라운지",
  description: "익명 메디컬 케어 체험단 공식 플랫폼",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased font-sans">
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          precedence="default"
        />
        {children}
      </body>
    </html>
  );
}
