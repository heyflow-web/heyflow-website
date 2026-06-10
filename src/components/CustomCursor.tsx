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

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  if (typeof window === "undefined") return null;

  return (
    <motion.div
      className="custom-cursor-element"
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
