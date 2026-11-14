import React, { useState, useRef, useCallback, useEffect } from 'react';

interface PhotoComparatorProps {
  earthPhoto: string;
  spacePhoto: string;
  earthCaption: string;
  spaceCaption: string;
  targetBody: 'Luna' | 'Marte';
}

// Procedural realistic terrain generator canvas data-URL fallback (never a flat linear gradient)
function generateProceduralTerrain(type: 'earth' | 'space'): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = canvas.width;
  const h = canvas.height;

  // Base illumination
  const grad = ctx.createLinearGradient(0, 0, w, h);
  if (type === 'earth') {
    grad.addColorStop(0, '#7D6138');
    grad.addColorStop(0.5, '#A0804D');
    grad.addColorStop(1, '#5C4424');
  } else {
    grad.addColorStop(0, '#2D1B11');
    grad.addColorStop(0.5, '#63301B');
    grad.addColorStop(1, '#1A0C06');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Procedural noise ridges & crater relief
  const numRidges = 40;
  ctx.lineWidth = 2;
  for (let i = 0; i < numRidges; i++) {
    ctx.beginPath();
    ctx.strokeStyle = type === 'earth' ? 'rgba(215, 185, 130, 0.15)' : 'rgba(235, 140, 90, 0.12)';
    let x = Math.random() * w;
    let y = Math.random() * h;
    ctx.arc(x, y, 10 + Math.random() * 60, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Surface texture grain
  for (let i = 0; i < 2000; i++) {
    const rx = Math.random() * w;
    const ry = Math.random() * h;
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.15)';
    ctx.fillRect(rx, ry, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }

  return canvas.toDataURL();
}

export default function PhotoComparator({
  earthPhoto,
  spacePhoto,
  earthCaption,
  spaceCaption,
  targetBody,
}: PhotoComparatorProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [earthFailed, setEarthFailed] = useState(false);
  const [spaceFailed, setSpaceFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleContainerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  // Keyboard support (left/right arrows)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 3));
      if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 3));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const earthBg = earthFailed ? `url(${generateProceduralTerrain('earth')})` : `url(${earthPhoto})`;
  const spaceBg = spaceFailed ? `url(${generateProceduralTerrain('space')})` : `url(${spacePhoto})`;
  const targetLabel = targetBody === 'Luna' ? 'LUNA' : 'MARTE';

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="comparator-container w-full select-none relative overflow-hidden"
        style={{ height: 480 }}
        onPointerDown={handleContainerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* After layer (Moon / Mars) – full background */}
        <div
          className="comparator-after absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: spaceBg }}
        />

        {/* Before layer (Earth analog) – clipped horizontally */}
        <div
          className="comparator-before absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: earthBg,
            clipPath: `inset(0 ${100 - position}% 0 0)`,
          }}
        />

        {/* Divider line */}
        <div
          className="comparator-divider absolute top-0 bottom-0 w-[3px] bg-white z-20 shadow-[0_0_16px_rgba(0,0,0,0.5)]"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          {/* Handle */}
          <div
            className="comparator-handle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white text-[#0A0A0E] flex items-center justify-center font-bold text-xs shadow-2xl z-30 cursor-grab active:cursor-grabbing border-2 border-[#2544FF]"
            onPointerDown={handlePointerDown}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0A0A0E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none"
            >
              <polyline points="8 7 3 12 8 17" />
              <polyline points="16 7 21 12 16 17" />
            </svg>
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-10 font-mono px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/15 pointer-events-none">
          TIERRA (ANÁLOGO)
        </div>

        <div className="absolute top-4 right-4 z-10 font-mono px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/15 pointer-events-none">
          {targetLabel} (OBJETIVO)
        </div>

        {/* Bottom Captions */}
        <div className="absolute bottom-4 left-4 z-10 font-mono text-xs text-white/90 bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl max-w-[42%] border border-white/10 pointer-events-none">
          {earthCaption}
        </div>

        <div className="absolute bottom-4 right-4 z-10 font-mono text-xs text-white/90 bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl text-right max-w-[42%] border border-white/10 pointer-events-none">
          {spaceCaption}
        </div>

        {/* Preload / error catch images */}
        {!earthFailed && (
          <img
            src={earthPhoto}
            alt=""
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            onError={() => setEarthFailed(true)}
            crossOrigin="anonymous"
          />
        )}
        {!spaceFailed && (
          <img
            src={spacePhoto}
            alt=""
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            onError={() => setSpaceFailed(true)}
            crossOrigin="anonymous"
          />
        )}
      </div>
    </div>
  );
}
