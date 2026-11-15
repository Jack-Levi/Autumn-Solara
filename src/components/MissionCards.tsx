import React, { useRef, useCallback, useState, useEffect } from 'react';
import { TARGETS } from '../data';
import type { ExtraTerrestrialTarget } from '../data';
import { getTargetDatasetSummary } from '../data/nasaExtractedDatasets';
import DatasetExtractionModal from './DatasetExtractionModal';

interface MissionCardsProps {
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
}

// 4 Primary NASA Flagship Reference Targets corresponding to extracted CSV datasets
const FLAGSHIP_TARGET_IDS = ['MOON-SHK', 'MOON-COP', 'MARS-JEZ', 'MARS-ALB'];

export default function MissionCards({ selectedTargetId, onSelectTarget }: MissionCardsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);

  // Locomotive kinetic velocity skew & tilt connected to Lenis
  useEffect(() => {
    let rafId: number;
    let currentSkew = 0;
    let targetSkew = 0;
    let isRunning = true;

    const updateSkew = () => {
      if (!isRunning) return;
      const lenis = (window as any).__lenis;
      const velocity = lenis?.velocity || 0;

      // Dynamic micro-deformation: skew proportional to velocity, clamped strictly to max ±3deg
      targetSkew = Math.max(-3, Math.min(3, velocity * 0.08));

      // Damped return to 0 with silky inertia
      currentSkew += (targetSkew - currentSkew) * 0.12;

      if (gridRef.current) {
        if (Math.abs(currentSkew) > 0.005) {
          gridRef.current.style.transform = `translate3d(0,0,0) skewY(${currentSkew.toFixed(3)}deg)`;
        } else {
          gridRef.current.style.transform = 'translate3d(0,0,0) skewY(0deg)';
        }
      }

      rafId = requestAnimationFrame(updateSkew);
    };

    rafId = requestAnimationFrame(updateSkew);

    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Filter down to the 4 reference destinations
  const referenceTargets: ExtraTerrestrialTarget[] = FLAGSHIP_TARGET_IDS.map(
    (id) => TARGETS.find((t) => t.id === id) || TARGETS[0]
  );

  // Initial fan angles in degrees
  const initialFanAngles = [-6, -2, 2, 6];

  // IntersectionObserver to trigger fan unfurl animation when entering viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Smooth tilt: rotateX from vertical motion, rotateY from horizontal
    const rotateY = (x - 0.5) * 14;
    const rotateX = (0.5 - y) * 14;

    card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateY(-8px)`;
  }, []);

  const handleMouseLeave = useCallback((index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)';
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-light py-28 px-6 relative select-none"
      style={{
        background: '#F4F4F6',
        backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span
              className="font-sans uppercase tracking-wider block mb-3 text-[#686B75]"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              01 — Selección de misión destino · 4 objetivos de referencia
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
              Elige tu destino extraterrestre
            </h2>
            <p className="text-[#4B5563] text-[15px] mt-3 max-w-[65ch] font-normal leading-[1.65]">
              Selecciona uno de los 4 destinos espaciales de referencia para recalcular en tiempo real el Índice de Fidelidad Planetaria (PFI) sobre las 8 dimensiones oficiales de la NASA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsDatasetModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0A0A0E] text-white hover:bg-[#27272A] transition-all shadow-sm font-sans text-xs font-semibold"
            >
              <span>Datasets reales (8 archivos CSV)</span>
            </button>

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E4EC] shadow-sm font-sans text-xs text-[#686B75]">
              <span>4 destinos de referencia</span>
            </div>
          </div>
        </div>

        {/* Strict 4-Column Single Row Grid with Kinetic Velocity Skew */}
        <div
          ref={gridRef}
          className="kinetic-skew-wrap lg:grid-cols-4"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            alignItems: 'stretch',
          }}
        >
          {referenceTargets.map((target, index) => {
            const isSelected = target.id === selectedTargetId;
            const fanAngle = initialFanAngles[index % initialFanAngles.length];
            const summary = getTargetDatasetSummary(target.id);

            // Initial transition from fan angle to 0deg
            const baseTransform = hasEntered
              ? 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)'
              : `perspective(1000px) rotate(${fanAngle}deg) translateY(12px)`;

            return (
              <div
                key={target.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`mission-card group cursor-pointer transition-all duration-300 w-full min-h-[520px] flex flex-col justify-between p-7 rounded-3xl relative overflow-hidden border ${
                  isSelected
                    ? '!bg-[#0A0A0C] !text-white border-[#0A0A0C] shadow-2xl'
                    : '!bg-white !text-[#0A0A0E] border-[#D8DCE6] hover:border-[#0A0A0C] hover:shadow-xl'
                }`}
                style={{
                  transform: baseTransform,
                  transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.3s ease',
                  willChange: 'transform',
                }}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseLeave={() => handleMouseLeave(index)}
                onClick={() => onSelectTarget(target.id)}
              >
                {/* Aerospace Technical Blueprint Vector Overlay */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 320 500"
                  fill="none"
                  stroke={isSelected ? '#FFFFFF' : '#0A0A0E'}
                  strokeWidth="0.8"
                  style={{ opacity: isSelected ? 0.12 : 0.06 }}
                >
                  <circle cx="160" cy="220" r="130" strokeDasharray="3,3" />
                  <circle cx="160" cy="220" r="90" />
                  <circle cx="160" cy="220" r="40" strokeDasharray="4,2" />
                  <line x1="20" y1="220" x2="300" y2="220" strokeDasharray="4,4" />
                  <line x1="160" y1="60" x2="160" y2="380" strokeDasharray="4,4" />
                  <rect x="25" y="25" width="270" height="450" rx="18" strokeDasharray="6,6" />
                  <circle cx="28" cy="28" r="4" fill="currentColor" />
                  <circle cx="292" cy="28" r="4" fill="currentColor" />
                  <circle cx="28" cy="472" r="4" fill="currentColor" />
                  <circle cx="292" cy="472" r="4" fill="currentColor" />
                </svg>

                {/* Top Row: Number 01-04 & Celestial Body Pill */}
                <div className="relative z-10 flex items-start justify-between">
                  <span
                    className="font-extralight text-5xl leading-none select-none font-sans"
                    style={{
                      color: isSelected ? 'rgba(255,255,255,0.35)' : 'rgba(10,10,14,0.18)',
                    }}
                  >
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div
                    className={`font-sans text-[11px] px-3 py-1 rounded-full font-medium tracking-wide border ${
                      isSelected
                        ? 'bg-white/10 text-white border-white/20 backdrop-blur-md'
                        : 'bg-[#F4F4F6] text-[#686B75] border-[#E2E4EC]'
                    }`}
                  >
                    {target.body}
                  </div>
                </div>

                {/* Center Content: Title, ID & Real Instrument Badges */}
                <div className="relative z-10 my-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="font-mono text-[11px] font-bold tracking-wider"
                      style={{ color: isSelected ? '#FFFFFF' : '#0A0A0E' }}
                    >
                      {target.id}
                    </span>
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,14,0.3)' }}
                    />
                    <span
                      className="font-sans text-[10px] tracking-wide font-medium"
                      style={{ color: isSelected ? '#A1A1AA' : '#8E929F' }}
                    >
                      Destino de referencia
                    </span>
                  </div>

                  <h3
                    className="text-lg font-bold tracking-tight leading-snug"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: isSelected ? '#FFFFFF' : '#0A0A0E',
                    }}
                  >
                    {target.name}
                  </h3>

                  <p
                    className="text-xs mt-2 leading-relaxed font-light line-clamp-2"
                    style={{
                      color: isSelected ? 'rgba(255,255,255,0.75)' : '#5A5E6B',
                    }}
                  >
                    {target.subtitle}
                  </p>

                  {/* Clean Technical Instrument Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 mb-2">
                    <span
                      className="font-mono text-[9px] font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        color: isSelected ? '#FFFFFF' : '#0A0A0E',
                        border: isSelected ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.08)',
                      }}
                    >
                      {target.body === 'Luna' ? 'NASA LRO-LOLA DEM' : 'MGS-MOLA DEM'}
                    </span>
                    <span
                      className="font-mono text-[9px] font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        color: isSelected ? '#FFFFFF' : '#0A0A0E',
                        border: isSelected ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.08)',
                      }}
                    >
                      {target.body === 'Luna' ? 'DIVINER DLRE' : 'TES / THEMIS INERTIA'}
                    </span>
                  </div>

                  {/* 4 Real Extracted Metrics Grid */}
                  <div
                    className="grid grid-cols-2 gap-2 my-2.5 pt-2.5 pb-2 border-y"
                    style={{ borderColor: isSelected ? 'rgba(255,255,255,0.15)' : '#EAEAED' }}
                  >
                    {summary.metrics.map((m, idx) => (
                      <div key={idx} className="font-mono leading-tight">
                        <span
                          className="block text-[8.5px] uppercase font-medium tracking-wider mb-0.5"
                          style={{ color: isSelected ? '#A1A1AA' : '#8E929F' }}
                        >
                          {m.label}
                        </span>
                        <strong
                          className="text-[11px]"
                          style={{ color: isSelected ? '#FFFFFF' : '#0A0A0E' }}
                        >
                          {m.value}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Physical Specs & Activate Pill Button */}
                <div
                  className="relative z-10 pt-3 border-t"
                  style={{
                    borderColor: isSelected ? 'rgba(255,255,255,0.15)' : '#EAEAED',
                  }}
                >
                  <div className="flex justify-between items-center font-mono text-[11px] mb-1">
                    <span style={{ color: isSelected ? '#A1A1AA' : '#8E929F' }}>
                      GRAVEDAD:
                    </span>
                    <strong style={{ color: isSelected ? '#FFFFFF' : '#0A0A0E' }}>
                      {target.gravity} m/s²
                    </strong>
                  </div>

                  <div className="flex justify-between items-center font-mono text-[11px] mb-3">
                    <span style={{ color: isSelected ? '#A1A1AA' : '#8E929F' }}>
                      COORDENADAS:
                    </span>
                    <strong
                      className="text-[10px]"
                      style={{ color: isSelected ? '#FFFFFF' : '#0A0A0E' }}
                    >
                      {target.coords}
                    </strong>
                  </div>

                  {/* Active / Select CTA Button */}
                  <button
                    className={`w-full py-2.5 px-4 rounded-full font-sans text-xs font-semibold tracking-normal transition-all duration-300 flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-white text-[#0A0A0E] shadow-sm hover:bg-[#F4F4F6]'
                        : 'bg-[#0A0A0E] text-white hover:bg-[#27272A] shadow-sm'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0E]" />
                        <span>Destino activo</span>
                      </>
                    ) : (
                      <span>Activar misión →</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real NASA Datasets Extraction Modal */}
      {isDatasetModalOpen && (
        <DatasetExtractionModal
          isOpen={isDatasetModalOpen}
          onClose={() => setIsDatasetModalOpen(false)}
          initialTargetFilter="all"
        />
      )}
    </section>
  );
}
