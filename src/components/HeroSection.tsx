import React, { useRef, useEffect, useCallback, useState } from 'react';

interface HeroSectionProps {
  scrollProgress?: number;
  mousePos?: { x: number; y: number };
}

interface Particle3D {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  vxBase: number; // constant drift velocity X
  vyBase: number; // constant drift velocity Y
  depth: number; // 1 (far), 2 (mid), 3 (near)
  radius: number;
  opacity: number;
  color: string;
}

const PARTICLE_COUNT = 450;
const REPULSION_RADIUS = 160;

export default function HeroSection({ scrollProgress = 0 }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle3D[]>([]);
  const animFrameRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleBlockRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 60);
    return () => clearTimeout(timer);
  }, []);

  // Initialize 450 white stars with constant noticeable drift
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle3D[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const depth = Math.random() < 0.45 ? 1 : Math.random() < 0.8 ? 2 : 3;
      // Size: 0.8px to 2.6px
      const radius = 0.8 + Math.random() * 1.8;
      const opacity = 0.35 + Math.random() * 0.6;
      const color = depth === 3 ? '#FFFFFF' : depth === 2 ? '#F0F4FF' : '#E2EAFF';

      const depthFactor = depth === 1 ? 0.6 : depth === 2 ? 0.95 : 1.35;
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.75 + Math.random() * 1.15) * depthFactor;
      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vxBase: Math.cos(angle) * speed,
        vyBase: Math.sin(angle) * speed,
        depth,
        radius,
        opacity,
        color,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cachedGradient: CanvasGradient | null = null;

    const resize = () => {
      const section = sectionRef.current;
      if (!section) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = section.clientWidth || window.innerWidth;
      const h = section.clientHeight || window.innerHeight;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const grad = ctx.createRadialGradient(w / 2, -100, 50, w / 2, h * 0.5, w * 0.7);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.02)');
      grad.addColorStop(1, 'transparent');
      cachedGradient = grad;

      if (particlesRef.current.length === 0) {
        initParticles(w, h);
      } else {
        particlesRef.current.forEach((p) => {
          p.originX = Math.random() * w;
          p.originY = Math.random() * h;
          p.x = p.originX;
          p.y = p.originY;
          p.vx = 0;
          p.vy = 0;
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMove = (e: MouseEvent) => {
      mousePosRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };
    const handleMouseLeave = () => {
      mousePosRef.current = { x: -5000, y: -5000 };
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    let isVisible = true;
    let smoothScroll = window.scrollY;
    let scrollVelocity = 0;

    const animate = () => {
      if (!isVisible) {
        animFrameRef.current = 0;
        return;
      }
      const section = sectionRef.current;
      if (!canvas || !ctx || !section) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      // 100% Complete hardware buffer clear across all pixels
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Clamp drawing strictly within section viewport bounds
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.clip();

      // Global 60fps LERP inertia engine
      const targetScroll = window.scrollY;
      const scrollDiff = targetScroll - smoothScroll;
      smoothScroll += scrollDiff * 0.085;
      scrollVelocity = scrollDiff;

      // Parallax on title block during the first 40-65vh
      if (titleBlockRef.current) {
        const maxFade = (window.innerHeight || 900) * 0.65;
        const op = Math.max(0, 1 - smoothScroll / maxFade);
        const ty = smoothScroll * -0.25;
        titleBlockRef.current.style.transform = `translateY(${ty}px)`;
        titleBlockRef.current.style.opacity = `${op}`;
      }

      // 1. Vertical Zenith Lunar Light Beam (using cached gradient to prevent GC thrashing)
      if (cachedGradient) {
        ctx.fillStyle = cachedGradient;
        ctx.fillRect(0, 0, w, h);
      }

      const rect = section.getBoundingClientRect();
      const scaleX = rect.width / (w || 1);
      const scaleY = rect.height / (h || 1);
      const mp = mousePosRef.current;
      const mx = (mp.x - rect.left) / (scaleX || 1);
      const my = (mp.y - rect.top) / (scaleY || 1);

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Constant drift velocity + upward vertical acceleration during orbit descent
        p.originX += p.vxBase;
        const upwardBoost = (Math.max(0, scrollVelocity) * 0.18 + smoothScroll * 0.002) * (p.depth / 2);
        p.originY += p.vyBase - upwardBoost;

        // Clean wraparound without edge sticking
        if (p.originX < -20) {
          p.originX += w + 40;
          p.x = p.originX;
          p.vx = 0;
        } else if (p.originX > w + 20) {
          p.originX -= w + 40;
          p.x = p.originX;
          p.vx = 0;
        }

        if (p.originY < -20) {
          p.originY += h + 40;
          p.y = p.originY;
          p.vy = 0;
        } else if (p.originY > h + 20) {
          p.originY -= h + 40;
          p.y = p.originY;
          p.vy = 0;
        }

        // Safety position bounds to prevent stray particles
        if (p.x < -40 || p.x > w + 40) {
          p.x = p.originX;
          p.vx = 0;
        }
        if (p.y < -40 || p.y > h + 40) {
          p.y = p.originY;
          p.vy = 0;
        }

        // Spring return to origin with depth factor
        const springK = 0.012 * (p.depth / 2);
        const damping = 0.93;
        const dx = p.originX - p.x;
        const dy = p.originY - p.y;
        p.vx += dx * springK;
        p.vy += dy * springK;

        // Fluid repulsion from cursor with turbulence
        const pdx = p.x - mx;
        const pdy = p.y - my;
        const dist = Math.sqrt(pdx * pdx + pdy * pdy);

        if (dist < REPULSION_RADIUS && dist > 0) {
          const force = ((REPULSION_RADIUS - dist) / REPULSION_RADIUS) * (2.8 * p.depth);
          const angle = Math.atan2(pdy, pdx);
          const swirl = 0.3;
          p.vx += Math.cos(angle + swirl) * force;
          p.vy += Math.sin(angle + swirl) * force;
        }

        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle only within visible area
        if (p.x >= -2 && p.x <= w + 2 && p.y >= -2 && p.y <= h + 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fill();
        }
      }

      ctx.restore(); // Restore clip region

      animFrameRef.current = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else if (!isVisible && animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = 0;
        }
      },
      { rootMargin: '100px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [initParticles]);

  return (
    <section
      id="hero-section"
      ref={sectionRef}
      className="hero-interactive section-dark relative overflow-hidden select-none"
      style={{
        background: '#050508',
        minHeight: '100vh',
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        position: 'relative',
        zIndex: 2,
        willChange: 'transform, filter',
        transformOrigin: 'center center',
      }}
    >
      {/* 1. Canvas 2D Depth Particle Field */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* 2. Hero Content Overlaid on Lower-Left Third with Line-by-Line Masked Reveal */}
      <div
        ref={titleBlockRef}
        className="relative z-10 w-full flex flex-col"
        style={{
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '0 6vw 24vh 6vw',
          textAlign: 'left',
          maxWidth: '1440px',
          willChange: 'transform, opacity',
        }}
      >
        <h1
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(3.4rem, 6.2vw, 6.5rem)',
            fontWeight: 550,
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            color: '#FFFFFF',
            textAlign: 'left',
            margin: 0,
            textShadow: '0 2px 28px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <span
              style={{
                display: 'block',
                transform: revealed ? 'translateY(0%)' : 'translateY(105%)',
                transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.0s',
                willChange: 'transform',
              }}
            >
              Earth as a Proving Ground
            </span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <span
              style={{
                display: 'block',
                transform: revealed ? 'translateY(0%)' : 'translateY(105%)',
                transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.08s',
                willChange: 'transform',
              }}
            >
              for New Worlds
            </span>
          </div>
        </h1>

        <div style={{ overflow: 'hidden', marginTop: '1.75rem' }}>
          <p
            className="font-normal leading-[1.65]"
            style={{
              fontFamily: "'Inter', sans-serif",
              maxWidth: '820px',
              fontSize: 'clamp(16px, 1.25vw, 20px)',
              color: '#A1A1AA',
              textAlign: 'left',
              margin: 0,
              transform: revealed ? 'translateY(0%)' : 'translateY(105%)',
              transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.16s',
              willChange: 'transform',
            }}
          >
            Plataforma de caracterización geomorfológica y física que vincula los desiertos y cráteres más extremos
            de la Tierra con misiones Artemis en la Luna y bases tripuladas en Marte.
          </p>
        </div>
      </div>
    </section>
  );
}
