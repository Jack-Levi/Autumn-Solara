import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SphereParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  isTracer: boolean;
}

const GRAVITY_PRESETS = [
  {
    id: 'earth',
    name: 'Tierra',
    gVal: 9.81,
    ratio: '1.00g',
    desc: 'Caída rápida, alta compactación basal y baja altura de rebote.',
    restitution: 0.58,
    damping: 0.992,
  },
  {
    id: 'mars',
    name: 'Marte',
    gVal: 3.72,
    ratio: '0.38g',
    desc: 'Caída media, amplios arcos parabólicos y dispersión balística moderada.',
    restitution: 0.74,
    damping: 0.996,
  },
  {
    id: 'moon',
    name: 'Luna',
    gVal: 1.62,
    ratio: '0.16g',
    desc: 'Flotación lenta, suspensión prolongada y eyección balística extendida.',
    restitution: 0.86,
    damping: 0.998,
  },
];

export default function GravitySimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedGravity, setSelectedGravity] = useState<string>('earth');
  const spheresRef = useRef<SphereParticle[]>([]);
  const animFrameRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number; vx: number; vy: number; lastTime: number }>({
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    lastTime: 0,
  });

  const activePreset = GRAVITY_PRESETS.find((p) => p.id === selectedGravity) || GRAVITY_PRESETS[0];

  // Initialize exactly 280 spheres: Ivory White (#F4F4F0), Lunar Silver (#A1A1AA), Regolith Gray (#52525B)
  const initSpheres = useCallback((width: number, height: number) => {
    const spheres: SphereParticle[] = [];
    const count = 280;

    for (let i = 0; i < count; i++) {
      const radius = 7 + Math.random() * 12;
      const rand = Math.random();

      let color = '#F4F4F0'; // Blanco marfil
      let isTracer = false;
      if (rand > 0.65) {
        color = '#52525B'; // Gris regolito
      } else if (rand > 0.3) {
        color = '#A1A1AA'; // Plata lunar
      }

      spheres.push({
        x: radius + Math.random() * (width - radius * 2),
        y: height * 0.2 + Math.random() * (height * 0.75 - radius),
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3,
        radius,
        mass: (radius * radius) / 25,
        color,
        isTracer,
      });
    }
    spheresRef.current = spheres;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const now = performance.now();
    const dt = Math.max(1, now - mousePosRef.current.lastTime);

    const vx = ((currentX - mousePosRef.current.x) / dt) * 16;
    const vy = ((currentY - mousePosRef.current.y) / dt) * 16;

    mousePosRef.current = {
      x: currentX,
      y: currentY,
      vx,
      vy,
      lastTime: now,
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = { x: -1000, y: -1000, vx: 0, vy: 0, lastTime: 0 };
  };

  // Crater Impact Shockwave Simulation:
  // Propels the 280 spheres upward in an explosive crater ejecta curtain
  const handleCraterImpact = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const epicX = width * 0.5;
    const epicY = height;

    spheresRef.current.forEach((s) => {
      const dx = s.x - epicX;
      const dy = s.y - epicY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const normDist = Math.min(1, dist / width);

      // Radial impulse with upward hyperbolic boost
      const power = 38 * (1 - normDist * 0.65);
      const angle = Math.atan2(dy, dx);

      s.vx += Math.cos(angle) * power * 1.3 + (Math.random() - 0.5) * 10;
      s.vy = -Math.abs(Math.sin(angle)) * power * 2.2 - (Math.random() * 12 + 16);
    });
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
      const h = Math.max(500, Math.min(620, window.innerHeight * 0.62));
      canvas.width = rect.width * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (spheresRef.current.length === 0) {
        initSpheres(rect.width, h);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();
    let isVisible = false;

    // High performance 60 FPS animation loop with Spatial Grid optimization
    const animate = (time: number) => {
      if (!isVisible) {
        animFrameRef.current = 0;
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.033);
      lastTime = time;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      const gAccel = activePreset.gVal * 68;
      const restitution = activePreset.restitution;
      const damping = activePreset.damping;
      const mouse = mousePosRef.current;
      const mouseSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      const spheres = spheresRef.current;

      // 1. Physics update: Gravity, Mouse Repulsion & Wall Collisions
      for (let i = 0; i < spheres.length; i++) {
        const s = spheres[i];

        // Apply active planetary gravity
        s.vy += gAccel * dt;

        // Mouse kinetic repulsion field proportional to cursor velocity
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const splashRadius = Math.min(180, 110 + mouseSpeed * 1.8);

        if (dist < splashRadius && dist > 0) {
          const proximity = (splashRadius - dist) / splashRadius;
          const force = proximity * (750 + mouseSpeed * 35);
          const nx = dx / dist;
          const ny = dy / dist;

          s.vx += (nx * force + mouse.vx * 0.6) * dt;
          s.vy += (ny * force + mouse.vy * 0.6) * dt;
        }

        // Integrate positions
        s.x += s.vx * dt * 60;
        s.y += s.vy * dt * 60;

        // Atmospheric/surface damping
        s.vx *= damping;
        s.vy *= damping;

        // Boundaries: Floor collision with regolith restitution
        if (s.y + s.radius > height) {
          s.y = height - s.radius;
          s.vy = -s.vy * restitution;
          s.vx *= 0.94; // Surface friction
        }
        // Ceiling
        if (s.y - s.radius < 0) {
          s.y = s.radius;
          s.vy = -s.vy * restitution;
        }
        // Right wall
        if (s.x + s.radius > width) {
          s.x = width - s.radius;
          s.vx = -s.vx * restitution;
        }
        // Left wall
        if (s.x - s.radius < 0) {
          s.x = s.radius;
          s.vx = -s.vx * restitution;
        }
      }

      // 2. Spatial Grid Partition for 60 FPS Sphere-Sphere Elastic Collisions
      const cellSize = 42;
      const cols = Math.ceil(width / cellSize) + 1;
      const rows = Math.ceil(height / cellSize) + 1;
      const grid: number[][] = new Array(cols * rows);

      for (let i = 0; i < spheres.length; i++) {
        const s = spheres[i];
        const cx = Math.max(0, Math.min(cols - 1, Math.floor(s.x / cellSize)));
        const cy = Math.max(0, Math.min(rows - 1, Math.floor(s.y / cellSize)));
        const idx = cx + cy * cols;
        if (!grid[idx]) grid[idx] = [];
        grid[idx].push(i);
      }

      // Check collisions within neighboring cells only
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const idx = cx + cy * cols;
          const cell = grid[idx];
          if (!cell || cell.length === 0) continue;

          // Check pairs in same cell and adjacent cells
          for (let dy = 0; dy <= 1; dy++) {
            for (let dx = dy === 0 ? 0 : -1; dx <= 1; dx++) {
              const ncx = cx + dx;
              const ncy = cy + dy;
              if (ncx < 0 || ncx >= cols || ncy < 0 || ncy >= rows) continue;

              const nidx = ncx + ncy * cols;
              const ncell = grid[nidx];
              if (!ncell) continue;

              for (let i = 0; i < cell.length; i++) {
                const idx1 = cell[i];
                const s1 = spheres[idx1];
                const jStart = idx === nidx ? i + 1 : 0;

                for (let j = jStart; j < ncell.length; j++) {
                  const idx2 = ncell[j];
                  const s2 = spheres[idx2];

                  const cdx = s2.x - s1.x;
                  const cdy = s2.y - s1.y;
                  const distSq = cdx * cdx + cdy * cdy;
                  const minDist = s1.radius + s2.radius;

                  if (distSq < minDist * minDist && distSq > 0) {
                    const cdist = Math.sqrt(distSq);
                    const overlap = (minDist - cdist) * 0.5;
                    const nx = cdx / cdist;
                    const ny = cdy / cdist;

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
            }
          }
        }
      }

      // 3. Render all 280 spheres with specular highlight & depth shadow
      for (let i = 0; i < spheres.length; i++) {
        const s = spheres[i];

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
        ctx.shadowBlur = s.isTracer ? 12 : 6;
        ctx.shadowOffsetY = 3;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Subtle specular highlight on spheres
        if (s.radius > 9) {
          ctx.beginPath();
          ctx.arc(s.x - s.radius * 0.32, s.y - s.radius * 0.35, s.radius * 0.28, 0, Math.PI * 2);
          ctx.fillStyle = s.isTracer ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.45)';
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animFrameRef.current) {
          // Add initial dynamic upward bounce impulse when entering viewport
          spheresRef.current.forEach((s) => {
            if (Math.abs(s.vy) < 1) {
              s.vy = -3 - Math.random() * 5;
              s.vx += (Math.random() - 0.5) * 4;
            }
          });
          lastTime = performance.now();
          animFrameRef.current = requestAnimationFrame(animate);
        } else if (!isVisible && animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = 0;
        }
      },
      { rootMargin: '120px' }
    );
    observer.observe(container);

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [initSpheres, activePreset]);

  return (
    <section
      id="gravity-section"
      className="relative w-full overflow-hidden select-none py-28 px-6 text-white"
      style={{
        background: '#0D0E11',
        backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '36px 36px 0 0',
        minHeight: '78vh',
      }}
    >
      <div className="max-w-[1400px] mx-auto text-center relative z-10">
        {/* Top Tag in Clean Sentence Case */}
        <span
          className="font-sans uppercase tracking-wider block mb-3 text-[#8E9299] font-medium"
          style={{ fontSize: '11px', letterSpacing: '0.12em' }}
        >
          04 — Dinámica de regolito y gravedad planetaria
        </span>

        {/* Central Title in Elegant Human Typography (Reform 7: font-weight 600, letter-spacing -0.03em) */}
        <h2
          className="editorial-reveal-title text-white font-semibold tracking-[-0.03em] leading-[1.1] mb-4"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(28px, 4.2vw, 52px)',
            maxWidth: '900px',
            margin: '0 auto 16px',
          }}
        >
          Física de regolito y gravedad extraterrestre
        </h2>

        {/* Subtitle connecting simulator with NASA physical limitation */}
        <p className="text-[#A1A1AA] text-base max-w-[65ch] mx-auto font-normal leading-[1.65] mb-8">
          La Tierra no puede reproducir la gravedad reducida de la Luna (1.62 m/s²) ni de Marte (3.72 m/s²). Mueve el cursor a través de las partículas para observar cómo cambian el ángulo de reposo, la velocidad de caída y la dispersión balística de eyección en cada mundo.
        </p>

        {/* Interactive Planetary Gravity Controls: Architectural Segmented/Pill Style */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          <div className="inline-flex p-1 bg-[#121316] border border-white/10 rounded-lg">
            {GRAVITY_PRESETS.map((preset) => {
              const isSel = selectedGravity === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedGravity(preset.id)}
                  className={`py-2 px-4 rounded-md font-sans text-xs transition-all duration-200 ${
                    isSel
                      ? 'bg-white text-[#0A0A0C] font-semibold'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <span>{preset.name}</span>
                  <span className="opacity-75 ml-1.5 font-normal">
                    {preset.gVal} m/s² ({preset.ratio})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Crater Impact Simulation Button: Clean White (Reform 4: rounded-lg) */}
          <button
            onClick={handleCraterImpact}
            className="py-2.5 px-5 rounded-lg font-sans text-xs font-semibold bg-white text-[#0A0A0C] hover:bg-[#E4E4E7] transition-all duration-200 transform active:scale-95 border border-white"
          >
            Simular impacto de cráter
          </button>
        </div>

        {/* Canvas Physics Container: Deep Carbon Monochrome with data-lenis-prevent for physics wheel isolation */}
        <div
          ref={containerRef}
          data-lenis-prevent="true"
          className="relative max-w-[1240px] mx-auto rounded-3xl overflow-hidden bg-[#0A0B0E] border border-white/10 shadow-2xl"
          style={{ minHeight: '520px' }}
        >
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full h-full block cursor-pointer"
          />

          {/* Top-Left Telemetry HUD Badge */}
          <div className="absolute top-4 left-6 bg-[#121316]/90 backdrop-blur-md px-4 py-2 rounded-full font-sans text-xs text-white/95 border border-white/10 flex items-center gap-3 pointer-events-none shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>
              Régimen: <strong className="text-white">{activePreset.name}</strong>
            </span>
            <span className="text-white/20">|</span>
            <span>
              Aceleración: <strong>{activePreset.gVal} m/s²</strong> ({activePreset.ratio})
            </span>
            <span className="text-white/20">|</span>
            <span className="text-[#8E9299]">280 esferas de regolito</span>
          </div>
        </div>
      </div>
    </section>
  );
}
