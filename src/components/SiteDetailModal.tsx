import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { EarthSite, ExtraTerrestrialTarget, VectorScores } from '../data';
import { fidelityColor, fidelityLabel } from '../data';
import PhotoComparator from './PhotoComparator';

interface SiteDetailModalProps {
  site: EarthSite | null;
  target: ExtraTerrestrialTarget;
  pfi: number;
  breakdown: VectorScores;
  onClose: () => void;
}

export default function SiteDetailModal({
  site,
  target,
  pfi,
  breakdown,
  onClose,
}: SiteDetailModalProps) {
  // Horizontal Carousel Drag & Motion Blur State
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [carouselVelocity, setCarouselVelocity] = useState(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const velocityAnimRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Inertial smooth decay for carousel velocity blur
  useEffect(() => {
    const decayLoop = () => {
      setCarouselVelocity((v) => {
        if (Math.abs(v) < 0.05) return 0;
        return v * 0.88; // rapid smooth return to 0
      });
      velocityAnimRef.current = requestAnimationFrame(decayLoop);
    };
    velocityAnimRef.current = requestAnimationFrame(decayLoop);
    return () => cancelAnimationFrame(velocityAnimRef.current);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    lastXRef.current = e.pageX;
    lastTimeRef.current = performance.now();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;

    const now = performance.now();
    const dt = now - lastTimeRef.current || 16;
    const dx = e.pageX - lastXRef.current;
    const v = dx / dt;
    setCarouselVelocity(v * 40);
    lastXRef.current = e.pageX;
    lastTimeRef.current = now;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!site) return null;

  const scoreColor = fidelityColor(pfi);
  const scoreLabel = fidelityLabel(pfi);
  const isMoon = target.body === 'Luna';
  const targetColor = isMoon ? '#94A3B8' : '#FF4D24';

  // 6-Axis Radar Points
  const radarAxes = [
    { key: 'morphology', label: 'MORFOLOGÍA' },
    { key: 'mineralogy', label: 'MINERALOGÍA' },
    { key: 'temperature', label: 'TEMPERATURA' },
    { key: 'aridity', label: 'HIPERARIDEZ' },
    { key: 'radiation', label: 'RADIACIÓN' },
    { key: 'isru', label: 'ISRU' },
  ] as const;

  const center = 130;
  const radius = 90;
  const angleStep = (Math.PI * 2) / 6;

  const getPoints = (axesObj: any) => {
    return radarAxes
      .map((axis, i) => {
        const val = Math.max(0, Math.min(100, axesObj[axis.key] || 50));
        const r = (val / 100) * radius;
        const angle = i * angleStep - Math.PI / 2;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const earthPoints = getPoints(site.radar);
  const targetPoints = getPoints(target.radar);

  // Topo path
  const maxDist = Math.max(...site.topo.map((p) => p.distKm), ...target.topo.map((p) => p.distKm)) || 1;
  const minElev = Math.min(...site.topo.map((p) => p.elevM), ...target.topo.map((p) => p.elevM));
  const maxElev = Math.max(...site.topo.map((p) => p.elevM), ...target.topo.map((p) => p.elevM));
  const rangeElev = maxElev - minElev || 1;

  const getTopoPath = (pts: { distKm: number; elevM: number }[]) => {
    const coords = pts.map((p) => {
      const x = 50 + (p.distKm / maxDist) * 580;
      const y = 140 - ((p.elevM - minElev) / rangeElev) * 100;
      return `${x},${y}`;
    });
    return 'M ' + coords.join(' L ');
  };

  const earthTopoPath = getTopoPath(site.topo);
  const targetTopoPath = getTopoPath(target.topo);

  // Carousel motion blur & stretch calculation
  const carouselBlur = Math.min(Math.abs(carouselVelocity) * 0.18, 7);
  const carouselStretch = 1 + Math.min(Math.abs(carouselVelocity) * 0.005, 0.08);

  return (
    <div className="fixed inset-0 z-[150] bg-[#050508] text-[#E8E8EC] overflow-y-auto select-none">
      {/* 1. Top Fixed Navigation Bar */}
      <div className="sticky top-0 z-50 bg-[#0F1015]/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)] px-6 md:px-12 py-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="pill-btn pill-btn-dark hover:border-[#2544FF] text-white flex items-center gap-2 text-xs font-mono py-2.5 px-5 shadow-lg"
        >
          <span className="text-[#2544FF] font-bold text-sm">←</span>
          <span>VOLVER AL LABORATORIO (BACK)</span>
        </button>

        <div className="flex items-center gap-4">
          <div
            className="flex items-baseline gap-2 px-4 py-1.5 rounded-full border font-mono"
            style={{
              borderColor: `${scoreColor}50`,
              backgroundColor: `${scoreColor}15`,
              color: scoreColor,
            }}
          >
            <span className="text-xl font-bold">{Math.round(pfi)}% PFI</span>
            <span className="text-[10px] font-semibold uppercase">{scoreLabel}</span>
          </div>

          <span className="font-mono text-xs text-[#6B6F7B] hidden sm:inline">
            OBJETIVO: <strong className="text-white">{target.name}</strong>
          </span>
        </div>
      </div>

      {/* 2. Hero Editorial Case Study Header */}
      <div className="max-w-[1300px] mx-auto px-6 md:px-12 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs px-3 py-1 rounded-full font-bold bg-[#2544FF] text-white">
            {site.id}
          </span>
          <span className="font-mono text-xs text-[#6B6F7B] uppercase tracking-wider">
            CASO DE ESTUDIO GEOCIENTÍFICO // NASA EARTH SCIENCE
          </span>
        </div>

        <h1
          className="text-4xl md:text-6xl font-extrabold text-white tracking-tight uppercase leading-[1.05] mb-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {site.name}
        </h1>

        <p className="font-mono text-sm text-[#8E929F] max-w-3xl leading-relaxed mb-10">
          {site.country} · {site.region} · Coordenadas: <span className="text-white">{site.dms}</span> · Elevación: <span className="text-white">{site.elevM.toLocaleString()} m</span>
        </p>

        {/* 3. Photo Comparator with Real Imagery */}
        <div className="rounded-3xl overflow-hidden border border-[rgba(255,255,255,0.12)] shadow-2xl mb-14">
          <div className="bg-[#0F1015] px-6 py-3 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between font-mono text-xs text-[#8E929F]">
            <span>COMPARADOR DE CORTINA FOTOGRÁFICA // FOTOS REALES DE ALTA RESOLUCIÓN</span>
            <span className="text-[#2544FF] font-semibold">ARRASTRA EL DIVISOR CENTRAL ◀▶</span>
          </div>
          <PhotoComparator
            earthPhoto={site.photoEarth}
            spacePhoto={site.photoSpace}
            earthCaption={site.photoEarthCaption}
            spaceCaption={site.photoSpaceCaption}
            targetBody={target.body}
          />
        </div>

        {/* 4. Horizontal Geological Inspection Carousel (Lusion Style Drag & Velocity Blur) */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B6F7B] block">
                GALERÍA HORIZONTAL DE INSPECCIÓN GEOLÓGICA
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Muestreo Espectral y Textura de Superficie
              </h3>
            </div>
            <span className="font-mono text-xs text-[#6B6F7B] hidden sm:inline">
              ARRASTRA HORIZONTALMENTE (VELOCITY BLUR) ↔
            </span>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-none cursor-grab active:cursor-grabbing select-none"
            style={{
              filter: `blur(${carouselBlur}px)`,
              transform: `scaleX(${carouselStretch})`,
              transition: isDragging ? 'none' : 'filter 0.25s ease-out, transform 0.25s ease-out',
              willChange: 'filter, transform',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {site.inspectionGallery.map((photo, idx) => (
              <div
                key={idx}
                className="carousel-card shrink-0 w-[340px] md:w-[420px] rounded-2xl overflow-hidden bg-[#0F1015] border border-[rgba(255,255,255,0.08)] shadow-lg"
              >
                <div className="relative h-64 overflow-hidden bg-[#181B20]">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 pointer-events-none"
                    crossOrigin="anonymous"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full font-mono text-[10px] text-white font-semibold">
                    {photo.category}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-base text-white mb-1">{photo.title}</h4>
                  <p className="font-mono text-xs text-[#8E929F]">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Scientific 6-Axis Radar & Topographic Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
          {/* Radar Chart */}
          <div className="bg-[#0F1015] p-8 rounded-3xl border border-[rgba(255,255,255,0.08)] flex flex-col items-center">
            <span className="font-mono text-xs uppercase tracking-widest text-[#6B6F7B] mb-4">
              RADAR MULTIVARIABLE (6 EJES) // NORMALIZADO
            </span>
            <svg width="260" height="260" viewBox="0 0 260 260" className="select-none">
              {[20, 40, 60, 80, 100].map((lvl) => {
                const r = (lvl / 100) * radius;
                const pts = Array.from({ length: 6 }, (_, i) => {
                  const a = i * angleStep - Math.PI / 2;
                  return `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`;
                }).join(' ');
                return <polygon key={lvl} points={pts} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
              })}

              {radarAxes.map((_, i) => {
                const a = i * angleStep - Math.PI / 2;
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={center + radius * Math.cos(a)}
                    y2={center + radius * Math.sin(a)}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                );
              })}

              <polygon points={targetPoints} fill="none" stroke={targetColor} strokeWidth="1.8" strokeDasharray="4,3" />
              <polygon points={earthPoints} fill="rgba(37,68,255,0.22)" stroke="#2544FF" strokeWidth="2.2" />

              {radarAxes.map((axis, i) => {
                const a = i * angleStep - Math.PI / 2;
                const x = center + (radius + 20) * Math.cos(a);
                const y = center + (radius + 20) * Math.sin(a);
                return (
                  <text key={axis.key} x={x} y={y + 3} fill="#8E929F" fontSize="8.5" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="600">
                    {axis.label}
                  </text>
                );
              })}
            </svg>

            <div className="flex items-center gap-6 text-xs font-mono mt-4">
              <span className="flex items-center gap-2 text-white">
                <span className="w-3 h-3 rounded-xs bg-[#2544FF]" />
                {site.id} (Tierra)
              </span>
              <span className="flex items-center gap-2" style={{ color: targetColor }}>
                <span className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: targetColor }} />
                {target.id} ({target.body})
              </span>
            </div>
          </div>

          {/* Topographic Cross-Section SVG */}
          <div className="bg-[#0F1015] p-8 rounded-3xl border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#6B6F7B] block mb-2">
                TRANSECTO TOPOGRÁFICO CRUZADO // SRTM 30m vs {target.body.toUpperCase()}
              </span>
              <div className="flex items-center gap-4 font-mono text-xs mb-4">
                <span className="text-[#2544FF] font-bold">— {site.id} (Δz: {Math.round(maxElev - minElev)}m)</span>
                <span style={{ color: targetColor }}>-- {target.id}</span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 680 160" className="w-full h-44">
                <line x1="50" y1="40" x2="630" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="50" y1="90" x2="630" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="50" y1="140" x2="630" y2="140" stroke="rgba(255,255,255,0.12)" />

                <path d={targetTopoPath} fill="none" stroke={targetColor} strokeWidth="1.8" strokeDasharray="4,3" />
                <path d={earthTopoPath} fill="none" stroke="#2544FF" strokeWidth="2.4" />

                <text x="42" y="44" fill="#6B6F7B" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
                  {Math.round(maxElev)}m
                </text>
                <text x="42" y="142" fill="#6B6F7B" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
                  {Math.round(minElev)}m
                </text>
                <text x="630" y="154" fill="#6B6F7B" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
                  {maxDist} km
                </text>
              </svg>
            </div>

            <p className="font-mono text-[10px] text-[#6B6F7B] mt-2">
              Perfil digital normalizado de elevación SRTM 1-arcsec cruzado con LOLA/MOLA.
            </p>
          </div>
        </div>

        {/* 6. Hardware Testing Protocols & Scientific Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#0F1015] p-8 rounded-3xl border border-[rgba(255,255,255,0.08)]">
            <span className="font-mono text-xs uppercase tracking-widest text-[#6B6F7B] block mb-4">
              PROTOCOLOS DE PRUEBA DE HARDWARE RECOMENDADOS (TRL 5-8)
            </span>
            <div className="space-y-3">
              {site.protocols.map((proto) => (
                <div key={proto.code} className="bg-[#050508] p-4 rounded-2xl border border-[rgba(255,255,255,0.06)]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-sm font-bold text-white">{proto.title}</span>
                    <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#2544FF]/20 text-[#2544FF] font-bold">
                      {proto.trl}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#8E929F] leading-relaxed">{proto.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0F1015] p-8 rounded-3xl border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#6B6F7B] block mb-3">
                SÍNTESIS CIENTÍFICA Y ASTROBIOLOGÍA
              </span>
              <p className="text-base text-[#E8E8EC] leading-relaxed font-light mb-4">
                {site.summary}
              </p>
              {site.grayZone && (
                <div className="p-4 rounded-2xl bg-[#FF4D24]/10 border border-[#FF4D24]/30 text-xs font-mono text-[#E8E8EC] leading-relaxed">
                  <strong className="text-[#FF4D24] block mb-1"> JUSTIFICACIÓN SATELITAL ZONA GRIS:</strong>
                  {site.grayZone}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="pill-btn pill-btn-cobalt w-full justify-center py-3 text-xs mt-6"
            >
              VOLVER A LA VISTA GENERAL DE SITIOS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
