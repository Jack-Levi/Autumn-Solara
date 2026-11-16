import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  getPlanetaryTopo,
  getTopoStats,
  getTargetDatasetSummary,
  getTargetThermalProfile,
  getEarthSiteThermalInertia,
  getThermalInertiaPositionPct,
  getTemperaturePositionPct,
} from '../data/nasaExtractedDatasets';
import type { PlanetaryTopoTransect } from '../data/nasaExtractedDatasets';
import { TARGET_ORBITAL_PHOTOS, SITES } from '../data';
import type { VisualGuide } from '../data';
import ZenithSatelliteView from './ZenithSatelliteView';
import DiurnalThermal24hSimulator from './DiurnalThermal24hSimulator';

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
  earthTempMinC?: number;
  earthTempMaxC?: number;
  onOpenDatasetModal?: () => void;
  earthLat?: number;
  earthLng?: number;
  visualGuide?: VisualGuide;
}

// Procedural Fallback Canvas
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
  earthSiteId = 'ATC-01',
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
  earthTempMinC,
  earthTempMaxC,
  onOpenDatasetModal,
  earthLat,
  earthLng,
  visualGuide,
}: PhotoComparatorProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [spaceImgError, setSpaceImgError] = useState(false);
  const [hoverSvgX, setHoverSvgX] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const spaceCanvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Ingest real 100-point planetary DEM transect
  const extractedPlanetaryPoints: PlanetaryTopoTransect[] = getPlanetaryTopo(targetId);
  const planetaryStats = getTopoStats(extractedPlanetaryPoints);
  const datasetSummary = getTargetDatasetSummary(targetId);

  // Real thermal profile from official CSV datasets (TES/THEMIS & Diviner)
  const targetThermal = getTargetThermalProfile(targetId);
  const earthInertia = getEarthSiteThermalInertia(earthSiteId);

  // Active target topo array (prefer real extracted 100 points)
  const activeTargetTopo =
    extractedPlanetaryPoints.length > 0 ? extractedPlanetaryPoints : targetTopo;

  // Retrieve site data and coordinates for zenith satellite view & visual guide
  const siteData = useMemo(() => SITES.find((s) => s.id === earthSiteId), [earthSiteId]);
  const effectiveLat = earthLat ?? siteData?.lat ?? -24.088;
  const effectiveLng = earthLng ?? siteData?.lng ?? -69.916;
  const effectiveVisualGuide = visualGuide ?? siteData?.visualGuide;

  // Orbital space capture from verified NASA orbital registry
  const verifiedSpace =
    TARGET_ORBITAL_PHOTOS[targetId] ||
    (targetBody === 'Luna'
      ? TARGET_ORBITAL_PHOTOS['MOON-SHK']
      : TARGET_ORBITAL_PHOTOS['MARS-JEZ']);

  const activeSpacePhoto = verifiedSpace.photo;
  const activeSpaceCaption = spaceCaption || verifiedSpace.caption;

  useEffect(() => {
    setSpaceImgError(false);
  }, [activeSpacePhoto]);

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 3));
      if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 3));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ─── Topographic Morphological Dual-Scale Normalization (Δm) ─────────────
  // SVG ViewBox: 0 0 900 240
  // Left: 75, Right: 825, Width: 750
  // Height: 240 -> Top Margin: 24 (10%), Bottom Margin: 24 (10%), Active Plot: 192 (80%)
  // Baseline y = 216, Top y = 24
  const PLOT_LEFT = 75;
  const PLOT_RIGHT = 825;
  const PLOT_WIDTH = 750;
  const PLOT_BASELINE = 216;
  const PLOT_ACTIVE_H = 192;

  const earthElevs = earthTopo.map((p) => p.elevM);
  const targetElevs = activeTargetTopo.map((p) => p.elevM);

  const earthMinElev = earthElevs.length ? Math.min(...earthElevs) : 0;
  const earthMaxElev = earthElevs.length ? Math.max(...earthElevs) : 1000;
  const earthRangeElev = Math.max(1, earthMaxElev - earthMinElev);

  const targetMinElev = targetElevs.length ? Math.min(...targetElevs) : 0;
  const targetMaxElev = targetElevs.length ? Math.max(...targetElevs) : 1000;
  const targetRangeElev = Math.max(1, targetMaxElev - targetMinElev);

  const targetMaxDist =
    activeTargetTopo.length > 0
      ? activeTargetTopo[activeTargetTopo.length - 1].distKm
      : 10;

  // Normalized Earth SVG Path (100% across plot width, 80% height)
  const { earthPath, earthAreaPath } = useMemo(() => {
    if (earthTopo.length === 0) return { earthPath: '', earthAreaPath: '' };
    const points = earthTopo.map((p, idx) => {
      const frac = idx / Math.max(1, earthTopo.length - 1);
      const x = PLOT_LEFT + frac * PLOT_WIDTH;
      const y = PLOT_BASELINE - ((p.elevM - earthMinElev) / earthRangeElev) * PLOT_ACTIVE_H;
      return { x, y };
    });

    const dStroke = 'M ' + points.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' L ');
    const dArea =
      `M ${PLOT_LEFT},${PLOT_BASELINE} ` +
      points.map((pt) => `L ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ') +
      ` L ${PLOT_RIGHT},${PLOT_BASELINE} Z`;

    return { earthPath: dStroke, earthAreaPath: dArea };
  }, [earthTopo, earthMinElev, earthRangeElev]);

  // Normalized Target DEM SVG Path (100% across plot width, 80% height)
  const targetPath = useMemo(() => {
    if (activeTargetTopo.length === 0) return '';
    return (
      'M ' +
      activeTargetTopo
        .map((p, idx) => {
          const frac = idx / Math.max(1, activeTargetTopo.length - 1);
          const x = PLOT_LEFT + frac * PLOT_WIDTH;
          const y = PLOT_BASELINE - ((p.elevM - targetMinElev) / targetRangeElev) * PLOT_ACTIVE_H;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' L ')
    );
  }, [activeTargetTopo, targetMinElev, targetRangeElev]);

  // Handle interactive pointer crosshair
  const handleSvgPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 900;
    const clampedX = Math.max(PLOT_LEFT, Math.min(PLOT_RIGHT, rawX));
    setHoverSvgX(clampedX);
  }, []);

  const handleSvgPointerLeave = useCallback(() => {
    setHoverSvgX(null);
  }, []);

  // Compute live interpolated telemetry at hovered cursor position
  const liveTelemetry = useMemo(() => {
    const frac = hoverSvgX !== null ? (hoverSvgX - PLOT_LEFT) / PLOT_WIDTH : 0.5;
    const distKm = frac * targetMaxDist;

    // Target DEM interpolation & slope
    let targetElev = targetMinElev;
    let targetSlope = 0;
    if (activeTargetTopo.length > 1) {
      const rawIdx = frac * (activeTargetTopo.length - 1);
      const idx = Math.min(activeTargetTopo.length - 2, Math.floor(rawIdx));
      const p0 = activeTargetTopo[idx];
      const p1 = activeTargetTopo[idx + 1];
      const subFrac = rawIdx - idx;
      targetElev = p0.elevM + subFrac * (p1.elevM - p0.elevM);
      const dz = p1.elevM - p0.elevM;
      const dx = (p1.distKm - p0.distKm) * 1000;
      targetSlope = Math.abs(Math.round((Math.atan2(Math.abs(dz), Math.max(0.1, dx)) * 180) / Math.PI * 10) / 10);
    }

    // Earth SRTM interpolation & slope
    let earthElev = earthMinElev;
    let earthSlope = 0;
    if (earthTopo.length > 1) {
      const rawIdx = frac * (earthTopo.length - 1);
      const idx = Math.min(earthTopo.length - 2, Math.floor(rawIdx));
      const p0 = earthTopo[idx];
      const p1 = earthTopo[idx + 1];
      const subFrac = rawIdx - idx;
      earthElev = p0.elevM + subFrac * (p1.elevM - p0.elevM);
      const dz = p1.elevM - p0.elevM;
      const dx = (p1.distKm - p0.distKm) * 1000;
      earthSlope = Math.abs(Math.round((Math.atan2(Math.abs(dz), Math.max(0.1, dx)) * 180) / Math.PI * 10) / 10);
    }

    const localReliefDelta = Math.round(Math.abs(targetElev - targetMinElev));

    const yEarth = PLOT_BASELINE - ((earthElev - earthMinElev) / earthRangeElev) * PLOT_ACTIVE_H;
    const yTarget = PLOT_BASELINE - ((targetElev - targetMinElev) / targetRangeElev) * PLOT_ACTIVE_H;

    return {
      distKm,
      targetElev: Math.round(targetElev),
      targetSlope,
      earthElev: Math.round(earthElev),
      earthSlope,
      localReliefDelta,
      yEarth,
      yTarget,
    };
  }, [
    hoverSvgX,
    targetMaxDist,
    activeTargetTopo,
    earthTopo,
    earthMinElev,
    earthRangeElev,
    targetMinElev,
    targetRangeElev,
  ]);

  // Thermal comparison data setup
  const earthMinC = earthTempMinC !== undefined ? earthTempMinC : earthMeanTempC - 10;
  const earthMaxC = earthTempMaxC !== undefined ? earthTempMaxC : earthMeanTempC + 10;
  const earthMeanC = earthMeanTempC;
  const earthDeltaT = Math.max(1, Math.round(earthMaxC - earthMinC));

  const targetMinK = targetThermal.tempMinK;
  const targetMaxK = targetThermal.tempMaxK;
  const targetMeanK = targetThermal.tempMeanK;
  const targetMinC = targetThermal.tempMinC;
  const targetMaxC = targetThermal.tempMaxC;
  const targetMeanC = targetThermal.tempMeanC;
  const targetDeltaT = targetThermal.deltaTK;

  // Ruler markers position %
  const earthInertiaPct = getThermalInertiaPositionPct(earthInertia.tiu);
  const targetInertiaPct = getThermalInertiaPositionPct(targetThermal.thermalInertiaTIU);

  // Thermal range bar position %
  const targetLeftPct = getTemperaturePositionPct(targetMinC);
  const targetRightPct = getTemperaturePositionPct(targetMaxC);
  const targetWidthPct = Math.max(1, targetRightPct - targetLeftPct);
  const targetMeanPct = getTemperaturePositionPct(targetMeanC);

  const earthLeftPct = getTemperaturePositionPct(earthMinC);
  const earthRightPct = getTemperaturePositionPct(earthMaxC);
  const earthWidthPct = Math.max(1, earthRightPct - earthLeftPct);
  const earthMeanPct = getTemperaturePositionPct(earthMeanC);

  return (
    <div className="w-full bg-[#0A0A0C] rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
      {/* ── GUÍA DE LECTURA VISUAL (3 COLUMNAS EDITORIALES JUSTO ENCIMA DE LA CORTINA) ── */}
      {effectiveVisualGuide && (
        <div className="border-b border-white/[0.08] bg-[#0E1015]">
          <div className="px-6 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold text-[#F4F4F6] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>Guía de Lectura Visual: Comparación Cenital Orbital (Tierra vs. {targetBody})</span>
            </span>
            <span className="font-mono text-[10px] text-[#8E9299]">
              Escala Orbital Homogénea desde el Espacio
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {/* Columna 1: Tierra */}
            <div className="p-4 md:p-5">
              <div className="font-mono text-[10px] text-[#8E9299] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                <span>Qué observar a la izquierda: Tierra ({earthSiteName})</span>
              </div>
              <p className="font-sans text-xs text-[#F4F4F6] leading-relaxed">
                {effectiveVisualGuide.earthObservation}
              </p>
            </div>

            {/* Columna 2: NASA Target */}
            <div className="p-4 md:p-5">
              <div className="font-mono text-[10px] text-[#8E9299] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A1A1AA] inline-block" />
                <span>Qué observar a la derecha: NASA ({targetName})</span>
              </div>
              <p className="font-sans text-xs text-[#F4F4F6] leading-relaxed">
                {effectiveVisualGuide.targetObservation}
              </p>
            </div>

            {/* Columna 3: Clave Científica */}
            <div className="p-4 md:p-5">
              <div className="font-mono text-[10px] text-[#8E9299] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                <span>Clave Científica de la Comparación (Misiones NASA)</span>
              </div>
              <p className="font-sans text-xs text-[#F4F4F6] leading-relaxed">
                {effectiveVisualGuide.scientificKey}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP SLIDING COMPARATOR STAGE ───────────────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none cursor-ew-resize"
        style={{ height: '52vh', minHeight: '390px' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Right Layer: Space Destination Zenith Orbital Photo */}
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

          {/* Right Side Orbital Scale Badge */}
          <div className="absolute bottom-4 right-4 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2.5 font-mono text-[10px] text-white pointer-events-none tabular-nums shadow-lg">
            <span>{verifiedSpace.scaleLabel}</span>
            <div className="w-14 h-1.5 bg-white border border-black/40 flex">
              <div className="w-1/2 h-full bg-[#0A0A0C]" />
              <div className="w-1/2 h-full bg-white" />
            </div>
          </div>
        </div>

        {/* Left Layer: Earth Analog Site Zenith Orbital View (Esri World Imagery) */}
        <div
          className="absolute inset-0 bg-[#140E0A] overflow-hidden"
          style={{
            clipPath: `inset(0 ${100 - position}% 0 0)`,
          }}
        >
          <ZenithSatelliteView
            lat={effectiveLat}
            lng={effectiveLng}
            zoom={11}
            mode="imagery"
            siteName={earthSiteName}
            scaleKm={effectiveVisualGuide?.earthScaleKm ?? 5}
          />
        </div>

        {/* Divider Slider Line with Monochrome Handle */}
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-white z-20 shadow-[0_0_20px_rgba(0,0,0,0.8)] pointer-events-none"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-[#0A0A0C] flex items-center justify-center font-bold text-xs shadow-xl z-30 pointer-events-auto cursor-grab active:cursor-grabbing border border-black/15"
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
          <span className="font-sans text-xs px-3.5 py-1.5 rounded-full font-semibold uppercase tracking-wider bg-black/80 backdrop-blur-md text-[#F4F4F6] border border-white/[0.1]">
            Tierra, Vista Orbital Cenital
          </span>
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-black/60 text-[#8E9299] border border-white/[0.08] hidden sm:inline tabular-nums">
            9.81 m/s², 1 atm
          </span>
        </div>

        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-black/60 text-[#8E9299] border border-white/[0.08] hidden sm:inline tabular-nums">
            {targetBody === 'Luna' ? '1.62 m/s² (0.16g)' : '3.72 m/s² (0.38g)'}
          </span>
          <span className="font-sans text-xs px-3.5 py-1.5 rounded-full font-semibold uppercase tracking-wider text-[#F4F4F6] border border-white/[0.1] bg-black/80 backdrop-blur-md">
            {targetName} ({targetBody}), Vista Orbital Cenital
          </span>
        </div>

        {/* Bottom Captions positioned above scale bars */}
        <div className="absolute bottom-14 left-4 z-10 font-sans text-xs text-[#F4F4F6] bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl max-w-[44%] border border-white/[0.08] pointer-events-none">
          <span className="text-[#8E9299] block text-[10px] uppercase font-medium">Terreno análogo cenital:</span>
          <span className="line-clamp-1">{earthSiteName}, Esri World Imagery ({effectiveLat.toFixed(3)}°, {effectiveLng.toFixed(3)}°)</span>
        </div>

        <div className="absolute bottom-14 right-4 z-10 font-sans text-xs text-[#F4F4F6] bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl text-right max-w-[44%] border border-white/[0.08] pointer-events-none">
          <span className="text-[#8E9299] block text-[10px] uppercase font-medium">Destino orbital NASA:</span>
          <span className="line-clamp-1">{activeSpaceCaption}</span>
        </div>
      </div>

      {/* ── SECTION HEADER STRIP ───────────────────────────────────── */}
      <div className="px-6 py-3 bg-[#121316] border-t border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-sans text-xs">
          <span className="font-semibold text-[#F4F4F6]">
            Dossier Científico: Altimetría Cruzada, Inercia Térmica y Ciclo Diurno de 24 Horas
          </span>
          <span className="hidden sm:inline font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-[#8E9299]">
            LOLA/MOLA DEM, Diviner DLRE, TES/THEMIS, MODIS LST
          </span>
        </div>

        {onOpenDatasetModal && (
          <button
            onClick={onOpenDatasetModal}
            className="font-sans text-xs px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#F4F4F6] border border-white/[0.08] transition-all font-medium"
          >
            Descargar datos CSV
          </button>
        )}
      </div>

      {/* ── DOSSIER CONTENT: TOPOGRAPHY, THERMAL INERTIA & 24H CYCLE ── */}
      <div className="px-6 py-6 bg-[#0A0A0C]">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
            <div>
              <span className="font-sans text-xs font-bold text-[#F4F4F6] uppercase tracking-wider block">
                Perfil Topográfico Morfológico Normalizado y Panel de Inercia Térmica ({datasetSummary.instrumentBadge})
              </span>
              <span className="font-sans text-[11px] text-[#8E9299]">
                Transecto morfológico real (100 puntos): USGS SRTM 30m vs. {datasetSummary.demCsvName}
              </span>
            </div>

            <div className="flex items-center gap-5 text-xs font-sans">
              <span className="flex items-center gap-2 text-[#F4F4F6]">
                <span className="w-4 h-0.5 bg-white inline-block" />
                {earthSiteName} (SRTM 30m)
              </span>
              <span className="flex items-center gap-2 text-[#A1A1AA]">
                <span className="w-4 h-0.5 border-t border-dashed border-[#A1A1AA] inline-block" />
                {targetName} (DEM NASA)
              </span>
            </div>
          </div>

          {/* Real-Time Telemetry Readout Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3.5 rounded-xl bg-[#121316] border border-white/[0.08] font-mono text-xs tabular-nums text-[#8E9299]">
            <div>
              <span className="text-[10px] text-[#8E9299] uppercase tracking-wider block mb-0.5">Distancia</span>
              <span className="text-[#F4F4F6] font-bold">
                {hoverSvgX !== null ? `${liveTelemetry.distKm.toFixed(2)} km` : `0.00 a ${targetMaxDist.toFixed(1)} km`}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#8E9299] uppercase tracking-wider block mb-0.5">Tierra (SRTM 30m)</span>
              <span className="text-[#F4F4F6] font-bold">
                {hoverSvgX !== null
                  ? `${liveTelemetry.earthElev} m, ${liveTelemetry.earthSlope.toFixed(1)}°`
                  : `${Math.round(earthMinElev)} a ${Math.round(earthMaxElev)} m`}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#8E9299] uppercase tracking-wider block mb-0.5">Destino NASA DEM</span>
              <span className="text-[#A1A1AA] font-bold">
                {hoverSvgX !== null
                  ? `${liveTelemetry.targetElev} m, ${liveTelemetry.targetSlope.toFixed(1)}°`
                  : `${Math.round(targetMinElev)} a ${Math.round(targetMaxElev)} m`}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#8E9299] uppercase tracking-wider block mb-0.5">Relieve Local Δh</span>
              <span className="text-[#F4F4F6] font-bold">
                {hoverSvgX !== null ? `${liveTelemetry.localReliefDelta} m` : `Δh máx: ${planetaryStats.elevDelta} m`}
              </span>
            </div>
          </div>

          {/* Topographic SVG with Dual Normalized Y-Axis */}
          <div className="w-full overflow-x-auto">
            <svg
              ref={svgRef}
              viewBox="0 0 900 240"
              className="w-full h-56 select-none cursor-crosshair min-w-[720px]"
              onPointerMove={handleSvgPointerMove}
              onPointerLeave={handleSvgPointerLeave}
            >
              <defs>
                <linearGradient id="earthAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.07" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={PLOT_LEFT} y1={24} x2={PLOT_RIGHT} y2={24} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1={PLOT_LEFT} y1={120} x2={PLOT_RIGHT} y2={120} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1={PLOT_LEFT} y1={PLOT_BASELINE} x2={PLOT_RIGHT} y2={PLOT_BASELINE} stroke="rgba(255,255,255,0.12)" />

              {/* Earth Fill Area Gradient */}
              {earthAreaPath && <path d={earthAreaPath} fill="url(#earthAreaGrad)" />}

              {/* NASA Target DEM Curve (Dashed Silver) */}
              {targetPath && (
                <path
                  d={targetPath}
                  fill="none"
                  stroke="#A1A1AA"
                  strokeWidth="1.75"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Earth SRTM Curve (Solid White) */}
              {earthPath && (
                <path
                  d={earthPath}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Left Y-Axis (Earth SRTM 30m - White) */}
              <text x={PLOT_LEFT - 8} y={15} fill="#F4F4F6" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="end">
                TIERRA (SRTM 30m)
              </text>
              <text x={PLOT_LEFT - 8} y={28} fill="#F4F4F6" fontSize="11" fontFamily="monospace" textAnchor="end" className="tabular-nums">
                {Math.round(earthMaxElev)} m
              </text>
              <text x={PLOT_LEFT - 8} y={124} fill="#8E9299" fontSize="10" fontFamily="monospace" textAnchor="end" className="tabular-nums">
                {Math.round((earthMaxElev + earthMinElev) / 2)} m
              </text>
              <text x={PLOT_LEFT - 8} y={PLOT_BASELINE} fill="#F4F4F6" fontSize="11" fontFamily="monospace" textAnchor="end" className="tabular-nums">
                {Math.round(earthMinElev)} m
              </text>

              {/* Right Y-Axis (NASA Target DEM - Silver) */}
              <text x={PLOT_RIGHT + 8} y={15} fill="#8E9299" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="start">
                {targetBody.toUpperCase()} ({datasetSummary.demCsvName.includes('LOLA') ? 'LOLA DEM' : 'MOLA DEM'})
              </text>
              <text x={PLOT_RIGHT + 8} y={28} fill="#8E9299" fontSize="11" fontFamily="monospace" textAnchor="start" className="tabular-nums">
                {Math.round(targetMaxElev)} m
              </text>
              <text x={PLOT_RIGHT + 8} y={124} fill="#8E9299" fontSize="10" fontFamily="monospace" textAnchor="start" className="tabular-nums">
                {Math.round((targetMaxElev + targetMinElev) / 2)} m
              </text>
              <text x={PLOT_RIGHT + 8} y={PLOT_BASELINE} fill="#8E9299" fontSize="11" fontFamily="monospace" textAnchor="start" className="tabular-nums">
                {Math.round(targetMinElev)} m
              </text>

              {/* Bottom X-Axis (Distance) */}
              <text x={PLOT_LEFT} y={232} fill="#8E9299" fontSize="10" fontFamily="monospace" textAnchor="middle" className="tabular-nums">
                0 km
              </text>
              <text x={PLOT_LEFT + PLOT_WIDTH * 0.25} y={232} fill="#8E9299" fontSize="10" fontFamily="monospace" textAnchor="middle" className="tabular-nums">
                {(targetMaxDist * 0.25).toFixed(1)} km
              </text>
              <text x={PLOT_LEFT + PLOT_WIDTH * 0.5} y={232} fill="#8E9299" fontSize="10" fontFamily="monospace" textAnchor="middle" className="tabular-nums">
                {(targetMaxDist * 0.5).toFixed(1)} km
              </text>
              <text x={PLOT_LEFT + PLOT_WIDTH * 0.75} y={232} fill="#8E9299" fontSize="10" fontFamily="monospace" textAnchor="middle" className="tabular-nums">
                {(targetMaxDist * 0.75).toFixed(1)} km
              </text>
              <text x={PLOT_RIGHT} y={232} fill="#8E9299" fontSize="10" fontFamily="monospace" textAnchor="middle" className="tabular-nums">
                {targetMaxDist.toFixed(1)} km
              </text>

              {/* Interactive Crosshair Guideline & Dual Dots */}
              {hoverSvgX !== null && (
                <g pointerEvents="none">
                  <line
                    x1={hoverSvgX}
                    y1={24}
                    x2={hoverSvgX}
                    y2={PLOT_BASELINE}
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={hoverSvgX}
                    cy={liveTelemetry.yEarth}
                    r={4.5}
                    fill="#FFFFFF"
                    stroke="#0A0A0C"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={hoverSvgX}
                    cy={liveTelemetry.yTarget}
                    r={4.5}
                    fill="#0A0A0C"
                    stroke="#A1A1AA"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* ── SECTION 2: OPEN THERMAL INERTIA & DIURNAL RANGE PANEL ── */}
          <div className="mt-8 pt-7 border-t border-white/[0.08]" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '28px' }}>
            {/* Instrument 1: Comparador Físico de Inercia Térmica del Regolito */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h4 className="font-sans text-sm font-bold text-[#F4F4F6] tracking-tight">
                    Comparador Físico de Inercia Térmica del Regolito (J·m⁻²·K⁻¹·s⁻¹/² / TIU)
                  </h4>
                  <p className="font-sans text-xs text-[#8E9299]">
                    Telemetría directa de MGS TES / Mars Odyssey THEMIS y LRO Diviner (DLRE)
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-2 text-[#F4F4F6]">
                    <span className="w-2.5 h-2.5 rounded-full bg-white inline-block shadow-sm" />
                    Tierra ({earthSiteName}): {earthInertia.tiu} TIU
                  </span>
                  <span className="flex items-center gap-2 text-[#A1A1AA]">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-[#A1A1AA] bg-[#0A0A0C] inline-block" />
                    {targetName}: {targetThermal.thermalInertiaTIU} TIU
                  </span>
                </div>
              </div>

              {/* Horizontal Ruler Track with 4 Planetary Regimes */}
              <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
                {/* 4 Regime Headers */}
                <div className="grid grid-cols-4 gap-2 mb-3 text-[11px] font-sans border-b border-white/[0.06] pb-2.5">
                  <div className="border-r border-white/[0.06] pr-2">
                    <span className="font-mono text-[#F4F4F6] font-bold block tabular-nums">0 – 100 TIU</span>
                    <span className="text-[#8E9299] text-[10px] leading-tight block">Polvo fino suelto / regolito altamente poroso</span>
                  </div>
                  <div className="border-r border-white/[0.06] pr-2">
                    <span className="font-mono text-[#F4F4F6] font-bold block tabular-nums">100 – 350 TIU</span>
                    <span className="text-[#8E9299] text-[10px] leading-tight block">Arena eólica / ceniza volcánica consolidada</span>
                  </div>
                  <div className="border-r border-white/[0.06] pr-2">
                    <span className="font-mono text-[#F4F4F6] font-bold block tabular-nums">350 – 1,200 TIU</span>
                    <span className="text-[#8E9299] text-[10px] leading-tight block">Duricrust cementado / brecha fracturada</span>
                  </div>
                  <div>
                    <span className="font-mono text-[#F4F4F6] font-bold block tabular-nums">&gt; 1,200 TIU</span>
                    <span className="text-[#8E9299] text-[10px] leading-tight block">Roca madre expuesta / basalto masivo</span>
                  </div>
                </div>

                {/* Ruler Track Bar with Dual Markers */}
                <div className="relative w-full h-8 flex items-center select-none my-1">
                  {/* Background Track Line with 4 colored zones */}
                  <div className="absolute inset-x-0 h-[4px] rounded-full bg-white/[0.08] overflow-hidden flex">
                    <div className="w-1/4 h-full bg-white/[0.06] border-r border-white/[0.1]" />
                    <div className="w-1/4 h-full bg-white/[0.1] border-r border-white/[0.1]" />
                    <div className="w-1/4 h-full bg-white/[0.14] border-r border-white/[0.1]" />
                    <div className="w-1/4 h-full bg-white/[0.18]" />
                  </div>

                  {/* Marker 1: Earth Solid White Marker */}
                  <div
                    className="absolute -translate-x-1/2 flex flex-col items-center z-10 transition-all duration-300"
                    style={{ left: `${earthInertiaPct}%` }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white border border-[#0A0A0C] shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                    <span className="mt-1 font-mono text-[10px] text-[#F4F4F6] whitespace-nowrap tabular-nums">
                      {earthInertia.tiu} TIU
                    </span>
                  </div>

                  {/* Marker 2: NASA Target Light-Gray Ring Marker */}
                  <div
                    className="absolute -translate-x-1/2 flex flex-col items-center z-10 transition-all duration-300"
                    style={{ left: `${targetInertiaPct}%` }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#A1A1AA] bg-[#0A0A0C]" />
                    <span className="mt-1 font-mono text-[10px] text-[#A1A1AA] whitespace-nowrap tabular-nums">
                      {targetThermal.thermalInertiaTIU} TIU
                    </span>
                  </div>
                </div>

                {/* 2-Line Technical Note */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] font-sans text-xs text-[#8E9299] leading-relaxed">
                  <p>
                    La baja inercia térmica lunar y marciana evidencia regolito desgasificado de extrema porosidad en ausencia de presión atmosférica normal.
                  </p>
                  <p className="text-[#F4F4F6] mt-0.5">
                    En pruebas terrestres, el aire intersticial compacta el suelo, enmascarando el riesgo de hundimiento de ruedas y sobreestimando la energía de corte requerida para excavación ISRU.
                  </p>
                </div>
              </div>
            </div>

            {/* Instrument 2: Rango Térmico Diurno Real */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h4 className="font-sans text-sm font-bold text-[#F4F4F6] tracking-tight">
                    Rango Térmico Diurno Real (Diviner / TES-THEMIS vs. Tierra)
                  </h4>
                  <p className="font-sans text-xs text-[#8E9299]">
                    Intervalo térmico real (Mínima, Media y Máxima en K y °C) frente a la oscilación diaria terrestre
                  </p>
                </div>
                <div className="font-mono text-xs text-[#8E9299] tabular-nums">
                  Eje térmico: 33 K (-240 °C) a 398 K (+125 °C)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08] space-y-4">
                {/* Row 1: NASA Target Real Temperature Span */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#A1A1AA] font-semibold">
                      {targetName} ({targetBody}, {targetThermal.instrumentBadge})
                    </span>
                    <span className="text-[#F4F4F6] font-bold tabular-nums">
                      ΔT = {targetDeltaT.toFixed(1)} K ({targetThermal.deltaTC.toFixed(1)} °C)
                    </span>
                  </div>

                  <div className="relative w-full h-11 flex items-center select-none my-1">
                    {/* Baseline hairline */}
                    <div className="absolute inset-x-0 h-[1px] bg-white/[0.08]" />

                    {/* Active 2px Bar */}
                    <div
                      className="absolute h-[2px] bg-[#A1A1AA] rounded-full"
                      style={{ left: `${targetLeftPct}%`, width: `${targetWidthPct}%` }}
                    />

                    {/* Min Dot (Label above) */}
                    <div
                      className="absolute -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${targetLeftPct}%` }}
                    >
                      <span className="mb-1 font-mono text-[9px] text-[#A1A1AA] whitespace-nowrap tabular-nums">
                        Mín {targetMinK} K ({targetMinC.toFixed(1)} °C)
                      </span>
                      <div className="w-2 h-2 rounded-full bg-[#A1A1AA]" />
                    </div>

                    {/* Mean Dot (Label below) */}
                    <div
                      className="absolute -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${targetMeanPct}%` }}
                    >
                      <div className="w-1.5 h-1.5 rotate-45 bg-[#8E9299]" />
                      <span className="mt-1 font-mono text-[9px] text-[#8E9299] whitespace-nowrap tabular-nums">
                        Media {targetMeanK} K ({targetMeanC.toFixed(1)} °C)
                      </span>
                    </div>

                    {/* Max Dot (Label above) */}
                    <div
                      className="absolute -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${targetRightPct}%` }}
                    >
                      <span className="mb-1 font-mono text-[9px] text-[#A1A1AA] whitespace-nowrap tabular-nums">
                        Máx {targetMaxK} K ({targetMaxC.toFixed(1)} °C)
                      </span>
                      <div className="w-2 h-2 rounded-full bg-[#A1A1AA]" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Earth Analog Real Temperature Span */}
                <div className="pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#F4F4F6] font-semibold">
                      {earthSiteName} (Tierra, Estación SRTM, Clima)
                    </span>
                    <span className="text-[#F4F4F6] font-bold tabular-nums">
                      ΔT = {earthDeltaT.toFixed(1)} K ({earthDeltaT.toFixed(1)} °C)
                    </span>
                  </div>

                  <div className="relative w-full h-11 flex items-center select-none my-1">
                    {/* Baseline hairline */}
                    <div className="absolute inset-x-0 h-[1px] bg-white/[0.08]" />

                    {/* Active 2px Bar */}
                    <div
                      className="absolute h-[2px] bg-white rounded-full"
                      style={{ left: `${earthLeftPct}%`, width: `${earthWidthPct}%` }}
                    />

                    {/* Min Dot (Label above) */}
                    <div
                      className="absolute -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${earthLeftPct}%` }}
                    >
                      <span className="mb-1 font-mono text-[9px] text-[#F4F4F6] whitespace-nowrap tabular-nums">
                        Mín {(earthMinC + 273.15).toFixed(1)} K ({earthMinC.toFixed(1)} °C)
                      </span>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>

                    {/* Mean Dot (Label below) */}
                    <div
                      className="absolute -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${earthMeanPct}%` }}
                    >
                      <div className="w-1.5 h-1.5 rotate-45 bg-[#8E9299]" />
                      <span className="mt-1 font-mono text-[9px] text-[#8E9299] whitespace-nowrap tabular-nums">
                        Media {(earthMeanC + 273.15).toFixed(1)} K ({earthMeanC.toFixed(1)} °C)
                      </span>
                    </div>

                    {/* Max Dot (Label above) */}
                    <div
                      className="absolute -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${earthRightPct}%` }}
                    >
                      <span className="mb-1 font-mono text-[9px] text-[#F4F4F6] whitespace-nowrap tabular-nums">
                        Máx {(earthMaxC + 273.15).toFixed(1)} K ({earthMaxC.toFixed(1)} °C)
                      </span>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                </div>

                {/* Analytical Callout */}
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-[#8E9299]">
                    Amplitud térmica extrema: <strong className="text-[#F4F4F6]">ΔT {targetDeltaT.toFixed(1)} K</strong> en {targetName} frente a <strong className="text-[#F4F4F6]">ΔT {earthDeltaT.toFixed(1)} K</strong> en {earthSiteName}
                  </span>
                  <span className="text-[#A1A1AA] font-bold tabular-nums">
                    {(targetDeltaT / Math.max(earthDeltaT, 1)).toFixed(1)}× de oscilación diurna
                  </span>
                </div>
              </div>
            </div>

            {/* ── SECTION 3: 24-HOUR DIURNAL THERMAL WAVEFRONT SIMULATOR ── */}
            <div
              className="mt-8 pt-8 border-t border-white/[0.08]"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '32px' }}
            >
              <DiurnalThermal24hSimulator
                targetId={targetId}
                targetName={targetName}
                targetBody={targetBody}
                earthSiteName={earthSiteName}
                earthMeanTempC={earthMeanTempC}
                earthTempMinC={earthTempMinC}
                earthTempMaxC={earthTempMaxC}
              />
            </div>
          </div>
        </div>
      </div>
  );
}
