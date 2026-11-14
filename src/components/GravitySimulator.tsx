import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SphereParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
}

const GRAVITY_PRESETS = [
  { id: 'earth', name: 'TIERRA', gVal: 9.81, label: '9.81 m/s²' },
  { id: 'mars', name: 'MARTE', gVal: 3.72, label: '3.72 m/s²' },
  { id: 'moon', name: 'LUNA', gVal: 1.62, label: '1.62 m/s²' },
];

export default function GravitySimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedGravity, setSelectedGravity] = useState<string>('earth');
  const spheresRef = useRef<SphereParticle[]>([]);
  const animFrameRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const activeGravityRef = useRef<number>(9.81);

  useEffect(() => {
    const preset = GRAVITY_PRESETS.find((p) => p.id === selectedGravity);
    if (preset) {
      activeGravityRef.current = preset.gVal;
    }
  }, [selectedGravity]);

  // Initialize 120 white and ice-blue spheres filling bottom area wall-to-wall
  const initSpheres = useCallback((width: number, height: number) => {
    const spheres: SphereParticle[] = [];
    const count = 120;

    for (let i = 0; i < count; i++) {
      const radius = 6 + Math.random() * 12;
      const isWhite = Math.random() < 0.65;
      const color = isWhite ? '#FFFFFF' : '#A5B8FF';

      spheres.push({
        x: radius + Math.random() * (width - radius * 2),
        y: height * 0.35 + Math.random() * (height * 0.6 - radius),
        vx: (Math.random() - 0.5) * 5,
        vy: Math.random() * 2,
        radius,
        mass: (radius * radius) / 30,
        color,
      });
    }
    spheresRef.current = spheres;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = { x: -1000, y: -1000 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = 480 * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `480px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (spheresRef.current.length === 0) {
        initSpheres(rect.width, 480);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();
    let isVisible = false;

    const animate = (time: number) => {
      if (!isVisible) {
        animFrameRef.current = 0;
        return;
      }
      const dt = Math.min((time - lastTime) / 1000, 0.04);
      lastTime = time;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = 480;

      ctx.clearRect(0, 0, width, height);

      const gScale = activeGravityRef.current * 75;
      const mouse = mousePosRef.current;
      const spheres = spheresRef.current;

      // Update positions and physics
      for (let i = 0; i < spheres.length; i++) {
        const s = spheres[i];

        // Apply selected gravity
        s.vy += gScale * dt;

        // Mouse splash impact
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const splashRadius = 90;

        if (dist < splashRadius && dist > 0) {
          const force = ((splashRadius - dist) / splashRadius) * 850;
          s.vx += (dx / dist) * force * dt;
          s.vy += (dy / dist) * force * dt;
        }

        s.x += s.vx * dt * 60;
        s.y += s.vy * dt * 60;

        s.vx *= 0.996;
        s.vy *= 0.998;

        // Bounce on boundaries
        const restitution = 0.68;
        if (s.y + s.radius > height) {
          s.y = height - s.radius;
          s.vy = -s.vy * restitution;
          s.vx *= 0.94;
        }
        if (s.y - s.radius < 0) {
          s.y = s.radius;
          s.vy = -s.vy * restitution;
        }
        if (s.x + s.radius > width) {
          s.x = width - s.radius;
          s.vx = -s.vx * restitution;
        }
        if (s.x - s.radius < 0) {
          s.x = s.radius;
          s.vx = -s.vx * restitution;
        }
      }

      // Ball-to-ball collisions (optimized with simple grid or distance check)
      for (let i = 0; i < spheres.length; i++) {
        for (let j = i + 1; j < spheres.length; j++) {
          const s1 = spheres[i];
          const s2 = spheres[j];
          const dx = s2.x - s1.x;
          const dy = s2.y - s1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = s1.radius + s2.radius;

          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;

            s1.x -= nx * overlap;
            s1.y -= ny * overlap;
            s2.x += nx * overlap;
            s2.y += ny * overlap;

            const kx = s1.vx - s2.vx;
            const ky = s1.vy - s2.vy;
            const p = (2 * (nx * kx + ny * ky)) / (s1.mass + s2.mass);

            s1.vx -= p * s2.mass * nx;
            s1.vy -= p * s2.mass * ny;
            s2.vx += p * s1.mass * nx;
            s2.vy += p * s1.mass * ny;
          }
        }
      }

      // Render all 280 white/ice-blue spheres
      for (let i = 0; i < spheres.length; i++) {
        const s = spheres[i];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animFrameRef.current) {
          lastTime = performance.now();
          animFrameRef.current = requestAnimationFrame(animate);
        } else if (!isVisible && animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = 0;
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(container);

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [initSpheres]);

  const handleSplash = () => {
    spheresRef.current.forEach((s) => {
      s.vy = -16 - Math.random() * 20;
      s.vx = (Math.random() - 0.5) * 22;
    });
  };

  return (
    <section
      className="relative w-full overflow-hidden select-none py-28 px-6 text-white"
      style={{
        background: '#2544FF',
      }}
    >
      <div className="max-w-[1400px] mx-auto text-center relative z-10">
        {/* Top Tag */}
        <span
          className="font-mono uppercase tracking-[0.2em] block mb-3 text-white/80 font-bold"
          style={{ fontSize: '11px' }}
        >
          04 — LUSION FOOTER SANDBOX // EXTRATERRESTRIAL FLUIDITY
        </span>

        {/* Colossal Central Typography */}
        <h2
          className="text-white font-extrabold uppercase tracking-tight leading-[0.95] mb-6"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(32px, 5.5vw, 76px)',
            maxWidth: '1100px',
            margin: '0 auto 24px',
            textShadow: '0 4px 30px rgba(0,0,0,0.2)',
          }}
        >
          TEST PAYLOAD PHYSICS IN EXTRATERRESTRIAL GRAVITY
        </h2>

        <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed mb-8">
          Mueve el cursor a través de las esferas de regolito para sentir la dispersión inercial y compara en vivo los tres regímenes gravitatorios de exploración.
        </p>

        {/* Gravity Preset Buttons (White on Cobalt) */}
        <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          {GRAVITY_PRESETS.map((preset) => {
            const isSel = selectedGravity === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedGravity(preset.id)}
                className={`py-2.5 px-6 rounded-full font-mono text-xs font-bold transition-all duration-300 shadow-md ${
                  isSel
                    ? 'bg-white text-[#2544FF] scale-105 shadow-xl'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                <span>{preset.name}</span>
                <span className="opacity-80 ml-1.5 font-normal">({preset.label})</span>
              </button>
            );
          })}

          <button
            onClick={handleSplash}
            className="py-2.5 px-6 rounded-full font-mono text-xs font-bold bg-white text-[#2544FF] hover:bg-white/90 shadow-md"
          >
            DISPERSAR ESFERAS
          </button>
        </div>

        {/* Canvas Physics Container */}
        <div
          ref={containerRef}
          className="relative max-w-[1200px] mx-auto rounded-3xl overflow-hidden bg-[#203BD4] border border-white/20 shadow-2xl"
          style={{ height: '480px' }}
        >
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full h-full block"
          />

          <div className="absolute top-4 left-6 bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full font-mono text-xs text-white/90 border border-white/15 flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>ACELERACIÓN GRAVITATORIA ACTIVA: <strong>{activeGravityRef.current} m/s²</strong></span>
          </div>

          <div className="absolute bottom-4 right-6 font-mono text-[10px] text-white/60 pointer-events-none">
            PASA EL CURSOR SOBRE LAS ESFERAS PARA GENERAR IMPACTOS ELÁSTICOS
          </div>
        </div>
      </div>
    </section>
  );
}
