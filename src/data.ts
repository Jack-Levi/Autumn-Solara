/* ═══ TERRA—ANALOG™ Complete Data & Types ═══ */

/* ── Types ── */
export type BiomeType = 'Todos' | 'Hiperárido' | 'Polar/Criogénico' | 'Volcánico/Basáltico' | 'Impacto/Cráter' | 'Subterráneo/Cueva';
export type CharLevel = 'Alto' | 'Medio' | 'Bajo';

export interface PFIWeights {
  topography: number; geology: number; environment: number; resources: number;
}

export interface VectorScores {
  topography: number; geology: number; environment: number; resources: number;
}

export interface RadarAxes {
  morphology: number; mineralogy: number; temperature: number; aridity: number; radiation: number; isru: number;
}

export interface TopoPoint { distKm: number; elevM: number; }

export interface TestProtocol {
  code: string; title: string; trl: string; domain: string; desc: string;
}

export interface ExtraTerrestrialTarget {
  id: string; body: 'Luna' | 'Marte'; name: string; subtitle: string;
  cardIcon: string;
  coords: string; gravity: number; pressure: string; tempRange: string; meanTemp: number;
  focus: string; mineralogy: string; waterFraction: string; radiation: string;
  missionRef: string;
  vector: VectorScores; radar: RadarAxes; topo: TopoPoint[];
}

export interface GeologicalInspectionPhoto {
  title: string;
  category: 'Vista Orbital SRTM' | 'Textura de Regolito' | 'Espectro Mineralógico' | 'Homólogo Extraterrestre';
  url: string;
  caption: string;
}

export interface EarthSite {
  id: string; name: string; country: string; region: string;
  lat: number; lng: number; dms: string; elevM: number;
  biome: BiomeType; charLevel: CharLevel;
  isCandidate?: boolean;
  isUserCandidate?: boolean;
  meanTempC: number; tempMinC: number; tempMaxC: number;
  precipMm: number; humidityPct: number;
  slopeDeg: number; roughnessRms: number;
  uvPeak: number; solarWpm2: number; pressureHpa: number;
  mineralogy: string; petrology: string;
  summary: string;
  grayZone?: string;
  protocols: TestProtocol[];
  vector: VectorScores; radar: RadarAxes; topo: TopoPoint[];
  photoEarth: string;
  photoSpace: string;
  photoEarthCaption: string;
  photoSpaceCaption: string;
  inspectionGallery: GeologicalInspectionPhoto[];
}

export interface RankedSite { site: EarthSite; pfi: number; breakdown: VectorScores; rank: number; }

/* ── PFI Calculation Engine ── */
export function calculatePFI(site: EarthSite, target: ExtraTerrestrialTarget, w: PFIWeights): { pfi: number; breakdown: VectorScores } {
  const total = w.topography + w.geology + w.environment + w.resources || 1;
  const nw = { topography: w.topography / total, geology: w.geology / total, environment: w.environment / total, resources: w.resources / total };
  const t = Math.max(0, 100 - Math.abs(site.vector.topography - target.vector.topography));
  const g = Math.max(0, 100 - Math.abs(site.vector.geology - target.vector.geology));
  const e = Math.max(0, 100 - Math.abs(site.vector.environment - target.vector.environment));
  const r = Math.max(0, 100 - Math.abs(site.vector.resources - target.vector.resources));
  const pfi = Math.round((t * nw.topography + g * nw.geology + e * nw.environment + r * nw.resources) * 10) / 10;
  return { pfi, breakdown: { topography: Math.round(t * 10) / 10, geology: Math.round(g * 10) / 10, environment: Math.round(e * 10) / 10, resources: Math.round(r * 10) / 10 } };
}

export function rankSites(sites: EarthSite[], target: ExtraTerrestrialTarget, w: PFIWeights): RankedSite[] {
  return sites.map(site => { const { pfi, breakdown } = calculatePFI(site, target, w); return { site, pfi, breakdown, rank: 0 }; })
    .sort((a, b) => b.pfi - a.pfi).map((s, i) => ({ ...s, rank: i + 1 }));
}

export function fidelityColor(score: number): string {
  if (score >= 82) return '#2544FF';
  if (score >= 68) return '#F59E0B';
  return '#EF4444';
}

export function fidelityLabel(score: number): string {
  if (score >= 82) return 'ÓPTIMO';
  if (score >= 68) return 'MODERADO';
  return 'BAJO';
}

/* ── Planetary Targets ── */
export const TARGETS: ExtraTerrestrialTarget[] = [
  {
    id: 'MOON-SHK', body: 'Luna', name: 'Polo Sur — Shackleton',
    subtitle: 'Trampas de frío extremo, hielo en sombra permanente, iluminación solar rasante.',
    cardIcon: '☽',
    coords: '89.9° S, 0.0° E', gravity: 1.62, pressure: '10⁻¹² Pa', tempRange: '-238°C a -50°C', meanTemp: -190,
    focus: 'Hielo de agua en regiones en sombra permanente (PSR), borde con iluminación rasante perpetua, regolito anortosítico.',
    mineralogy: 'Anortosita, plagioclasa cálcica, troctolita, hielo ~5.5 wt%', waterFraction: '5.5 wt% H₂O', radiation: '380 mSv/año',
    missionRef: 'Artemis III / Lunar South Pole Basecamp',
    vector: { topography: 90, geology: 76, environment: 95, resources: 92 },
    radar: { morphology: 92, mineralogy: 70, temperature: 98, aridity: 100, radiation: 95, isru: 90 },
    topo: [{ distKm: 0, elevM: 1400 }, { distKm: 2.5, elevM: 2200 }, { distKm: 5, elevM: 800 }, { distKm: 8, elevM: -1800 }, { distKm: 10.5, elevM: -2800 }, { distKm: 13, elevM: -2800 }, { distKm: 16, elevM: -1400 }, { distKm: 18.5, elevM: 2150 }, { distKm: 21, elevM: 1350 }],
  },
  {
    id: 'MOON-LAV', body: 'Luna', name: 'Mare Tranquillitatis',
    subtitle: 'Tubos de lava basálticos subterráneos, escudo natural contra radiación cósmica.',
    cardIcon: '◉',
    coords: '8.33° N, 33.22° E', gravity: 1.62, pressure: '10⁻¹² Pa', tempRange: '-130°C a +120°C', meanTemp: -20,
    focus: 'Refugios subterráneos basálticos contra radiación y micrometeoritos.',
    mineralogy: 'Basalto rico en ilmenita (FeTiO₃), piroxeno, olivino', waterFraction: '<0.01 wt%', radiation: '<10 mSv/año (subterráneo)',
    missionRef: 'Lunar Subsurface Habitation & Ti Mining',
    vector: { topography: 82, geology: 94, environment: 68, resources: 62 },
    radar: { morphology: 85, mineralogy: 95, temperature: 65, aridity: 100, radiation: 40, isru: 60 },
    topo: [{ distKm: 0, elevM: 150 }, { distKm: 0.8, elevM: 150 }, { distKm: 1.1, elevM: 40 }, { distKm: 1.15, elevM: -60 }, { distKm: 1.3, elevM: -60 }, { distKm: 1.5, elevM: -55 }, { distKm: 1.8, elevM: 145 }, { distKm: 2.2, elevM: 150 }],
  },
  {
    id: 'MARS-JEZ', body: 'Marte', name: 'Cráter Jezero Delta',
    subtitle: 'Antiguo delta fluvial, arcillas filosilicatadas, rovers navegando entre rocas.',
    cardIcon: '♂',
    coords: '18.38° N, 77.58° E', gravity: 3.72, pressure: '610 Pa', tempRange: '-90°C a +20°C', meanTemp: -55,
    focus: 'Deltas fluviales, filosilicatos, carbonatos, búsqueda de biofirmas.',
    mineralogy: 'Esmectitas Fe/Mg, carbonato de magnesio, olivino, sulfatos', waterFraction: '2-4 wt% en arcillas', radiation: '230 mSv/año',
    missionRef: 'Mars 2020 (Perseverance) & Mars Sample Return',
    vector: { topography: 86, geology: 96, environment: 87, resources: 81 },
    radar: { morphology: 88, mineralogy: 98, temperature: 80, aridity: 92, radiation: 85, isru: 78 },
    topo: [{ distKm: 0, elevM: -2100 }, { distKm: 5, elevM: -2300 }, { distKm: 10, elevM: -2520 }, { distKm: 12, elevM: -2580 }, { distKm: 15, elevM: -2640 }, { distKm: 22, elevM: -2630 }, { distKm: 30, elevM: -2500 }, { distKm: 38, elevM: -2150 }],
  },
  {
    id: 'MARS-ARC', body: 'Marte', name: 'Arcadia Planitia Hielo',
    subtitle: 'Planicies volcánicas con sábanas de hielo para bases humanas Starship.',
    cardIcon: '◬',
    coords: '39.3° N, 189.7° E', gravity: 3.72, pressure: '750 Pa', tempRange: '-120°C a -10°C', meanTemp: -65,
    focus: 'Hielo de agua masivo a 1-2m de profundidad, sitio predilecto para Starship.',
    mineralogy: 'Hielo >80% pureza, basalto eólico, regolito cementado', waterFraction: '>65 wt% (1-2.5 m prof.)', radiation: '210 mSv/año',
    missionRef: 'Human Mars Landing / Starship ISRU Plant',
    vector: { topography: 72, geology: 79, environment: 88, resources: 97 },
    radar: { morphology: 68, mineralogy: 75, temperature: 88, aridity: 85, radiation: 80, isru: 98 },
    topo: [{ distKm: 0, elevM: -4020 }, { distKm: 10, elevM: -4015 }, { distKm: 25, elevM: -4010 }, { distKm: 40, elevM: -4005 }, { distKm: 60, elevM: -4010 }, { distKm: 80, elevM: -4025 }, { distKm: 100, elevM: -4020 }],
  },
];

/* ── Verified Space Reference Images ── */
export const SPACE_PHOTOS = {
  mars: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
  moon: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
};

/* ── Earth Analog Sites (Verified Unsplash High-Res Photos) ── */
export const SITES: EarthSite[] = [
  {
    id: 'ATC-01', name: 'Desierto de Atacama — Zona Yungay', country: 'Chile', region: 'Sudamérica',
    lat: -24.088, lng: -69.916, dms: '24°05′17″ S, 69°54′58″ W', elevM: 1020,
    biome: 'Hiperárido', charLevel: 'Alto',
    meanTempC: 18.2, tempMinC: 1.5, tempMaxC: 36.4, precipMm: 1.2, humidityPct: 8.5,
    slopeDeg: 4.8, roughnessRms: 0.12, uvPeak: 14.5, solarWpm2: 1140, pressureHpa: 898,
    mineralogy: 'Halita, Anhidrita, Percloratos (ClO₄⁻), Nitratos',
    petrology: 'Costra evaporítica sobre regolito coluvial sin materia orgánica',
    summary: 'Límite de sequedad extrema de la Tierra con aridez ininterrumpida por >15 Ma. Concentraciones de percloratos análogas a las detectadas por Curiosity y Phoenix. Referencia global para astrobiología y perforación marciana.',
    protocols: [
      { code: 'PRT-ATC-DRL', title: 'Perforación Autónoma en Subsuelo Seco', trl: 'TRL-6', domain: 'Drilling', desc: 'Brocas rotopercursivas sin fluidos en regolito cementado por sales.' },
      { code: 'PRT-ATC-BIO', title: 'Fluorescencia Raman de Biofirmas', trl: 'TRL-7', domain: 'Sensors', desc: 'Detección de extremófilos endolíticos con óptica de baja potencia.' },
    ],
    vector: { topography: 68, geology: 96, environment: 94, resources: 42 },
    radar: { morphology: 70, mineralogy: 98, temperature: 75, aridity: 100, radiation: 96, isru: 44 },
    topo: [{ distKm: 0, elevM: 1040 }, { distKm: 3, elevM: 1030 }, { distKm: 7, elevM: 1020 }, { distKm: 12, elevM: 1015 }, { distKm: 16, elevM: 1005 }, { distKm: 20, elevM: 995 }, { distKm: 25, elevM: 990 }],
    photoEarth: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.mars,
    photoEarthCaption: 'Desierto de Atacama, Zona Yungay — Cuenca hiperárida',
    photoSpaceCaption: 'Marte, Valles Marineris / Cráter Jezero — NASA/JPL',
    inspectionGallery: [
      { title: 'Vista Satelital SRTM', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', caption: 'Llanuras aluviales y abanicos hiperáridos' },
      { title: 'Costra de Sal y Percloratos', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=800&q=80', caption: 'Superficie friable cementada por halita y sales anhidras' },
      { title: 'Reflectancia ASTER TIR', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80', caption: 'Firmas de sulfatos y óxidos de hierro en bandas SWIR' },
      { title: 'Homólogo Marciano', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.mars, caption: 'Planicies oxidadas del cráter Gale y Jezero' },
    ],
  },
  {
    id: 'HGT-02', name: 'Cráter de Impacto Haughton', country: 'Canadá', region: 'Ártico',
    lat: 75.383, lng: -89.666, dms: '75°22′59″ N, 89°39′58″ W', elevM: 240,
    biome: 'Impacto/Cráter', charLevel: 'Alto',
    meanTempC: -16.4, tempMinC: -48, tempMaxC: 12, precipMm: 120, humidityPct: 76,
    slopeDeg: 14.5, roughnessRms: 0.48, uvPeak: 3.2, solarWpm2: 480, pressureHpa: 988,
    mineralogy: 'Brechas de impacto, Dolomita, Cuarzo chocado, Esmectitas',
    petrology: 'Astroblema de 23 km en secuencias sedimentarias paleozoicas con permafrost continuo',
    summary: 'Cráter de impacto de 23 km formado hace ~39 Ma en desierto polar con permafrost continuo. Inversión de relieve y depósitos hidrotermales fósiles. Análogo primario para cráteres del Polo Sur Lunar y tierras altas de Marte.',
    protocols: [
      { code: 'PRT-HGT-EVA', title: 'Operaciones EVA con Trajes Presurizados', trl: 'TRL-7', domain: 'EVA', desc: 'Movilidad articular y fatiga en terreno de impacto con luz rasante.' },
      { code: 'PRT-HGT-LID', title: 'Navegación LiDAR en Bajo Contraste', trl: 'TRL-7', domain: 'Mobility', desc: 'SLAM en brechas caóticas bajo niebla ártica.' },
    ],
    vector: { topography: 93, geology: 86, environment: 89, resources: 86 },
    radar: { morphology: 96, mineralogy: 82, temperature: 92, aridity: 75, radiation: 65, isru: 88 },
    topo: [{ distKm: 0, elevM: 320 }, { distKm: 2, elevM: 360 }, { distKm: 5, elevM: 210 }, { distKm: 10, elevM: 140 }, { distKm: 11.5, elevM: 220 }, { distKm: 13, elevM: 145 }, { distKm: 18, elevM: 355 }, { distKm: 20, elevM: 310 }],
    photoEarth: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.moon,
    photoEarthCaption: 'Cráter Haughton, Isla Devon — Astroblema de impacto en desierto ártico',
    photoSpaceCaption: 'Cráter Shackleton, Polo Sur Lunar — LRO/LOLA NASA',
    inspectionGallery: [
      { title: 'Borde Anular de Impacto', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', caption: 'Relieve invertido de colinas de brecha de impacto' },
      { title: 'Permafrost y Bloques Autógenos', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=800&q=80', caption: 'Sustrato congelado con fragmentos rocosos angulares' },
      { title: 'Esmectitas Hidrotermales', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80', caption: 'Arcillas de alteración post-impacto análogas a cráteres marcianos' },
      { title: 'Topografía de Shackleton', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.moon, caption: 'Pendientes empinadas y sombras permanentes del polo lunar' },
    ],
  },
  {
    id: 'LNZ-03', name: 'Tubos de Lava de Corona — Lanzarote', country: 'España', region: 'Canarias',
    lat: 29.152, lng: -13.447, dms: '29°09′07″ N, 13°26′49″ W', elevM: 185,
    biome: 'Subterráneo/Cueva', charLevel: 'Medio',
    meanTempC: 19.8, tempMinC: 14, tempMaxC: 28.5, precipMm: 135, humidityPct: 68,
    slopeDeg: 12, roughnessRms: 0.35, uvPeak: 9.8, solarWpm2: 920, pressureHpa: 994,
    mineralogy: 'Basalto alcalino, Clinopiroxeno, Magnetita, Vidrio volcánico',
    petrology: 'Tubos de lava pahoehoe con secciones de >25 m de diámetro y claraboyas de colapso',
    summary: 'Uno de los sistemas de tubos de lava más extensos del planeta (~7.6 km). Utilizado por ESA (PANGAEA) y NASA para entrenamiento. Analogía precisa para refugios subterráneos en Mare Tranquillitatis (Luna) y Tharsis (Marte).',
    protocols: [
      { code: 'PRT-LNZ-CAV', title: 'Exploración Autónoma sin GNSS', trl: 'TRL-6', domain: 'Mobility', desc: 'Drones y rovers con LiDAR en oscuridad total y reflectividad basáltica ultrabaja.' },
      { code: 'PRT-LNZ-HAB', title: 'Hábitats Inflables en Cavidades', trl: 'TRL-5', domain: 'Habitat', desc: 'Anclajes mecánicos en bóvedas de basalto vesicular.' },
    ],
    vector: { topography: 84, geology: 96, environment: 64, resources: 56 },
    radar: { morphology: 88, mineralogy: 95, temperature: 62, aridity: 58, radiation: 42, isru: 55 },
    topo: [{ distKm: 0, elevM: 260 }, { distKm: 0.4, elevM: 245 }, { distKm: 0.9, elevM: 160 }, { distKm: 1.1, elevM: 155 }, { distKm: 1.5, elevM: 140 }, { distKm: 1.8, elevM: 205 }, { distKm: 2.2, elevM: 185 }],
    photoEarth: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.moon,
    photoEarthCaption: 'Malpaís de La Corona, Lanzarote — Bóvedas de basalto volcánico',
    photoSpaceCaption: 'Claraboya de Tubo de Lava, Mare Tranquillitatis — NASA/LRO',
    inspectionGallery: [
      { title: 'Conductos de Descenso (Jameos)', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', caption: 'Claraboyas colapsadas con acceso directo a galerías' },
      { title: 'Basalto Pahoehoe Ondulado', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', caption: 'Paredes de lava basáltica con cornisas de refundición' },
      { title: 'Reflectancia Magnética', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80', caption: 'Abundancia de titanomagnetita y piroxenos cálcicos' },
      { title: 'Túnel Lunar Análogo', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.moon, caption: 'Blindaje de más de 30m de roca basáltica contra radiación' },
    ],
  },
  {
    id: 'PIN-04', name: 'Campo Volcánico El Pinacate', country: 'México', region: 'Norteamérica',
    lat: 31.772, lng: -113.498, dms: '31°46′19″ N, 113°29′53″ W', elevM: 260,
    biome: 'Volcánico/Basáltico', charLevel: 'Bajo', isCandidate: true,
    meanTempC: 22.8, tempMinC: -2, tempMaxC: 49.5, precipMm: 74, humidityPct: 18,
    slopeDeg: 24.5, roughnessRms: 0.62, uvPeak: 12.8, solarWpm2: 1080, pressureHpa: 982,
    mineralogy: 'Basalto vesicular, Olivino, Magnetita, Vidrio piroclástico',
    petrology: 'Cráteres maar en escudo basáltico — El Elegante (1.6 km ø × 250 m profundidad)',
    summary: 'Cráteres maar con geometría indistinguible de cráteres de impacto lunares. Sitio de entrenamiento geológico del Apolo pero sin caracterización robótica contemporánea. El campo de pruebas de más bajo costo logístico en Norteamérica.',
    grayZone: 'Los datos SRTM y ASTER demuestran perfiles transversales indistinguibles de cráteres lunares de tamaño medio, pero existe un vacío de literatura científica indexada en la última década.',
    protocols: [
      { code: 'PRT-PIN-SLP', title: 'Rovers en Pendientes Basálticas >28°', trl: 'TRL-6', domain: 'Mobility', desc: 'Tracción en taludes de escoria y eyección de cráteres maar.' },
      { code: 'PRT-PIN-VIS', title: 'Odometría Visual en Albedo Ultrabajo', trl: 'TRL-7', domain: 'Sensors', desc: 'Cámaras estereoscópicas en mantos de lapilli negro bajo sol intenso.' },
    ],
    vector: { topography: 94, geology: 91, environment: 80, resources: 44 },
    radar: { morphology: 95, mineralogy: 92, temperature: 78, aridity: 88, radiation: 86, isru: 46 },
    topo: [{ distKm: 0, elevM: 260 }, { distKm: 0.3, elevM: 285 }, { distKm: 0.5, elevM: 180 }, { distKm: 0.9, elevM: 50 }, { distKm: 1.1, elevM: 35 }, { distKm: 1.6, elevM: 120 }, { distKm: 1.9, elevM: 280 }, { distKm: 2.2, elevM: 260 }],
    photoEarth: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.moon,
    photoEarthCaption: 'Cráter El Elegante, El Pinacate (Sonora, México) — Cráter maar basáltico',
    photoSpaceCaption: 'Cráter Copernicus, Luna — LRO/WAC NASA',
    inspectionGallery: [
      { title: 'Morfometría SRTM', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80', caption: 'Caída vertical de 248 m y diámetro de 1,600 m' },
      { title: 'Cenizas y Lapilli Negro', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', caption: 'Eyecta basáltica de grano fino (<0.5 mm) idéntica al regolito lunar' },
      { title: 'Bandas ASTER Mineral', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', caption: 'Contrastes entre arenas de dunas y flujos de basalto alcalino' },
      { title: 'Simulación Apolo / Artemis', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.moon, caption: 'Entrenamiento histórico de astronautas de las misiones Apolo' },
    ],
  },
  {
    id: 'MCM-05', name: 'Valles Secos de McMurdo', country: 'Antártida', region: 'Antártida',
    lat: -77.862, lng: 163.05, dms: '77°51′43″ S, 163°03′00″ E', elevM: 1680,
    biome: 'Polar/Criogénico', charLevel: 'Medio',
    meanTempC: -21.5, tempMinC: -53, tempMaxC: -1.2, precipMm: 10, humidityPct: 11.2,
    slopeDeg: 16, roughnessRms: 0.42, uvPeak: 4.8, solarWpm2: 520, pressureHpa: 790,
    mineralogy: 'Doleritas de Ferrar, Cuarzo, Feldespato, Hielo intersticial',
    petrology: 'Regolito criogénico con permafrost masivo a 2-10 cm de profundidad',
    summary: 'El desierto más frío y seco de la Tierra. Vientos catabáticos impiden acumulación de nieve. Análogo supremo para hielo en trampas frías del Polo Sur Lunar y misiones polares de Marte.',
    protocols: [
      { code: 'PRT-MCM-ICE', title: 'Extracción Criogénica ISRU', trl: 'TRL-6', domain: 'ISRU', desc: 'Extracción térmica al vacío de agua en regolito a -30°C.' },
      { code: 'PRT-MCM-BAT', title: 'Ciclos de Baterías a -50°C', trl: 'TRL-7', domain: 'Sensors', desc: 'Autodescarga y calentamiento por radioisótopos simulados.' },
    ],
    vector: { topography: 74, geology: 83, environment: 98, resources: 96 },
    radar: { morphology: 76, mineralogy: 78, temperature: 100, aridity: 96, radiation: 82, isru: 98 },
    topo: [{ distKm: 0, elevM: 2150 }, { distKm: 1.5, elevM: 1950 }, { distKm: 3, elevM: 1720 }, { distKm: 5, elevM: 1680 }, { distKm: 6.5, elevM: 1675 }, { distKm: 8, elevM: 1850 }, { distKm: 10, elevM: 2200 }],
    photoEarth: 'https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.mars,
    photoEarthCaption: 'Valles Secos de McMurdo, Antártida — Desierto polar hiperárido',
    photoSpaceCaption: 'Arcadia Planitia y Phoenix Landing Site, Marte — NASA/JPL',
    inspectionGallery: [
      { title: 'Topografía de Valles en U', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=800&q=80', caption: 'Valles barridos por vientos catabáticos supersónicos' },
      { title: 'Terreno Poligonal de Hielo', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', caption: 'Cuñas de contracción térmica idénticas a Phoenix' },
      { title: 'Mantos de Permafrost Seco', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80', caption: 'Ausencia total de agua líquida superficial' },
      { title: 'Manto de Hielo Masivo', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.mars, caption: 'Sábanas de hielo subterráneo a 1 metro de profundidad' },
    ],
  },
  {
    id: 'PUN-06', name: 'Puna de Atacama — Campo de Piedra Pómez', country: 'Argentina', region: 'Sudamérica',
    lat: -25.56, lng: -67.53, dms: '25°33′36″ S, 67°31′48″ W', elevM: 4250,
    biome: 'Hiperárido', charLevel: 'Bajo', isCandidate: true,
    meanTempC: 6.5, tempMinC: -22, tempMaxC: 26, precipMm: 38, humidityPct: 12.5,
    slopeDeg: 9.8, roughnessRms: 0.75, uvPeak: 19.8, solarWpm2: 1390, pressureHpa: 595,
    mineralogy: 'Ignimbrita, Piedra pómez, Ulexita, Bórax, Halita',
    petrology: 'Mega-yardangs eólicos esculpidos en ignimbrita y salares hipersalinos',
    summary: 'Altiplano volcánico de >4,200 m con la radiación UV más alta de la Tierra, presión atmosférica reducida (60% del nivel del mar) y el mayor campo de mega-yardangs del planeta. Análogo perfecto para la Formación Medusae Fossae en Marte.',
    grayZone: 'Valores de radiación UV superiores a cualquier otro desierto y yardangs que reproducen la aerodinámica eólica marciana, pero el aislamiento ha limitado las campañas.',
    protocols: [
      { code: 'PRT-PUN-UV', title: 'Degradación Óptica bajo UV Extremo', trl: 'TRL-6', domain: 'Sensors', desc: 'Exposición a dosis UV-B/C atípicas por altitud de 4,200 m.' },
      { code: 'PRT-PUN-YRD', title: 'Navegación en Corredores de Yardangs', trl: 'TRL-6', domain: 'Mobility', desc: 'Path-planning en laberintos de mega-crestas eólicas.' },
    ],
    vector: { topography: 86, geology: 93, environment: 97, resources: 64 },
    radar: { morphology: 90, mineralogy: 92, temperature: 86, aridity: 98, radiation: 100, isru: 68 },
    topo: [{ distKm: 0, elevM: 4320 }, { distKm: 2, elevM: 4280 }, { distKm: 4, elevM: 4240 }, { distKm: 6, elevM: 4235 }, { distKm: 8, elevM: 4220 }, { distKm: 11, elevM: 3910 }, { distKm: 14, elevM: 3900 }],
    photoEarth: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.mars,
    photoEarthCaption: 'Campo de Piedra Pómez, Catamarca — Mega-yardangs eólicos de ignimbrita blanca',
    photoSpaceCaption: 'Medusae Fossae Formation, Marte — MRO HiRISE NASA',
    inspectionGallery: [
      { title: 'Estructura de Yardangs', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=800&q=80', caption: 'Laberintos tallados por vientos catabáticos persistentes' },
      { title: 'Gravas de Piedra Pómez', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', caption: 'Pómez piroclástica de ultrabaja densidad' },
      { title: 'Absorción Atmosférica Reducida', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80', caption: 'Presión de 595 hPa y flujo UV biológicamente crítico' },
      { title: 'Erosión Eólica Marciana', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.mars, caption: 'Campos de yardangs en formaciones estratificadas de Marte' },
    ],
  },
  {
    id: 'ASK-07', name: 'Tierras Altas de Askja — Holuhraun', country: 'Islandia', region: 'Atlántico Norte',
    lat: 64.92, lng: -16.75, dms: '64°55′12″ N, 16°45′00″ W', elevM: 1100,
    biome: 'Volcánico/Basáltico', charLevel: 'Medio',
    meanTempC: -1.8, tempMinC: -28, tempMaxC: 15, precipMm: 450, humidityPct: 62,
    slopeDeg: 11.2, roughnessRms: 0.55, uvPeak: 4.2, solarWpm2: 610, pressureHpa: 875,
    mineralogy: 'Basalto toleítico, Plagioclasa, Piroxeno, Palagonita',
    petrology: 'Lavas recientes (2014-15) sobre desierto volcánico periglacial',
    summary: 'Campo de lavas basálticas activas más representativo. Terreno de instrucción del Apolo 11 y actualmente de robótica rover NASA/ESA. Lavas de Holuhraun son basaltos prístinos libres de intemperismo biológico.',
    protocols: [
      { code: 'PRT-ASK-WHL', title: 'Abrasión de Ruedas en Lavas Aʻā', trl: 'TRL-7', domain: 'Mobility', desc: 'Deformación plástica en grousers de Ti sobre escoria vítrea.' },
      { code: 'PRT-ASK-GEO', title: 'Muestreo Geológico Artemis', trl: 'TRL-8', domain: 'EVA', desc: 'Procedimientos de recolección con herramientas presurizadas.' },
    ],
    vector: { topography: 87, geology: 98, environment: 84, resources: 70 },
    radar: { morphology: 89, mineralogy: 99, temperature: 82, aridity: 72, radiation: 68, isru: 74 },
    topo: [{ distKm: 0, elevM: 1450 }, { distKm: 2, elevM: 1100 }, { distKm: 4, elevM: 1060 }, { distKm: 6, elevM: 1080 }, { distKm: 9, elevM: 920 }, { distKm: 12, elevM: 880 }, { distKm: 15, elevM: 860 }],
    photoEarth: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.mars,
    photoEarthCaption: 'Tierras Altas de Askja y Lavas de Holuhraun — Islandia',
    photoSpaceCaption: 'Flujos de Basalto en Olympus Mons, Marte — NASA/Viking',
    inspectionGallery: [
      { title: 'Caldera Volcánica Askja', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80', caption: 'Colapsos de caldera anidados y llanuras piroclásticas' },
      { title: 'Escoria Aʻā y Arenas Negras', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', caption: 'Vidrio volcánico cortante y basalto toleítico vesicular' },
      { title: 'Enfriamiento Térmico Landsat', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', caption: 'Monitoreo de tasa de enfriamiento espectral' },
      { title: 'Entrenamiento de Muestreo Artemis', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.mars, caption: 'Instrucción directa de geología lunar para astronautas' },
    ],
  },
  {
    id: 'DNK-08', name: 'Depresión de Danakil — Dallol', country: 'Etiopía', region: 'África Oriental',
    lat: 14.241, lng: 40.3, dms: '14°14′28″ N, 40°18′00″ E', elevM: -125,
    biome: 'Hiperárido', charLevel: 'Bajo', isCandidate: true,
    meanTempC: 34.6, tempMinC: 22, tempMaxC: 51.5, precipMm: 95, humidityPct: 24,
    slopeDeg: 6.2, roughnessRms: 0.28, uvPeak: 13.5, solarWpm2: 1120, pressureHpa: 1030,
    mineralogy: 'Halita, Jarosita, Azufre elemental, Hematita',
    petrology: 'Cráter hidrotermal en depresión tectónica con salmueras hiperácidas (pH <0)',
    summary: 'Uno de los lugares más inhóspitos del planeta (-125 m). Piscinas hidrotermales ácidas con pH negativo. Minerales de jarosita idénticos a los del rover Opportunity en Marte. Modelo para sistemas hidrotermales marcianos en desecación.',
    grayZone: 'Conflicto geopolítico y calor extremo la han mantenido inaccesible para experimentación robótica formal. ASTER confirma que es el análogo geoquímico más fiel para evaporitas ácidas del Hespérico marciano.',
    protocols: [
      { code: 'PRT-DNK-COR', title: 'Resistencia a Corrosión Extrema', trl: 'TRL-6', domain: 'Sensors', desc: 'Sellos y aleaciones en vapores de cloro y salmueras ácidas.' },
      { code: 'PRT-DNK-BIO', title: 'Biofirmas en pH Extremo', trl: 'TRL-5', domain: 'Sensors', desc: 'Microfluídicos de ADN/proteínas en soluciones de azufre y hierro.' },
    ],
    vector: { topography: 70, geology: 95, environment: 95, resources: 52 },
    radar: { morphology: 72, mineralogy: 98, temperature: 88, aridity: 90, radiation: 88, isru: 58 },
    topo: [{ distKm: 0, elevM: -80 }, { distKm: 0.5, elevM: -100 }, { distKm: 1, elevM: -125 }, { distKm: 1.5, elevM: -120 }, { distKm: 2, elevM: -128 }, { distKm: 2.5, elevM: -110 }, { distKm: 3, elevM: -85 }],
    photoEarth: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.mars,
    photoEarthCaption: 'Dallol, Depresión de Danakil — Fosa tectónica y chimeneas de sulfatos',
    photoSpaceCaption: 'Meridiani Planum, Marte (Evaporitas y Jarosita) — NASA/Opportunity',
    inspectionGallery: [
      { title: 'Depresión Tectónica (-125m)', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', caption: 'Piso tectónico bajo el nivel medio del mar' },
      { title: 'Costras Salinas Hiperácidas', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80', caption: 'Salmueras de pH <0 con precipitación de jarosita' },
      { title: 'Mapeo ASTER de Azufre', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', caption: 'Emisión de dióxido de azufre e hidrotérmicos' },
      { title: 'Sistemas Hidrotermales Marcianos', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.mars, caption: 'Modelado del Marte del período Hespérico' },
    ],
  },
];
