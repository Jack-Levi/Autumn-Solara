import React from 'react';
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
  const handleSliderChange = (key: keyof PFIWeights, val: number) => {
    onUpdateWeights({
      ...weights,
      [key]: val,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop to close on click outside */}
      <div
        className="fixed inset-0 z-[55]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dock Panel — anchored top-right under nav */}
      <div
        className="calibration-dock visible"
        style={{
          position: 'fixed',
          top: '72px',
          right: '24px',
          zIndex: 60,
          pointerEvents: 'auto',
        }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              MOTOR PARAMÉTRICO DE PESOS // PFI CALIBRATION
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onResetWeights}
              className="font-mono text-[10px] text-[#6B6F7B] hover:text-white transition-colors"
            >
              ↺ RESTABLECER (25%)
            </button>
            <button
              onClick={onClose}
              className="font-mono text-[10px] text-[#6B6F7B] hover:text-[#FF4D24] transition-colors font-bold"
            >
              ✕ CERRAR
            </button>
          </div>
        </div>

        {/* 4 Weight Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex justify-between font-mono text-[11px] mb-1">
              <span className="text-[#E8E8EC]">Topografía / Pendiente</span>
              <strong className="text-[#2544FF]">{weights.topography}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.topography}
              onChange={(e) => handleSliderChange('topography', parseInt(e.target.value) || 0)}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between font-mono text-[11px] mb-1">
              <span className="text-[#E8E8EC]">Fidelidad Geológica</span>
              <strong className="text-[#2544FF]">{weights.geology}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.geology}
              onChange={(e) => handleSliderChange('geology', parseInt(e.target.value) || 0)}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between font-mono text-[11px] mb-1">
              <span className="text-[#E8E8EC]">Extremos Ambientales</span>
              <strong className="text-[#2544FF]">{weights.environment}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.environment}
              onChange={(e) => handleSliderChange('environment', parseInt(e.target.value) || 0)}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between font-mono text-[11px] mb-1">
              <span className="text-[#E8E8EC]">Potencial ISRU y Logística</span>
              <strong className="text-[#2544FF]">{weights.resources}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.resources}
              onChange={(e) => handleSliderChange('resources', parseInt(e.target.value) || 0)}
              className="w-full"
            />
          </div>
        </div>

        {/* Biome Filter Chips */}
        <div>
          <span className="font-mono text-[10px] text-[#6B6F7B] uppercase block mb-2">
            FILTRAR POR BIOMA ANÁLOGO:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {BIOME_OPTIONS.map((biome) => {
              const isSel = selectedBiome === biome;
              return (
                <button
                  key={biome}
                  onClick={() => onSelectBiome(biome)}
                  className={`font-mono text-[10px] px-3 py-1 rounded-full transition-all ${
                    isSel
                      ? 'bg-[#2544FF] text-white font-bold'
                      : 'bg-[#050508] text-[#8E929F] hover:text-white border border-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  {biome}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

