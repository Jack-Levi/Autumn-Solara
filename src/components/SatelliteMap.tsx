import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { EarthSite, ExtraTerrestrialTarget } from '../data';
import { fidelityColor, fidelityLabel, calculatePFI } from '../data';

interface SatelliteMapProps {
  sites: EarthSite[];
  pfiScores: Record<string, number>;
  selectedSiteId: string;
  onSelectSite: (siteId: string) => void;
  activeTarget: ExtraTerrestrialTarget;
  onAddNewSite?: (newSite: EarthSite) => void;
}

type LayerMode = 'satellite' | 'topo';

interface DiscoveredScan {
  lat: number;
  lng: number;
  elevM: number;
  slopeDeg: number;
  aridityScore: number;
  mineralogy: string;
  pfi: number;
}

export default function SatelliteMap({
  sites,
  pfiScores,
  selectedSiteId,
  onSelectSite,
  activeTarget,
  onAddNewSite,
}: SatelliteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const scanMarkerRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<LayerMode>('satellite');
  const [scanModeActive, setScanModeActive] = useState<boolean>(false);
  const [currentScan, setCurrentScan] = useState<DiscoveredScan | null>(null);
  const [candidateSaved, setCandidateSaved] = useState<boolean>(false);

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // Initialize Leaflet Map with strict maxNativeZoom 13, maxZoom 14
  useEffect(() => {
    let isCancelled = false;

    const initMap = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      try {
        const L = (window as any).L || (await import('leaflet'));

        if (isCancelled || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
          center: [selectedSite ? selectedSite.lat : 20, selectedSite ? selectedSite.lng : 0],
          zoom: 3,
          minZoom: 2,
          maxZoom: 14, // Never exceed 14 to prevent "Map data not yet available"
          zoomControl: false,
          attributionControl: true,
        });

        // Esri World Imagery (MaxNativeZoom 13 avoids missing tile warnings)
        const satelliteLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxNativeZoom: 13,
            maxZoom: 14,
            attribution: 'Esri, Maxar, Earthstar Geographics, USDA, USGS',
          }
        );

        satelliteLayer.addTo(map);
        tileLayerRef.current = satelliteLayer;

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;
        mapInstanceRef.current = map;

        // Click on map when Discovery Scan Mode is active
        map.on('click', (e: any) => {
          handleMapClick(e.latlng.lat, e.latlng.lng, L);
        });

        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      } catch (err) {
        console.error('Error initializing Leaflet map:', err);
      }
    };

    initMap();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Map click handler for Discovery Scanner
  const handleMapClick = useCallback(
    (lat: number, lng: number, L: any) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Simulated satellite telemetry synthesis for clicked point
      const simulatedElev = Math.round(150 + Math.abs(lat * 38) + Math.abs(lng * 12) + (Math.sin(lat) * 600));
      const simulatedSlope = Math.round(4 + (Math.abs(Math.sin(lat * 4)) * 22) * 10) / 10;
      const aridity = Math.round(60 + Math.abs(Math.cos(lat)) * 38);
      const minerals = [
        'Basalto piroxénico con olivino y óxidos de titanio',
        'Costras evaporíticas de sulfatos con hematita',
        'Brecha volcánica con vidrio de impacto y plagioclasa',
        'Arenas de cuarzo ferrífero con percloratos dispersos',
      ];
      const selectedMin = minerals[Math.abs(Math.round(lat + lng)) % minerals.length];

      // Simulated feature vector
      const vector = {
        topography: Math.min(95, Math.max(50, Math.round(simulatedSlope * 3.5 + 40))),
        geology: Math.min(98, Math.max(55, Math.round(80 + (Math.cos(lng) * 15)))),
        environment: Math.min(98, Math.max(60, aridity)),
        resources: Math.min(95, Math.max(40, Math.round(60 + (Math.sin(lat) * 30)))),
      };

      // Calculate real-time PFI against active target
      const t = Math.max(0, 100 - Math.abs(vector.topography - activeTarget.vector.topography));
      const g = Math.max(0, 100 - Math.abs(vector.geology - activeTarget.vector.geology));
      const env = Math.max(0, 100 - Math.abs(vector.environment - activeTarget.vector.environment));
      const res = Math.max(0, 100 - Math.abs(vector.resources - activeTarget.vector.resources));
      const pfiScore = Math.round((t * 0.25 + g * 0.25 + env * 0.25 + res * 0.25) * 10) / 10;

      setCurrentScan({
        lat: Math.round(lat * 1000) / 1000,
        lng: Math.round(lng * 1000) / 1000,
        elevM: simulatedElev,
        slopeDeg: simulatedSlope,
        aridityScore: aridity,
        mineralogy: selectedMin,
        pfi: pfiScore,
      });
      setCandidateSaved(false);

      // Render or move animated radar scan ring on map
      if (scanMarkerRef.current) {
        map.removeLayer(scanMarkerRef.current);
      }

      const scanIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 44px; height: 44px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #FF4D24; animation: pulseRing 1.5s ease-out infinite;"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #FF4D24; box-shadow: 0 0 12px #FF4D24;"></div>
          </div>
        `,
        className: 'discovery-scan-ping',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      scanMarkerRef.current = L.marker([lat, lng], { icon: scanIcon }).addTo(map);
    },
    [activeTarget]
  );

  // Switch Layer
  const switchLayer = useCallback(async (mode: LayerMode) => {
    setActiveLayer(mode);
    const map = mapInstanceRef.current;
    if (!map) return;

    const L = (window as any).L || (await import('leaflet'));

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mode === 'satellite') {
      const sat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxNativeZoom: 13,
          maxZoom: 14,
          attribution: 'Esri, Maxar, Earthstar Geographics',
        }
      );
      sat.addTo(map);
      tileLayerRef.current = sat;
    } else {
      const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 14,
        maxZoom: 14,
        attribution: 'OpenTopoMap (CC-BY-SA)',
      });
      topo.addTo(map);
      tileLayerRef.current = topo;
    }
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    sites.forEach((site) => {
      const isSelected = site.id === selectedSiteId;
      const score = pfiScores[site.id] || 75;
      const color = fidelityColor(score);

      const L = (window as any).L;
      if (!L) return;

      const markerHtml = `
        <div style="cursor: none; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center;">
          <div style="
            width: ${isSelected ? '36px' : '26px'};
            height: ${isSelected ? '36px' : '26px'};
            border-radius: 50%;
            background: ${color}26;
            border: 2px solid ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: ${isSelected ? `0 0 24px ${color}` : 'none'};
            transition: all 0.3s ease;
          ">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
          </div>
          <div style="
            margin-top: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            font-weight: 700;
            color: #FFFFFF;
            background: rgba(15,16,21,0.88);
            backdrop-filter: blur(8px);
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid rgba(255,255,255,0.15);
            white-space: nowrap;
          ">
            ${site.id} · <span style="color: ${color};">${Math.round(score)}%</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-satellite-pin',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([site.lat, site.lng], { icon: customIcon });

      marker.on('click', () => {
        onSelectSite(site.id);
        // Zoom 11 guarantees crisp imagery with ZERO "Map data not yet available"
        map.flyTo([site.lat, site.lng], 11, { duration: 1.8 });
      });

      markersGroup.addLayer(marker);
    });
  }, [sites, pfiScores, selectedSiteId, onSelectSite]);

  // FlyTo site (fixed to zoom 11)
  const flyToSite = useCallback((site: EarthSite) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([site.lat, site.lng], 11, { duration: 1.8 });
  }, []);

  // Save Discovered Site
  const handleSaveCandidate = () => {
    if (!currentScan || !onAddNewSite) return;

    const newId = `DISC-${Math.floor(100 + Math.random() * 899)}`;
    const newSite: EarthSite = {
      id: newId,
      name: `Candidato Satelital [${currentScan.lat}°, ${currentScan.lng}°]`,
      country: 'Descubrimiento Satelital',
      region: 'Zona Gris Mapeada',
      lat: currentScan.lat,
      lng: currentScan.lng,
      dms: `${Math.abs(currentScan.lat).toFixed(2)}° ${currentScan.lat >= 0 ? 'N' : 'S'}, ${Math.abs(currentScan.lng).toFixed(2)}° ${currentScan.lng >= 0 ? 'E' : 'W'}`,
      elevM: currentScan.elevM,
      biome: 'Hiperárido',
      charLevel: 'Bajo',
      isCandidate: true,
      meanTempC: 14.5,
      tempMinC: -5,
      tempMaxC: 38,
      precipMm: 45,
      humidityPct: 15,
      slopeDeg: currentScan.slopeDeg,
      roughnessRms: 0.35,
      uvPeak: 12.5,
      solarWpm2: 980,
      pressureHpa: 890,
      mineralogy: currentScan.mineralogy,
      petrology: 'Sustrato detectado por clasificación espectral satelital NASA',
      summary: `Nuevo sitio análogo identificado en tiempo real mediante telemetría orbital. Presenta concordancia morfométrica de pendiente y reflectancia mineral con ${activeTarget.name}.`,
      grayZone: 'Sitio sin expediciones de campo previas pero con alto potencial según datos ASTER y SRTM.',
      protocols: [
        { code: `PRT-${newId}-CAL`, title: 'Calibración de Sensores In-Situ', trl: 'TRL-5', domain: 'Sensors', desc: 'Validación en tierra de parámetros de reflectancia orbital.' },
      ],
      vector: {
        topography: Math.round(currentScan.slopeDeg * 3.5 + 40),
        geology: 85,
        environment: currentScan.aridityScore,
        resources: 60,
      },
      radar: {
        morphology: 85,
        mineralogy: 80,
        temperature: 75,
        aridity: 90,
        radiation: 80,
        isru: 65,
      },
      topo: [
        { distKm: 0, elevM: currentScan.elevM + 30 },
        { distKm: 5, elevM: currentScan.elevM },
        { distKm: 10, elevM: currentScan.elevM - 20 },
      ],
      photoEarth: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      photoSpace: activeTarget.body === 'Luna' ? 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
      photoEarthCaption: 'Candidato Satelital Descubierto',
      photoSpaceCaption: `Objetivo Homólogo: ${activeTarget.name}`,
      inspectionGallery: [
        { title: 'Telemetría Satelital', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', caption: 'Coordenadas escaneadas' },
      ],
    };

    onAddNewSite(newSite);
    setCandidateSaved(true);
  };

  return (
    <section id="satellite-section" className="section-dark cross-grid-dark py-24 px-6 relative select-none">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span
              className="font-mono uppercase tracking-widest block mb-3 text-[#6B6F7B]"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              03 — EXPLORADOR SATELITAL // USGS & NASA OPEN DATA
            </span>
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(32px, 4vw, 44px)',
                color: '#E8E8EC',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Vista orbital de alta resolución
            </h2>
            <p className="text-[#6B6F7B] text-base mt-2 max-w-xl font-light">
              Imágenes satelitales reales sin restricciones de API Key. Haz clic en cualquier análogo para sobrevolar su terreno o activa el escáner para descubrir nuevos sitios.
            </p>
          </div>

          {/* Layer and Discovery Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => switchLayer('satellite')}
              className={`pill-btn pill-btn-dark ${activeLayer === 'satellite' ? 'border-[#2544FF] text-[#2544FF]' : ''}`}
            >
              <span>Vista Satelital (Esri)</span>
            </button>

            <button
              onClick={() => switchLayer('topo')}
              className={`pill-btn pill-btn-dark ${activeLayer === 'topo' ? 'border-[#2544FF] text-[#2544FF]' : ''}`}
            >
              <span>Relieve Topográfico</span>
            </button>

            {/* Discovery Scanner Toggle Button */}
            <button
              onClick={() => setScanModeActive(!scanModeActive)}
              className={`pill-btn ${
                scanModeActive
                  ? 'bg-[#FF4D24] text-white border-[#FF4D24] shadow-lg shadow-[#FF4D24]/30'
                  : 'pill-btn-dark text-[#FF4D24] border-[#FF4D24]/40 hover:border-[#FF4D24]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span>{scanModeActive ? 'ESCANEANDO (HAZ CLIC EN EL MAPA)' : 'ESCANEAR NUEVA COORDENADA'}</span>
            </button>
          </div>
        </div>

        {/* Map Viewport Container */}
        <div className="relative rounded-3xl overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[#050508] shadow-2xl h-[75vh] min-h-[500px]">
          <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

          {/* HUD Overlay */}
          <div className="absolute top-6 left-6 z-10 pointer-events-none flex flex-col gap-3">
            <div className="bg-[#0F1015]/85 backdrop-blur-md border border-[rgba(255,255,255,0.08)] px-4 py-2 rounded-full font-mono text-xs text-[#E8E8EC] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#2544FF] animate-pulse" />
              <span>SITIO ACTIVO: <strong className="text-white">{selectedSite.id} — {selectedSite.name}</strong></span>
              <span className="text-[#6B6F7B]">|</span>
              <span className="text-[#6B6F7B]">{selectedSite.dms}</span>
            </div>

            {scanModeActive && (
              <div className="bg-[#FF4D24]/15 backdrop-blur-md border border-[#FF4D24]/40 px-4 py-2 rounded-full font-mono text-xs text-[#FF4D24] font-bold flex items-center gap-2">
                <span className="animate-spin text-sm leading-none">✛</span>
                <span>MODO DESCUBRIMIENTO ACTIVO: HAZ CLIC EN CUALQUIER PUNTO DE LA TIERRA</span>
              </div>
            )}
          </div>

          {/* Scan Results Card if a point is clicked */}
          {currentScan && (
            <div className="absolute top-6 right-6 z-20 bg-[#0F1015]/95 backdrop-blur-xl border border-[#FF4D24]/50 rounded-2xl p-5 max-w-sm shadow-2xl font-mono text-xs text-[#E8E8EC]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                <span className="text-[#FF4D24] font-bold uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF4D24]" />
                  COORDENADA ESCANEADA
                </span>
                <button
                  onClick={() => setCurrentScan(null)}
                  className="text-[#6B6F7B] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-[#6B6F7B]">Latitud / Longitud:</span>
                  <strong className="text-white">{currentScan.lat}°, {currentScan.lng}°</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6F7B]">Elevación SRTM:</span>
                  <strong className="text-white">{currentScan.elevM} m s.n.m.</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6F7B]">Pendiente Media:</span>
                  <strong className="text-white">{currentScan.slopeDeg}°</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6F7B]">Fidelidad PFI vs {activeTarget.name.split(' ')[0]}:</span>
                  <strong className="text-[#2544FF] text-sm">{currentScan.pfi}%</strong>
                </div>
                <div className="pt-2 border-t border-white/10 text-[10px] text-[#8E929F]">
                  <strong className="text-[#6B6F7B] block mb-0.5">MINERALOGÍA ESTIMADA:</strong>
                  {currentScan.mineralogy}
                </div>
              </div>

              <button
                onClick={handleSaveCandidate}
                disabled={candidateSaved}
                className={`w-full py-2.5 rounded-full font-bold uppercase text-[11px] transition-all flex items-center justify-center gap-2 ${
                  candidateSaved
                    ? 'bg-emerald-500 text-white cursor-default'
                    : 'bg-[#FF4D24] hover:bg-[#e03f19] text-white shadow-md'
                }`}
              >
                <span>{candidateSaved ? '✓ GUARDADO EN LA GALERÍA' : '+ GUARDAR NUEVO SITIO DESCUBIERTO'}</span>
              </button>
            </div>
          )}

          {/* Bottom Quick Jump Bar */}
          <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
            {sites.map((site) => {
              const isCur = site.id === selectedSiteId;
              const score = pfiScores[site.id] || 75;
              return (
                <button
                  key={site.id}
                  onClick={() => {
                    onSelectSite(site.id);
                    flyToSite(site);
                  }}
                  className={`shrink-0 px-3.5 py-2 rounded-full font-mono text-xs transition-all flex items-center gap-2 shadow-lg ${
                    isCur
                      ? 'bg-[#2544FF] text-white font-bold'
                      : 'bg-[#0F1015]/85 text-[#8E929F] hover:text-white border border-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  <span>{site.id}</span>
                  <span className="opacity-80 text-[10px]">{site.country}</span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: fidelityColor(score) }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
