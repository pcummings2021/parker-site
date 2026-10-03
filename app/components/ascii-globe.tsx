"use client";

import { useEffect, useRef } from "react";
import { renderGlobe } from "./ascii-globe-frame";

const initialFrame = renderGlobe(0);

export default function AsciiGlobe() {
  const frameRef = useRef<HTMLPreElement>(null);
  const angleRef = useRef(0);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    let animationId = 0;
    let previousTime = 0;

    function animate(time: number) {
      if (!element) return;
      if (!previousTime) previousTime = time;
      const elapsed = time - previousTime;
      angleRef.current += (Math.min(elapsed, 100) / 1000) * 0.45;
      element.textContent = renderGlobe(angleRef.current);
      previousTime = time;
      animationId = window.requestAnimationFrame(animate);
    }

    function syncAnimation() {
      const shouldAnimate = inView && !document.hidden && !reducedMotion.matches;
      if (shouldAnimate && !animationId) {
        previousTime = 0;
        animationId = window.requestAnimationFrame(animate);
      } else if (!shouldAnimate && animationId) {
        window.cancelAnimationFrame(animationId);
        animationId = 0;
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncAnimation();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", syncAnimation);
    reducedMotion.addEventListener("change", syncAnimation);

    return () => {
      window.cancelAnimationFrame(animationId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncAnimation);
      reducedMotion.removeEventListener("change", syncAnimation);
    };
  }, []);

  return (
    <div className="ascii-globe">
      <pre ref={frameRef} aria-hidden="true" className="ascii-globe-frame">{initialFrame}</pre>
    </div>
  );
}
