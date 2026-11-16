import React, { useRef, useState, useEffect, useMemo } from 'react';

export interface ZenithSatelliteViewProps {
  lat: number;
  lng: number;
  zoom?: number;
  mode: 'imagery' | 'topo' | 'thermal';
  siteName?: string;
  elevM?: number;
  slopeDeg?: number;
  roughnessRms?: number;
  meanTempC?: number;
  scaleKm?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ZenithSatelliteView({
  lat,
  lng,
  zoom,
  mode,
  siteName = 'Sitio Análogo Terrestre',
  elevM = 1000,
  slopeDeg = 5.2,
  roughnessRms = 0.15,
  meanTempC = 18,
  scaleKm = 5,
  className = '',
  style = {},
}: ZenithSatelliteViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 420 });
  const [tileErrorMap, setTileErrorMap] = useState<Record<string, boolean>>({});

  // Active zoom level: 11 for topo, 12 for thermal, 11 for imagery (or overridden)
  const activeZoom = zoom ?? (mode === 'thermal' ? 12 : 11);

  // ResizeObserver to always fit exact container width and height
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({
            width: Math.round(width),
            height: Math.round(height),
          });
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute 2D tile layout covering container
  const tiles = useMemo(() => {
    const { width, height } = dimensions;
    const n = Math.pow(2, activeZoom);
    const rad = (lat * Math.PI) / 180;

    // Center coordinate in Web Mercator tile units
    const exactX = ((lng + 180.0) / 360.0) * n;
    const exactY =
      ((1.0 - Math.log(Math.tan(rad) + 1.0 / Math.cos(rad)) / Math.PI) / 2.0) * n;

    const centerPxX = exactX * 256.0;
    const centerPxY = exactY * 256.0;

    const topLeftPxX = centerPxX - width / 2.0;
    const topLeftPxY = centerPxY - height / 2.0;

    const startTx = Math.floor(topLeftPxX / 256.0);
    const endTx = Math.floor((topLeftPxX + width) / 256.0);
    const startTy = Math.floor(topLeftPxY / 256.0);
    const endTy = Math.floor((topLeftPxY + height) / 256.0);

    const list: {
      key: string;
      url: string;
      fallbackUrl: string;
      left: number;
      top: number;
    }[] = [];

    for (let tx = startTx; tx <= endTx; tx++) {
      for (let ty = startTy; ty <= endTy; ty++) {
        // Wrap longitude if outside world bounds
        const wrappedTx = ((tx % n) + n) % n;
        // Clamp latitude within world bounds
        const clampedTy = Math.max(0, Math.min(n - 1, ty));

        const left = Math.round(tx * 256.0 - topLeftPxX);
        const top = Math.round(ty * 256.0 - topLeftPxY);
        const key = `${activeZoom}/${clampedTy}/${wrappedTx}`;

        let url = '';
        let fallbackUrl = '';

        if (mode === 'topo') {
          url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${activeZoom}/${clampedTy}/${wrappedTx}`;
          fallbackUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/${activeZoom}/${clampedTy}/${wrappedTx}`;
        } else {
          // imagery or thermal
          url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${activeZoom}/${clampedTy}/${wrappedTx}`;
          fallbackUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${activeZoom}/${clampedTy}/${wrappedTx}`;
        }

        list.push({ key, url, fallbackUrl, left, top });
      }
    }

    return list;
  }, [lat, lng, activeZoom, mode, dimensions]);

  // Derived thermal bounds
  const meanTempK = Math.round(meanTempC + 273.15);
  const minTempK = meanTempK - 12;
  const maxTempK = meanTempK + 15;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#0A0C12] select-none ${className}`}
      style={style}
    >
      {/* ── BASE SATELLITE TILE GRID ──────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          filter:
            mode === 'thermal'
              ? 'contrast(1.25) brightness(0.92) saturate(1.1)'
              : mode === 'topo'
              ? 'contrast(1.05)'
              : 'none',
        }}
      >
        {tiles.map((tile) => {
          const hasError = tileErrorMap[tile.key];
          const src = hasError ? tile.fallbackUrl : tile.url;

          return (
            <img
              key={tile.key}
              src={src}
              alt=""
              loading="eager"
              decoding="async"
              className="absolute w-[256px] h-[256px] object-cover pointer-events-none"
              style={{
                left: `${tile.left}px`,
                top: `${tile.top}px`,
                width: '256px',
                height: '256px',
              }}
              onError={() => {
                if (!hasError) {
                  setTileErrorMap((prev) => ({ ...prev, [tile.key]: true }));
                }
              }}
            />
          );
        })}
      </div>

      {/* ── OVERLAY: MODE = TOPO (Curvas de nivel SVG + Vectores de Pendiente) ── */}
      {mode === 'topo' && (
        <>
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Concentric Topographic Contours centered on terrain */}
            <g transform={`translate(${dimensions.width / 2}, ${dimensions.height / 2})`}>
              {[30, 65, 100, 140, 185, 230, 280, 330].map((r, i) => {
                const isIndex = i % 2 === 0;
                // Generate deformed natural contour ring
                const pts: string[] = [];
                const steps = 36;
                for (let a = 0; a <= steps; a++) {
                  const angle = (a / steps) * Math.PI * 2;
                  const radOffset =
                    Math.sin(angle * 4 + r * 0.05) * 12 +
                    Math.cos(angle * 3) * 7 +
                    Math.sin(angle * 7) * 4;
                  const x = Math.cos(angle) * (r + radOffset) * 1.3;
                  const y = Math.sin(angle) * (r + radOffset) * 0.85;
                  pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
                }
                const d = `M ${pts.join(' L ')} Z`;

                return (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke={isIndex ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.22)'}
                    strokeWidth={isIndex ? 1.5 : 0.8}
                    strokeDasharray={isIndex ? 'none' : '4 3'}
                  />
                );
              })}

              {/* Slope Vectors (Down-gradient arrows) */}
              {[-180, -90, 0, 90, 180].map((x) =>
                [-120, 0, 120].map((y) => {
                  const dx = -x * 0.06;
                  const dy = -y * 0.06;
                  return (
                    <g key={`${x}_${y}`} transform={`translate(${x}, ${y})`}>
                      <line
                        x1="0"
                        y1="0"
                        x2={dx}
                        y2={dy}
                        stroke="rgba(255, 255, 255, 0.55)"
                        strokeWidth="1.2"
                      />
                      <circle cx={dx} cy={dy} r="2" fill="rgba(255, 255, 255, 0.7)" />
                    </g>
                  );
                })
              )}
            </g>
          </svg>

          {/* Topographic HUD Telemetry Strip */}
          <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-md px-4 py-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-white tabular-nums">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>USGS SRTM 30m DEM, Elevación base: {elevM.toLocaleString()} m</span>
            </div>
            <div className="text-[#8E9299]">
              Pendiente media: <strong className="text-white">{slopeDeg}°</strong>, Rugosidad RMS:{' '}
              <strong className="text-white">{roughnessRms}</strong>
            </div>
          </div>
        </>
      )}

      {/* ── OVERLAY: MODE = THERMAL (Retícula de coordenadas + Escala Kelvin) ── */}
      {mode === 'thermal' && (
        <>
          {/* Subtle Coordinate Graticule Grid */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <line x1="25%" y1="0" x2="25%" y2="100%" stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <line x1="75%" y1="0" x2="75%" y2="100%" stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
            <line x1="0" y1="33%" x2="100%" y2="33%" stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <line x1="0" y1="67%" x2="100%" y2="67%" stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
          </svg>

          {/* Central Aim Reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />
            </div>
          </div>

          {/* Coordinate Readout Top Left */}
          <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-md font-mono text-[10px] text-[#F4F4F6] border border-white/10 tabular-nums">
            {lat >= 0 ? `${lat.toFixed(4)}° N` : `${Math.abs(lat).toFixed(4)}° S`},{' '}
            {lng >= 0 ? `${lng.toFixed(4)}° E` : `${Math.abs(lng).toFixed(4)}° W`}
          </div>

          {/* Thermal Kelvin Scale Bar at Bottom */}
          <div className="absolute bottom-0 inset-x-0 bg-black/85 backdrop-blur-md px-4 py-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-white tabular-nums">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase text-[#8E9299] tracking-wider">
                MODIS LST / ASTER TIR:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#A1A1AA]">{minTempK} K</span>
                <div
                  className="w-24 sm:w-36 h-2 rounded-full overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(to right, #1E3A8A, #059669, #D97706, #DC2626, #F4F4F6)',
                  }}
                />
                <span className="text-[11px] text-[#F4F4F6] font-bold">{maxTempK} K</span>
              </div>
            </div>
            <div className="text-[11px] text-[#8E9299]">
              Media superficial: <strong className="text-white">{meanTempK} K ({meanTempC.toFixed(1)} °C)</strong>
            </div>
          </div>
        </>
      )}

      {/* ── OVERLAY: MODE = IMAGERY (Metric Scale Rule for Curtain Left) ── */}
      {mode === 'imagery' && (
        <>
          {/* Subtle Central Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-6 h-6 border-t border-b border-l border-r border-white/30 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </div>

          {/* Metric Scale Bar in Bottom-Left */}
          <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2.5 font-mono text-[10px] text-white pointer-events-none tabular-nums shadow-lg">
            <span>Escala terrestre: {scaleKm} km</span>
            <div className="w-14 h-1.5 bg-white border border-black/40 flex">
              <div className="w-1/2 h-full bg-[#0A0A0C]" />
              <div className="w-1/2 h-full bg-white" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
