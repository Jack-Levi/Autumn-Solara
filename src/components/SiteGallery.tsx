import React, { useState, useRef, useCallback } from 'react';
import { SITES, fidelityColor, fidelityLabel } from '../data';
import type { RankedSite, EarthSite } from '../data';

interface SiteGalleryProps {
  rankedSites: RankedSite[];
  onSelectSite: (siteId: string) => void;
  scrollVelocity?: number;
}

const SiteCard = React.memo(function SiteCard({
  site,
  pfiScore,
  onSelect,
}: {
  site: EarthSite;
  pfiScore: number | undefined;
  onSelect: () => void;
  scrollVelocity?: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 6;
    const rotateX = (0.5 - y) * 6;
    cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'translate3d(0,0,0)';
  }, []);

  const pfiDisplay = pfiScore !== undefined ? Math.round(pfiScore) : 75;
  const pfiCol = fidelityColor(pfiDisplay);

  return (
    <div
      ref={cardRef}
      className="gallery-card group border border-[rgba(0,0,0,0.06)] shadow-sm hover:shadow-2xl transition-all duration-300"
      style={{
        transform: 'translate3d(0,0,0)',
        willChange: 'transform, box-shadow',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
    >
      {/* Real High-Resolution Image Container */}
      <div className="relative overflow-hidden bg-[#181B20] rounded-t-3xl" style={{ height: 340 }}>
        <img
          src={site.photoEarth}
          alt={site.name}
          className="gallery-card-img w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setImgFailed(true)}
          crossOrigin="anonymous"
          loading="lazy"
        />

        {/* Gradient dark scrim for readable badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] px-2.5 py-1 rounded-full font-bold bg-[#0F1015]/85 text-white backdrop-blur-md border border-[rgba(255,255,255,0.15)]">
              {site.id}
            </span>

            {site.isCandidate && (
              <span className="font-mono text-[9px] px-2 py-0.8 rounded-full font-bold bg-[#FF4D24] text-white shadow-sm">
                NUEVO CANDIDATO
              </span>
            )}
          </div>

          {/* PFI Score Pill */}
          <span
            className="font-mono text-xs px-3 py-1 rounded-full font-bold shadow-md"
            style={{
              backgroundColor: '#FFFFFF',
              color: pfiCol,
            }}
          >
            {pfiDisplay}% PFI
          </span>
        </div>

        {/* Bottom Image Overlay Badges */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 z-10">
          <span className="font-mono text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full bg-black/60 text-white/90 backdrop-blur-md border border-white/10">
            {site.biome}
          </span>
          <span className="font-mono text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full bg-black/60 text-white/90 backdrop-blur-md border border-white/10">
            {site.elevM} m s.n.m.
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-7 bg-white rounded-b-3xl">
        {/* Lusion Arrow Animation Title */}
        <div className="gallery-card-arrow mb-2">
          <span className="arrow-icon text-[#2544FF] text-xl font-bold leading-none">
            →
          </span>
          <h3 className="card-title text-2xl font-bold text-[#0A0A0E] tracking-tight group-hover:text-[#2544FF] transition-colors leading-tight">
            {site.name}
          </h3>
        </div>

        {/* Location & Coordinates */}
        <p className="font-mono text-xs text-[#686B75] mb-3">
          {site.country} · {site.region} · <span className="text-[#0A0A0E]">{site.dms}</span>
        </p>

        {/* Summary Snippet */}
        <p className="text-sm text-[#686B75] leading-relaxed line-clamp-2 font-light">
          {site.summary}
        </p>

        {/* Bottom CTA Pill */}
        <div className="mt-5 pt-4 border-t border-[rgba(0,0,0,0.06)] flex items-center justify-between font-mono text-xs text-[#2544FF] font-semibold">
          <span>ABRIR ESTUDIO GEOLÓGICO COMPLETO</span>
          <span className="text-lg leading-none">↗</span>
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
  const pfiMap = new Map(rankedSites.map((rs) => [rs.site.id, rs.pfi]));

  return (
    <section className="section-light cross-grid py-28 px-6 select-none">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span
              className="font-mono uppercase tracking-widest block mb-3 text-[#686B75]"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              02 — LABORATORIO DE CAMPO TERRESTRE
            </span>
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(32px, 4vw, 48px)',
                color: '#0A0A0E',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Sitios análogos caracterizados
            </h2>
            <p className="text-[#686B75] text-base mt-2 max-w-xl font-light">
              Explora en alta resolución los 8 terrenos extremos de prueba para rovers, hábitats subterráneos y extracción de hielo.
            </p>
          </div>

          <div className="font-mono text-xs text-[#686B75] bg-white px-4 py-2 rounded-full border border-[rgba(0,0,0,0.08)] shadow-sm shrink-0">
            TOTAL ANÁLOGOS: <strong className="text-[#2544FF]">{SITES.length} ACTIVOS</strong>
          </div>
        </div>

        {/* 2-Column Spacious Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {SITES.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              pfiScore={pfiMap.get(site.id)}
              onSelect={() => onSelectSite(site.id)}
              scrollVelocity={scrollVelocity}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
