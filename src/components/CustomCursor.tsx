"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // 마우스 이동 추적
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    // 호버 상태 추적
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") || 
        target.closest("button") || 
        target.closest(".cursor-hover")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    // 디바이스 판별 (터치 디바이스에서는 커서 숨김)
    if (window.matchMedia("(pointer: coarse)").matches) {
      return; // 터치 디바이스는 이벤트를 등록하지 않음
    }

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  // SSR 환경에서는 렌더링하지 않음 방지 처리 필요 여부 체크 (간단히 x,y가 -100일땐 화면 밖)
  if (typeof window === "undefined") return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 999999,
        mixBlendMode: "difference", // 배경색에 따라 반전되는 효과
        backgroundColor: "#ffffff",
      }}
      animate={{
        x: mousePosition.x - (isHovered ? 24 : 10),
        y: mousePosition.y - (isHovered ? 24 : 10),
        height: isHovered ? 48 : 20,
        width: isHovered ? 48 : 20,
      }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
    >
      {isHovered && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="cursor-text"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            fontSize: "10px",
            color: "#000",
            fontWeight: "bold",
            mixBlendMode: "normal"
          }}
        >
        </motion.span>
      )}
    </motion.div>
  );
}
