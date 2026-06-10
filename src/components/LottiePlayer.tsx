"use client";

import { useEffect, useRef } from "react";
import lottie from "lottie-web";

interface LottiePlayerProps {
  src: string;
  alignLeft?: boolean;
}

export default function LottiePlayer({ src, alignLeft = false }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: src,
      rendererSettings: {
        preserveAspectRatio: alignLeft ? 'xMinYMid slice' : 'xMidYMid slice',
      }
    });

    return () => {
      anim.destroy();
    };
  }, [src, alignLeft]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
