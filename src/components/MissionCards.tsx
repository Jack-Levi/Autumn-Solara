import React, { useRef, useCallback, useState, useMemo } from 'react';
import { TARGETS } from '../data';

interface MissionCardsProps {
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
}

export default function MissionCards({ selectedTargetId, onSelectTarget }: MissionCardsProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [filterBody, setFilterBody] = useState<'Todos' | 'Luna' | 'Marte'>('Todos');

  const filteredTargets = useMemo(() => {
    if (filterBody === 'Todos') return TARGETS;
    return TARGETS.filter((t) => t.body === filterBody);
  }, [filterBody]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * 16;
    const rotateX = (0.5 - y) * 16;

    card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateY(-8px)`;
    card.style.setProperty('--mouse-x', `${x * 100}%`);
    card.style.setProperty('--mouse-y', `${y * 100}%`);
  }, []);

  const handleMouseLeave = useCallback((index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.style.transform = '';
  }, []);

  // Fan angles for initial rest state
  const fanAngles = [-3, -1, 1, 3];

  return (
    <section className="section-light cross-grid py-28 px-6 relative select-none">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span
              className="font-mono uppercase tracking-widest block mb-3 text-[#686B75]"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              01 — SELECCIÓN DE MISIÓN DESTINO // NASA TREK SITES
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
              Elige tu destino extraterrestre
            </h2>
            <p className="text-[#686B75] text-base mt-2 max-w-xl font-light">
              12 ubicaciones estratégicas caracterizadas con LRO LOLA (Luna) y MGS MOLA (Marte). Selecciona un destino para recalcular en tiempo real el Índice de Fidelidad Planetaria (PFI).
            </p>
          </div>

          {/* Filter Pills: TODOS | LUNA | MARTE */}
          <div className="flex items-center gap-2 bg-[#EAEAED] p-1.5 rounded-full border border-black/5 self-start md:self-end">
            {(['Todos', 'Luna', 'Marte'] as const).map((b) => {
              const active = filterBody === b;
              const count = b === 'Todos' ? TARGETS.length : TARGETS.filter((t) => t.body === b).length;
              return (
                <button
                  key={b}
                  onClick={() => setFilterBody(b)}
                  className={`font-mono text-xs px-4 py-1.5 rounded-full transition-all duration-200 ${
                    active
                      ? 'bg-[#2544FF] text-white font-bold shadow-sm'
                      : 'text-[#686B75] hover:text-[#0A0A0E]'
                  }`}
                >
                  {b.toUpperCase()} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {filteredTargets.map((target, index) => {
            const isSelected = target.id === selectedTargetId;
            const fanRot = fanAngles[index % fanAngles.length];

            return (
              <div
                key={target.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`mission-card group cursor-pointer transition-all duration-300 w-full min-h-[480px] flex flex-col justify-between p-6 rounded-2xl relative overflow-hidden border ${
                  isSelected
                    ? 'bg-white text-[#0A0A0E] border-[#2544FF] shadow-2xl shadow-[#2544FF]/25'
                    : 'bg-[#2544FF] text-white border-transparent hover:shadow-xl hover:shadow-[#2544FF]/30'
                }`}
                style={{
                  transform: `rotate(${fanRot}deg)`,
                  transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease',
                }}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseLeave={() => handleMouseLeave(index)}
                onClick={() => onSelectTarget(target.id)}
              >
                {/* Intricate Aerospace Blueprint SVG Vector Overlay */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                  viewBox="0 0 300 450"
                  fill="none"
                  stroke={isSelected ? '#2544FF' : '#FFFFFF'}
                  strokeWidth="0.8"
                >
                  <circle cx="150" cy="180" r="110" strokeDasharray="3,3" />
                  <circle cx="150" cy="180" r="70" />
                  <circle cx="150" cy="180" r="25" />
                  <line x1="20" y1="180" x2="280" y2="180" strokeDasharray="4,4" />
                  <line x1="150" y1="50" x2="150" y2="310" strokeDasharray="4,4" />
                  <rect x="30" y="30" width="240" height="390" strokeDasharray="6,6" />
                  <path d="M 40,40 L 60,40 L 40,60 Z" fill={isSelected ? '#2544FF' : '#FFFFFF'} fillOpacity="0.2" />
                </svg>

                {/* Top Bar: Number & Body */}
                <div className="relative z-10 flex items-start justify-between">
                  <span
                    className="font-extralight text-5xl leading-none select-none opacity-40 font-sans"
                    style={{ color: isSelected ? '#2544FF' : 'white' }}
                  >
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div
                    className={`font-mono text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
                      isSelected
                        ? 'bg-[#2544FF]/10 text-[#2544FF] border-[#2544FF]/30'
                        : 'bg-white/15 text-white border-white/30'
                    }`}
                  >
                    {target.body}
                  </div>
                </div>

                {/* Center: Technical Aerospace Vector & Title */}
                <div className="relative z-10 my-4">
                  <div className="mb-3 flex items-center gap-2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="opacity-90"
                    >
                      {target.body === 'Luna' ? (
                        <>
                          <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
                          <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
                        </>
                      ) : (
                        <>
                          <circle cx="12" cy="12" r="8" />
                          <ellipse cx="12" cy="12" rx="11" ry="4" strokeDasharray="2 2" />
                        </>
                      )}
                    </svg>
                    <span className="font-mono text-[11px] font-bold tracking-widest opacity-70">
                      {target.id}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-bold tracking-tight leading-snug"
                    style={{ color: isSelected ? '#0A0A0E' : 'white' }}
                  >
                    {target.name}
                  </h3>
                  <p
                    className="text-xs mt-2 leading-relaxed font-light line-clamp-3"
                    style={{ color: isSelected ? '#686B75' : 'rgba(255,255,255,0.85)' }}
                  >
                    {target.subtitle}
                  </p>
                  {target.missionRef && (
                    <span
                      className="inline-block mt-3 font-mono text-[10px] px-2 py-0.5 rounded opacity-80"
                      style={{
                        backgroundColor: isSelected ? 'rgba(37,68,255,0.08)' : 'rgba(255,255,255,0.15)',
                        color: isSelected ? '#2544FF' : 'white',
                      }}
                    >
                      {target.missionRef}
                    </span>
                  )}
                </div>

                {/* Bottom: Metrics Specs & Select CTA */}
                <div className="relative z-10 pt-3 border-t border-current/15">
                  <div className="flex justify-between items-center font-mono text-[11px] mb-2">
                    <span className="opacity-70">GRAVEDAD:</span>
                    <strong>{target.gravity} m/s²</strong>
                  </div>
                  <div className="flex justify-between items-center font-mono text-[11px] mb-3">
                    <span className="opacity-70">COORDENADAS:</span>
                    <strong className="text-[10px]">{target.coords}</strong>
                  </div>

                  {/* Active / Select Pill Button */}
                  <button
                    className={`w-full py-2.5 px-4 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-[#2544FF] text-white shadow-md'
                        : 'bg-white text-[#2544FF] hover:bg-white/90 shadow-sm'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isSelected ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>DESTINO ACTIVO</span>
                        </>
                      ) : (
                        <span>ACTIVAR MISIÓN →</span>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
