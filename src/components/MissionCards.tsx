import React, { useRef, useCallback } from 'react';
import { TARGETS } from '../data';

interface MissionCardsProps {
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
}

export default function MissionCards({ selectedTargetId, onSelectTarget }: MissionCardsProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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
  const fanAngles = [-4, -1.5, 1.5, 4];

  return (
    <section className="section-light cross-grid py-28 px-6 relative select-none">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="mb-14">
          <span
            className="font-mono uppercase tracking-widest block mb-3 text-[#686B75]"
            style={{ fontSize: '11px', letterSpacing: '0.12em' }}
          >
            01 — SELECCIÓN DE MISIÓN DESTINO
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
            Selecciona la referencia lunar o marciana para recalcular instantáneamente los índices PFI de compatibilidad.
          </p>
        </div>

        {/* 4 Cards STRICTLY in 1 SINGLE ROW of 4 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {TARGETS.map((target, index) => {
            const isSelected = target.id === selectedTargetId;
            const fanRot = fanAngles[index];

            return (
              <div
                key={target.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`mission-card group cursor-pointer transition-all duration-300 w-full min-h-[460px] flex flex-col justify-between p-6 rounded-2xl relative overflow-hidden border ${
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
                    0{index + 1}
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

                {/* Center: Icon & Title */}
                <div className="relative z-10 my-6">
                  <div className="text-3xl mb-3">{target.cardIcon}</div>
                  <h3
                    className="text-xl font-bold tracking-tight leading-snug"
                    style={{ color: isSelected ? '#0A0A0E' : 'white' }}
                  >
                    {target.name}
                  </h3>
                  <p
                    className="text-xs mt-2 leading-relaxed font-light"
                    style={{ color: isSelected ? '#686B75' : 'rgba(255,255,255,0.8)' }}
                  >
                    {target.subtitle}
                  </p>
                </div>

                {/* Bottom: Metrics Specs & Select CTA */}
                <div className="relative z-10 pt-4 border-t border-current/15">
                  <div className="flex justify-between items-center font-mono text-[11px] mb-3">
                    <span className="opacity-70">GRAVEDAD:</span>
                    <strong>{target.gravity} m/s²</strong>
                  </div>
                  <div className="flex justify-between items-center font-mono text-[11px] mb-4">
                    <span className="opacity-70">PRESIÓN:</span>
                    <strong>{target.pressure}</strong>
                  </div>

                  {/* Active / Select Pill Button */}
                  <button
                    className={`w-full py-2.5 px-4 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-[#2544FF] text-white shadow-md'
                        : 'bg-white text-[#2544FF] hover:bg-white/90 shadow-sm'
                    }`}
                  >
                    <span>{isSelected ? '● DESTINO ACTIVO' : 'ACTIVAR MISIÓN →'}</span>
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
