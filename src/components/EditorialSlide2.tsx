import React, { useRef, useEffect, useState } from 'react';

// ─── High-Fidelity Planetary Flyover Canvas (Procedural Fallback) ─────────────
function PlanetaryCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    type Star = { x: number; y: number; r: number; phase: number; speed: number };
    const stars: Star[] = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.65,
      r: 0.4 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
    }));

    type Crater = { cx: number; cy: number; r: number; depth: number };
    const craters: Crater[] = Array.from({ length: 22 }, () => ({
      cx: Math.random(),
      cy: 0.65 + Math.random() * 0.3,
      r: 0.015 + Math.random() * 0.05,
      depth: 0.4 + Math.random() * 0.5,
    }));

    let t = 0;

    const draw = () => {
      t += 0.01;
      const W = c.offsetWidth;
      const H = c.offsetHeight;
      if (!W || !H) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // Deep space gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
      sky.addColorStop(0, '#030408');
      sky.addColorStop(0.5, '#070A14');
      sky.addColorStop(1, '#0C1224');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Starfield
      for (const s of stars) {
        const flicker = 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
        ctx.globalAlpha = flicker * 0.85;
        ctx.fillStyle = '#E2EAFF';
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Martian / Lunar surface terrain scrolling
      const surfaceScroll = -(t * 22) % W;
      for (let pass = 0; pass < 2; pass++) {
        const ox = surfaceScroll + pass * W;
        ctx.beginPath();
        ctx.moveTo(ox, H);
        for (let x = 0; x <= W + 20; x += 6) {
          const ny =
            H * 0.68 +
            Math.sin((x + ox) * 0.0035 + t * 0.06) * H * 0.065 +
            Math.sin((x + ox) * 0.011 + t * 0.12) * H * 0.028 +
            Math.sin((x + ox) * 0.028) * H * 0.012;
          ctx.lineTo(ox + x, ny);
        }
        ctx.lineTo(ox + W + 20, H);
        ctx.closePath();

        const surf = ctx.createLinearGradient(0, H * 0.65, 0, H);
        surf.addColorStop(0, '#2D1F1A');
        surf.addColorStop(0.3, '#1F1410');
        surf.addColorStop(1, '#0D0705');
        ctx.fillStyle = surf;
        ctx.fill();
      }

      // Craters
      for (const cr of craters) {
        const cx = ((cr.cx * W - t * 22) % (W * 1.1) + W * 1.1) % (W * 1.1);
        const cy = cr.cy * H;
        const r = cr.r * W;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10, 5, 4, ${cr.depth * 0.85})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx - r * 0.15, cy - r * 0.15, r * 1.05, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180, 110, 80, ${cr.depth * 0.4})`;
        ctx.lineWidth = Math.max(1, r * 0.12);
        ctx.stroke();
      }

      // Atmospheric limb glow
      const limb = ctx.createLinearGradient(0, H * 0.6, 0, H * 0.74);
      limb.addColorStop(0, 'transparent');
      limb.addColorStop(0.5, 'rgba(196, 92, 54, 0.12)');
      limb.addColorStop(1, 'transparent');
      ctx.fillStyle = limb;
      ctx.fillRect(0, H * 0.6, W, H * 0.14);

      rafRef.current = requestAnimationFrame(draw);
    };

    const resize = () => {
      c.width = c.offsetWidth * window.devicePixelRatio;
      c.height = c.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ─── Grand Shooting Star (Lusion-Style Scroll Curve) ─────────────────────────
// A majestic cosmic trajectory curving across the full viewport.
// Solid pure white body (#FFFFFF) with finely glowing golden yellow borders (#FFE066 / #FFD700).
// Traveling starburst nucleus with golden diffraction flare.
function ShootingStar({ progress }: { progress: number }) {
  const p = Math.max(0, Math.min(1, progress));

  // Trajectory in normalized 1600x1000 viewport coordinates
  const W = 1600;
  const H = 1000;

  // Natural cosmic S-curve: starts top-left, curves between header, dips around video card, swoops right
  const sx = -60;
  const sy = 160;
  const c1x = 420;
  const c1y = 40;
  const c2x = 760;
  const c2y = 380;
  const midX = 940;
  const midY = 320;
  const c3x = 1180;
  const c3y = 240;
  const c4x = 1380;
  const c4y = 680;
  const ex = 1680;
  const ey = 600;

  const pathD = `M ${sx},${sy} C ${c1x},${c1y} ${c2x},${c2y} ${midX},${midY} C ${c3x},${c3y} ${c4x},${c4y} ${ex},${ey}`;
  const totalLength = 1920;
  const currentLength = p * totalLength;

  // Approximate position of star nucleus along the 2-segment cubic bezier
  const t = p;
  let nx = sx;
  let ny = sy;
  if (t <= 0.5) {
    const tSeg = t / 0.5;
    const mt = 1 - tSeg;
    nx =
      mt * mt * mt * sx +
      3 * mt * mt * tSeg * c1x +
      3 * mt * tSeg * tSeg * c2x +
      tSeg * tSeg * tSeg * midX;
    ny =
      mt * mt * mt * sy +
      3 * mt * mt * tSeg * c1y +
      3 * mt * tSeg * tSeg * c2y +
      tSeg * tSeg * tSeg * midY;
  } else {
    const tSeg = (t - 0.5) / 0.5;
    const mt = 1 - tSeg;
    nx =
      mt * mt * mt * midX +
      3 * mt * mt * tSeg * c3x +
      3 * mt * tSeg * tSeg * c4x +
      tSeg * tSeg * tSeg * ex;
    ny =
      mt * mt * mt * midY +
      3 * mt * mt * tSeg * c3y +
      3 * mt * tSeg * tSeg * c4y +
      tSeg * tSeg * tSeg * ey;
  }

  // Star flare rotation angle (degrees)
  const flareAngle = p * 720;

  if (p < 0.005) return null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'visible',
      }}
      aria-hidden="true"
    >
      <defs>
        {/* Fine yellow golden glow filter */}
        <filter id="goldGlowFine" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur1" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Outer soft yellow atmosphere glow */}
        <filter id="goldGlowAura" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="9" result="blur2" />
        </filter>
      </defs>

      {/* 1. Outer Soft Yellow Aura (Fine golden radiance) */}
      <path
        d={pathD}
        fill="none"
        stroke="#FFD700"
        strokeWidth="12"
        strokeOpacity="0.22"
        strokeLinecap="round"
        strokeDasharray={`${currentLength} ${totalLength}`}
        filter="url(#goldGlowAura)"
      />

      {/* 2. Fine Golden Border (#FFE066 / #FFD700) */}
      <path
        d={pathD}
        fill="none"
        stroke="#FFCC00"
        strokeWidth="3.2"
        strokeOpacity="0.8"
        strokeLinecap="round"
        strokeDasharray={`${currentLength} ${totalLength}`}
        filter="url(#goldGlowFine)"
      />

      {/* 3. Pure White Solid Body (#FFFFFF) */}
      <path
        d={pathD}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4.2"
        strokeOpacity="1"
        strokeLinecap="round"
        strokeDasharray={`${currentLength} ${totalLength}`}
      />

      {/* 4. Traveling Star Nucleus at Leading Tip */}
      <g transform={`translate(${nx}, ${ny})`}>
        {/* Soft golden halo */}
        <circle r="18" fill="#FFE066" opacity="0.3" filter="url(#goldGlowAura)" />
        <circle r="9" fill="#FFD700" opacity="0.6" filter="url(#goldGlowFine)" />

        {/* Pure white core nucleus */}
        <circle r="5" fill="#FFFFFF" />

        {/* 4-pointed golden sparkle flare (+) */}
        <g transform={`rotate(${flareAngle})`}>
          <line x1="-16" y1="0" x2="16" y2="0" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="0" y1="-16" x2="0" y2="16" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#FFD700" strokeWidth="3" opacity="0.7" strokeLinecap="round" />
          <line x1="0" y1="-10" x2="0" y2="10" stroke="#FFD700" strokeWidth="3" opacity="0.7" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

// ─── Main Editorial Slide 2 Component ────────────────────────────────────────
export default function EditorialSlide2() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Track scroll progress within this 250vh section
  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalScrollable = el.offsetHeight - window.innerHeight;
      const raw = -rect.top / (totalScrollable || 1);
      setScrollProgress(Math.max(0, Math.min(1, raw)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Morphing interpolation curves
  // Ease-out cubic for natural weight and inertia
  const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
  const morphProgress = easeOut(Math.min(1, scrollProgress * 1.55));

  // Width: starts compact (42vw) -> expands to command the screen (92vw)
  const vidWidth = 42 + (92 - 42) * morphProgress;

  // Height: starts compact (28vh) -> expands to cinematic IMAX window (72vh)
  const vidHeight = 28 + (72 - 28) * morphProgress;

  // Corner radius: 26px -> sharpens softly to 12px
  const vidRadius = 26 + (12 - 26) * morphProgress;

  // 3D perspective transform: tilts with depth, smoothly aligns flat
  const rotateX = 8 * (1 - morphProgress);
  const rotateY = -7 * (1 - morphProgress);
  const translateY = 20 * (1 - morphProgress);

  const transformStyle =
    morphProgress < 0.98
      ? `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px)`
      : 'none';

  // Shooting star progresses across the first 75% of the scroll
  const starProgress = Math.min(1, scrollProgress / 0.75);

  // Verified NASA HiRISE Mars 3D Flyover + ISS Earth Observation videos
  const VIDEO_SOURCES = [
    'https://upload.wikimedia.org/wikipedia/commons/3/33/Flying_over_Becquerel_crater_%281080p%29.webm',
    'https://upload.wikimedia.org/wikipedia/commons/8/82/Earth_Views_from_the_International_Space_Station.webm',
  ];

  return (
    <section
      id="editorial-slide-2"
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '250vh',
        background: '#F4F4F6',
        overflow: 'hidden',
      }}
    >
      {/* Precision architectural dot grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.065) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* ── STICKY VIEWPORT CONTAINER ─────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '24px 0',
        }}
      >
        {/* Shooting Star with pure white body and fine golden yellow borders */}
        <ShootingStar progress={starProgress} />

        {/* ── 2-COLUMN EDITORIAL HEADER ────────────────────────────────── */}
        <div
          style={{
            width: '100%',
            maxWidth: 1320,
            padding: '0 56px',
            display: 'grid',
            gridTemplateColumns: '1.05fr 0.95fr',
            gap: 64,
            marginBottom: 36,
            position: 'relative',
            zIndex: 5,
            transition: 'opacity 0.4s ease',
            opacity: morphProgress > 0.85 ? Math.max(0, 1 - (morphProgress - 0.85) * 5) : 1,
          }}
        >
          {/* Left Column: Section tag + Colossal Title */}
          <div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#8E929F',
                display: 'block',
                marginBottom: 16,
              }}
            >
              DIAPOSITIVA 02 // CAMPO DE PRUEBAS PLANETARIO
            </span>
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(28px, 3.8vw, 52px)',
                lineHeight: 1.05,
                color: '#0A0A0E',
                margin: 0,
                letterSpacing: '-0.025em',
              }}
            >
              Nuestro planeta como campo de pruebas para nuevos mundos
            </h2>
          </div>

          {/* Right Column: Brief overview of upcoming slides + Stats */}
          <div style={{ marginTop: 44 }}>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: 'clamp(14px, 1.35vw, 17px)',
                lineHeight: 1.75,
                color: '#686B75',
                margin: 0,
              }}
            >
              En las siguientes diapositivas explorarás{' '}
              <strong style={{ color: '#0A0A0E', fontWeight: 600 }}>8 sitios análogos terrestres</strong>{' '}
              caracterizados con datos abiertos SRTM, ASTER y MODIS. Compararás su topografía con el Polo Sur lunar y los cañones de Marte,
              calibrarás el modelo paramétrico de pesos PFI y activarás el escáner satelital interactivo.
            </p>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'flex', gap: 40, marginTop: 28 }}>
              {[
                ['8', 'Sitios Análogos'],
                ['3', 'Cuerpos Celestes'],
                ['≥97%', 'Fidelidad PFI'],
              ].map(([val, label]) => (
                <div key={label}>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontVariantNumeric: 'tabular-nums',
                      fontSize: 'clamp(20px, 2.2vw, 32px)',
                      fontWeight: 700,
                      color: '#2544FF',
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    {val}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#8E929F',
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SMOOTH FLEXIBLE MORPHING VIDEO CONTAINER ────────────────── */}
        <div
          style={{
            width: `${vidWidth}vw`,
            height: `${vidHeight}vh`,
            borderRadius: `${vidRadius}px`,
            transform: transformStyle,
            overflow: 'hidden',
            boxShadow: `0 ${12 + morphProgress * 50}px ${32 + morphProgress * 90}px rgba(0, 0, 0, ${0.08 + morphProgress * 0.22})`,
            background: '#04050A',
            position: 'relative',
            zIndex: 6,
            willChange: 'transform, width, height, border-radius',
            flexShrink: 0,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'border-radius 0.12s ease-out',
          }}
        >
          {/* Primary HTML5 Video: NASA Mars Becquerel HiRISE Flyover */}
          {!videoError && (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              onCanPlay={() => setVideoLoaded(true)}
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
              }}
            >
              {VIDEO_SOURCES.map((src, i) => (
                <source key={i} src={src} type="video/webm" />
              ))}
            </video>
          )}

          {/* Procedural Canvas Fallback (always ready, zero-delay rendering) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: videoLoaded && !videoError ? -1 : 1,
            }}
          >
            <PlanetaryCanvas />
          </div>

          {/* Cinematic Vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(4, 5, 10, 0.65) 0%, transparent 45%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* HUD Status Bar */}
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
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#2544FF',
                  display: 'inline-block',
                  boxShadow: '0 0 10px #2544FF',
                }}
              />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'rgba(255, 255, 255, 0.75)',
                }}
              >
                {videoLoaded && !videoError
                  ? 'NASA HiRISE // MARS DIGITAL ELEVATION MODEL FLYOVER'
                  : 'PLANETARY SURFACE RENDERING // TERRA-ANALOG ENGINE'}
              </span>
            </div>

            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.5)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.08em',
              }}
            >
              ZOOM: {(morphProgress * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
