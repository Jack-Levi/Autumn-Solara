import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  COPERNICUS_DIVINER_TEMP,
  JEZERO_TES_THEMIS,
  ALBA_MONS_TES_THEMIS,
} from '../data/nasaExtractedDatasets';

interface DiurnalThermal24hSimulatorProps {
  targetId: string;
  targetName: string;
  targetBody: 'Luna' | 'Marte';
  earthSiteName?: string;
  earthMeanTempC?: number;
  earthTempMinC?: number;
  earthTempMaxC?: number;
}

interface HourlyDataPoint {
  hour: number;
  hourStr: string;
  earthTempK: number;
  earthTempC: number;
  targetTempK: number;
  targetTempC: number;
  phaseLabel: string;
  diagnostic: string;
}

// 24-hour illuminated polar rim model for Shackleton Artemis Exploration Zone
const SHACKLETON_RIM_24H: number[] = [
  76.5, 75.8, 75.2, 76.0, 78.4, 83.2, 88.5, 94.0, 99.8, 104.2, 107.5, 108.4,
  108.0, 106.8, 104.0, 99.5, 94.2, 88.0, 83.5, 79.8, 78.0, 77.2, 76.8, 76.5,
];

// Permanent shadow cold-trap constant model
const SHACKLETON_PSR_TEMP_K = 42.0;

function getSolarPhaseLabel(h: number): string {
  if (h >= 0 && h <= 4) return 'Medianoche solar';
  if (h >= 5 && h <= 8) return 'Terminador / Alba';
  if (h >= 9 && h <= 11) return 'Mañana ascendente';
  if (h >= 12 && h <= 14) return 'Mediodía solar';
  if (h >= 15 && h <= 17) return 'Tarde descendente';
  if (h >= 18 && h <= 20) return 'Terminador / Ocaso';
  return 'Noche profunda';
}

export default function DiurnalThermal24hSimulator({
  targetId,
  targetName,
  targetBody,
  earthSiteName = 'Sitio Análogo Terrestre',
  earthMeanTempC = 18,
  earthTempMinC,
  earthTempMaxC,
}: DiurnalThermal24hSimulatorProps) {
  const [selectedHour, setSelectedHour] = useState<number>(12); // Default to noon (12:00)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [shackletonMode, setShackletonMode] = useState<'rim' | 'psr'>('rim');

  const svgRef = useRef<SVGSVGElement>(null);

  // Play / Pause timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSelectedHour((prev) => (prev + 1) % 24);
    }, 650);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Calibrated Terrestrial MODIS LST Diurnal Model (14 Sites)
  // Min temp at 05:00 LST (pre-dawn), max at 14:00 LST (atmospheric thermal lag)
  const earthMinC = earthTempMinC !== undefined ? earthTempMinC : earthMeanTempC - 10;
  const earthMaxC = earthTempMaxC !== undefined ? earthTempMaxC : earthMeanTempC + 10;

  // Build the 24-Hour physically faithful data points
  const hourlySeries: HourlyDataPoint[] = useMemo(() => {
    const points: HourlyDataPoint[] = [];

    for (let h = 0; h < 24; h++) {
      const hourStr = `${h.toString().padStart(2, '0')}:00`;
      const phaseLabel = getSolarPhaseLabel(h);

      // 1. Earth MODIS LST calculation
      let f = 0.5;
      if (h >= 5 && h <= 14) {
        const theta = ((h - 5) / 9.0) * (Math.PI / 2.0);
        f = Math.sin(theta);
      } else if (h > 14) {
        f = 0.5 * (1.0 + Math.cos(((h - 14) / 15.0) * Math.PI));
      } else {
        f = 0.5 * (1.0 + Math.cos(((h + 10) / 15.0) * Math.PI));
      }
      const eTempC = Math.round((earthMinC + (earthMaxC - earthMinC) * f) * 10) / 10;
      const eTempK = Math.round((eTempC + 273.15) * 10) / 10;

      // 2. NASA Target DEM Temperature calculation
      let tTempK = 200;
      if (targetId === 'MOON-COP') {
        const row = COPERNICUS_DIVINER_TEMP[h] || COPERNICUS_DIVINER_TEMP[12];
        tTempK = row.tempK;
      } else if (targetId === 'MOON-SHK') {
        tTempK = shackletonMode === 'psr' ? SHACKLETON_PSR_TEMP_K : SHACKLETON_RIM_24H[h] || 85.0;
      } else if (targetId === 'MARS-JEZ') {
        const row = JEZERO_TES_THEMIS[h] || JEZERO_TES_THEMIS[12];
        tTempK = row.tempK;
      } else if (targetId === 'MARS-ALB') {
        const row = ALBA_MONS_TES_THEMIS[h] || ALBA_MONS_TES_THEMIS[12];
        tTempK = row.tempK;
      } else if (targetBody === 'Luna') {
        const row = COPERNICUS_DIVINER_TEMP[h] || COPERNICUS_DIVINER_TEMP[12];
        tTempK = row.tempK;
      } else {
        const row = JEZERO_TES_THEMIS[h] || JEZERO_TES_THEMIS[12];
        tTempK = row.tempK;
      }

      const tTempC = Math.round((tTempK - 273.15) * 10) / 10;

      // 3. Dynamic Technical Diagnostic per Hour & Target
      let diagnostic = '';
      if (targetId === 'MOON-COP') {
        if (h >= 11 && h <= 14) {
          diagnostic =
            'Gradiente radiativo extremo al mediodía (+109 °C sin atmósfera); sobrecalentamiento crítico de aviónica que requiere radiadores bifásicos de amoníaco y aislamiento multicapa MLI reflectivo.';
        } else if (h >= 6 && h <= 9) {
          diagnostic =
            'Cruce violento del terminador lunar (+200 K en pocas horas); microfisuras por expansión termoelástica diferencial en cristales ópticos y soldaduras electrónicas.';
        } else if (h >= 18 && h <= 20) {
          diagnostic =
            'Ocaso y enfriamiento radiativo repentino hacia el espacio profundo; contracción rápida de aleaciones estructurales y sellos herméticos de elastómero.';
        } else {
          diagnostic =
            'Noche lunar criogénica profunda (-178 °C); riesgo de congelación irreversible del electrolito de baterías Li-ion; demanda permanente de calefactores RHU por radioisótopos.';
        }
      } else if (targetId === 'MOON-SHK') {
        if (shackletonMode === 'psr') {
          diagnostic =
            'Trampa criogénica en sombra perpetua a 42 K (-231 °C); ambiente de preservación ultralimpia de hielo de agua y volátiles. Fragilización total de titanio; riesgo de criocavitación en brocas de perforación ISRU.';
        } else {
          diagnostic =
            'Iluminación rasante polar continua con sol rozando el horizonte a 1.5°; entorno térmico benigno para paneles solares verticales Artemis con oscilación contenida (ΔT ~32 K).';
        }
      } else if (targetId === 'MARS-JEZ' || targetId === 'MARS-ALB') {
        if (h >= 11 && h <= 15) {
          diagnostic =
            'Ventana térmica operativa óptima en tenue atmósfera de CO₂ (6.1 hPa); máxima eficiencia para navegación autónoma del rover, movilidad de ruedas y recarga fotovoltaica.';
        } else if (h >= 4 && h <= 7) {
          diagnostic =
            'Mínimo nocturno e inversión térmica en capa límite marciana con heladas matutinas de CO₂; demanda máxima de potencia en calefactores resistivos de actuadores.';
        } else {
          diagnostic =
            'Convección atmosférica débil con transferencia térmica dominada por radiación y conducción al suelo; amortiguamiento sostenido por inercia térmica del regolito.';
        }
      } else {
        diagnostic =
          'Régimen térmico radiométrico orbital en ciclo planetario diurno sincronizado.';
      }

      points.push({
        hour: h,
        hourStr,
        earthTempK: eTempK,
        earthTempC: eTempC,
        targetTempK: Math.round(tTempK * 10) / 10,
        targetTempC: tTempC,
        phaseLabel,
        diagnostic,
      });
    }

    return points;
  }, [earthMinC, earthMaxC, targetId, targetBody, shackletonMode]);

  const activeData = hourlySeries[selectedHour] || hourlySeries[12];
  const deltaInstantK = Math.abs(Math.round((activeData.targetTempK - activeData.earthTempK) * 10) / 10);

  // ─── SVG Wavefront Coordinate Calculations ──────────────────────────────
  // ViewBox: 0 0 900 230
  // X: 65 (hour 0) to 850 (hour 23), Width: 785
  // Y: 20 (400 K) to 200 (40 K), Height: 180 (Scale: 40 K to 400 K -> 360 K range)
  const X_LEFT = 65;
  const X_RIGHT = 850;
  const X_WIDTH = 785;
  const Y_TOP = 20;
  const Y_BOTTOM = 200;
  const Y_SPAN = 180;
  const K_MIN = 40;
  const K_MAX = 400;

  const getX = (h: number) => X_LEFT + (h / 23) * X_WIDTH;
  const getY = (k: number) => {
    const clamped = Math.max(K_MIN, Math.min(K_MAX, k));
    return Y_BOTTOM - ((clamped - K_MIN) / (K_MAX - K_MIN)) * Y_SPAN;
  };

  // Paths
  const earthLinePath = useMemo(() => {
    return (
      'M ' +
      hourlySeries
        .map((p) => `${getX(p.hour).toFixed(1)},${getY(p.earthTempK).toFixed(1)}`)
        .join(' L ')
    );
  }, [hourlySeries]);

  const targetLinePath = useMemo(() => {
    return (
      'M ' +
      hourlySeries
        .map((p) => `${getX(p.hour).toFixed(1)},${getY(p.targetTempK).toFixed(1)}`)
        .join(' L ')
    );
  }, [hourlySeries]);

  const targetAreaPath = useMemo(() => {
    const pts = hourlySeries.map((p) => `${getX(p.hour).toFixed(1)},${getY(p.targetTempK).toFixed(1)}`).join(' L ');
    return `M ${X_LEFT},${Y_BOTTOM} L ${pts} L ${X_RIGHT},${Y_BOTTOM} Z`;
  }, [hourlySeries]);

  // Handle direct pointer scrub on SVG
  const handleSvgPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 900;
    const clampedX = Math.max(X_LEFT, Math.min(X_RIGHT, rawX));
    const frac = (clampedX - X_LEFT) / X_WIDTH;
    const h = Math.min(23, Math.max(0, Math.round(frac * 23)));
    setSelectedHour(h);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handleSvgPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons !== 1) return;
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 900;
    const clampedX = Math.max(X_LEFT, Math.min(X_RIGHT, rawX));
    const frac = (clampedX - X_LEFT) / X_WIDTH;
    const h = Math.min(23, Math.max(0, Math.round(frac * 23)));
    setSelectedHour(h);
  }, []);

  const cursorX = getX(selectedHour);
  const cursorEarthY = getY(activeData.earthTempK);
  const cursorTargetY = getY(activeData.targetTempK);

  return (
    <div className="w-full select-none">
      {/* ── 1. HEADER & CONTROLS ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h4 className="font-sans text-sm font-bold text-[#F4F4F6] tracking-tight">
            Ciclo Térmico Diurno de 24 Horas
          </h4>
          <p className="font-sans text-xs text-[#8E9299]">
            Comparativa radiométrica horaria entre telemetría orbital NASA (LRO Diviner / TES-THEMIS) y superficie terrestre (MODIS LST).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Shackleton Mode Switcher if applicable */}
          {targetId === 'MOON-SHK' && (
            <div className="flex items-center gap-1 font-sans text-xs bg-white/[0.04] p-1 rounded-md border border-white/[0.08]">
              <button
                onClick={() => setShackletonMode('rim')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  shackletonMode === 'rim'
                    ? 'bg-white text-[#0A0A0C] font-semibold'
                    : 'text-[#8E9299] hover:text-[#F4F4F6]'
                }`}
              >
                Borde Artemis
              </button>
              <button
                onClick={() => setShackletonMode('psr')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  shackletonMode === 'psr'
                    ? 'bg-white text-[#0A0A0C] font-semibold'
                    : 'text-[#8E9299] hover:text-[#F4F4F6]'
                }`}
              >
                Interior PSR (42 K)
              </button>
            </div>
          )}

          {/* Minimal Play / Pause Toggle Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              color: '#F4F4F6',
            }}
            className="hover:bg-white/[0.08] transition-colors font-sans font-medium"
          >
            {isPlaying ? 'Pausar ciclo' : 'Simular ciclo 24h'}
          </button>
        </div>
      </div>

      {/* ── 2. EDITORIAL MONOCHROME SOLAR HOUR SLIDER ────────────────── */}
      <div className="mb-6 p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
        <div className="flex items-center justify-between text-xs font-mono text-[#8E9299] mb-2.5">
          <span className="text-[11px] uppercase tracking-wider">Control Temporal de Hora Solar</span>
          <span className="text-[#F4F4F6] font-bold tabular-nums">
            {activeData.hourStr} h · {activeData.phaseLabel}
          </span>
        </div>

        {/* Custom Range Input */}
        <div className="relative w-full flex items-center h-6">
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={selectedHour}
            onChange={(e) => setSelectedHour(Number(e.target.value))}
            className="w-full cursor-pointer h-2 bg-transparent appearance-none focus:outline-none"
            style={{
              accentColor: '#FFFFFF',
            }}
          />
        </div>

        {/* 5 Clean Hourly Tick Labels Every 6 Hours */}
        <div className="flex justify-between items-center text-[10px] font-mono text-[#8E9299] mt-2 pt-1 border-t border-white/[0.06] tabular-nums">
          <span>00:00 Medianoche</span>
          <span className="hidden sm:inline">06:00 Terminador / Alba</span>
          <span>12:00 Mediodía solar</span>
          <span className="hidden sm:inline">18:00 Ocaso</span>
          <span>23:00 Noche</span>
        </div>
      </div>

      {/* ── 3. SYNCHRONIZED 24H SVG THERMAL WAVEFRONT CANVAS ────────── */}
      <div className="w-full overflow-x-auto p-4 rounded-xl bg-[#121316] border border-white/[0.08] mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 text-xs font-sans">
          <span className="font-mono text-[11px] text-[#8E9299] uppercase tracking-wider">
            Onda Térmica Diurna (40 K — 400 K)
          </span>
          <div className="flex items-center gap-5 text-xs font-sans">
            <span className="flex items-center gap-2 text-[#F4F4F6]">
              <span className="w-4 h-0.5 bg-white inline-block" />
              {earthSiteName} (MODIS LST)
            </span>
            <span className="flex items-center gap-2 text-[#A1A1AA]">
              <span className="w-4 h-0.5 border-t border-dashed border-[#A1A1AA] inline-block" />
              {targetName} ({targetId === 'MOON-SHK' && shackletonMode === 'psr' ? 'PSR Diviner' : 'Diviner / TES-THEMIS'})
            </span>
          </div>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 900 230"
          className="w-full h-56 select-none cursor-ew-resize min-w-[720px]"
          onPointerDown={handleSvgPointerDown}
          onPointerMove={handleSvgPointerMove}
        >
          <defs>
            <linearGradient id="targetWaveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Temperature Reference Grid Lines */}
          {[400, 300, 200, 100, 40].map((k) => {
            const y = getY(k);
            return (
              <g key={k}>
                <line
                  x1={X_LEFT}
                  y1={y}
                  x2={X_RIGHT}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="2 2"
                />
                <text
                  x={X_LEFT - 8}
                  y={y + 3.5}
                  fill="#8E9299"
                  fontSize="9.5"
                  fontFamily="monospace"
                  textAnchor="end"
                  className="tabular-nums"
                >
                  {k} K ({Math.round(k - 273.15)}°C)
                </text>
              </g>
            );
          })}

          {/* NASA Target Wavefront Gradient Area */}
          {targetAreaPath && <path d={targetAreaPath} fill="url(#targetWaveGrad)" />}

          {/* Extraterrestrial Thermal Wave (Dashed Silver) */}
          {targetLinePath && (
            <path
              d={targetLinePath}
              fill="none"
              stroke="#A1A1AA"
              strokeWidth="1.75"
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Terrestrial MODIS LST Thermal Wave (Solid White) */}
          {earthLinePath && (
            <path
              d={earthLinePath}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Synchronized Vertical Cursor Hairline */}
          <line
            x1={cursorX}
            y1={Y_TOP}
            x2={cursorX}
            y2={Y_BOTTOM}
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Intersection Node on Earth Curve */}
          <circle
            cx={cursorX}
            cy={cursorEarthY}
            r={5}
            fill="#FFFFFF"
            stroke="#0A0A0C"
            strokeWidth="1.5"
          />

          {/* Intersection Node on NASA Target Curve */}
          <circle
            cx={cursorX}
            cy={cursorTargetY}
            r={5}
            fill="#0A0A0C"
            stroke="#A1A1AA"
            strokeWidth="2"
          />

          {/* Hour labels along bottom axis */}
          {[0, 3, 6, 9, 12, 15, 18, 21, 23].map((h) => (
            <text
              key={h}
              x={getX(h)}
              y={222}
              fill={h === selectedHour ? '#FFFFFF' : '#8E9299'}
              fontSize="9"
              fontFamily="monospace"
              fontWeight={h === selectedHour ? 'bold' : 'normal'}
              textAnchor="middle"
              className="tabular-nums"
            >
              {h.toString().padStart(2, '0')}:00
            </text>
          ))}
        </svg>
      </div>

      {/* ── 4. LIVE TELEMETRY & DYNAMIC THERMAL FATIGUE DIAGNOSTIC ──── */}
      <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
        {/* 4 Metric Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-white/[0.06]">
          {/* Metric 1 */}
          <div className="border-l first:border-l-0 border-white/[0.08] pl-3.5">
            <span className="font-mono text-[10px] text-[#8E9299] uppercase tracking-wider block mb-1">
              Hora Solar Local
            </span>
            <div className="font-mono text-sm font-bold text-[#F4F4F6] tabular-nums">
              {activeData.hourStr} h
            </div>
            <span className="text-[11px] text-[#8E9299] font-sans">
              {activeData.phaseLabel}
            </span>
          </div>

          {/* Metric 2 */}
          <div className="border-l border-white/[0.08] pl-3.5">
            <span className="font-mono text-[10px] text-[#8E9299] uppercase tracking-wider block mb-1">
              Superficie Terrestre (MODIS)
            </span>
            <div className="font-mono text-sm font-bold text-[#F4F4F6] tabular-nums">
              {activeData.earthTempK.toFixed(1)} K
            </div>
            <span className="text-[11px] text-[#8E9299] font-mono tabular-nums">
              {activeData.earthTempC > 0 ? '+' : ''}{activeData.earthTempC.toFixed(1)} °C
            </span>
          </div>

          {/* Metric 3 */}
          <div className="border-l border-white/[0.08] pl-3.5">
            <span className="font-mono text-[10px] text-[#8E9299] uppercase tracking-wider block mb-1">
              Superficie Destino ({targetBody})
            </span>
            <div className="font-mono text-sm font-bold text-[#A1A1AA] tabular-nums">
              {activeData.targetTempK.toFixed(1)} K
            </div>
            <span className="text-[11px] text-[#8E9299] font-mono tabular-nums">
              {activeData.targetTempC > 0 ? '+' : ''}{activeData.targetTempC.toFixed(1)} °C
            </span>
          </div>

          {/* Metric 4 */}
          <div className="border-l border-white/[0.08] pl-3.5">
            <span className="font-mono text-[10px] text-[#8E9299] uppercase tracking-wider block mb-1">
              Brecha Térmica Instantánea
            </span>
            <div className="font-mono text-sm font-bold text-[#F4F4F6] tabular-nums">
              ΔT {deltaInstantK.toFixed(1)} K
            </div>
            <span className="text-[11px] text-[#8E9299] font-sans">
              Desviación termodinámica
            </span>
          </div>
        </div>

        {/* Dynamic Hourly Thermal Diagnostic Line */}
        <div className="mt-3.5 pt-1 text-xs font-sans text-[#8E9299] flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0" />
          <p className="leading-relaxed">
            <strong className="text-[#F4F4F6] font-medium">Diagnóstico de fatiga térmica: </strong>
            {activeData.diagnostic}
          </p>
        </div>
      </div>
    </div>
  );
}
