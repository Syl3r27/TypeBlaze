'use client';
import { useEffect, useRef } from 'react';

export function PixelStardust() {
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spot = spotRef.current;
    if (!spot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    const startTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let raf: number;
    const animate = (now: number) => {
      const t = (now - startTime) / 1000;

      // Sluggish follow
      currentX += (mouseX - currentX) * 0.04;
      currentY += (mouseY - currentY) * 0.04;

      // Slow, small-amplitude wiggle
      const wiggleX = Math.sin(t * 0.4) * 7 + Math.cos(t * 0.3) * 4;
      const wiggleY = Math.cos(t * 0.35) * 7 + Math.sin(t * 0.45) * 4;

      // Subtle scale breathe
      const scale = 1 + Math.sin(t * 0.5) * 0.04;

      // Center exactly on cursor (half of 700px = 350)
      spot.style.transform = `translate(${currentX - 350 + wiggleX}px, ${currentY - 350 + wiggleY}px) scale(${scale})`;

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={spotRef}
      className="fixed top-0 left-0 pointer-events-none"
      style={{
        width: '700px',
        height: '700px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)',
        zIndex: 1,
        willChange: 'transform',
      }}
    />
  );
}
