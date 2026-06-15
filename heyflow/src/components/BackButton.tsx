"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className={`cursor-hover ${className || ""}`}
      style={{ 
        background: "none", 
        border: "none", 
        padding: 0, 
        color: "inherit", 
        display: "flex", 
        alignItems: "center", 
        gap: "6px" 
      }}
    >
      <ArrowLeft size={16} /> Back
    </button>
  );
}
