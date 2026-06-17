"use client";

import { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";

interface LottiePlayerProps {
  src: string;
  alignLeft?: boolean;
  speed?: number;
}

export default function LottiePlayer({ src, alignLeft = false, speed = 1.5 }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let anim: AnimationItem | null = null;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !anim) {
        anim = lottie.loadAnimation({
          container: containerRef.current!,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: src,
          rendererSettings: {
            preserveAspectRatio: alignLeft ? 'xMinYMid slice' : 'xMidYMid slice',
          }
        });
        anim.setSpeed(speed);
      }
    }, { threshold: 0.1 });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (anim) anim.destroy();
    };
  }, [src, alignLeft]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
