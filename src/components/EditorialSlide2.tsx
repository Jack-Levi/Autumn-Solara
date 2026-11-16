import React, { useRef, useEffect, useState } from 'react';

// ─── High-Fidelity 3D Planetary Crater Flyover Canvas (LOLA / SRTM LIDAR) ────
// Bulletproof 60fps orbital flyover over a lunar/martian crater with real-time
// laser elevation scanning beam and orbital mission telemetry (Luxury Monochrome).
function PlanetaryCanvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const ROWS = 42;
    const COLS = 46;

    const getCraterElevation = (x: number, z: number) => {
      const dist = Math.sqrt(x * x + z * z);
      let elev = 0;

      const rimDist = Math.abs(dist - 0.48);
      if (rimDist < 0.22) {
        elev += Math.cos((rimDist / 0.22) * (Math.PI / 2)) * 68;
      }
      if (dist < 0.44) {
        elev -= Math.cos((dist / 0.44) * (Math.PI / 2)) * 52;
      }
      if (dist < 0.12) {
        elev += Math.cos((dist / 0.12) * (Math.PI / 2)) * 36;
      }
      elev += Math.sin(x * 4.2 + z * 3.1) * 9 + Math.cos(x * 8.5) * 5;
      return elev;
    };

    const draw = () => {
      time += 0.014;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      if (!width || !height) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#020306');
      skyGrad.addColorStop(0.45, '#05070F');
      skyGrad.addColorStop(1, '#090D1A');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#E8EEFF';
      for (let s = 0; s < 50; s++) {
        const sx = ((s * 197 + Math.sin(s) * 40) % width + width) % width;
        const sy = (s * 83) % (height * 0.42);
        const sr = s % 3 === 0 ? 1.4 : 0.8;
        const sa = 0.3 + 0.6 * Math.abs(Math.sin(time * 0.5 + s));
        ctx.globalAlpha = sa;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const fov = 340;
      const camY = -120;
      const camZ = -260;
      const horizonY = height * 0.46;
      const centerX = width / 2;

      const laserCycle = (time * 0.42) % 2;
      const laserZNorm = laserCycle < 1 ? -0.8 + laserCycle * 1.6 : 0.8 - (laserCycle - 1) * 1.6;

      const points: { sx: number; sy: number; zWorld: number; elev: number; isLaser: boolean }[][] = [];

      for (let r = 0; r < ROWS; r++) {
        const rowArr: { sx: number; sy: number; zWorld: number; elev: number; isLaser: boolean }[] = [];
        const zNorm = -1.0 + (r / (ROWS - 1)) * 2.0;
        const zWorld = zNorm * 380 + ((time * 42) % 30);

        for (let c = 0; c < COLS; c++) {
          const xNorm = -1.1 + (c / (COLS - 1)) * 2.2;
          const xWorld = xNorm * 460;
          const craterCenterZ = Math.sin(time * 0.15) * 0.2;
          const elev = getCraterElevation(xNorm * 0.75, zNorm * 0.85 - craterCenterZ);

          const depth = zWorld - camZ;
          const scale = depth > 10 ? fov / depth : 0;
          const sx = centerX + xWorld * scale;
          const sy = horizonY + (camY - elev) * scale;
          const isLaser = Math.abs(zNorm - laserZNorm) < 0.055;
          rowArr.push({ sx, sy, zWorld, elev, isLaser });
        }
        points.push(rowArr);
      }

      for (let r = 0; r < ROWS; r++) {
        const row = points[r];
        if (row.length < 2) continue;

        ctx.beginPath();
        ctx.moveTo(row[0].sx, row[0].sy);
        for (let c = 1; c < COLS; c++) {
          ctx.lineTo(row[c].sx, row[c].sy);
        }

        const depthFactor = r / ROWS;
        const isLaserRow = row.some((p) => p.isLaser);

        if (isLaserRow) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2.0;
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + depthFactor * 0.28})`;
          ctx.lineWidth = 0.8 + depthFactor * 0.5;
          ctx.stroke();
        }
      }

      for (let c = 0; c < COLS; c += 2) {
        ctx.beginPath();
        ctx.moveTo(points[0][c].sx, points[0][c].sy);
        for (let r = 1; r < ROWS; r++) {
          ctx.lineTo(points[r][c].sx, points[r][c].sy);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      const laserRowIdx = Math.floor(((laserZNorm + 1.0) / 2.0) * (ROWS - 1));
      if (laserRowIdx >= 0 && laserRowIdx < ROWS) {
        const targetPt = points[laserRowIdx][Math.floor(COLS / 2)];
        if (targetPt) {
          ctx.beginPath();
          ctx.moveTo(centerX, -10);
          ctx.lineTo(targetPt.sx, targetPt.sy);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(targetPt.sx, targetPt.sy, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      if (!isVisible) {
        rafRef.current = 0;
        return;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Performance Optimization: Pause crater flyover canvas when off-screen
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible && !rafRef.current) {
          rafRef.current = requestAnimationFrame(draw);
        } else if (!isVisible && rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      },
      { rootMargin: '150px' }
    );
    observer.observe(canvas);

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ─── Mathematical S-Curve Spline Evaluator ──────────────────────────────────
// Continuous C^1 Bezier curve across the 100vh viewport:
// Enters upper-left (-3% W, 16% H) -> behind title & initial video (38% W, 74% H) -> exits right (105% W, 82% H)
function getSplinePointWithTangent(u: number, W: number, H: number) {
  const clampU = Math.min(Math.max(u, 0), 1);
  const P0 = { x: -0.03 * W, y: 0.16 * H };
  const C1 = { x: 0.24 * W, y: 0.22 * H };
  const C2 = { x: 0.13 * W, y: 0.74 * H };
  const P1 = { x: 0.38 * W, y: 0.74 * H };
  const C3 = { x: 0.64 * W, y: 0.72 * H };
  const C4 = { x: 0.78 * W, y: 0.35 * H };
  const P2 = { x: 1.05 * W, y: 0.82 * H };

  let t = 0;
  let pA = P0, cA = C1, cB = C2, pB = P1;
  if (clampU <= 0.5) {
    t = clampU / 0.5;
    pA = P0; cA = C1; cB = C2; pB = P1;
  } else {
    t = (clampU - 0.5) / 0.5;
    pA = P1; cA = C3; cB = C4; pB = P2;
  }

  const mt = 1 - t;
  const x = mt * mt * mt * pA.x + 3 * mt * mt * t * cA.x + 3 * mt * t * t * cB.x + t * t * t * pB.x;
  const y = mt * mt * mt * pA.y + 3 * mt * mt * t * cA.y + 3 * mt * t * t * cB.y + t * t * t * pB.y;
  const dx = 3 * mt * mt * (cA.x - pA.x) + 6 * mt * t * (cB.x - cA.x) + 3 * t * t * (pB.x - cB.x);
  const dy = 3 * mt * mt * (cA.y - pA.y) + 6 * mt * t * (cB.y - cA.y) + 3 * t * t * (pB.y - cB.y);

  return { x, y, dx, dy };
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

// ─── Main Editorial Slide 2 Component ────────────────────────────────────────
export default function EditorialSlide2() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const zoomHudRef = useRef<HTMLSpanElement>(null);

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Smooth scroll LERP refs (60 FPS Inertia Engine)
  const targetScrollRef = useRef(0);
  const smoothScrollRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const sparksRef = useRef<Spark[]>([]);

  // Public domain NASA WebM flyover videos (starting at second 16 to skip ESA/Berlin title card)
  const VIDEO_SOURCES = [
    'https://upload.wikimedia.org/wikipedia/commons/3/33/Flying_over_Becquerel_crater_%281080p%29.webm#t=16',
    'https://upload.wikimedia.org/wikipedia/commons/8/82/Earth_Views_from_the_International_Space_Station.webm',
  ];

  // 60 FPS Master Animation & Inertia LERP Loop
  useEffect(() => {
    let animId = 0;
    targetScrollRef.current = window.scrollY;
    smoothScrollRef.current = window.scrollY;

    const onScroll = () => {
      targetScrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Handle canvas resolution on resize
    const handleResize = () => {
      const canvas = starCanvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w > 0 && h > 0) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let isVisible = true;

    const loop = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }
      const target = targetScrollRef.current;
      const smooth = smoothScrollRef.current;
      const diff = target - smooth;
      smoothScrollRef.current += diff * 0.085;
      scrollVelocityRef.current = diff;

      const section = sectionRef.current;
      if (section) {
        const rect = section.getBoundingClientRect();
        const sectionTopDoc = window.scrollY + rect.top;
        const totalScrollable = section.offsetHeight - window.innerHeight;
        const rawP = (smoothScrollRef.current - sectionTopDoc) / (totalScrollable || 1);
        const p = Math.min(Math.max(rawP, 0), 1);
        const velocity = scrollVelocityRef.current;

        // Trigger masked title reveal once Slide 2 comes into view
        if (rect.top <= window.innerHeight * 0.85) {
          setRevealed(true);
        }

        // 1. VIDEO MORPHING & VELOCITY TILT (Intact 28px rounded corners, NO polygon clip-path)
        const t = Math.min(Math.max((p - 0.25) / 0.53, 0), 1);
        const easeInOutCubic = (x: number) =>
          x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
        const easedT = easeInOutCubic(t);
        const bell = Math.sin(t * Math.PI);
        const vFactor = Math.min(Math.max(velocity / 120, -1), 1);

        const currentWidth = 42 + (92 - 42) * easedT;
        const currentHeight = 44 + (82 - 44) * easedT;
        const currentLeft = 5 + (4 - 5) * easedT;
        const currentTop = 46 + (9 - 46) * easedT;

        const rotY = bell * -16 + vFactor * -6;
        const rotX = bell * 7 + vFactor * 4;
        const rotZ = bell * -2.5 + vFactor * -1.5;
        const skewY = bell * -4 + vFactor * -2.5;

        if (videoWrapperRef.current) {
          const vwStyle = videoWrapperRef.current.style;
          vwStyle.width = `${currentWidth}vw`;
          vwStyle.height = `${currentHeight}vh`;
          vwStyle.left = `${currentLeft}vw`;
          vwStyle.top = `${currentTop}vh`;
          vwStyle.transform = `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg) skewY(${skewY}deg)`;
          vwStyle.boxShadow = `0 ${16 + easedT * 40}px ${40 + easedT * 70}px rgba(0, 0, 0, ${0.45 + easedT * 0.4})`;
        }

        // Inner Video Parallax (Optical Contra-Zoom: 1.24x to 1.0x)
        if (videoElementRef.current) {
          videoElementRef.current.style.transform = `scale(${1.24 - t * 0.24})`;
        }

        // Telemetry HUD Zoom percentage
        if (zoomHudRef.current) {
          zoomHudRef.current.textContent = `Zoom orbital: ${(easedT * 100).toFixed(0)}%`;
        }

        // 2. HEADER SLIDE UP (p = 0.35 to 0.82)
        const headerT = Math.min(Math.max((p - 0.35) / (0.82 - 0.35), 0), 1);
        if (headerRef.current) {
          headerRef.current.style.transform = `translateY(${-headerT * 120}%)`;
          headerRef.current.style.opacity = `${1 - headerT}`;
          headerRef.current.style.pointerEvents = headerT >= 1 ? 'none' : 'auto';
        }

        // 3. SHOOTING STAR CANVAS 2D TAPERED CONIC SEGMENTS (p = 0.0 to 0.65)
        const canvas = starCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const width = canvas.offsetWidth;
          const height = canvas.offsetHeight;
          if (ctx && width > 0 && height > 0) {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            const drawProgress = Math.min(Math.max(p / 0.65, 0), 1);
            if (drawProgress > 0.005) {
              const TAIL_LEN = 0.48;
              const tailStart = Math.max(0, drawProgress - TAIL_LEN);
              const NUM_SEGS = 90;
              const segPoints: { x: number; y: number; radius: number; alpha: number }[] = [];

              for (let i = 0; i <= NUM_SEGS; i++) {
                const segRatio = i / NUM_SEGS;
                const u = tailStart + segRatio * (drawProgress - tailStart);
                const pt = getSplinePointWithTangent(u, width, height);
                const tSeg = Math.pow(segRatio, 1.7);
                const radius = 0.5 + tSeg * 14;
                const alpha = tSeg;
                segPoints.push({ x: pt.x, y: pt.y, radius, alpha });
              }

              // Pass 1: Yellow Edge & Fine Golden Glow (#FFE066, lineWidth = radius * 1.32, shadowBlur = 16)
              ctx.lineCap = 'round';
              ctx.shadowColor = '#FFD43B';
              ctx.shadowBlur = 16;
              for (let i = 0; i < NUM_SEGS; i++) {
                const pA = segPoints[i];
                const pB = segPoints[i + 1];
                if (pB.alpha < 0.02) continue;
                ctx.beginPath();
                ctx.moveTo(pA.x, pA.y);
                ctx.lineTo(pB.x, pB.y);
                ctx.strokeStyle = `rgba(255, 224, 102, ${pB.alpha * 0.95})`;
                ctx.lineWidth = pB.radius * 1.32;
                ctx.stroke();
              }

              // Pass 2: Pure White Core Body (#FFFFFF, lineWidth = radius, shadowBlur = 0)
              ctx.shadowBlur = 0;
              for (let i = 0; i < NUM_SEGS; i++) {
                const pA = segPoints[i];
                const pB = segPoints[i + 1];
                if (pB.alpha < 0.02) continue;
                ctx.beginPath();
                ctx.moveTo(pA.x, pA.y);
                ctx.lineTo(pB.x, pB.y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${pB.alpha})`;
                ctx.lineWidth = pB.radius;
                ctx.stroke();
              }

              // Radiant Star Head with 4-pointed optical flare
              const head = getSplinePointWithTangent(drawProgress, width, height);
              const headAngle = Math.atan2(head.dy, head.dx);

              ctx.save();
              ctx.translate(head.x, head.y);

              // Soft yellow aura
              ctx.beginPath();
              ctx.arc(0, 0, 18, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255, 224, 102, 0.45)';
              ctx.shadowColor = '#FFD43B';
              ctx.shadowBlur = 20;
              ctx.fill();

              // Warm yellow border
              ctx.beginPath();
              ctx.arc(0, 0, 11, 0, Math.PI * 2);
              ctx.fillStyle = '#FFF3B0';
              ctx.shadowBlur = 10;
              ctx.fill();

              // Pure white core nucleus
              ctx.beginPath();
              ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
              ctx.fillStyle = '#FFFFFF';
              ctx.shadowBlur = 0;
              ctx.fill();

              // 4-pointed optical star flare rotating with tangent angle
              ctx.rotate(headAngle);
              ctx.lineWidth = 1.6;
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
              ctx.beginPath();
              ctx.moveTo(-28, 0); ctx.lineTo(28, 0);
              ctx.moveTo(0, -28); ctx.lineTo(0, 28);
              ctx.stroke();

              // Fine golden cross
              ctx.lineWidth = 2.6;
              ctx.strokeStyle = 'rgba(255, 224, 102, 0.8)';
              ctx.beginPath();
              ctx.moveTo(-16, 0); ctx.lineTo(16, 0);
              ctx.moveTo(0, -16); ctx.lineTo(0, 16);
              ctx.stroke();

              ctx.restore();

              // Emit micro-particles when scrolling with velocity (keep away from rightmost edge)
              if (Math.abs(velocity) > 0.5 && drawProgress < 0.95 && head.x < width - 25) {
                const count = 1 + Math.floor(Math.random() * 2);
                for (let k = 0; k < count; k++) {
                  const sparkAngle = headAngle + Math.PI + (Math.random() - 0.5) * 1.4;
                  const speed = 0.6 + Math.random() * 2.2;
                  sparksRef.current.push({
                    x: head.x + (Math.random() - 0.5) * 4,
                    y: head.y + (Math.random() - 0.5) * 4,
                    vx: Math.cos(sparkAngle) * speed,
                    vy: Math.sin(sparkAngle) * speed,
                    life: 40,
                    maxLife: 40,
                  });
                }
              }

              // Update & draw shedding micro-sparks (cull if outside width)
              for (let j = sparksRef.current.length - 1; j >= 0; j--) {
                const s = sparksRef.current[j];
                s.x += s.vx;
                s.y += s.vy;
                s.vx *= 0.96;
                s.vy *= 0.96;
                s.life -= 1;
                if (s.life <= 0 || s.x >= width || s.x <= 0) {
                  sparksRef.current.splice(j, 1);
                  continue;
                }
                const sparkAlpha = s.life / s.maxLife;
                ctx.beginPath();
                ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 246, 204, ${sparkAlpha * 0.9})`;
                ctx.shadowColor = '#FFD43B';
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;
              }
            }
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible && !animId) {
          targetScrollRef.current = window.scrollY;
          smoothScrollRef.current = window.scrollY;
          animId = requestAnimationFrame(loop);
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { rootMargin: '200px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section
      id="editorial-slide-2"
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '280vh',
        background: '#050508',
      }}
    >
      {/* ── LAYER 1: ARCHITECTURAL CROSS GRID (+ at 48px intervals) (z-index: 1) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 21v6M21 24h6' stroke='rgba(255,255,255,0.06)' stroke-width='1' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── STICKY CAMERA VIEWPORT (100vh) ──────────────────────────────── */}
      <div
        id="editorial-slide-2-inner"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          willChange: 'transform, filter',
          transformOrigin: 'center center',
        }}
      >
        {/* ── LAYER 2: GRAND SHOOTING STAR CANVAS 2D (z-index: 2) ────────── */}
        <canvas
          ref={starCanvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            pointerEvents: 'none',
            display: 'block',
          }}
        />

        {/* ── LAYER 3: 2-COLUMN EDITORIAL HEADER (z-index: 3) ─────────────── */}
        <div
          ref={headerRef}
          style={{
            position: 'absolute',
            top: '7vh',
            left: '5vw',
            right: '5vw',
            maxWidth: 1320,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.05fr 0.95fr',
            gap: 56,
            zIndex: 3,
            willChange: 'transform, opacity',
          }}
        >
          {/* Left Column: Big Impactful Title with Masked Line Reveal */}
          <div>
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 'clamp(28px, 3.8vw, 54px)',
                lineHeight: 1.05,
                color: '#FFFFFF',
                margin: 0,
                letterSpacing: '-0.03em',
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
                  Donde la Tierra se Convierte
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
                  en la Luna y Marte
                </span>
              </div>
            </h2>
          </div>

          {/* Right Column: Clean Editorial Overview with Masked Line Reveal */}
          <div style={{ marginTop: 14 }}>
            <div style={{ overflow: 'hidden' }}>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: 'clamp(14px, 1.25vw, 17px)',
                  lineHeight: 1.65,
                  color: '#A1A1AA',
                  maxWidth: '65ch',
                  margin: 0,
                  transform: revealed ? 'translateY(0%)' : 'translateY(105%)',
                  transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.16s',
                  willChange: 'transform',
                }}
              >
                En las siguientes secciones seleccionarás misiones reales de la NASA hacia el Polo Sur Lunar,
                Mare Tranquillitatis, el Cráter Jezero y Arcadia Planitia; compararás cara a cara fotografías de nuestros
                desiertos, cráteres y tubos de lava con capturas de rovers planetarios; explorarás telemetría orbital
                en vivo y pondrás a prueba la física gravitatoria de otros mundos.
              </p>
            </div>
          </div>
        </div>

        {/* ── LAYER 5: ELASTIC 3D MORPHING VIDEO CONTAINER (z-index: 5) ───── */}
        <div
          ref={videoWrapperRef}
          style={{
            position: 'absolute',
            left: '5vw',
            top: '46vh',
            width: '42vw',
            height: '44vh',
            borderRadius: '28px',
            overflow: 'hidden',
            transformStyle: 'preserve-3d',
            background: '#04050A',
            zIndex: 5,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            willChange: 'transform, width, height, left, top',
          }}
        >
          {/* Primary HTML5 Video: NASA Mars Becquerel Flyover (Seamless 16s-44.5s loop skipping ESA title card) */}
          {!videoError && (
            <video
              ref={videoElementRef}
              autoPlay
              muted
              playsInline
              onLoadedMetadata={() => {
                if (videoElementRef.current) {
                  videoElementRef.current.currentTime = 16;
                }
              }}
              onSeeked={() => {
                if (videoElementRef.current && videoElementRef.current.currentTime >= 16) {
                  setVideoLoaded(true);
                }
              }}
              onPlay={() => {
                if (videoElementRef.current && videoElementRef.current.currentTime < 16) {
                  videoElementRef.current.currentTime = 16;
                }
              }}
              onTimeUpdate={() => {
                if (videoElementRef.current) {
                  if (videoElementRef.current.currentTime >= 44.5) {
                    videoElementRef.current.currentTime = 16;
                  } else if (videoElementRef.current.currentTime < 16) {
                    videoElementRef.current.currentTime = 16;
                  }
                  if (videoElementRef.current.currentTime >= 16 && !videoLoaded) {
                    setVideoLoaded(true);
                  }
                }
              }}
              onEnded={() => {
                if (videoElementRef.current) {
                  videoElementRef.current.currentTime = 16;
                  videoElementRef.current.play().catch(() => {});
                }
              }}
              onCanPlay={() => {
                if (videoElementRef.current && videoElementRef.current.currentTime < 16) {
                  videoElementRef.current.currentTime = 16;
                }
              }}
              onError={() => {
                setVideoError(true);
                setVideoLoaded(false);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                opacity: videoLoaded ? 1 : 0,
                transition: 'opacity 0.7s ease',
                transformOrigin: 'center center',
                willChange: 'transform',
              }}
            >
              {VIDEO_SOURCES.map((src, i) => (
                <source key={i} src={src} type="video/webm" />
              ))}
            </video>
          )}

          {/* Fallback 3D Canvas Flyover with LOLA Laser Scanner */}
          {(!videoLoaded || videoError) && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
              }}
            >
              <PlanetaryCanvas3D />
            </div>
          )}

          {/* Cinematic Vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(4, 5, 10, 0.75) 0%, transparent 45%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* Telemetry HUD Status Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 18,
              left: 24,
              right: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              zIndex: 3,
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  display: 'inline-block',
                  opacity: 0.8,
                }}
              />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  color: 'rgba(255, 255, 255, 0.8)',
                  letterSpacing: '0.02em',
                }}
              >
                {videoLoaded && !videoError
                  ? 'NASA HiRISE — Modelo digital de elevación orbital'
                  : 'LOLA LiDAR — Altímetro láser de precisión 1064 nm'}
              </span>
            </div>

            <span
              ref={zoomHudRef}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.55)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              Zoom orbital: 0%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
