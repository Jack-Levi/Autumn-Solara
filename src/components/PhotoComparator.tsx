import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  getPlanetaryTopo,
  getTopoStats,
  getTargetDatasetSummary,
} from '../data/nasaExtractedDatasets';
import type { PlanetaryTopoTransect } from '../data/nasaExtractedDatasets';
import PlanetaryThermalSimulator from './PlanetaryThermalSimulator';
import { useWikipediaImage, WIKIPEDIA_TARGET_REGISTRY } from '../services/wikipediaImages';

interface PhotoComparatorProps {
  earthSiteId?: string;
  earthPhoto: string;
  targetId: string;
  targetName: string;
  targetBody: 'Luna' | 'Marte';
  earthCaption?: string;
  spaceCaption?: string;
  earthTelemetry?: string;
  earthTopo?: { distKm: number; elevM: number }[];
  targetTopo?: { distKm: number; elevM: number }[];
  earthSiteName?: string;
  earthMeanTempC?: number;
  onOpenDatasetModal?: () => void;
}

// 4 Primary Verified NASA Target Reference Photos (+ fallbacks)
const TARGET_VERIFIED_PHOTOS: Record<string, { photo: string; caption: string }> = {
  'MOON-SHK': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/1280px-Aldrin_Apollo_11_original.jpg',
    caption: 'Luna: Polo Sur (Cráter Shackleton) — Superficie y regolito anortosítico polar (NASA Apollo / LRO)',
  },
  'MOON-COP': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Copernicus_crater_AS17-151-23260.jpg/1280px-Copernicus_crater_AS17-151-23260.jpg',
    caption: 'Luna: Cráter Copernicus — Complejo de picos centrales y terrazas de impacto (NASA LRO / Apollo 17)',
  },
  'MOON-LAV': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Mare_Tranquillitatis_pit_crater.jpg/1024px-Mare_Tranquillitatis_pit_crater.jpg',
    caption: 'Luna: Mare Tranquillitatis — Claraboya natural (skylight) a tubo de lava basáltico (NASA LRO)',
  },
  'MARS-JEZ': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/NASA_Mars_Rover.jpg/1280px-NASA_Mars_Rover.jpg',
    caption: 'Marte: Cráter Jezero — Abanico deltaico fluvial explorado por Perseverance (NASA/JPL-Caltech)',
  },
  'MARS-ALB': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Alba_Patera_MGS.jpg/1024px-Alba_Patera_MGS.jpg',
    caption: 'Marte: Alba Mons (Tharsis) — Llanuras volcánicas de baja pendiente cubiertas de polvo (NASA MGS MOLA)',
  },
  'MARS-ARC': {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/1280px-OSIRIS_Mars_true_color.jpg',
    caption: 'Marte: Arcadia Planitia — Llanuras basálticas con hielo somero (ESA / NASA)',
  },
};

// High-Fidelity Procedural Fallback Canvas (Never a blank box)
function drawProceduralSurface(canvas: HTMLCanvasElement, body: 'earth' | 'luna' | 'marte') {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  if (body === 'luna') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#12141A');
    grad.addColorStop(0.5, '#232733');
    grad.addColorStop(1, '#0C0E14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 28; i++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const r = 8 + Math.random() * 45;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(8, 10, 15, 0.7)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - r * 0.15, cy - r * 0.15, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = Math.max(1, r * 0.1);
      ctx.stroke();
    }
  } else if (body === 'marte') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#42160C');
    grad.addColorStop(0.5, '#7C2D12');
    grad.addColorStop(1, '#2D0F08');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let y = 30; y < h; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < w; x += 15) {
        ctx.lineTo(x, y + Math.sin(x * 0.03 + y) * 7);
      }
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.2)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  } else {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#5C2D14');
    grad.addColorStop(0.5, '#8C4D26');
    grad.addColorStop(1, '#3B1A0A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 35; i++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      ctx.beginPath();
      ctx.arc(cx, cy, 15 + Math.random() * 30, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(254, 215, 170, 0.16)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let i = 0; i < 1500; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
}

export default function PhotoComparator({
  earthSiteId,
  earthPhoto,
  targetId,
  targetName,
  targetBody,
  earthCaption,
  spaceCaption,
  earthTelemetry,
  earthTopo = [],
  targetTopo = [],
  earthSiteName = 'Sitio Análogo Terrestre',
  earthMeanTempC = 18,
  onOpenDatasetModal,
}: PhotoComparatorProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [earthImgError, setEarthImgError] = useState(false);
  const [spaceImgError, setSpaceImgError] = useState(false);
  const [activeTab, setActiveTab] = useState<'topo' | 'thermal'>('topo');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const earthCanvasRef = useRef<HTMLCanvasElement>(null);
  const spaceCanvasRef = useRef<HTMLCanvasElement>(null);

  // Ingest real 100-point planetary DEM transect
  const extractedPlanetaryPoints: PlanetaryTopoTransect[] = getPlanetaryTopo(targetId);
  const planetaryStats = getTopoStats(extractedPlanetaryPoints);
  const datasetSummary = getTargetDatasetSummary(targetId);

  // Active target topo array (prefer real extracted points if available)
  const activeTargetTopo =
    extractedPlanetaryPoints.length > 0 ? extractedPlanetaryPoints : targetTopo;

  // Space photo & caption based on targetId
  const wikiSpaceUrl = useWikipediaImage(targetId);
  const wikiEarthUrl = useWikipediaImage(earthSiteId || '');

  const verifiedSpace = TARGET_VERIFIED_PHOTOS[targetId] || {
    photo:
      targetBody === 'Luna'
        ? TARGET_VERIFIED_PHOTOS['MOON-SHK'].photo
        : TARGET_VERIFIED_PHOTOS['MARS-JEZ'].photo,
    caption: `${targetName} — Misión espacial NASA`,
  };

  const activeSpacePhoto = wikiSpaceUrl || verifiedSpace.photo;
  const activeSpaceCaption = spaceCaption || verifiedSpace.caption;
  const activeEarthPhoto = wikiEarthUrl || earthPhoto;

  // Reset img error if URLs change
  useEffect(() => {
    setEarthImgError(false);
  }, [activeEarthPhoto]);

  useEffect(() => {
    setSpaceImgError(false);
  }, [activeSpacePhoto]);

  // Canvas fallbacks
  useEffect(() => {
    if (earthImgError && earthCanvasRef.current) {
      drawProceduralSurface(earthCanvasRef.current, 'earth');
    }
  }, [earthImgError]);

  useEffect(() => {
    if (spaceImgError && spaceCanvasRef.current) {
      drawProceduralSurface(
        spaceCanvasRef.current,
        targetBody === 'Luna' ? 'luna' : 'marte'
      );
    }
  }, [spaceImgError, targetBody]);

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

  // Keyboard support (left/right arrows)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 3));
      if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 3));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Topographic cross-section calculations (Dual Y-Axis normalized for direct morphological comparison)
  const maxDist =
    Math.max(
      ...earthTopo.map((p) => p.distKm),
      ...activeTargetTopo.map((p) => p.distKm),
      1
    ) || 10;

  const earthElevs = earthTopo.map((p) => p.elevM);
  const targetElevs = activeTargetTopo.map((p) => p.elevM);

  const earthMinElev = earthElevs.length ? Math.min(...earthElevs) : 0;
  const earthMaxElev = earthElevs.length ? Math.max(...earthElevs) : 1000;
  const earthRangeElev = Math.max(1, earthMaxElev - earthMinElev);

  const targetMinElev = targetElevs.length ? Math.min(...targetElevs) : 0;
  const targetMaxElev = targetElevs.length ? Math.max(...targetElevs) : 1000;
  const targetRangeElev = Math.max(1, targetMaxElev - targetMinElev);

  // Map Earth curve to y: 135 (bottom) to 30 (top) using Earth's relative relief
  const earthTopoPath =
    earthTopo.length > 0
      ? 'M ' +
        earthTopo
          .map((p) => {
            const x = 55 + (p.distKm / maxDist) * 580;
            const y = 135 - ((p.elevM - earthMinElev) / earthRangeElev) * 105;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' L ')
      : '';

  // Map Target planetary curve to y: 135 (bottom) to 30 (top) using Target's relative relief
  const targetTopoPath =
    activeTargetTopo.length > 0
      ? 'M ' +
        activeTargetTopo
          .map((p) => {
            const x = 55 + (p.distKm / maxDist) * 580;
            const y = 135 - ((p.elevM - targetMinElev) / targetRangeElev) * 105;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' L ')
      : '';

  const targetColor = '#A1A1AA';

  // Hovered point details
  const hoveredPoint =
    hoveredPointIdx !== null && activeTargetTopo[hoveredPointIdx]
      ? activeTargetTopo[hoveredPointIdx]
      : null;

  return (
    <div className="w-full bg-[#08090C] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* ── TOP SLIDING COMPARATOR STAGE ───────────────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none cursor-ew-resize"
        style={{ height: '50vh', minHeight: '380px' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Right Layer: Space Destination Surface Photo */}
        <div className="absolute inset-0 bg-[#0C0E14]">
          {!spaceImgError ? (
            <img
              src={activeSpacePhoto}
              alt={targetName}
              className="w-full h-full object-cover pointer-events-none"
              onError={() => setSpaceImgError(true)}
            />
          ) : (
            <canvas ref={spaceCanvasRef} className="w-full h-full object-cover" width={800} height={500} />
          )}
        </div>

        {/* Left Layer: Earth Analog Site Photo (Clipped by position %) */}
        <div
          className="absolute inset-0 bg-[#140E0A] overflow-hidden"
          style={{
            clipPath: `inset(0 ${100 - position}% 0 0)`,
          }}
        >
          {!earthImgError ? (
            <img
              src={activeEarthPhoto}
              alt="Sitio Análogo Terrestre"
              className="w-full h-full object-cover pointer-events-none"
              onError={() => setEarthImgError(true)}
            />
          ) : (
            <canvas ref={earthCanvasRef} className="w-full h-full object-cover" width={800} height={500} />
          )}
        </div>

        {/* Divider Slider Line with Monochrome Handle */}
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-white z-20 shadow-[0_0_20px_rgba(0,0,0,0.8)] pointer-events-none"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          {/* Draggable Circle Handle */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-[#0A0A0E] flex items-center justify-center font-bold text-xs shadow-xl z-30 pointer-events-auto cursor-grab active:cursor-grabbing border border-black/15"
            onPointerDown={handlePointerDown}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="8 7 3 12 8 17" />
              <polyline points="16 7 21 12 16 17" />
            </svg>
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
          <span className="font-sans text-xs px-3.5 py-1.5 rounded-full font-semibold uppercase tracking-wider bg-black/75 backdrop-blur-md text-white border border-white/15">
            Tierra (Análogo)
          </span>
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-black/60 text-white/80 border border-white/15 hidden sm:inline">
            9.81 m/s² · 1 atm
          </span>
        </div>

        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-black/60 text-white/80 border border-white/15 hidden sm:inline">
            {targetBody === 'Luna' ? '1.62 m/s² (0.16g)' : '3.72 m/s² (0.38g)'}
          </span>
          <span
            className="font-sans text-xs px-3.5 py-1.5 rounded-full font-semibold uppercase tracking-wider text-white border border-white/20 bg-black/75 backdrop-blur-md"
          >
            {targetName} ({targetBody})
          </span>
        </div>

        {/* Bottom Captions */}
        <div className="absolute bottom-4 left-4 z-10 font-sans text-xs text-white/90 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-xl max-w-[44%] border border-white/10 pointer-events-none">
          <span className="text-[#8E9299] block text-[10px] uppercase font-medium">Terreno análogo:</span>
          {earthCaption || earthTelemetry || 'Mapeo de campo geológico NASA'}
        </div>

        <div className="absolute bottom-4 right-4 z-10 font-sans text-xs text-white/90 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-xl text-right max-w-[44%] border border-white/10 pointer-events-none">
          <span className="text-[#8E9299] block text-[10px] uppercase font-medium">Superficie destino:</span>
          {activeSpaceCaption}
        </div>
      </div>

      {/* ── TAB BAR: TOPOGRAPHY vs. THERMAL SIMULATOR ─────────────── */}
      <div className="px-6 py-3 bg-[#0F121C] border-t border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-sans text-xs">
          <button
            onClick={() => setActiveTab('topo')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              activeTab === 'topo'
                ? 'bg-white text-[#0A0A0C] shadow-sm'
                : 'text-[#8E9299] hover:text-white bg-white/[0.05]'
            }`}
          >
            Topografía DEM LOLA / MOLA
          </button>
          <button
            onClick={() => setActiveTab('thermal')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              activeTab === 'thermal'
                ? 'bg-white text-[#0A0A0C] shadow-sm'
                : 'text-[#8E9299] hover:text-white bg-white/[0.05]'
            }`}
          >
            {targetBody === 'Luna'
              ? 'Ciclo térmico diurno (Diviner)'
              : 'Inercia térmica y mecánica (TES / THEMIS)'}
          </button>
        </div>

        {onOpenDatasetModal && (
          <button
            onClick={onOpenDatasetModal}
            className="font-sans text-xs px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/15 transition-all font-medium"
          >
            Descargar datos CSV (8)
          </button>
        )}
      </div>

      {/* ── TAB CONTENT 1: SUPERIMPOSED TOPOGRAPHIC CROSS-SECTION SVG ── */}
      {activeTab === 'topo' && (
        <div className="px-6 py-5 bg-[#0A0C12]">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs font-bold text-white uppercase tracking-wider block">
                  Perfil topográfico cruzado · {datasetSummary.instrumentBadge}
                </span>
              </div>
              <span className="font-sans text-[11px] text-[#8E9299]">
                Curvas de elevación reales (100 puntos extraídos): USGS SRTM 30m vs. {datasetSummary.demCsvName}
              </span>
            </div>

            <div className="flex items-center gap-5 text-xs font-sans">
              <span className="flex items-center gap-2 text-white">
                <span className="w-4 h-0.5 bg-white inline-block" />
                {earthSiteName} (Línea sólida)
              </span>
              <span className="flex items-center gap-2 text-[#A1A1AA]">
                <span
                  className="w-4 h-0.5 border-t-2 border-dashed border-[#A1A1AA] inline-block"
                />
                {targetName} (100 Puntos DEM)
              </span>
            </div>
          </div>

          {/* Telemetry Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4 p-3 rounded-2xl bg-[#0F1322] border border-white/5 font-mono text-xs">
            <div>
              <span className="text-[9px] text-[#8E929F] uppercase block">TRANSECTO:</span>
              <strong className="text-white">{planetaryStats.totalDistKm} km</strong>
            </div>
            <div>
              <span className="text-[9px] text-[#8E929F] uppercase block">DESNIVEL (DELTA):</span>
              <strong className="text-white">{planetaryStats.elevDelta} m</strong>
            </div>
            <div>
              <span className="text-[9px] text-[#8E929F] uppercase block">PENDIENTE MÁXIMA:</span>
              <strong style={{ color: targetColor }}>{planetaryStats.maxSlopeDeg}°</strong>
            </div>
            <div>
              <span className="text-[9px] text-[#8E929F] uppercase block">PENDIENTE MEDIA:</span>
              <strong className="text-white">{planetaryStats.avgSlopeDeg}°</strong>
            </div>
            <div>
              <span className="text-[9px] text-[#8E929F] uppercase block">MUESTRAS DEM:</span>
              <strong className="text-white font-mono">{planetaryStats.pointsCount} pts</strong>
            </div>
            <div>
              <span className="text-[9px] text-[#8E929F] uppercase block">DATASET CSV:</span>
              <a
                href={datasetSummary.demDownloadUrl}
                download={datasetSummary.demCsvName}
                className="text-[#38BDF8] underline text-[11px] truncate block"
              >
                DESCARGAR CSV
              </a>
            </div>
          </div>

          {/* SVG Plot with Dual Y-Axis */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 720 165"
              className="w-full h-44 select-none cursor-crosshair min-w-[620px]"
              onMouseLeave={() => setHoveredPointIdx(null)}
            >
              {/* Grid lines */}
              <line x1="55" y1="30" x2="635" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
              <line x1="55" y1="82" x2="635" y2="82" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
              <line x1="55" y1="135" x2="635" y2="135" stroke="rgba(255,255,255,0.12)" />

              {/* Target Real 100-point Curve (Dual Y: Right Axis) */}
              {targetTopoPath && (
                <path
                  d={targetTopoPath}
                  fill="none"
                  stroke={targetColor}
                  strokeWidth="2.4"
                  strokeDasharray="4,3"
                />
              )}

              {/* Earth SRTM Curve (Dual Y: Left Axis) */}
              {earthTopoPath && (
                <path
                  d={earthTopoPath}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
              )}

              {/* Interactive Point Markers on Target DEM */}
              {activeTargetTopo.map((p, idx) => {
                if (idx % 4 !== 0 && idx !== hoveredPointIdx) return null;
                const cx = 55 + (p.distKm / maxDist) * 580;
                const cy = 135 - ((p.elevM - targetMinElev) / targetRangeElev) * 105;
                const isHovered = idx === hoveredPointIdx;

                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5 : 2}
                    fill={isHovered ? '#FFFFFF' : targetColor}
                    stroke={targetColor}
                    strokeWidth={isHovered ? 2 : 1}
                    onMouseEnter={() => setHoveredPointIdx(idx)}
                  />
                );
              })}

              {/* Dual Y-Axis: Left Labels (Earth SRTM - White) */}
              <text x="50" y="18" fill="#FFFFFF" fontSize="8.5" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="end">
                TIERRA (SRTM)
              </text>
              <text x="50" y="33" fill="#FFFFFF" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
                {Math.round(earthMaxElev)}m
              </text>
              <text x="50" y="138" fill="#FFFFFF" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
                {Math.round(earthMinElev)}m
              </text>

              {/* Dual Y-Axis: Right Labels (Moon/Mars DEM - Target Color) */}
              <text x="640" y="18" fill={targetColor} fontSize="8.5" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="start">
                {targetBody.toUpperCase()} ({datasetSummary.instrumentBadge})
              </text>
              <text x="640" y="33" fill={targetColor} fontSize="9" fontFamily="JetBrains Mono" textAnchor="start">
                {Math.round(targetMaxElev)}m
              </text>
              <text x="640" y="138" fill={targetColor} fontSize="9" fontFamily="JetBrains Mono" textAnchor="start">
                {Math.round(targetMinElev)}m
              </text>

              {/* Distance Axis Label */}
              <text x="345" y="154" fill="#6B6F7B" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
                TRANSECTO COMPARATIVO DE RELIEVE: 0 — {maxDist} km
              </text>
            </svg>

            {/* Hovered Point Tooltip Strip */}
            {hoveredPoint && (
              <div className="mt-2 p-2 rounded-lg bg-[#141829] border border-white/10 flex items-center justify-between font-mono text-[11px] text-[#CBD5E1]">
                <span>
                  DISTANCIA: <strong className="text-white">{hoveredPoint.distKm} km</strong>
                </span>
                <span>
                  ELEVACIÓN DEM: <strong style={{ color: targetColor }}>{hoveredPoint.elevM} m</strong>
                </span>
                {'lat' in hoveredPoint && typeof (hoveredPoint as PlanetaryTopoTransect).lat === 'number' && (
                  <span>
                    COORDENADAS: <strong className="text-white">{(hoveredPoint as PlanetaryTopoTransect).lat.toFixed(3)}°, {(hoveredPoint as PlanetaryTopoTransect).lng.toFixed(3)}°</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 2: THERMAL WAVEFRONT & INERTIA SIMULATOR ── */}
      {activeTab === 'thermal' && (
        <PlanetaryThermalSimulator
          targetId={targetId}
          targetName={targetName}
          targetBody={targetBody}
          earthSiteName={earthSiteName}
          earthMeanTempC={earthMeanTempC}
        />
      )}
    </div>
  );
}
