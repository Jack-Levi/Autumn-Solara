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

  // Compute text scale: from 1.0 to 12.0
  const textScale = 1 + progress * 11;
  const textOpacity = progress < 0.82 ? 1 : Math.max(0, 1 - (progress - 0.82) * 5.5);

  // Concentric geometric frame scales (4 frames)
  const frames = [1, 2, 3, 4, 5];

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{
        height: '125vh',
        background: '#050508',
      }}
    >
      {/* Sticky Fullscreen Viewport */}
      <div
        id="space-tunnel-inner"
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden"
        style={{
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
            const opacity = Math.sin(Math.min(Math.PI, frameProgress * Math.PI)) * 0.45;

            return (
              <div
                key={f}
                className="absolute border border-[#2544FF] rounded-3xl"
                style={{
                  width: '320px',
                  height: '240px',
                  transform: `translateZ(${frameProgress * 400}px) scale(${scale})`,
                  opacity,
                  boxShadow: '0 0 40px rgba(37,68,255,0.25)',
                  filter: `blur(${Math.max(0, (scale - 1) * 2)}px)`,
                }}
              />
            );
          })}
        </div>

        {/* Warp Light Streaks */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at center, rgba(37,68,255,0.2) 0%, transparent 70%)',
            transform: `scale(${1 + progress * 2})`,
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
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#2544FF] font-bold mb-2">
            TRANSICIÓN ORBITAL // VELOCIDAD LUMINOSA
          </span>
          <h2
            className="text-white font-extrabold uppercase tracking-tight"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(28px, 5.5vw, 72px)',
              letterSpacing: '-0.02em',
              textShadow: '0 0 60px rgba(37,68,255,0.6)',
              maxWidth: '850px',
              lineHeight: 1.05,
            }}
          >
            STEP INTO ANALOG WORLDS
          </h2>
          <span className="font-mono text-[10px] text-[#8E929F] mt-3 tracking-widest">
            CALIBRANDO DATOS SATELITALES LRO · MRO · SRTM
          </span>
        </div>

        {/* Bottom indicator */}
        <div
          className="absolute bottom-8 font-mono text-[10px] text-[#6B6F7B] tracking-widest uppercase transition-opacity"
          style={{ opacity: progress > 0.8 ? 0 : 0.8 }}
        >
          AVANCE DEL TÚNEL: {Math.round(progress * 100)}%
        </div>
      </div>
    </div>
  );
}
