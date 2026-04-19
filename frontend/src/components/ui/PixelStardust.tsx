'use client';
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
}

const PARTICLE_COLOR = '#FFFFFF';

export function PixelStardust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animFrame = useRef<number>(0);
  const lastSpawn = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Track mouse — spawn particles slowly
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      // Only spawn every ~60ms for a slow, gentle trail
      if (now - lastSpawn.current < 60) return;
      lastSpawn.current = now;

      // Spawn 1 particle per tick
      particles.current.push({
        x: e.clientX + (Math.random() - 0.5) * 4,
        y: e.clientY + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.3 - Math.random() * 0.5, // gentle upward drift
        size: 2 + Math.floor(Math.random() * 3), // 2-4px squares
        life: 0,
        maxLife: 50 + Math.random() * 40, // ~800-1500ms at 60fps
      });

      // Limit max particles
      if (particles.current.length > 80) {
        particles.current = particles.current.slice(-60);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter((p) => {
        p.life++;
        if (p.life >= p.maxLife) return false;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.01; // very gentle gravity

        const progress = p.life / p.maxLife;
        const alpha = 1 - progress;

        ctx.globalAlpha = alpha * 0.7; // slightly transparent even at start
        ctx.fillStyle = PARTICLE_COLOR;
        ctx.fillRect(
          Math.floor(p.x),
          Math.floor(p.y),
          p.size,
          p.size
        );

        return true;
      });

      ctx.globalAlpha = 1;
      animFrame.current = requestAnimationFrame(animate);
    };
    animFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrame.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
