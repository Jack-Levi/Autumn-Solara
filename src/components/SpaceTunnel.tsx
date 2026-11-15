import React, { useRef, useEffect, useState } from 'react';

interface SpaceTunnelProps {
  onEnterEditorial?: () => void;
}

export default function SpaceTunnel({ onEnterEditorial }: SpaceTunnelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const totalDist = rect.height - windowH;

      if (totalDist <= 0) return;

      // Progress 0 (entering) to 1 (leaving)
      const current = -rect.top;
      const pct = Math.max(0, Math.min(1, current / totalDist));
      setProgress(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute text scale and opacity: smoothly fade out in last 25% of scroll
  const textScale = 1 + Math.min(progress, 0.78) * 7.5;
  const textOpacity = progress < 0.75 ? 1 : Math.max(0, 1 - (progress - 0.75) / 0.20);
  const bgFadeToLight = progress < 0.8 ? 0 : Math.min(1, (progress - 0.8) / 0.18);

  // Concentric geometric frame scales (4 frames)
  const frames = [1, 2, 3, 4, 5];

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{
        height: '125vh',
        background: '#0A0A0C',
      }}
    >
      {/* Sticky Fullscreen Viewport */}
      <div
        id="space-tunnel-inner"
        className="sticky top-0 w-full flex items-center justify-center overflow-hidden"
        style={{
          height: '100vh',
          background: '#0A0A0C',
          overflow: 'hidden',
          willChange: 'transform, filter',
          transformOrigin: 'center center',
        }}
      >
        {/* Concentric 3D Geometric Tunnel Frames */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ perspective: '1000px' }}
        >
          {frames.map((f, i) => {
            const frameProgress = (progress * 2.5 + i * 0.2) % 1.5;
            const scale = Math.pow(frameProgress + 0.2, 2.5) * 3;
            const opacity = Math.sin(Math.min(Math.PI, frameProgress * Math.PI)) * 0.35 * (1 - bgFadeToLight);

            return (
              <div
                key={f}
                className="absolute border border-white/20 rounded-3xl"
                style={{
                  width: '320px',
                  height: '240px',
                  transform: `translateZ(${frameProgress * 400}px) scale(${scale})`,
                  opacity,
                  filter: `blur(${Math.max(0, (scale - 1) * 2)}px)`,
                }}
              />
            );
          })}
        </div>

        {/* Subtle Warp Streaks */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 70%)',
            transform: `scale(${1 + progress * 2})`,
            opacity: 0.3 * (1 - bgFadeToLight),
          }}
        />

        {/* Scaling Central Text: STEP INTO ANALOG WORLDS */}
        <div
          className="relative z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          style={{
            transform: `scale(${textScale})`,
            opacity: textOpacity,
            willChange: 'transform, opacity',
          }}
        >
          <span className="font-sans text-xs tracking-wider text-[#8E9299] font-medium mb-3">
            Transición orbital hacia sitios análogos
          </span>
          <h2
            className="text-white font-extrabold uppercase tracking-tight"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(28px, 5.5vw, 72px)',
              letterSpacing: '-0.02em',
              textShadow: '0 4px 40px rgba(0,0,0,0.8)',
              maxWidth: '850px',
              lineHeight: 1.05,
            }}
          >
            STEP INTO ANALOG WORLDS
          </h2>
          <span className="font-sans text-xs text-[#8E9299] mt-3 tracking-wide">
            Datos satelitales NASA LRO · MRO · USGS SRTM
          </span>
        </div>

        {/* Smooth background transition to next section (#F5F5F3) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: '#F5F5F3',
            opacity: bgFadeToLight,
            zIndex: 15,
          }}
        />

        {/* Bottom indicator */}
        <div
          className="absolute bottom-8 font-sans text-xs text-[#8E9299] transition-opacity"
          style={{ opacity: progress > 0.75 ? 0 : 0.8 }}
        >
          Transición: {Math.round(progress * 100)}%
        </div>
      </div>
    </div>
  );
}
