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

    const resize = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particlesRef.current.length === 0) {
        initParticles(rect.width, rect.height);
      } else {
        particlesRef.current.forEach((p) => {
          p.originX = Math.random() * rect.width;
          p.originY = Math.random() * rect.height;
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
    window.addEventListener('mousemove', handleMove, { passive: true });

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

      const rect = section.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

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

      ctx.clearRect(0, 0, w, h);

      // 1. Vertical Zenith Lunar Light Beam
      const gradient = ctx.createRadialGradient(w / 2, -100, 50, w / 2, h * 0.5, w * 0.7);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.02)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      const mp = mousePosRef.current;
      const mx = mp.x - rect.left;
      const my = mp.y - rect.top;

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 0. Constant drift velocity + upward vertical acceleration during orbit descent
        p.originX += p.vxBase;
        const upwardBoost = (Math.max(0, scrollVelocity) * 0.22 + smoothScroll * 0.003) * (p.depth / 2);
        p.originY += p.vyBase - upwardBoost;
        // Seamless wraparound: shift both origin and position simultaneously so springs don't jerk
        if (p.originX < -30) {
          p.originX += w + 60;
          p.x += w + 60;
        } else if (p.originX > w + 30) {
          p.originX -= w + 60;
          p.x -= w + 60;
        }
        if (p.originY < -30) {
          p.originY += h + 60;
          p.y += h + 60;
        } else if (p.originY > h + 30) {
          p.originY -= h + 60;
          p.y -= h + 60;
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
          // Add subtle fluid swirl
          const swirl = 0.3;
          p.vx += Math.cos(angle + swirl) * force;
          p.vy += Math.sin(angle + swirl) * force;
        }

        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

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
      observer.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [initParticles]);

  // Path length for 48px thick signature spline
  const pathLength = 2600;
  const dashOffset = Math.max(0, pathLength - scrollProgress * pathLength * 2.5);

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

      {/* 2. Signature Minimalist Architectural Spline (Monochrome curve behind title) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{ zIndex: 2 }}
      >
        <defs>
          <linearGradient id="splineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
            <stop offset="50%" stopColor="#E4E4E7" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d="M -100,200 C 400,100 300,750 800,600 C 1300,450 1200,900 1750,850"
          stroke="url(#splineGradient)"
          strokeWidth="42"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={pathLength}
          strokeDashoffset={dashOffset}
          style={{
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
            transition: 'stroke-dashoffset 0.12s ease-out',
          }}
        />
      </svg>

      {/* 3. Hero Content Overlaid on Lower-Left Third with Line-by-Line Masked Reveal */}
      <div
        ref={titleBlockRef}
        className="relative z-10 w-full flex flex-col"
        style={{
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '0 7vw 12vh 7vw',
          textAlign: 'left',
          maxWidth: '900px',
          willChange: 'transform, opacity',
        }}
      >
        <h1
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(2.4rem, 4.4vw, 4.2rem)',
            fontWeight: 500,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            textAlign: 'left',
            margin: 0,
            textShadow: '0 2px 24px rgba(0,0,0,0.5)',
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

        <div style={{ overflow: 'hidden', marginTop: '1.25rem' }}>
          <p
            className="font-normal leading-[1.65]"
            style={{
              fontFamily: "'Inter', sans-serif",
              maxWidth: '520px',
              fontSize: '15px',
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
