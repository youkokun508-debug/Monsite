'use client';

import { useEffect, useRef } from 'react';

// Pluie de confettis dorés, légère (canvas), lancée une fois quand `fire` passe à true.
// Désactivée si l'utilisateur a demandé moins d'animations.
export function Confetti({ fire }: { fire: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!fire) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();

    const colors = ['#C9A84C', '#E8CC80', '#F5F0E8', '#8A6E2E'];
    const W = () => canvas.width;
    const parts = Array.from({ length: 140 }, () => ({
      x: W() / 2 + (Math.random() - 0.5) * W() * 0.3,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 14 * dpr,
      vy: (-Math.random() * 16 - 6) * dpr,
      size: (Math.random() * 6 + 4) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() < 0.3 ? 'diamond' : 'rect',
    }));

    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of parts) {
        p.vy += 0.45 * dpr;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - frame / 160);
        ctx.fillStyle = p.color;
        if (p.shape === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 1.4);
          ctx.lineTo(p.size / 2, 0);
          ctx.lineTo(0, p.size / 1.4);
          ctx.lineTo(-p.size / 2, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (frame < 160) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [fire]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 60 }}
    />
  );
}
