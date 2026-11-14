import React, { useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

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

const PARTICLE_COUNT = 240;
const REPULSION_RADIUS = 160;

export default function HeroSection({ scrollProgress = 0 }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle3D[]>([]);
  const animFrameRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const sectionRef = useRef<HTMLDivElement>(null);

  // Initialize 3 depth layers of planetary regolith particles
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle3D[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const depth = Math.random() < 0.5 ? 1 : Math.random() < 0.8 ? 2 : 3;
      const radius = depth === 1 ? 1 + Math.random() * 1.5 : depth === 2 ? 2 + Math.random() * 2 : 3.5 + Math.random() * 3;
      const opacity = depth === 1 ? 0.2 + Math.random() * 0.25 : depth === 2 ? 0.45 + Math.random() * 0.3 : 0.8 + Math.random() * 0.2;
      const color = depth === 3 ? '#E8EDFF' : depth === 2 ? '#B0B8C8' : '#707888';

      const depthFactor = depth === 1 ? 0.45 : depth === 2 ? 0.8 : 1.25;
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.55 + Math.random() * 0.85) * depthFactor;
      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
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
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    window.addEventListener('mousemove', handleMove, { passive: true });

    let isVisible = true;

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

      ctx.clearRect(0, 0, w, h);

      // 1. Vertical Zenith Lunar Light Beam
      const gradient = ctx.createRadialGradient(w / 2, -100, 50, w / 2, h * 0.5, w * 0.7);
      gradient.addColorStop(0, 'rgba(37, 68, 255, 0.18)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.04)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      const mp = mousePosRef.current;
      const mx = mp.x - rect.left;
      const my = mp.y - rect.top;

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 0. Constant drift velocity (makes stars move perpetually, not sluggish)
        p.originX += p.vxBase;
        p.originY += p.vyBase;
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
      ref={sectionRef}
      className="hero-interactive section-dark min-h-screen relative overflow-hidden flex flex-col justify-between select-none"
      style={{ background: '#050508' }}
    >
      {/* 1. Canvas 2D Depth Particle Field */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* 2. Signature Lusion Spline (48px thick blue curve meandering behind title) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{ zIndex: 2 }}
      >
        <defs>
          <linearGradient id="splineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2544FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#1E38D4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4A66FF" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path
          d="M -100,200 C 400,100 300,750 800,600 C 1300,450 1200,900 1750,850"
          stroke="url(#splineGradient)"
          strokeWidth="48"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={pathLength}
          strokeDashoffset={dashOffset}
          style={{
            filter: 'drop-shadow(0 20px 60px rgba(37,68,255,0.4))',
            transition: 'stroke-dashoffset 0.12s ease-out',
          }}
        />
      </svg>

      {/* 3. Hero Content Overlaid on Top */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 pt-28 pb-12 max-w-7xl mx-auto w-full">
        {/* Colossal Main Title (3 Lines) */}
        <h1
          className="tracking-tight uppercase text-white font-extrabold leading-[0.92]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(44px, 8.2vw, 120px)',
            maxWidth: '1200px',
            textShadow: '0 2px 30px rgba(0,0,0,0.5)',
          }}
        >
          <span className="block">EARTH AS A</span>
          <span className="block text-[#E8E8EC]">PROVING GROUND</span>
          <span className="block text-white">FOR NEW WORLDS</span>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-8 max-w-2xl text-base md:text-xl font-light text-[#8E929F] leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Plataforma de caracterización geomorfológica y física que vincula los desiertos y cráteres más extremos
          de la Tierra con misiones Artemis en la Luna y bases tripuladas en Marte.
        </p>
      </div>

      {/* 4. Bottom Scroll Cue */}
      <div className="relative z-10 pb-8 flex flex-col items-center justify-center gap-3">
        <div className="relative flex items-center justify-center">
          <span
            className="absolute rounded-full"
            style={{
              width: '40px',
              height: '40px',
              border: '1px solid rgba(37, 68, 255, 0.5)',
              animation: 'pulseRing 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
            }}
          />
          <span className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.04)] backdrop-blur-md flex items-center justify-center">
            <ChevronDown size={16} color="#E8E8EC" className="animate-bounce" />
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B6F7B]">
          SCROLL PARA ENTRAR AL TÚNEL ESPACIAL
        </span>
      </div>
    </section>
  );
}
