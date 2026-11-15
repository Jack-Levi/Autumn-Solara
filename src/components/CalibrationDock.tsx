import React from 'react';
import { NASA_PFI_DIMENSIONS, PFI_PRESETS } from '../data';
import type { BiomeType, PFIWeights } from '../data';

interface CalibrationDockProps {
  isOpen: boolean;
  onClose: () => void;
  weights: PFIWeights;
  onUpdateWeights: (w: PFIWeights) => void;
  selectedBiome: BiomeType;
  onSelectBiome: (b: BiomeType) => void;
  onResetWeights: () => void;
}

const BIOME_OPTIONS: BiomeType[] = [
  'Todos',
  'Hiperárido',
  'Polar/Criogénico',
  'Volcánico/Basáltico',
  'Impacto/Cráter',
  'Subterráneo/Cueva',
];

export default function CalibrationDock({
  isOpen,
  onClose,
  weights,
  onUpdateWeights,
  selectedBiome,
  onSelectBiome,
  onResetWeights,
}: CalibrationDockProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSliderChange = (key: keyof PFIWeights, val: number) => {
    onUpdateWeights({
      ...weights,
      [key]: val,
    });
  };

  const handleApplyPreset = (presetWeights: PFIWeights) => {
    onUpdateWeights(presetWeights);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop to close on click outside */}
      <div
        className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dock Panel — anchored top-right under nav */}
      <div
        className="calibration-dock visible flex flex-col overflow-hidden"
        style={{
          position: 'fixed',
          top: '76px',
          right: '24px',
          width: 'min(92vw, 700px)',
          maxHeight: '88vh',
          zIndex: 60,
          pointerEvents: 'auto',
          background: '#0D0E15',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)',
        }}
      >
        {/* Header (flex-shrink: 0, fixed at top, never cuts body content) */}
        <div className="shrink-0 px-7 py-5 bg-[#0E0F12] border-b border-white/[0.08] flex items-center justify-between gap-4">
          <div>
            <h3 className="font-sans text-sm font-semibold text-white tracking-tight block">
              Calibración de Fidelidad Planetaria (PFI)
            </h3>
            <p className="font-sans text-xs text-[#8E9299] mt-0.5 max-w-[48ch] leading-relaxed">
              Ajusta la relevancia de las ocho dimensiones físicas para ponderar los sitios terrestres según los objetivos de tu misión.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onResetWeights}
              className="font-sans text-xs text-[#8E9299] hover:text-white transition-colors"
            >
              Restablecer (50%)
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 font-sans text-xs text-[#8E9299] hover:text-white transition-colors py-1.5 px-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 font-medium"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l8 8M9 1L1 9" />
              </svg>
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6">
          {/* Quick Presets Bar */}
          <div>
            <span className="font-sans text-xs text-[#8E9299] block mb-2 font-medium">
              Perfiles de ponderación rápida:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PFI_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(p.weights)}
                  className="font-sans text-xs px-2.5 py-1.5 rounded-lg bg-[#16171B] hover:bg-white hover:text-[#0A0A0C] text-[#E4E4E7] border border-white/10 transition-all text-center font-medium"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 8 NASA Dimension Sliders (Open Editorial Grid - Zero Boxes Inside Boxes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
            {NASA_PFI_DIMENSIONS.map((dim) => {
              const val = weights[dim.key] ?? 50;
              return (
                <div
                  key={dim.key}
                  className="py-5 border-t border-white/[0.08]"
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[13px] font-medium text-white block font-sans leading-tight">
                      {dim.title}
                    </span>
                    <strong className="font-mono text-sm text-[#F4F4F6] shrink-0 font-semibold tabular-nums ml-2">
                      {val}%
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={val}
                    onChange={(e) => handleSliderChange(dim.key, parseInt(e.target.value) || 0)}
                    className="w-full my-1.5"
                  />
                  <span className="font-sans text-[11px] text-[#71717A] block mt-1 leading-snug">
                    {dim.datasets}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Biome Filter Chips */}
          <div className="pt-5 border-t border-white/[0.08]">
            <span className="font-sans text-xs text-[#8E9299] block mb-2.5 font-medium">
              Filtrar por bioma análogo:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BIOME_OPTIONS.map((biome) => {
                const isSel = selectedBiome === biome;
                return (
                  <button
                    key={biome}
                    onClick={() => onSelectBiome(biome)}
                    className={`font-sans text-xs px-3 py-1.5 rounded-lg transition-all ${
                      isSel
                        ? 'bg-white text-[#0A0A0C] font-semibold'
                        : 'bg-[#16171B] text-[#8E9299] hover:text-white border border-white/10'
                    }`}
                  >
                    {biome}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
