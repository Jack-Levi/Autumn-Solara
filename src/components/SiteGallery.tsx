import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { fidelityColor, fidelityLabel } from '../data';
import type { RankedSite, EarthSite, BiomeType } from '../data';
import { useWikipediaImage, WIKIPEDIA_TARGET_REGISTRY } from '../services/wikipediaImages';

interface SiteGalleryProps {
  rankedSites: RankedSite[];
  onSelectSite: (siteId: string) => void;
  scrollVelocity?: number;
}

// ─── Procedural Geologic Palettes for Guaranteed Canvas Fallback ─────────────
const SITE_GEOLOGY_PALETTES: Record<
  string,
  { bg: string; grad: string[]; accent: string; contour: string }
> = {
  'ATC-01': {
    bg: '#451F10',
    grad: ['#7A3816', '#A65B32', '#C87D55', '#E09F67'],
    accent: '#FFE6D5',
    contour: 'rgba(255, 230, 213, 0.3)',
  },
  'HGT-02': {
    bg: '#182232',
    grad: ['#334155', '#475569', '#64748B', '#94A3B8'],
    accent: '#F1F5F9',
    contour: 'rgba(241, 245, 249, 0.32)',
  },
  'LNZ-03': {
    bg: '#0C0D11',
    grad: ['#18181B', '#27272A', '#3F3F46', '#52525B'],
    accent: '#E4E4E7',
    contour: 'rgba(228, 228, 231, 0.25)',
  },
  'PIN-04': {
    bg: '#3B0C11',
    grad: ['#701A25', '#881337', '#4C0519', '#1C1917'],
    accent: '#FECDD3',
    contour: 'rgba(254, 205, 211, 0.32)',
  },
  'MCM-05': {
    bg: '#081B33',
    grad: ['#0369A1', '#0284C7', '#38BDF8', '#BAE6FD'],
    accent: '#F0F9FF',
    contour: 'rgba(240, 249, 255, 0.35)',
  },
  'PUN-06': {
    bg: '#334155',
    grad: ['#64748B', '#94A3B8', '#CBD5E1', '#F8FAFC'],
    accent: '#FFFFFF',
    contour: 'rgba(255, 255, 255, 0.45)',
  },
  'ASK-07': {
    bg: '#080C16',
    grad: ['#0F172A', '#1E293B', '#0E7490', '#06B6D4'],
    accent: '#67E8F9',
    contour: 'rgba(103, 232, 249, 0.35)',
  },
  'DNK-08': {
    bg: '#292524',
    grad: ['#44403C', '#57534E', '#78716C', '#44403C'],
    accent: '#E7E5E4',
    contour: 'rgba(231, 229, 228, 0.35)',
  },
  'PAY-09': {
    bg: '#09090B',
    grad: ['#18181B', '#27272A', '#3F3F46', '#18181B'],
    accent: '#D4D4D8',
    contour: 'rgba(212, 212, 216, 0.28)',
  },
  'SLD-10': {
    bg: '#18181B',
    grad: ['#27272A', '#3F3F46', '#71717A', '#FFFFFF'],
    accent: '#FFFFFF',
    contour: 'rgba(255, 255, 255, 0.45)',
  },
  'UYU-11': {
    bg: '#27272A',
    grad: ['#3F3F46', '#52525B', '#71717A', '#FFFFFF'],
    accent: '#FFFFFF',
    contour: 'rgba(255, 255, 255, 0.55)',
  },
  'OJS-12': {
    bg: '#18181B',
    grad: ['#27272A', '#3F3F46', '#52525B', '#71717A'],
    accent: '#E4E4E7',
    contour: 'rgba(228, 228, 231, 0.35)',
  },
  'BAR-13': {
    bg: '#3D1501',
    grad: ['#78350F', '#92400E', '#B45309', '#D97706'],
    accent: '#FDE68A',
    contour: 'rgba(253, 230, 138, 0.35)',
  },
  'RIO-14': {
    bg: '#3B0808',
    grad: ['#7F1D1D', '#991B1B', '#B91C1C', '#D97706'],
    accent: '#FCA5A5',
    contour: 'rgba(252, 165, 165, 0.35)',
  },
};

// ─── Intelligent Geological Site Image Component ─────────────────────────────
// Dynamic Wikipedia REST API image with verified static Wikimedia backup
// and procedural SRTM satellite topography canvas fallback on network failure.
export function GeologicalSiteImage({ site }: { site: EarthSite }) {
  const wikiUrl = useWikipediaImage(site.id);
  const [imgSrc, setImgSrc] = useState<string>(
    () => wikiUrl || WIKIPEDIA_TARGET_REGISTRY[site.id]?.staticBackup || site.photoEarth
  );
  const [useFallback, setUseFallback] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (wikiUrl) {
      setImgSrc(wikiUrl);
      setUseFallback(false);
    }
  }, [wikiUrl]);

  // Draw procedural high-res SRTM satellite topography on canvas fallback
  useEffect(() => {
    if (!useFallback) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 500;
    canvas.width = W;
    canvas.height = H;

    const pal = SITE_GEOLOGY_PALETTES[site.id] || {
      bg: '#18191E',
      grad: ['#27272A', '#18181B', '#0A0A0C'],
      accent: '#FFFFFF',
      contour: 'rgba(255,255,255,0.25)',
    };

    // 1. Satellite Base Gradient
    const baseGrad = ctx.createLinearGradient(0, 0, W, H);
    baseGrad.addColorStop(0, pal.bg);
    baseGrad.addColorStop(0.35, pal.grad[0] || pal.bg);
    baseGrad.addColorStop(0.7, pal.grad[1] || pal.bg);
    baseGrad.addColorStop(1, pal.grad[2] || pal.bg);
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Realistic Topographic Elevation Curves (SRTM Iso-Elevation Lines)
    const centerX = W * 0.52;
    const centerY = H * 0.5;

    for (let r = 30; r < 460; r += 26) {
      ctx.beginPath();
      ctx.strokeStyle = pal.contour;
      ctx.lineWidth = r % 78 === 0 ? 1.6 : 0.8;

      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.08) {
        const noise =
          Math.sin(a * 4 + r * 0.04) * 16 +
          Math.sin(a * 9) * 8 +
          Math.cos(a * 2 + r * 0.08) * 10;
        const rad = r + noise;
        const px = centerX + Math.cos(a) * rad * 1.25;
        const py = centerY + Math.sin(a) * rad * 0.85;

        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // 3. Central Mineral Peak / Geological Target Reticle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = pal.accent;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshairs
    ctx.strokeStyle = pal.contour;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY);
    ctx.lineTo(centerX + 40, centerY);
    ctx.moveTo(centerX, centerY - 40);
    ctx.lineTo(centerX, centerY + 40);
    ctx.stroke();

    // 4. NASA Orbital Telemetry HUD Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, H - 42, W, 42);

    ctx.font = "600 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = pal.accent;
    ctx.fillText(`NASA Earth Observatory   SRTM 30m DEM   ${site.id}`, 20, H - 24);

    ctx.font = "400 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'right';
    ctx.fillText(`${site.dms}   ELEV: ${site.elevM}m   PEND: ${site.slopeDeg}°`, W - 20, H - 24);
    ctx.textAlign = 'left';
  }, [useFallback, site]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0A0D14]">
      {/* Primary Real Photo (Dynamic Wikipedia / Static Backup) */}
      <img
        src={imgSrc}
        alt={site.name}
        className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
          useFallback ? 'hidden' : 'block'
        }`}
        onLoad={() => {
          setUseFallback(false);
        }}
        onError={() => {
          const backup = WIKIPEDIA_TARGET_REGISTRY[site.id]?.staticBackup;
          if (backup && imgSrc !== backup) {
            setImgSrc(backup);
          } else {
            setUseFallback(true);
          }
        }}
        loading="lazy"
      />

      {/* Procedural Canvas Fallback */}
      {useFallback && (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}

      {/* Subtle Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />
    </div>
  );
}

// ─── Single Site Gallery Card ────────────────────────────────────────────────
const SiteCard = React.memo(function SiteCard({
  rankedSite,
  onSelect,
}: {
  rankedSite: RankedSite;
  onSelect: () => void;
}) {
  const { site, pfi } = rankedSite;
  const cardRef = useRef<HTMLDivElement>(null);
  const imgFrameRef = useRef<HTMLDivElement>(null);

  // Parallax window frame effect (Locomotive / GSAP ScrollTrigger)
  useEffect(() => {
    const gsap = (window as any).gsap;
    const ScrollTrigger = (window as any).ScrollTrigger;
    const frame = imgFrameRef.current;
    const card = cardRef.current;
    if (!gsap || !ScrollTrigger || !frame || !card) return;

    const tween = gsap.fromTo(
      frame,
      { yPercent: -8, scale: 1.08 },
      {
        yPercent: 8,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

    return () => {
      if (tween.scrollTrigger) {
        tween.scrollTrigger.kill();
      }
      tween.kill();
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 8;
    const rotateX = (0.5 - y) * 8;
    cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  }, []);

  const pfiDisplay = Math.round(pfi);

  return (
    <div
      ref={cardRef}
      className="gallery-card group bg-white border border-[#E2E4EC] hover:border-[#0A0A0E] shadow-sm hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between"
      style={{
        borderRadius: '24px',
        willChange: 'transform, box-shadow, border-color',
        transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.3s ease',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
    >
      {/* Top Metadata Strip in Clean Editorial Sans/Mono */}
      <div className="px-6 py-3.5 bg-[#FAFBFD] border-b border-[#EAEAED] flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
          <strong className="text-[#0A0A0E] font-bold font-mono">{site.id}</strong>
          <span className="text-[#686B75] text-[11px] truncate font-sans">
            {site.nasaDatasets || 'NASA SRTM 30m / ASTER'}
          </span>
          <span className="text-[#0A0A0E] font-medium text-[11px] font-sans">{site.biome}</span>
        </div>

        {/* Sober Black PFI Badge (Zero Traffic-Light Neon) */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {site.isCandidate && (
            <span className="font-sans text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#18181B] text-white">
              {site.id.startsWith('DISC-') ? 'Satélite' : 'Candidato'}
            </span>
          )}
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#0A0A0C] text-white shadow-sm">
            {pfiDisplay}% PFI
          </span>
        </div>
      </div>

      {/* Large Geological Image with Guaranteed Real Image and Window Parallax */}
      <div className="relative w-full h-[320px] overflow-hidden bg-[#181B24] parallax-frame">
        <div ref={imgFrameRef} className="parallax-frame-img w-full h-full">
          <GeologicalSiteImage site={site} />
        </div>

        {/* Coordinates Pill on Image Bottom */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <span className="font-mono text-[10px] text-white/90 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
            {site.dms}   {site.elevM} m s.n.m.
          </span>
          <span className="font-sans text-[10px] text-white/80 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 font-medium">
            {fidelityLabel(pfiDisplay)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-7 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Arrow Interaction */}
          <div className="gallery-card-arrow mb-1.5">
            <span className="arrow-icon text-[#0A0A0E] text-lg font-bold leading-none">
              →
            </span>
            <h3 className="card-title text-2xl font-bold text-[#0A0A0E] tracking-tight group-hover:text-black transition-colors leading-tight font-sans">
              {site.name}
            </h3>
          </div>

          {/* Location Line */}
          <p className="font-sans text-xs text-[#686B75] mb-4">
            {site.country} — {site.region}
          </p>

          {/* Editorial Block: Micro-escala & Proceso activo with left label & right description */}
          <div className="my-5 border-t border-[#E5E7EB] text-left">
            <div className="flex flex-col sm:flex-row sm:items-start py-3.5 border-b border-[#E5E7EB] gap-1 sm:gap-4">
              <span className="shrink-0 sm:w-[130px] font-sans text-[13px] text-[#71717A] font-normal">
                Micro-escala
              </span>
              <p className="flex-1 font-sans text-[14px] text-[#18181B] leading-snug font-normal">
                {site.microScale}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start py-3.5 border-b border-[#E5E7EB] gap-1 sm:gap-4">
              <span className="shrink-0 sm:w-[130px] font-sans text-[13px] text-[#71717A] font-normal">
                Proceso activo
              </span>
              <p className="flex-1 font-sans text-[14px] text-[#18181B] leading-snug font-normal">
                {site.activeProcess}
              </p>
            </div>
          </div>

          {/* Summary */}
          <p className="text-[13px] text-[#4B5563] leading-[1.65] line-clamp-2 font-normal font-sans">
            {site.summary}
          </p>
        </div>

        {/* Bottom CTA Link: Explorar caracterización del sitio → */}
        <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex items-center justify-between font-sans text-[13px] text-[#18181B] font-medium group-hover:text-black transition-colors">
          <span className="relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#18181B] group-hover:after:w-full after:transition-all after:duration-300">
            Explorar caracterización del sitio
          </span>
          <span className="text-sm font-normal transform group-hover:translate-x-1.5 transition-transform duration-300">
            →
          </span>
        </div>
      </div>
    </div>
  );
});

export default function SiteGallery({
  rankedSites,
  onSelectSite,
  scrollVelocity = 0,
}: SiteGalleryProps) {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const handleBefore = () => setIsPrinting(true);
    const handleAfter = () => setIsPrinting(false);
    window.addEventListener('beforeprint', handleBefore);
    window.addEventListener('afterprint', handleAfter);
    return () => {
      window.removeEventListener('beforeprint', handleBefore);
      window.removeEventListener('afterprint', handleAfter);
    };
  }, []);

  const candidateCount = useMemo(
    () => rankedSites.filter((rs) => rs.site.isCandidate === true).length,
    [rankedSites]
  );

  const galleryFilters: { key: string; label: string }[] = useMemo(
    () => [
      { key: 'Todos', label: `Todos (${rankedSites.length})` },
      { key: 'Candidatos', label: `Nuevos candidatos (${candidateCount})` },
      { key: 'Hiperárido', label: 'Hiperárido' },
      { key: 'Polar/Criogénico', label: 'Polar / Criogénico' },
      { key: 'Volcánico', label: 'Volcánico' },
      { key: 'Impacto/Cráter', label: 'Impacto / Cráter' },
      { key: 'Subterráneo/Cueva', label: 'Subterráneo / Cueva' },
    ],
    [rankedSites.length, candidateCount]
  );

  // Filter ranked sites based on user-selected filter chip (in print mode, render ALL 14 sites)
  const filteredRankedSites = useMemo(() => {
    if (isPrinting) return rankedSites;
    return rankedSites.filter((rs) => {
      if (activeFilter === 'Todos') return true;
      if (activeFilter === 'Candidatos') return rs.site.isCandidate === true;
      if (activeFilter === 'Volcánico') {
        return rs.site.biome === 'Volcánico/Basáltico';
      }
      return rs.site.biome === activeFilter;
    });
  }, [isPrinting, rankedSites, activeFilter]);

  return (
    <section
      id="gallery-section"
      className="section-light py-28 px-6 select-none"
      style={{
        background: '#F5F5F3',
        backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.04) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span
              className="font-sans uppercase tracking-wider block mb-3 text-[#686B75]"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              02 — Laboratorio de campo terrestre — 14 sitios análogos
            </span>
            <h2
              className="editorial-reveal-title"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 'clamp(30px, 3.5vw, 44px)',
                color: '#0A0A0E',
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: '-0.03em',
              }}
            >
              Sitios análogos caracterizados
            </h2>
            <p className="text-[#4B5563] text-[15px] mt-3 max-w-[65ch] font-normal leading-[1.65]">
              Catálogo de los 14 sitios de prueba terrestres caracterizados para misiones Artemis en la Luna y bases en Marte. Reordenados dinámicamente por afinidad con el destino y las 8 dimensiones oficiales de la NASA.
            </p>
          </div>

          <div className="font-sans text-xs text-[#686B75] bg-white px-4 py-2.5 rounded-full border border-[#E2E4EC] shadow-sm shrink-0 self-start md:self-end">
            Catálogo: <strong className="text-[#0A0A0E] font-semibold">{rankedSites.length} sitios activos</strong>
          </div>
        </div>

        {/* Biome / Candidate Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-12 pb-2">
          {galleryFilters.map((f) => {
            const isSelected = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`font-sans text-xs px-4 py-2 rounded-full transition-all duration-200 border ${
                  isSelected
                    ? 'bg-[#0A0A0E] text-white border-[#0A0A0E] font-semibold shadow-sm'
                    : 'bg-white text-[#686B75] border-[#E2E4EC] hover:text-[#0A0A0E] hover:border-[#CBD5E1]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* 2-Column Spacious Editorial Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch"
          style={{
            willChange: 'transform',
            transform: Math.abs(scrollVelocity) > 2 ? `skewY(${Math.min(Math.max(scrollVelocity * 0.04, -1.2), 1.2)}deg)` : 'none',
            transition: 'transform 0.2s ease-out',
          }}
        >
          {filteredRankedSites.map((rs) => (
            <SiteCard
              key={rs.site.id}
              rankedSite={rs}
              onSelect={() => onSelectSite(rs.site.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
