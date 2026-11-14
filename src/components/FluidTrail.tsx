import React, { useEffect, useRef } from 'react';

// ─── Lusion-grade fluid mouse trail ──────────────────────────────────────────
// Organic ribbon following the cursor.
// STRICT RULE: 100% invisible on Slide 1 (Hero section) to avoid colliding with
// the starfield. Smoothly fades in as the user enters Slide 2, remaining active
// throughout the rest of the experience.

interface Pt {
  x: number;
  y: number;
  vx: number;
  vy: number;
  time: number;
}

const MAX_HISTORY = 45;
const FADE_DURATION_MS = 650; // trail dissolves after mouse stops moving

export default function FluidTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Pt[]>([]);
  const rafRef = useRef<number>(0);
  const opacityRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const prevMouseRef = useRef<{ x: number; y: number } | null>(null);

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

    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const prev = prevMouseRef.current;
      const vx = prev ? (e.clientX - prev.x) : 0;
      const vy = prev ? (e.clientY - prev.y) : 0;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      pointsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        vx,
        vy,
        time: now,
      });

      if (pointsRef.current.length > MAX_HISTORY) {
        pointsRef.current.shift();
      }
      lastMoveTimeRef.current = now;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Passive cached scroll tracking to avoid layout thrashing in draw loop
    let targetVis = 0;
    const updateVisibility = () => {
      const hero = document.querySelector('.hero-interactive') as HTMLElement | null;
      if (!hero) {
        targetVis = 1;
        return;
      }
      const rect = hero.getBoundingClientRect();
      const fadeStart = window.innerHeight * 0.45;
      const fadeEnd = 0;

      if (rect.bottom >= fadeStart) {
        targetVis = 0; // strictly 0 on Hero
      } else if (rect.bottom <= fadeEnd) {
        targetVis = 1; // 100% active from Slide 2 onward
      } else {
        targetVis = (fadeStart - rect.bottom) / (fadeStart - fadeEnd);
      }
    };

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const draw = (now: number) => {
      opacityRef.current = lerp(opacityRef.current, targetVis, 0.1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentVis = opacityRef.current;
      const pts = pointsRef.current;

      // Drop stale points
      while (pts.length > 0 && now - pts[0].time > FADE_DURATION_MS) {
        pts.shift();
      }

      if (currentVis < 0.01 || pts.length < 3) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const timeSinceMove = now - lastMoveTimeRef.current;
      const fadeRatio = timeSinceMove > FADE_DURATION_MS
        ? 0
        : Math.pow(1 - timeSinceMove / FADE_DURATION_MS, 1.2);

      if (fadeRatio < 0.01) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const totalAlpha = currentVis * fadeRatio;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // ── PASS 1: Soft Outer Iridescent Glow (electric cobalt / cyan) ──────
      for (let i = 2; i < pts.length; i++) {
        const t = i / (pts.length - 1);
        const p0 = pts[i - 2];
        const p1 = pts[i - 1];
        const p2 = pts[i];

        const speed = Math.sqrt(p1.vx * p1.vx + p1.vy * p1.vy);
        const dynamicWidth = lerp(3, 26, t) * lerp(0.7, 1.35, Math.min(speed / 14, 1));
        const alpha = t * t * 0.42 * totalAlpha;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        ctx.beginPath();
        ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
        ctx.quadraticCurveTo(p1.x, p1.y, mx, my);
        ctx.lineWidth = dynamicWidth;
        ctx.strokeStyle = `rgba(37, 68, 255, ${alpha})`;
        ctx.stroke();
      }

      // ── PASS 2: Vivid Mid Ribbon with Cyan/Violet Edge Sheen ─────────────
      for (let i = 2; i < pts.length; i++) {
        const t = i / (pts.length - 1);
        const p0 = pts[i - 2];
        const p1 = pts[i - 1];
        const p2 = pts[i];

        const speed = Math.sqrt(p1.vx * p1.vx + p1.vy * p1.vy);
        const dynamicWidth = lerp(1.5, 12, t) * lerp(0.8, 1.25, Math.min(speed / 14, 1));
        const alpha = t * t * 0.75 * totalAlpha;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        // Subtle gradient shift along length
        const r = Math.round(lerp(50, 100, t));
        const g = Math.round(lerp(90, 180, t));
        const b = 255;

        ctx.beginPath();
        ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
        ctx.quadraticCurveTo(p1.x, p1.y, mx, my);
        ctx.lineWidth = dynamicWidth;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.stroke();
      }

      // ── PASS 3: Bright Specular Core (White center spine) ─────────────────
      for (let i = 2; i < pts.length; i++) {
        const t = i / (pts.length - 1);
        const p0 = pts[i - 2];
        const p1 = pts[i - 1];
        const p2 = pts[i];

        const dynamicWidth = lerp(0.5, 3.5, t);
        const alpha = t * t * 0.9 * totalAlpha;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        ctx.beginPath();
        ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
        ctx.quadraticCurveTo(p1.x, p1.y, mx, my);
        ctx.lineWidth = dynamicWidth;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.stroke();
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', updateVisibility);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
