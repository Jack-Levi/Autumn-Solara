import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { EarthSite, ExtraTerrestrialTarget, VectorScores, PFIWeights } from '../data';
import {
  fidelityColor,
  fidelityLabel,
  NASA_PFI_DIMENSIONS,
} from '../data';
import {
  EARTH_PLANETARY_LIMITS,
  SITE_SCIENTIFIC_DATA,
} from '../scientificData';
import PhotoComparator from './PhotoComparator';
import { GeologicalSiteImage } from './SiteGallery';
import MissionReportModal from './MissionReportModal';
import DatasetExtractionModal from './DatasetExtractionModal';
import { useWikipediaImage } from '../services/wikipediaImages';

interface SiteDetailModalProps {
  site: EarthSite | null;
  target: ExtraTerrestrialTarget;
  pfi: number;
  breakdown: VectorScores;
  allSites: EarthSite[];
  allTargets: ExtraTerrestrialTarget[];
  onSelectSite: (siteId: string) => void;
  onSelectTarget: (targetId: string) => void;
  onClose: () => void;
  weights?: PFIWeights;
}

// 4 Primary Destination Tabs for the Quick Switcher
const REFERENCE_TARGET_BUTTONS = [
  { id: 'MOON-SHK', label: 'Polo Sur Shackleton', body: 'Luna' },
  { id: 'MOON-COP', label: 'Cráter Copernicus', body: 'Luna' },
  { id: 'MARS-JEZ', label: 'Cráter Jezero', body: 'Marte' },
  { id: 'MARS-ALB', label: 'Alba Mons Tharsis', body: 'Marte' },
];

// ─── Procedural DEM Heatmap & Slope Canvas (Slide 2) ─────────────────────────
function DemHeatmapCanvas({ site }: { site: EarthSite }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 700;
    const h = 420;
    canvas.width = w;
    canvas.height = h;

    // Hypsometric tint base
    const grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, '#0C1020');
    grad.addColorStop(0.25, '#1E3A8A');
    grad.addColorStop(0.5, '#059669');
    grad.addColorStop(0.75, '#D97706');
    grad.addColorStop(1, '#DC2626');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Overlay 25m contour lines
    const cx = w * 0.5;
    const cy = h * 0.5;
    for (let r = 25; r < 360; r += 25) {
      ctx.beginPath();
      ctx.strokeStyle = r % 100 === 0 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = r % 100 === 0 ? 1.4 : 0.8;
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.06) {
        const rad = r + Math.sin(a * 5 + r * 0.05) * 14 + Math.cos(a * 3) * 8;
        const px = cx + Math.cos(a) * rad * 1.35;
        const py = cy + Math.sin(a) * rad * 0.85;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Slope vectors (arrows pointing down-gradient)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let x = 60; x < w - 40; x += 90) {
      for (let y = 60; y < h - 40; y += 80) {
        const dx = (cx - x) * 0.08;
        const dy = (cy - y) * 0.08;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // HUD Telemetry overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, h - 38, w, 38);
    ctx.font = "600 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`USGS SRTM 30m DEM · Elevación base: ${site.elevM}m`, 18, h - 16);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#E4E4E7';
    ctx.fillText(`Pendiente media: ${site.slopeDeg}° · Rugosidad RMS: ${site.roughnessRms}`, w - 18, h - 16);
    ctx.textAlign = 'left';
  }, [site]);

  return <canvas ref={canvasRef} className="w-full h-full object-cover" />;
}

// ─── Procedural Mineralogical Spectral Signature Canvas (Slide 3) ────────────
function SpectralSignatureCanvas({
  site,
  target,
}: {
  site: EarthSite;
  target: ExtraTerrestrialTarget;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 700;
    const h = 420;
    canvas.width = w;
    canvas.height = h;

    // Dark spectrometer backdrop
    ctx.fillStyle = '#080A10';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 60; x < w - 30; x += 75) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, h - 50);
      ctx.stroke();
    }
    for (let y = 60; y < h - 40; y += 45) {
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(w - 30, y);
      ctx.stroke();
    }

    // Synthetic Spectral Curves across wavelength (0.4 µm to 14.0 µm)
    // 1. Target Curve (dashed silver)
    const targetColor = '#A1A1AA';
    ctx.strokeStyle = targetColor;
    ctx.lineWidth = 2.4;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    for (let x = 60; x < w - 30; x += 4) {
      const normX = (x - 60) / (w - 90);
      const absFeature =
        Math.sin(normX * 8) * 22 +
        Math.sin(normX * 18) * 14 +
        Math.cos(normX * 3) * 35;
      const y = h * 0.45 - absFeature;
      if (x === 60) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Earth Analog Curve (solid white)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    for (let x = 60; x < w - 30; x += 4) {
      const normX = (x - 60) / (w - 90);
      const absFeature =
        Math.sin(normX * 8 + 0.3) * 20 +
        Math.sin(normX * 18 + 0.1) * 12 +
        Math.cos(normX * 3 + 0.2) * 32;
      const y = h * 0.48 - absFeature;
      if (x === 60) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Absorption Band Markers
    const bands = [
      { x: 140, label: '0.95 µm (Fe²⁺)' },
      { x: 280, label: '1.9 µm (H₂O/OH)' },
      { x: 420, label: '2.2 µm (Al-OH)' },
      { x: 560, label: '8.2 µm (TIR Silicatos)' },
    ];

    bands.forEach((b) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(b.x, 45);
      ctx.lineTo(b.x, h - 50);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "500 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = '#8E929F';
      ctx.fillText(b.label, b.x - 24, h - 35);
    });

    // Legend
    ctx.font = "600 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`— ${site.id} (TERRA/ASTER TIR)`, 60, 30);
    ctx.fillStyle = '#A1A1AA';
    ctx.fillText(`-- ${target.name} (${target.body === 'Luna' ? 'LRO Diviner' : 'MRO CRISM'})`, 280, 30);
  }, [site, target]);

  return <canvas ref={canvasRef} className="w-full h-full object-cover" />;
}

export default function SiteDetailModal({
  site,
  target,
  pfi,
  breakdown,
  allSites,
  allTargets,
  onSelectSite,
  onSelectTarget,
  onClose,
  weights,
}: SiteDetailModalProps) {
  // Written Scientific Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  // Real NASA Datasets Extraction Modal State
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);

  // Scroll Container Ref for the whole case study
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Horizontal Carousel Drag & Velocity Motion Blur
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [carouselVelocity, setCarouselVelocity] = useState(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const velocityAnimRef = useRef<number>(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Pause Lenis smooth scroll while modal is active so it never traps wheel events
  useEffect(() => {
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.stop();
    }
    return () => {
      if (lenis) {
        lenis.start();
      }
    };
  }, []);

  // Reset scroll position to top whenever active site changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [site?.id]);

  // Inertial smooth return to 0 for carousel velocity
  useEffect(() => {
    const decayLoop = () => {
      setCarouselVelocity((v) => {
        if (Math.abs(v) < 0.05) return 0;
        return v * 0.85; // smooth rapid lerp back to 0
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
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;

    const now = performance.now();
    const dt = now - lastTimeRef.current || 16;
    const dx = e.pageX - lastXRef.current;
    const v = dx / dt;
    setCarouselVelocity(v * 36);
    lastXRef.current = e.pageX;
    lastTimeRef.current = now;
  };

  // Only apply velocity if user is explicitly scrolling horizontally with touchpad
  const handleWheel = (e: React.WheelEvent) => {
    if (!carouselRef.current) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      setCarouselVelocity(e.deltaX * 0.4);
    }
    // Do NOT intercept vertical wheel deltaY: allows native vertical scrolling down the whole case study
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Helper to scroll carousel horizontally with buttons
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.7;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!site) return null;

  // Site index navigation
  const currentIndex = allSites.findIndex((s) => s.id === site.id);
  const prevSiteId = allSites[(currentIndex - 1 + allSites.length) % allSites.length]?.id;
  const nextSiteId = allSites[(currentIndex + 1) % allSites.length]?.id;

  const scoreColor = fidelityColor(pfi);
  const scoreLabel = fidelityLabel(pfi);
  const isMoon = target.body === 'Luna';
  const targetColor = '#A1A1AA';
  const targetWikiPhoto = useWikipediaImage(target.id);

  // Scientific data lookup
  const scientific = SITE_SCIENTIFIC_DATA[site.id] || {
    strongAnalogy: [site.summary],
    breaksDown: [site.grayZone || 'Diferencias atmosféricas y gravitacionales normales'],
    explorationCases: [],
  };

  // 8-Axis Radar Geometry
  const radarAxes = [
    { key: 'geology', label: '1. GEOLOGÍA' },
    { key: 'terrain', label: '2. TERRENO' },
    { key: 'temperature', label: '3. TEMPERATURA' },
    { key: 'iceWater', label: '4. AGUA/HIELO' },
    { key: 'atmosphere', label: '5. POLVO/ATM' },
    { key: 'biosphere', label: '6. BIOLOGÍA' },
    { key: 'subsurface', label: '7. CUEVAS/SUBS' },
    { key: 'robotics', label: '8. OPERACIONES' },
  ] as const;

  const center = 150;
  const radius = 105;
  const angleStep = (Math.PI * 2) / 8;

  const getPoints = (vectorObj: any) => {
    return radarAxes
      .map((axis, i) => {
        const val = Math.max(0, Math.min(100, vectorObj[axis.key] ?? 50));
        const r = (val / 100) * radius;
        const angle = i * angleStep - Math.PI / 2;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const earthPoints = getPoints(site.vector);
  const targetPoints = getPoints(target.vector);

  // Velocity motion blur values
  const velocityMagnitude = Math.abs(carouselVelocity);
  const blurPx = Math.min(velocityMagnitude * 0.18, 7);
  const stretchX = 1 + Math.min(velocityMagnitude * 0.0025, 0.06);
  const skewX = Math.min(Math.max(carouselVelocity * -0.12, -5), 5);

  return (
    <div
      className="fixed inset-0 z-[9000] bg-[#0A0A0C] text-[#F4F4F6] flex flex-col overflow-hidden select-none"
      data-lenis-prevent="true"
    >
      {/* ── 1. TOP STICKY NAVIGATION BAR (68px) ───────────────────────────── */}
      <header
        className="sticky top-0 z-50 shrink-0 h-[68px] bg-[#0C0E14]/95 backdrop-blur-xl border-b border-[rgba(255,255,255,0.1)] px-6 md:px-10 flex items-center justify-between gap-4"
        style={{ height: '68px' }}
      >
        {/* Left: Back Button */}
        <button
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-sans text-xs font-semibold transition-all flex items-center gap-2 border border-white/15 shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7.5 1.5L3 6l4.5 4.5" />
          </svg>
          <span>Volver a la galería (Esc)</span>
        </button>

        {/* Center: Previous / Next Site Quick Switcher */}
        <div className="flex items-center gap-2 font-mono text-xs text-white shrink-0">
          <button
            onClick={() => onSelectSite(prevSiteId)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#8E929F] hover:text-white transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-white font-mono font-bold px-2">
            {site.id} ({currentIndex + 1} de {allSites.length})
          </span>
          <button
            onClick={() => onSelectSite(nextSiteId)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#8E929F] hover:text-white transition-colors"
          >
            Siguiente →
          </button>
        </div>

        {/* Right: Space Destination Switcher (4 Flagship Targets) & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 bg-[#121316] p-1 rounded-full border border-white/10">
            <span className="font-sans text-[11px] text-[#8E9299] px-2.5 font-medium">
              Destino:
            </span>
            {REFERENCE_TARGET_BUTTONS.map((tBtn) => {
              const isActive = target.id === tBtn.id;
              return (
                <button
                  key={tBtn.id}
                  onClick={() => onSelectTarget(tBtn.id)}
                  className={`font-sans text-xs px-3.5 py-1 rounded-full transition-all ${
                    isActive
                      ? 'bg-white text-[#0A0A0C] font-semibold shadow-sm'
                      : 'text-[#8E9299] hover:text-white'
                  }`}
                >
                  {tBtn.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsReportOpen(true)}
            className="py-2 px-3.5 rounded-lg font-sans text-xs font-semibold bg-white hover:bg-white/90 text-[#0A0A0C] transition-all flex items-center gap-1.5 border border-white shrink-0"
          >
            <span>Generar reporte científico</span>
          </button>
        </div>
      </header>

      {/* ── CUERPO DESPLAZABLE (SCROLL CONTAINER) ────────────────────────── */}
      <div
        ref={scrollContainerRef}
        data-lenis-prevent="true"
        className="w-full bg-[#F4F4F6] text-[#0A0A0E]"
        style={{
          height: 'calc(100vh - 68px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
          paddingBottom: '120px',
        }}
      >
        {/* ── SECCIÓN 1 — ENCABEZADO GEOLÓGICO Y ESCALAS DEL SITIO ─────── */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-10 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs px-3.5 py-1 rounded-full font-bold bg-[#0A0A0C] text-white">
                {site.id}
              </span>
              <span className="font-sans text-xs uppercase tracking-wider text-[#686B75]">
                Sección 1 — Caso de estudio geológico · NASA Space Apps
              </span>
              {site.isCandidate && (
                <span className="font-sans text-xs px-2.5 py-0.5 rounded-full font-medium bg-[#18181B] text-white">
                  Candidato
                </span>
              )}
            </div>

            {/* Dynamic PFI Score Badge + Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsDatasetModalOpen(true)}
                className="py-2 px-4 rounded-full font-sans text-xs font-semibold bg-[#121316] hover:bg-[#202227] text-white transition-all shadow-sm flex items-center gap-1.5 border border-white/12"
              >
                <span>Datasets NASA (8 archivos CSV)</span>
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="py-2 px-4 rounded-full font-sans text-xs font-semibold bg-white hover:bg-[#E4E4E7] text-[#0A0A0C] transition-all shadow-md flex items-center gap-2 border border-white"
              >
                <span>Generar reporte científico</span>
              </button>

              <div
                className="flex items-baseline gap-2.5 px-4 py-1.5 rounded-full border border-black/10 font-mono shadow-sm bg-white text-[#0A0A0C]"
              >
                <span className="text-xl font-bold">{Math.round(pfi)}% PFI</span>
                <span className="text-[10px] font-semibold uppercase text-[#686B75]">{scoreLabel}</span>
              </div>
            </div>
          </div>

          <h1
            className="text-4xl md:text-6xl font-extrabold text-[#0A0A0E] tracking-tight uppercase leading-[1.05] mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {site.name}
          </h1>

          <p className="font-mono text-sm text-[#686B75] max-w-4xl leading-relaxed mb-6">
            {site.country} · {site.region} · Coordenadas: <strong className="text-[#0A0A0E]">{site.dms}</strong> ({site.lat}°, {site.lng}°) · Elevación: <strong className="text-[#0A0A0E]">{site.elevM.toLocaleString()} m s.n.m.</strong>
          </p>

          {/* 2 Prominent Pills: Micro-Escala & Proceso Activo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-[#E2E4EC] shadow-sm">
              <div className="font-sans text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                Micro-escala exacta:
              </div>
              <p className="text-sm text-[#0A0A0E] leading-relaxed">
                {site.microScale}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2E4EC] shadow-sm">
              <div className="font-sans text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                Proceso geofísico activo:
              </div>
              <p className="text-sm text-[#0A0A0E] leading-relaxed">
                {site.activeProcess}
              </p>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 2 — GALERÍA MULTICAPA DE INSPECCIÓN GEOLÓGICA (4 LÁMINAS) ── */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#686B75] block">
                SECCIÓN 2 — GALERÍA MULTICAPA DE INSPECCIÓN GEOLÓGICA (4 LÁMINAS)
              </span>
              <h3 className="text-2xl font-bold text-[#0A0A0E] tracking-tight">
                Muestreo Espectral, Topografía y Terreno Homólogo
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#686B75] hidden sm:inline">
                ARRASTRA O USA LAS FLECHAS
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-[#0A0A0E] border border-[#E2E4EC] shadow-sm transition-all text-xs font-semibold flex items-center gap-1"
                  aria-label="Lámina anterior"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-[#0A0A0E] border border-[#E2E4EC] shadow-sm transition-all text-xs font-semibold flex items-center gap-1"
                  aria-label="Lámina siguiente"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>

          {/* 4 Large-Format Slides with Physics-based Velocity Blur */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-none cursor-grab active:cursor-grabbing select-none"
            style={{
              filter: `blur(${blurPx}px)`,
              transform: `scaleX(${stretchX}) skewX(${skewX}deg)`,
              transition: isDragging ? 'none' : 'filter 0.25s ease-out, transform 0.25s ease-out',
              willChange: 'filter, transform',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Lámina 01 — Fotografía Geológica de Campo */}
            <div className="shrink-0 w-[84vw] md:w-[620px] rounded-3xl overflow-hidden bg-white border border-[#E2E4EC] shadow-xl flex flex-col justify-between" style={{ height: '54vh', minHeight: '390px' }}>
              <div className="relative flex-1 overflow-hidden bg-[#181B20]">
                <GeologicalSiteImage site={site} />
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full font-mono text-xs text-white font-bold">
                  LÁMINA 01 · FOTOGRAFÍA GEOLÓGICA DE CAMPO
                </div>
              </div>
              <div className="p-4 bg-white border-t border-[#E2E4EC]">
                <h4 className="font-bold text-sm text-[#0A0A0E] mb-0.5">{site.name}</h4>
                <p className="font-mono text-xs text-[#686B75] line-clamp-1">{site.photoEarthCaption}</p>
              </div>
            </div>

            {/* Lámina 02 — Escaneo Orbital DEM / SRTM (Relieve y Pendientes) */}
            <div className="shrink-0 w-[84vw] md:w-[620px] rounded-3xl overflow-hidden bg-white border border-[#E2E4EC] shadow-xl flex flex-col justify-between" style={{ height: '54vh', minHeight: '390px' }}>
              <div className="relative flex-1 overflow-hidden bg-[#0A0C14]">
                <DemHeatmapCanvas site={site} />
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full font-mono text-xs text-white font-bold">
                  LÁMINA 02 · ESCANEO ORBITAL DEM & PENDIENTES
                </div>
              </div>
              <div className="p-4 bg-white border-t border-[#E2E4EC]">
                <h4 className="font-bold text-sm text-[#0A0A0E] mb-0.5">Mapa Hipsométrico y Vectores de Pendiente</h4>
                <p className="font-mono text-xs text-[#686B75] line-clamp-1">Curvas cada 25m y análisis de relieve para transitabilidad de rovers</p>
              </div>
            </div>

            {/* Lámina 03 — Firma Espectral Mineralógica */}
            <div className="shrink-0 w-[84vw] md:w-[620px] rounded-3xl overflow-hidden bg-white border border-[#E2E4EC] shadow-xl flex flex-col justify-between" style={{ height: '54vh', minHeight: '390px' }}>
              <div className="relative flex-1 overflow-hidden bg-[#080A10]">
                <SpectralSignatureCanvas site={site} target={target} />
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full font-mono text-xs text-white font-bold">
                  LÁMINA 03 · ESPECTROMETRÍA TÉRMICA / ALBEDO (ASTER vs CRISM/DIVINER)
                </div>
              </div>
              <div className="p-4 bg-white border-t border-[#E2E4EC]">
                <h4 className="font-bold text-sm text-[#0A0A0E] mb-0.5">Bandas de Absorción Mineralógica</h4>
                <p className="font-mono text-xs text-[#686B75] line-clamp-1">Comparación de firmas de {site.mineralogy.split(',').slice(0, 3).join(', ')}</p>
              </div>
            </div>

            {/* Lámina 04 — Terreno Homólogo en Luna / Marte */}
            <div className="shrink-0 w-[84vw] md:w-[620px] rounded-3xl overflow-hidden bg-white border border-[#E2E4EC] shadow-xl flex flex-col justify-between" style={{ height: '54vh', minHeight: '390px' }}>
              <div className="relative flex-1 overflow-hidden bg-[#10121A]">
                <img
                  src={
                    targetWikiPhoto ||
                    (isMoon
                      ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/1280px-Aldrin_Apollo_11_original.jpg'
                      : 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/NASA_Mars_Rover.jpg/1280px-NASA_Mars_Rover.jpg')
                  }
                  alt="Superficie espacial homóloga"
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full font-mono text-xs text-white font-bold">
                  LÁMINA 04 · TERRENO HOMÓLOGO EXTRATERRESTRE ({target.body.toUpperCase()})
                </div>
              </div>
              <div className="p-4 bg-white border-t border-[#E2E4EC]">
                <h4 className="font-bold text-sm text-[#0A0A0E] mb-0.5">{target.name}</h4>
                <p className="font-mono text-xs text-[#686B75] line-clamp-1">{target.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECCIONES 3 Y 4 — COMPARADOR VISUAL, ALTIMETRÍA Y CICLO 24H ── */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
          <div className="mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#686B75] block">
              SECCIÓN 3 Y 4 — COMPARADOR INTERACTIVO, ALTIMETRÍA CRUZADA Y CICLO TÉRMICO DIURNO
            </span>
            <h3 className="text-2xl font-bold text-[#0A0A0E] tracking-tight">
              Inspección Fotográfica, Topografía Morfológica y Onda Térmica de 24 Horas
            </h3>
          </div>

          <PhotoComparator
            earthSiteId={site.id}
            earthPhoto={site.photoEarth}
            targetId={target.id}
            targetName={target.name}
            targetBody={target.body}
            earthCaption={site.photoEarthCaption}
            spaceCaption={target.subtitle}
            earthTelemetry={`${site.id} · Temp: ${site.meanTempC}°C · Presión: ${site.pressureHpa} hPa · Gravedad: 9.81 m/s²`}
            earthTopo={site.topo}
            targetTopo={target.topo}
            earthSiteName={site.name}
            earthMeanTempC={site.meanTempC}
            earthTempMinC={site.tempMinC}
            earthTempMaxC={site.tempMaxC}
            onOpenDatasetModal={() => setIsDatasetModalOpen(true)}
          />
        </div>

        {/* ── SECCIÓN 5 — MATRIZ COMPARATIVA DE LAS 8 DIMENSIONES NASA ── */}
        <div className="bg-[#0A0A0C] text-[#E8E8EC] py-20 px-6 md:px-12 border-t border-white/10">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="font-sans text-xs uppercase tracking-wider text-[#8E9299] block mb-2 font-medium">
                  Sección 5 — Matriz cuantitativa multi-dataset · 8 dimensiones oficiales NASA
                </span>
                <h2 className="text-3xl font-semibold text-white tracking-tight">
                  Correlación paramétrica frente a {target.name}
                </h2>
              </div>
              <div className="font-sans text-xs text-[#8E9299]">
                PFI global: <strong className="text-white text-base font-mono">{Math.round(pfi)}%</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* 8-Axis Radar Chart */}
              <div className="lg:col-span-5 bg-[#121316] p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center">
                <span className="font-sans text-xs text-[#8E9299] uppercase mb-4 tracking-wider font-medium">
                  Polígono de similitud (8 ejes)
                </span>

                <svg width="300" height="300" viewBox="0 0 300 300" className="select-none">
                  {[20, 40, 60, 80, 100].map((lvl) => {
                    const r = (lvl / 100) * radius;
                    const pts = Array.from({ length: 8 }, (_, i) => {
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
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Target Polygon */}
                  <polygon points={targetPoints} fill="none" stroke="#A1A1AA" strokeWidth="1.8" strokeDasharray="4,3" />

                  {/* Earth Site Polygon (Clean White Accent) */}
                  <polygon points={earthPoints} fill="rgba(255,255,255,0.12)" stroke="#FFFFFF" strokeWidth="2" />

                  {radarAxes.map((axis, i) => {
                    const a = i * angleStep - Math.PI / 2;
                    const x = center + (radius + 22) * Math.cos(a);
                    const y = center + (radius + 22) * Math.sin(a);
                    return (
                      <text key={axis.key} x={x} y={y + 3} fill="#8E929F" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="600">
                        {axis.label}
                      </text>
                    );
                  })}
                </svg>

                <div className="flex items-center gap-6 text-xs font-sans mt-4">
                  <span className="flex items-center gap-2 text-white">
                    <span className="w-3 h-0.5 bg-white inline-block" />
                    {site.id} (Tierra)
                  </span>
                  <span className="flex items-center gap-2 text-[#A1A1AA]">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-[#A1A1AA] inline-block" />
                    {target.name} ({target.body})
                  </span>
                </div>
              </div>

              {/* Multi-Dataset Table */}
              <div className="lg:col-span-7 bg-[#121316] p-6 rounded-3xl border border-white/10 overflow-x-auto">
                <span className="font-sans text-xs text-[#8E9299] uppercase mb-4 block tracking-wider font-medium">
                  Tabla cuantitativa multi-dataset
                </span>

                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[#8E9299] text-[10px] uppercase">
                      <th className="py-2.5 pr-2">Dimensión</th>
                      <th className="py-2.5 px-2">Dataset Tierra</th>
                      <th className="py-2.5 px-2">Lectura</th>
                      <th className="py-2.5 px-2">Dataset Espacial</th>
                      <th className="py-2.5 px-2">Lectura</th>
                      <th className="py-2.5 pl-2 text-right">% Similitud</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    {NASA_PFI_DIMENSIONS.map((dim) => {
                      const sVal = site.vector[dim.key] ?? 50;
                      const tVal = target.vector[dim.key] ?? 50;
                      const sim = Math.max(0, 100 - Math.abs(sVal - tVal));
                      return (
                        <tr key={dim.key} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 pr-2 font-medium text-white">{dim.title.split(',')[0]}</td>
                          <td className="py-2.5 px-2 text-[#A1A1AA]">{dim.datasets.split('vs.')[0]?.trim()}</td>
                          <td className="py-2.5 px-2 text-white font-mono">{sVal}%</td>
                          <td className="py-2.5 px-2 text-[#A1A1AA]">{dim.datasets.split('vs.')[1]?.trim() || 'NASA MRO/LRO'}</td>
                          <td className="py-2.5 px-2 text-white font-mono">{tVal}%</td>
                          <td className="py-2.5 pl-2 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <span className="font-mono text-sm text-[#F4F4F6] tabular-nums font-medium">
                                {Math.round(sim)}%
                              </span>
                              <div className="w-8 h-[2px] bg-white/10 rounded-full overflow-hidden shrink-0">
                                <div
                                  className="h-full bg-white transition-all"
                                  style={{ width: `${Math.round(sim)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 6 — EVALUACIÓN CRÍTICA Y BARRERAS FÍSICAS ───────── */}
        <div className="bg-[#0C0E14] text-[#E8E8EC] py-20 px-6 md:px-12 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-10 text-center md:text-left">
              <span className="font-sans text-xs uppercase tracking-wider text-[#8E9299] block mb-2 font-medium">
                Sección 6 — Evaluación crítica de la analogía planetaria · NASA Space Apps
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                ¿Por qué coincide y dónde se rompe la analogía?
              </h2>
              <p className="text-sm text-[#8E9299] mt-2 max-w-2xl font-light leading-relaxed">
                Análisis geocientífico riguroso: fortalezas de fidelidad, factores donde la física terrestre diverge y las 4 barreras planetarias insuperables.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/[0.08] pt-8">
              {/* Columna 1 — PUNTOS DE ALTA FIDELIDAD */}
              <div className="space-y-4">
                <span className="font-sans text-xs uppercase tracking-wider text-white font-medium block">
                  Puntos de alta fidelidad analógica (Por qué coincide)
                </span>
                <div className="space-y-4 pt-2">
                  {scientific.strongAnalogy.map((point, i) => (
                    <div key={i} className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-[#52525B] tabular-nums shrink-0 font-medium">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm text-[#D4D4D8] leading-relaxed font-sans font-light">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna 2 — LÍMITES Y RUPTURA */}
              <div className="space-y-4 md:border-l md:border-white/10 md:pl-7">
                <span className="font-sans text-xs uppercase tracking-wider text-white font-medium block">
                  Límites y ruptura de la analogía local (Dónde se rompe)
                </span>
                <div className="space-y-4 pt-2">
                  {scientific.breaksDown.map((point, i) => (
                    <div key={i} className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-[#52525B] tabular-nums shrink-0 font-medium">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm text-[#D4D4D8] leading-relaxed font-sans font-light">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cuadrícula de 4 Barreras Físicas Universales de la Tierra y Mitigación Técnica */}
            <div className="mt-12 pt-8 border-t border-white/[0.08]">
              <span className="font-sans text-xs uppercase tracking-wider text-white font-medium block mb-6">
                4 Barreras Físicas Universales de la Tierra y Mitigación Técnica
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {EARTH_PLANETARY_LIMITS.map((lim, idx) => (
                  <div
                    key={lim.id}
                    className="bg-[#121316] p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-2 mb-1.5">
                        <strong className="text-white text-xs font-sans font-semibold">
                          {lim.title}
                        </strong>
                        <span className="font-mono text-[10px] text-[#52525B]">0{idx + 1}</span>
                      </div>
                      <div className="text-[10px] text-[#8E9299] font-mono py-1 border-t border-white/[0.06] mb-2 space-y-0.5">
                        <div>Tierra: {lim.earthCondition}</div>
                        <div>Espacio: {lim.spaceCondition}</div>
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] leading-relaxed font-light mb-2">
                        {lim.engineeringImpact}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-white/90">
                      Mitigación: {lim.mitigationStrategy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 7 — PROTOCOLOS DE ENSAYO OPERACIONAL (PREPARACIÓN DE MISIONES) ── */}
        <div className="bg-[#0A0A0C] text-[#E8E8EC] py-20 px-6 md:px-12 border-t border-white/10">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-10">
              <span className="font-sans text-xs uppercase tracking-wider text-[#8E9299] block mb-2 font-medium">
                Sección 7 — Protocolos de Ensayo Operacional (Preparación de Misiones Artemis y Marte)
              </span>
              <h2 className="text-3xl font-semibold text-white tracking-tight">
                Ensayos Críticos e Instrumentación de Vuelo
              </h2>
              <p className="text-sm text-[#8E9299] mt-2 max-w-2xl font-light">
                Protocolos específicos requeridos para mitigar riesgos antes del despliegue en la Luna (Artemis) y Marte.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {scientific.explorationCases.map((c, i) => (
                <div key={i} className="bg-[#121316] p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="font-sans text-[11px] text-[#8E9299] font-medium block mb-2">
                      Caso de prueba 0{i + 1}
                    </span>
                    <h4 className="font-bold text-base text-white mb-2">{c.title}</h4>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 font-sans text-xs text-white/90 mb-3">
                      Instrumento: {c.instrumentOrSystem}
                    </div>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">{c.objective}</p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-white/5 font-sans text-[11px] text-[#71717A]">
                    Validación TRL-6 a TRL-8
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Back Button: White on Dark Background */}
            <div className="text-center pt-6 border-t border-white/10">
              <button
                onClick={onClose}
                className="bg-white hover:bg-[#E4E4E7] text-[#0A0A0C] px-8 py-3.5 rounded-full font-sans text-xs font-semibold transition-all shadow-md"
              >
                Volver a la galería principal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Written Mission Report Modal */}
      {isReportOpen && (
        <MissionReportModal
          site={site}
          target={target}
          pfi={pfi}
          weights={
            weights || {
              geology: 50,
              terrain: 50,
              temperature: 50,
              iceWater: 50,
              atmosphere: 50,
              biosphere: 50,
              subsurface: 50,
              robotics: 50,
            }
          }
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />
      )}
      {/* Real NASA Datasets Extraction Modal */}
      {isDatasetModalOpen && (
        <DatasetExtractionModal
          isOpen={isDatasetModalOpen}
          onClose={() => setIsDatasetModalOpen(false)}
          initialTargetFilter={target.body === 'Luna' ? 'Luna' : 'Marte'}
        />
      )}
    </div>
  );
}
