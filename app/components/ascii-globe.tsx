"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { renderGlobe } from "./ascii-globe-frame";

const initialFrame = renderGlobe(0);

export default function AsciiGlobe() {
  const frameRef = useRef<HTMLPreElement>(null);
  const angleRef = useRef(0);
  const blipId = useRef(0);
  const [blips, setBlips] = useState<{ id: number; x: number; y: number }[]>([]);

  function addBlip(event: MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.detail === 0 ? bounds.width / 2 : event.clientX - bounds.left;
    const y = event.detail === 0 ? bounds.height / 2 : event.clientY - bounds.top;
    const globeX = (x - bounds.width / 2) / (bounds.width * 36 / 96);
    const globeY = (y - bounds.height / 2) / (bounds.height * 17 / 45);
    if (globeX * globeX + globeY * globeY > 16 / 15) return;
    const id = blipId.current++;
    setBlips((current) => [...current.slice(-7), { id, x, y }]);
  }

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
      // Keep the decorative ASCII animation light on mobile CPUs.
      if (elapsed < 1000 / 30) {
        animationId = window.requestAnimationFrame(animate);
        return;
      }
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
      <button type="button" className="globe-trigger" aria-label="Create a blip on the globe" onClick={addBlip} />
      {blips.map((blip) => (
        <svg
          key={blip.id}
          className="globe-blip"
          style={{ left: blip.x, top: blip.y }}
          width="28" height="28" viewBox="-14 -14 28 28"
          fill="none" stroke="currentColor" strokeWidth="1"
          aria-hidden="true"
          onAnimationEnd={() => setBlips((current) => current.filter(({ id }) => id !== blip.id))}
        >
          <circle r="2" />
          <path d="M0-5v-5M0 5v5M-5 0h-5M5 0h5M-4-4l-3-3M4 4l3 3M-4 4l-3 3M4-4l3-3" />
        </svg>
      ))}
    </div>
  );
}
