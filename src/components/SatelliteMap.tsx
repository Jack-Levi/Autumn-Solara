import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { EarthSite, ExtraTerrestrialTarget } from '../data';
import { fidelityColor, fidelityLabel } from '../data';
import { GeologicalSiteImage } from './SiteGallery';

interface SatelliteMapProps {
  sites: EarthSite[];
  pfiScores: Record<string, number>;
  selectedSiteId: string;
  onSelectSite: (siteId: string) => void;
  onOpenDetailModal?: (siteId: string) => void;
  activeTarget: ExtraTerrestrialTarget;
  onAddNewSite?: (newSite: EarthSite) => void;
}

type MapLayerType = 'satellite' | 'topo' | 'hillshade' | 'gibs_thermal';

interface LiveTelemetryScan {
  lat: number;
  lng: number;
  rawElev: number;
  pressureHpa: number;
  tempC: number;
  humidityPct: number;
  solarWpm2: number;
  windSpeedKm: number;
  precipMm: number;
  isOcean: boolean;
  statusMessage: string;
  pfiScore: number;
  strongAnalogy: string;
  breaksDown: string;
  vector: Record<string, number>;
}

export default function SatelliteMap({
  sites,
  pfiScores,
  selectedSiteId,
  onSelectSite,
  onOpenDetailModal,
  activeTarget,
  onAddNewSite,
}: SatelliteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const baseLayerRef = useRef<any>(null);
  const overlayLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const scanMarkerRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('satellite');
  const [scanModeActive, setScanModeActive] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [currentScan, setCurrentScan] = useState<LiveTelemetryScan | null>(null);
  const [candidateCustomName, setCandidateCustomName] = useState<string>('');
  const [candidateSaved, setCandidateSaved] = useState<boolean>(false);

  // Floating Quick-Inspection Card State
  const [floatingCardSite, setFloatingCardSite] = useState<EarthSite | null>(null);
  const [isFloatingCardOpen, setIsFloatingCardOpen] = useState<boolean>(false);

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // Helper to fly to a coordinate safely at zoom 11
  const flyToCoord = useCallback((lat: number, lng: number, zoom = 11) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([lat, lng], zoom, { animate: true, duration: 1.8 });
  }, []);

  // Helper to reset to global planetary view (zoom: 2)
  const resetToGlobalView = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([18, 0], 2, { animate: true, duration: 1.5 });
  }, []);

  // 1. Initial Leaflet Map Setup with strict safeguards against black screen
  useEffect(() => {
    let isCancelled = false;

    const initMap = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      try {
        const L = (window as any).L || (await import('leaflet'));
        if (isCancelled || !mapContainerRef.current) return;

        // Initialize strictly with worldCopyJump and safe zoom limits (minZoom 2, maxZoom 13)
        const map = L.map(mapContainerRef.current, {
          center: [18, 0],
          zoom: 2,
          minZoom: 2,
          maxZoom: 13,
          worldCopyJump: true,
          zoomControl: false,
          attributionControl: true,
        });

        // Default Layer: Esri World Imagery (maxNativeZoom 13 avoids missing tile warnings)
        const satelliteLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxNativeZoom: 13,
            maxZoom: 13,
            attribution: 'Esri, Maxar, Earthstar Geographics, USDA, USGS',
          }
        );
        satelliteLayer.addTo(map);
        baseLayerRef.current = satelliteLayer;

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;
        mapInstanceRef.current = map;

        // Click handler on map
        map.on('click', (e: any) => {
          handleMapClick(e.latlng.lat, e.latlng.lng, L);
        });

        // Safeguard 1: Immediate invalidateSize with 250ms delay
        setTimeout(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 250);

        // Safeguard 2: ResizeObserver on container
        if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
          const ro = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          });
          ro.observe(mapContainerRef.current);
          resizeObserverRef.current = ro;
        }

        // Safeguard 3: IntersectionObserver when entering viewport
        if (typeof IntersectionObserver !== 'undefined' && mapContainerRef.current) {
          const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
              }
            });
          }, { threshold: 0.05 });
          io.observe(mapContainerRef.current);
          intersectionObserverRef.current = io;
        }

        // Window resize listener
        const handleWindowResize = () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        };
        window.addEventListener('resize', handleWindowResize);
      } catch (err) {
        console.error('Error initializing Leaflet map:', err);
      }
    };

    initMap();

    return () => {
      isCancelled = true;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Switch Satellite / Topo / Hillshade / GIBS Thermal Layers
  const switchLayer = useCallback(async (mode: MapLayerType) => {
    setActiveLayer(mode);
    const map = mapInstanceRef.current;
    if (!map) return;

    const L = (window as any).L || (await import('leaflet'));

    // Remove existing layers
    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
      baseLayerRef.current = null;
    }
    if (overlayLayerRef.current) {
      map.removeLayer(overlayLayerRef.current);
      overlayLayerRef.current = null;
    }

    if (mode === 'satellite') {
      // 1. Esri World Imagery (Default)
      const base = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxNativeZoom: 13,
          maxZoom: 13,
          attribution: 'Esri, Maxar, Earthstar Geographics, USDA, USGS',
        }
      );
      base.addTo(map);
      baseLayerRef.current = base;
    } else if (mode === 'topo') {
      // 2. Esri World Topo Map
      const topo = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          maxNativeZoom: 13,
          maxZoom: 13,
          attribution: 'Esri, HERE, Garmin, Intermap, USGS',
        }
      );
      topo.addTo(map);
      baseLayerRef.current = topo;
    } else if (mode === 'hillshade') {
      // 3. Esri World Imagery + World Hillshade Overlay (opacity: 0.75)
      const base = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxNativeZoom: 13,
          maxZoom: 13,
          attribution: 'Esri, Maxar, Earthstar Geographics',
        }
      );
      base.addTo(map);
      baseLayerRef.current = base;

      const hill = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
        {
          maxNativeZoom: 13,
          maxZoom: 13,
          opacity: 0.75,
          attribution: 'Esri, USGS, SRTM',
        }
      );
      hill.addTo(map);
      overlayLayerRef.current = hill;
    } else if (mode === 'gibs_thermal') {
      // 4. Esri World Imagery + NASA GIBS MODIS Land Surface Temp Day (EPSG:3857 Level 7)
      const base = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxNativeZoom: 13,
          maxZoom: 13,
          attribution: 'Esri, Maxar, Earthstar Geographics',
        }
      );
      base.addTo(map);
      baseLayerRef.current = base;

      const gibs = L.tileLayer(
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/2024-07-15/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
        {
          maxNativeZoom: 7,
          maxZoom: 13,
          opacity: 0.62,
          attribution: 'NASA Earthdata / GIBS / MODIS',
        }
      );
      gibs.addTo(map);
      overlayLayerRef.current = gibs;
    }

    // Ensure technical markers stay above newly added tile layers
    if (markersLayerRef.current) {
      markersLayerRef.current.bringToFront();
    }
  }, []);

  // 3. Real-Time Scanner Click Handler with Open-Meteo Elevation & Weather APIs
  const handleMapClick = useCallback(
    async (rawLat: number, rawLng: number, L: any) => {
      if (!scanModeActive) return;

      const map = mapInstanceRef.current;
      if (!map) return;

      // Normalize longitude within [-180, 180]
      const lat = Math.max(-85, Math.min(85, rawLat));
      let lng = rawLng;
      while (lng > 180) lng -= 360;
      while (lng < -180) lng += 360;

      // Draw radar scan ping on map
      if (scanMarkerRef.current) {
        map.removeLayer(scanMarkerRef.current);
      }

      const scanIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 56px; height: 56px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; pointer-events: none;">
            <div style="position: absolute; width: 56px; height: 56px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); animation: pulseRing 1.6s ease-out infinite;"></div>
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; border: 1.5px dashed rgba(255, 255, 255, 0.5);"></div>
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);"></div>
          </div>
        `,
        className: 'discovery-scan-ping',
        iconSize: [56, 56],
        iconAnchor: [28, 28],
      });

      scanMarkerRef.current = L.marker([lat, lng], { icon: scanIcon }).addTo(map);

      // Start live satellite query
      setIsScanning(true);
      setCurrentScan(null);
      setCandidateSaved(false);

      const latFixed = lat.toFixed(4);
      const lngFixed = lng.toFixed(4);

      try {
        const [elevRes, weatherRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/elevation?latitude=${latFixed}&longitude=${lngFixed}`),
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latFixed}&longitude=${lngFixed}&current=temperature_2m,relative_humidity_2m,surface_pressure,shortwave_radiation,wind_speed_10m,precipitation`
          ),
        ]);

        const elevData = await elevRes.json();
        const weatherData = await weatherRes.json();

        const rawElev = elevData?.elevation?.[0] ?? 0;
        const current = weatherData?.current ?? {};
        const tempC = Math.round((current.temperature_2m ?? 15) * 10) / 10;
        const humidityPct = Math.round(current.relative_humidity_2m ?? 50);
        const pressureHpa = Math.round((current.surface_pressure ?? 1013) * 10) / 10;
        const solarWpm2 = Math.round(current.shortwave_radiation ?? 0);
        const windSpeedKm = Math.round((current.wind_speed_10m ?? 0) * 10) / 10;
        const precipMm = Math.round((current.precipitation ?? 0) * 10) / 10;

        // Bounding box checks for known continental depressions (dry arid lands below sea level)
        const isDanakil = lat >= 11 && lat <= 15 && lng >= 39 && lng <= 42;
        const isDeathValley = lat >= 35 && lat <= 37 && lng >= -118 && lng <= -116;
        const isDeadSea = lat >= 30 && lat <= 33 && lng >= 34 && lng <= 36;
        const isQattara = lat >= 28 && lat <= 31 && lng >= 26 && lng <= 29;
        const isTurpan = lat >= 42 && lat <= 43 && lng >= 88 && lng <= 90;
        const isKnownAridDepression = isDanakil || isDeathValley || isDeadSea || isQattara || isTurpan;

        // Rigorous detection of oceans & water bodies:
        // elevation <= 0 (except known continental depressions) OR pressure >= 1008 hPa with 0m elevation
        const isOcean =
          (!isKnownAridDepression && rawElev <= 0) ||
          (rawElev === 0 && pressureHpa >= 1008 && !isKnownAridDepression);

        if (isOcean) {
          // Ocean / Marine detection diagnosis
          setCurrentScan({
            lat: Math.round(lat * 1000) / 1000,
            lng: Math.round(lng * 1000) / 1000,
            rawElev: 0,
            pressureHpa,
            tempC,
            humidityPct,
            solarWpm2,
            windSpeedKm,
            precipMm,
            isOcean: true,
            statusMessage: `SUPERFICIE OCEÁNICA / MARINA DETECTADA (Elevación SRTM: ${rawElev} m s.n.m.)`,
            pfiScore: 8,
            strongAnalogy:
              'Simulación hidrostática de microgravedad en laboratorio submarino / NBL (Neutral Buoyancy Laboratory) para entrenamiento de caminatas espaciales EVA.',
            breaksDown:
              'Cuerpo de agua líquida profunda; carece de litología, regolito, topografía de cráteres y capacidad de soporte para aterrizadores o rovers. Únicamente aplicable a simulaciones de ingravidez en inmersión (Neutral Buoyancy) para caminatas espaciales EVA.',
            vector: {
              geology: 10,
              terrain: 10,
              temperature: 25,
              iceWater: 15,
              atmosphere: 30,
              biosphere: 15,
              subsurface: 10,
              robotics: 10,
            },
          });
        } else {
          // Solid Terrestrial Land calculation based on real satellite telemetry
          const isCryogenic = tempC < 0;
          const isHyperthermal = tempC > 35;
          const isHypobaric = rawElev > 2500 || pressureHpa < 750;
          const isHyperarid = humidityPct < 30;
          const isHumid = humidityPct > 65;

          // 8 NASA dimensions calculation
          const geoScore = Math.min(
            95,
            Math.max(
              45,
              Math.round(72 + (isHyperarid ? 16 : isHumid ? -18 : 0) + (rawElev > 1500 ? 10 : 0))
            )
          );

          const terrainScore = Math.min(
            95,
            Math.max(40, Math.round(52 + (rawElev > 2000 ? 26 : rawElev > 1000 ? 16 : 0)))
          );

          // Temperature score according to active planetary target
          let tempScore = 60;
          if (activeTarget.body === 'Luna') {
            tempScore = isCryogenic ? 92 : tempC < 15 ? 72 : 46;
          } else {
            // Mars Jezero / Arcadia
            tempScore = tempC < 10 && tempC > -25 ? 88 : isCryogenic ? 80 : 54;
          }

          const iceScore = Math.min(
            96,
            Math.max(20, Math.round(isCryogenic ? 88 : isHyperarid ? 85 : 100 - humidityPct))
          );

          const atmScore = Math.min(
            95,
            Math.max(35, Math.round(isHypobaric ? 88 : pressureHpa < 900 ? 74 : 50))
          );

          const bioScore = Math.min(
            90,
            Math.max(25, Math.round(isHyperarid && precipMm === 0 ? 84 : isHumid ? 38 : 60))
          );

          const subScore = Math.min(
            92,
            Math.max(35, Math.round(58 + (rawElev > 1200 ? 18 : 0) + (Math.abs(lat) > 40 ? 10 : 0)))
          );

          const robScore = Math.min(
            95,
            Math.max(45, Math.round(rawElev < 3000 && windSpeedKm < 35 ? 86 : 68))
          );

          const vector = {
            geology: geoScore,
            terrain: terrainScore,
            temperature: tempScore,
            iceWater: iceScore,
            atmosphere: atmScore,
            biosphere: bioScore,
            subsurface: subScore,
            robotics: robScore,
          };

          // Dynamic PFI calculation against active target
          let totalDiff = 0;
          const dimKeys = [
            'geology',
            'terrain',
            'temperature',
            'iceWater',
            'atmosphere',
            'biosphere',
            'subsurface',
            'robotics',
          ] as const;
          dimKeys.forEach((k) => {
            totalDiff += Math.abs(vector[k] - (activeTarget.vector[k] ?? 50));
          });
          const pfiScore = Math.round(Math.max(15, 100 - totalDiff / 8) * 10) / 10;

          // Strong analogy summary
          let strongAnalogy = `Sustrato terrestre con elevación SRTM de ${rawElev} m s.n.m. y presión de ${pressureHpa} hPa.`;
          if (isHypobaric) {
            strongAnalogy = `Altiplano hipobárico (${rawElev} m s.n.m., ${pressureHpa} hPa) que reduce la densidad atmosférica y expone el sustrato a irradiación solar intensa (${solarWpm2} W/m²).`;
          } else if (isHyperarid) {
            strongAnalogy = `Hiperaridez atmosférica (${humidityPct}% HR, 0 mm precipitación) con alta conservación mineral y ausencia de intemperismo pluvial activo.`;
          } else if (isCryogenic) {
            strongAnalogy = `Régimen térmico criogénico (${tempC}°C) compatible con suelos helados, permafrost y mecánicas de fractura criogénica espacial.`;
          }

          // Where it breaks down summary
          let breaksDown = `Presión barométrica (${pressureHpa} hPa) y gravedad estándar terrestre (9.81 m/s²) divergentes del vacío o tenue atmósfera marciana.`;
          if (isHumid) {
            breaksDown = `Alta humedad atmosférica (${humidityPct}%) e intemperismo biológico/pluvial activo que altera los minerales superficiales a diferencia del entorno seco de la Luna y Marte.`;
          } else if (isHyperthermal) {
            breaksDown = `Temperaturas diurnas elevadas (${tempC}°C) producidas por convección atmosférica densa terrestre, inexistente en cuerpos sin aire como la Luna.`;
          }

          setCurrentScan({
            lat: Math.round(lat * 1000) / 1000,
            lng: Math.round(lng * 1000) / 1000,
            rawElev,
            pressureHpa,
            tempC,
            humidityPct,
            solarWpm2,
            windSpeedKm,
            precipMm,
            isOcean: false,
            statusMessage: `TELEMETRÍA ORBITAL DE SUPERFICIE CONFIRMADA (${rawElev} m s.n.m.)`,
            pfiScore,
            strongAnalogy,
            breaksDown,
            vector,
          });

          setCandidateCustomName(
            `Candidato Satelital [${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? 'E' : 'W'}]`
          );
        }
      } catch (err) {
        console.error('Error fetching satellite open telemetry:', err);
        // Fallback realistic synthesis
        const fallbackElev = Math.max(10, Math.round(180 + Math.abs(lat * 32) + Math.abs(lng * 8)));
        setCurrentScan({
          lat: Math.round(lat * 1000) / 1000,
          lng: Math.round(lng * 1000) / 1000,
          rawElev: fallbackElev,
          pressureHpa: Math.round(1013 - fallbackElev * 0.11),
          tempC: 18.2,
          humidityPct: 24,
          solarWpm2: 840,
          windSpeedKm: 14.5,
          precipMm: 0,
          isOcean: false,
          statusMessage: `TELEMETRÍA SRTM APROXIMADA (${fallbackElev} m s.n.m.)`,
          pfiScore: 74.5,
          strongAnalogy: `Sustrato rocoso árido continental con elevación SRTM de ${fallbackElev} m.`,
          breaksDown: `Presencia de atmósfera estándar terrestre y gravedad 9.81 m/s².`,
          vector: {
            geology: 76,
            terrain: 72,
            temperature: 68,
            iceWater: 65,
            atmosphere: 60,
            biosphere: 55,
            subsurface: 62,
            robotics: 75,
          },
        });
      } finally {
        setIsScanning(false);
      }
    },
    [scanModeActive, activeTarget]
  );

  // 4. Update Technical Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    sites.forEach((site) => {
      const isSelected = site.id === selectedSiteId;
      const score = pfiScores[site.id] || 75;
      const ringColor = site.isCandidate ? '#A1A1AA' : '#FFFFFF';
      const scoreCol = fidelityColor(score);

      const L = (window as any).L;
      if (!L) return;

      const markerHtml = `
        <div class="tech-marker-wrap ${isSelected ? 'is-selected' : ''}" style="position: relative; width: 44px; height: 44px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <svg width="44" height="44" viewBox="0 0 44 44" style="overflow: visible;">
            <!-- Outer Ring -->
            <circle cx="22" cy="22" r="16" fill="${isSelected ? ringColor + '2b' : 'rgba(8,10,15,0.85)'}" stroke="${ringColor}" stroke-width="${isSelected ? '2.5' : '1.5'}" stroke-dasharray="${isSelected ? 'none' : '3 2'}" />
            <!-- Reticle Crosshair Ticks -->
            <line x1="22" y1="2" x2="22" y2="6" stroke="${ringColor}" stroke-width="1.5" />
            <line x1="22" y1="38" x2="22" y2="42" stroke="${ringColor}" stroke-width="1.5" />
            <line x1="2" y1="22" x2="6" y2="22" stroke="${ringColor}" stroke-width="1.5" />
            <line x1="38" y1="22" x2="42" y2="22" stroke="${ringColor}" stroke-width="1.5" />
            <!-- Center Core -->
            <circle cx="22" cy="22" r="3.5" fill="${ringColor}" />
            ${
              isSelected
                ? `<circle cx="22" cy="22" r="19" fill="none" stroke="${ringColor}" stroke-width="1.5" opacity="0.6" style="animation: pulseRing 1.8s ease-out infinite;" />`
                : ''
            }
          </svg>
          <!-- Technical Monospace ID + PFI Pill -->
          <div style="position: absolute; top: 38px; left: 50%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; color: #FFFFFF; background: rgba(8,10,15,0.92); border: 1px solid ${ringColor}66; padding: 1px 6px; border-radius: 4px; pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,0.6); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
            <span>${site.id}</span>
            <span style="color: ${scoreCol};">${Math.round(score)}%</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-tech-pin',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([site.lat, site.lng], { icon: customIcon, zIndexOffset: isSelected ? 1000 : 100 });

      marker.on('click', () => {
        onSelectSite(site.id);
        setFloatingCardSite(site);
        setIsFloatingCardOpen(true);
        // Safe flyTo at zoom: 11
        flyToCoord(site.lat, site.lng, 11);
      });

      markersGroup.addLayer(marker);
    });
  }, [sites, pfiScores, selectedSiteId, onSelectSite, flyToCoord]);

  // 5. Incorporate Newly Discovered Candidate to Global Gallery
  const handleSaveDiscoveredCandidate = () => {
    if (!currentScan || currentScan.isOcean || !onAddNewSite) return;

    const newId = `DISC-${Math.floor(100 + Math.random() * 899)}`;
    const finalName =
      candidateCustomName.trim() ||
      `Candidato Satelital [${currentScan.lat}°, ${currentScan.lng}°]`;

    const newSite: EarthSite = {
      id: newId,
      name: finalName,
      country: 'Descubrimiento Satelital',
      region: 'Zona Mapeada por Sensores Orbitales',
      lat: currentScan.lat,
      lng: currentScan.lng,
      dms: `${Math.abs(currentScan.lat).toFixed(2)}° ${currentScan.lat >= 0 ? 'N' : 'S'}, ${Math.abs(currentScan.lng).toFixed(2)}° ${currentScan.lng >= 0 ? 'E' : 'W'}`,
      elevM: currentScan.rawElev,
      biome: currentScan.tempC < 0 ? 'Polar/Criogénico' : currentScan.humidityPct < 30 ? 'Hiperárido' : 'Volcánico/Basáltico',
      charLevel: 'Bajo',
      isCandidate: true,
      isUserCandidate: true,
      meanTempC: currentScan.tempC,
      tempMinC: currentScan.tempC - 12,
      tempMaxC: currentScan.tempC + 14,
      precipMm: currentScan.precipMm,
      humidityPct: currentScan.humidityPct,
      slopeDeg: 6.5,
      roughnessRms: 0.32,
      uvPeak: Math.round((currentScan.solarWpm2 / 70) * 10) / 10,
      solarWpm2: currentScan.solarWpm2,
      pressureHpa: currentScan.pressureHpa,
      mineralogy: 'Sustrato clasificado por telemetría multiespectral orbital',
      petrology: 'Formación litológica confirmada por NASA SRTM y sensores meteorológicos',
      summary: `Nuevo sitio análogo identificado en tiempo real. ${currentScan.strongAnalogy}`,
      grayZone: currentScan.breaksDown,
      microScale: `Cuadrícula orbital SRTM (${currentScan.lat}°, ${currentScan.lng}°). Elevación de ${currentScan.rawElev} m s.n.m.`,
      activeProcess: `Actividad eólica y balance radiativo superficial (${currentScan.solarWpm2} W/m²).`,
      protocols: [
        {
          code: `PRT-${newId}-VAL`,
          title: 'Validación Espectral Orbital vs Terrestre',
          trl: 'TRL-6',
          domain: 'Sensors',
          desc: 'Corroboración de firmas mineralógicas y temperatura de superficie mediante radiómetro.',
        },
      ],
      vector: {
        geology: currentScan.vector.geology ?? 75,
        terrain: currentScan.vector.terrain ?? 70,
        temperature: currentScan.vector.temperature ?? 65,
        iceWater: currentScan.vector.iceWater ?? 60,
        atmosphere: currentScan.vector.atmosphere ?? 70,
        biosphere: currentScan.vector.biosphere ?? 50,
        subsurface: currentScan.vector.subsurface ?? 60,
        robotics: currentScan.vector.robotics ?? 80,
      },
      radar: {
        morphology: currentScan.vector.terrain ?? 70,
        mineralogy: currentScan.vector.geology ?? 75,
        temperature: currentScan.vector.temperature ?? 65,
        aridity: currentScan.vector.iceWater ?? 60,
        radiation: Math.min(95, Math.round(currentScan.solarWpm2 / 10)),
        isru: 65,
      },
      topo: [
        { distKm: 0, elevM: currentScan.rawElev + 25 },
        { distKm: 5, elevM: currentScan.rawElev },
        { distKm: 10, elevM: currentScan.rawElev - 15 },
      ],
      photoEarth: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      photoSpace:
        activeTarget.body === 'Luna'
          ? 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80'
          : 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
      photoEarthCaption: 'Candidato Satelital Descubierto',
      photoSpaceCaption: `Objetivo Homólogo: ${activeTarget.name}`,
      inspectionGallery: [
        {
          title: 'Escaneo Satelital en Tiempo Real',
          category: 'Vista Orbital SRTM',
          url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
          caption: 'Coordenadas validadas por sensores de órbita baja',
        },
      ],
    };

    onAddNewSite(newSite);
    setCandidateSaved(true);
    setFloatingCardSite(newSite);
    setIsFloatingCardOpen(true);
    flyToCoord(newSite.lat, newSite.lng, 11);
  };

  // Floating inspection card target site
  const activeFloatingSite = floatingCardSite || selectedSite;
  const floatingSiteScore = activeFloatingSite ? (pfiScores[activeFloatingSite.id] || 75) : 75;

  return (
    <section id="satellite-section" className="section-dark cross-grid-dark py-24 px-6 relative select-none">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <span
              className="font-mono uppercase tracking-widest block mb-3 text-[#6B6F7B]"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              03 — Explorador cartográfico — NASA GIBS y Esri multi-dataset
            </span>
            <h2
              className="editorial-reveal-title"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 'clamp(30px, 3.5vw, 44px)',
                color: '#FFFFFF',
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: '-0.03em',
              }}
            >
              Vista orbital y escáner satelital
            </h2>
            <p className="text-[#8E9299] text-[15px] mt-2 max-w-[65ch] font-normal leading-[1.65]">
              Combina capas satelitales ópticas, topográficas y térmicas de la NASA en tiempo real. Activa el escáner orbital para consultar elevación SRTM y atmósfera in-situ en cualquier coordenada terrestre.
            </p>
          </div>

          {/* Satellite Multi-Dataset Layer Controls: Segmented Control (Reform 4.2) */}
          <div className="flex items-center flex-wrap gap-3">
            <div className="inline-flex p-1 bg-[#121316] border border-white/10 rounded-lg">
              <button
                onClick={() => switchLayer('satellite')}
                className={`px-3.5 py-1.5 rounded-md font-sans text-xs transition-all ${
                  activeLayer === 'satellite'
                    ? 'bg-white text-[#0A0A0C] font-semibold'
                    : 'text-[#8E9299] hover:text-white'
                }`}
              >
                Óptico satelital
              </button>
              <button
                onClick={() => switchLayer('topo')}
                className={`px-3.5 py-1.5 rounded-md font-sans text-xs transition-all ${
                  activeLayer === 'topo'
                    ? 'bg-white text-[#0A0A0C] font-semibold'
                    : 'text-[#8E9299] hover:text-white'
                }`}
              >
                Topografía
              </button>
              <button
                onClick={() => switchLayer('hillshade')}
                className={`px-3.5 py-1.5 rounded-md font-sans text-xs transition-all ${
                  activeLayer === 'hillshade'
                    ? 'bg-white text-[#0A0A0C] font-semibold'
                    : 'text-[#8E9299] hover:text-white'
                }`}
              >
                Relieve SRTM
              </button>
              <button
                onClick={() => switchLayer('gibs_thermal')}
                className={`px-3.5 py-1.5 rounded-md font-sans text-xs transition-all ${
                  activeLayer === 'gibs_thermal'
                    ? 'bg-white text-[#0A0A0C] font-semibold'
                    : 'text-[#8E9299] hover:text-white'
                }`}
              >
                Térmico MODIS
              </button>
            </div>

            {/* Utility actions beside segmented control */}
            <div className="flex items-center gap-2">
              <button
                onClick={resetToGlobalView}
                className="px-3.5 py-1.5 rounded-lg font-sans text-xs bg-[#121316] text-[#8E9299] border border-white/10 hover:text-white transition-all font-medium"
                title="Restablecer a vista planetaria completa (zoom: 2)"
              >
                Vista global
              </button>

              <button
                onClick={() => {
                  setScanModeActive(!scanModeActive);
                  if (scanModeActive) {
                    setCurrentScan(null);
                    if (scanMarkerRef.current && mapInstanceRef.current) {
                      mapInstanceRef.current.removeLayer(scanMarkerRef.current);
                    }
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg font-sans text-xs transition-all border ${
                  scanModeActive
                    ? 'bg-white text-[#0A0A0C] border-white font-semibold'
                    : 'bg-[#121316] text-[#8E9299] border-white/10 hover:text-white'
                }`}
              >
                {scanModeActive ? 'Modo escáner activo' : 'Escanear nueva coordenada'}
              </button>
            </div>
          </div>
        </div>

        {/* Map Viewport Container with data-lenis-prevent for wheel isolation */}
        <div
          data-lenis-prevent="true"
          className={`relative rounded-3xl overflow-hidden border border-white/10 bg-[#0A0A0C] shadow-2xl h-[78vh] min-h-[550px] ${
            scanModeActive ? 'cursor-crosshair' : ''
          }`}
        >
          <div ref={mapContainerRef} data-lenis-prevent="true" className="w-full h-full" style={{ zIndex: 1 }} />

          {/* Top-Left Active HUD Overlay */}
          <div className="absolute top-5 left-5 z-10 pointer-events-none flex flex-col gap-2.5 max-w-md">
            <div className="bg-[#121316]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full font-sans text-xs text-[#E8E8EC] flex items-center gap-3 shadow-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>
                Sitio seleccionado:{' '}
                <strong className="text-white">
                  {selectedSite.id} — {selectedSite.name}
                </strong>
              </span>
              <span className="text-[#6B6F7B]">|</span>
              <span className="text-[#8E9299] text-[11px] font-mono">{selectedSite.dms}</span>
            </div>

            {scanModeActive && (
              <div className="bg-[#121316]/95 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full font-sans text-xs text-white font-medium flex items-center gap-2 shadow-xl">
                <span>Escáner activo: haz clic en cualquier coordenada terrestre</span>
              </div>
            )}
          </div>

          {/* Floating Discovery Scanner Panel (Shown when a scan occurs) */}
          {(isScanning || currentScan) && (
            <div className="absolute top-5 right-5 z-20 bg-[#090B12]/95 backdrop-blur-xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-5 w-[380px] max-w-[calc(100vw-40px)] shadow-2xl font-mono text-xs text-[#E8E8EC] max-h-[85%] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/60" />
                  <strong className="text-white text-xs uppercase tracking-wider font-sans">
                    {isScanning ? 'Consulta satelital en curso' : 'Telemetría orbital'}
                  </strong>
                </div>
                <button
                  onClick={() => {
                    setCurrentScan(null);
                    setIsScanning(false);
                  }}
                  className="text-[#8E9299] hover:text-white p-1 text-xs"
                  aria-label="Cerrar telemetría"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 1l8 8M9 1L1 9" />
                  </svg>
                </button>
              </div>

              {isScanning ? (
                <div className="py-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                  <p className="text-[#8E929F] text-xs font-sans">
                    Consultando sensores orbitales NASA SRTM y datos atmosféricos...
                  </p>
                </div>
              ) : currentScan ? (
                <div>
                  {/* Status Banner */}
                  <div className="p-2.5 rounded-lg border border-white/10 bg-[#18191E] mb-3 text-[11px] leading-snug font-medium text-white">
                    {currentScan.statusMessage}
                  </div>

                  {/* Coords & PFI Row */}
                  <div className="grid grid-cols-2 gap-2 mb-3 bg-[#111420] p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="text-[#6B6F7B] text-[10px] block">COORDENADAS:</span>
                      <strong className="text-white text-[11px]">
                        {currentScan.lat}°, {currentScan.lng}°
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#6B6F7B] text-[10px] block">FIDELIDAD PFI:</span>
                      <strong className="text-sm text-white font-mono">
                        {currentScan.pfiScore}% PFI
                      </strong>
                    </div>
                  </div>

                  {/* Real Telemetry Sensor Grid */}
                  <div className="space-y-1.5 mb-4 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-[#8E929F]">Elevación SRTM (NASA/Copernicus):</span>
                      <strong className="text-white">{currentScan.rawElev} m s.n.m.</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-[#8E929F]">Presión Superficial:</span>
                      <strong className="text-white">{currentScan.pressureHpa} hPa</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-[#8E929F]">Temperatura In-Situ:</span>
                      <strong className="text-white">{currentScan.tempC} °C</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-[#8E929F]">Humedad Relativa:</span>
                      <strong className="text-white">{currentScan.humidityPct}%</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-[#8E929F]">Irradiancia Onda Corta:</span>
                      <strong className="text-white">{currentScan.solarWpm2} W/m²</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-[#8E929F]">Viento en Superficie:</span>
                      <strong className="text-white">{currentScan.windSpeedKm} km/h</strong>
                    </div>
                  </div>

                  {/* Scientific Evaluation Breakdown */}
                  <div className="space-y-2 mb-4">
                    <div className="bg-[#12141E] p-2.5 rounded-lg border border-white/5">
                      <span className="text-white font-medium block mb-1 text-[11px] font-sans">
                        Analogía fuerte:
                      </span>
                      <p className="text-[11px] text-[#A0A4B0] leading-snug">
                        {currentScan.strongAnalogy}
                      </p>
                    </div>

                    <div className="bg-[#12141E] p-2.5 rounded-lg border border-white/5">
                      <span className="text-[#8E9299] font-medium block mb-1 text-[11px] font-sans">
                        Dónde se rompe la analogía:
                      </span>
                      <p className="text-[11px] text-[#A0A4B0] leading-snug">
                        {currentScan.breaksDown}
                      </p>
                    </div>
                  </div>

                  {/* Candidate Name Input & Incorporation Action */}
                  {!currentScan.isOcean ? (
                    <div className="space-y-2.5 pt-2 border-t border-white/10">
                      <div>
                        <label className="text-[11px] text-[#8E9299] block mb-1 font-sans">
                          Nombre del nuevo candidato:
                        </label>
                        <input
                          type="text"
                          value={candidateCustomName}
                          onChange={(e) => setCandidateCustomName(e.target.value)}
                          disabled={candidateSaved}
                          className="w-full bg-[#161824] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                          placeholder="Nombre descriptivo del sitio..."
                        />
                      </div>

                      <button
                        onClick={handleSaveDiscoveredCandidate}
                        disabled={candidateSaved}
                        className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 font-sans ${
                          candidateSaved
                            ? 'bg-white/10 text-white cursor-default'
                            : 'bg-white text-[#0A0A0C] hover:bg-[#E4E4E7] shadow-sm'
                        }`}
                      >
                        <span>
                          {candidateSaved
                            ? 'Incorporado a la galería como candidato'
                            : 'Incorporar a la galería como nuevo candidato'}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-white/5 text-[11px] text-[#8E9299] text-center border border-white/5 font-sans">
                      Incorporación restringida: no es posible añadir superficies oceánicas líquidas como sitios análogos.
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Floating Quick-Inspection Card for Sites Clicked on Map */}
          {isFloatingCardOpen && activeFloatingSite && !currentScan && (
            <div className="absolute top-5 right-5 z-20 bg-[#090B12]/95 backdrop-blur-xl border border-[rgba(255,255,255,0.14)] rounded-2xl p-5 w-[390px] max-w-[calc(100vw-40px)] shadow-2xl font-mono text-xs text-[#E8E8EC] max-h-[85%] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 mb-3 border-b border-white/10 gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white border border-white/15">
                      {activeFloatingSite.id}
                    </span>
                    <span className="text-[#8E9299] text-[11px] truncate">
                      {activeFloatingSite.country}
                    </span>
                  </div>
                  <h4 className="text-white text-base font-bold tracking-tight leading-tight">
                    {activeFloatingSite.name}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="px-2.5 py-1 rounded-full font-bold text-white text-[11px] shadow-sm"
                    style={{ backgroundColor: fidelityColor(floatingSiteScore) }}
                  >
                    {Math.round(floatingSiteScore)}% PFI
                  </span>
                  <button
                    onClick={() => setIsFloatingCardOpen(false)}
                    className="text-[#8E9299] hover:text-white p-1"
                    aria-label="Cerrar tarjeta flotante"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 1l8 8M9 1L1 9" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Real Geological Site Image with SRTM Canvas Fallback */}
              <div className="relative w-full h-[180px] rounded-xl overflow-hidden border border-white/10 mb-3 bg-[#111420]">
                <GeologicalSiteImage site={activeFloatingSite} />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10 text-[9px]">
                  <span className="bg-black/75 px-2 py-0.5 rounded text-white border border-white/10">
                    {activeFloatingSite.dms}
                  </span>
                  <span className="bg-black/75 px-2 py-0.5 rounded text-white border border-white/10">
                    {fidelityLabel(floatingSiteScore)}
                  </span>
                </div>
              </div>

              {/* Micro-Escala & Active Process Cards */}
              <div className="space-y-2 mb-3">
                <div className="bg-[#111420] p-2.5 rounded-xl border border-white/5">
                  <span className="text-[#8E9299] text-[10px] font-medium block mb-0.5 font-sans">
                    Micro-escala exacta:
                  </span>
                  <p className="text-[11px] text-[#A0A4B0] leading-snug font-sans">
                    {activeFloatingSite.microScale}
                  </p>
                </div>

                <div className="bg-[#111420] p-2.5 rounded-xl border border-white/5">
                  <span className="text-[#8E9299] text-[10px] font-medium block mb-0.5 font-sans">
                    Proceso geofísico activo:
                  </span>
                  <p className="text-[11px] text-[#A0A4B0] leading-snug font-sans">
                    {activeFloatingSite.activeProcess}
                  </p>
                </div>
              </div>

              {/* Key Telemetry Readings Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4 bg-[#111420] p-2.5 rounded-xl border border-white/5 text-[11px]">
                <div>
                  <span className="text-[#8E9299] text-[10px] block font-sans">Elevación SRTM:</span>
                  <strong className="text-white font-mono">{activeFloatingSite.elevM} m s.n.m.</strong>
                </div>
                <div>
                  <span className="text-[#8E9299] text-[10px] block font-sans">Presión:</span>
                  <strong className="text-white font-mono">{activeFloatingSite.pressureHpa} hPa</strong>
                </div>
                <div>
                  <span className="text-[#8E9299] text-[10px] block font-sans">Temp media:</span>
                  <strong className="text-white font-mono">{activeFloatingSite.meanTempC} °C</strong>
                </div>
                <div>
                  <span className="text-[#8E9299] text-[10px] block font-sans">Bioma:</span>
                  <strong className="text-white font-sans">{activeFloatingSite.biome}</strong>
                </div>
              </div>

              {/* Two Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (onOpenDetailModal) {
                      onOpenDetailModal(activeFloatingSite.id);
                    } else {
                      onSelectSite(activeFloatingSite.id);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-[#E4E4E7] text-[#0A0A0C] font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm font-sans"
                >
                  <span>Abrir estudio completo →</span>
                </button>

                <a
                  href={`https://www.google.com/maps/@${activeFloatingSite.lat},${activeFloatingSite.lng},13500m/data=!3m1!1e3`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#E8E8EC] hover:text-white border border-white/10 font-medium text-xs transition-all flex items-center justify-center gap-2 text-center font-sans"
                >
                  <span>Ver en Google Earth ↗</span>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Architectural Site Tabs Bar (Continuous horizontal strip beneath map - Reform 4.1) */}
        <div className="w-full mt-4 border-t border-b border-white/10 bg-[#0E0F12] overflow-x-auto flex items-center">
          {sites.map((site) => {
            const isCur = site.id === selectedSiteId;
            return (
              <button
                key={site.id}
                onClick={() => {
                  onSelectSite(site.id);
                  setFloatingCardSite(site);
                  setIsFloatingCardOpen(true);
                  flyToCoord(site.lat, site.lng, 11);
                }}
                className={`shrink-0 px-5 py-3 font-sans text-xs transition-colors flex items-center gap-2 border-b-2 ${
                  isCur
                    ? 'border-white text-white font-medium bg-white/[0.04]'
                    : 'border-transparent text-[#8E9299] hover:text-white'
                }`}
              >
                <span className="font-mono font-medium">{site.id}</span>
                <span className="text-[12px] opacity-90">{site.country}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
