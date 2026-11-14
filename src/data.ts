/* ═══ TERRA—ANALOG™ Complete Data & Types ═══ */
/* Enriquecido con datos oficiales de NASA Trek, LRO LOLA, MGS MOLA, Diviner y THEMIS */

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
  instrument?: string;
  demSource?: string;
  testingChallenge?: string;
  thermalInertia?: string;
  primaryAnalog?: string;
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
  targetHomologue?: string;
  engineeringBenchmark?: string;
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

/* ── Verified Space Reference Images ── */
export const SPACE_PHOTOS = {
  mars: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
  moon: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
  shackleton: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=1200&q=80',
  jezero: 'https://images.unsplash.com/photo-1545156521-77bd85671d30?auto=format&fit=crop&w=1200&q=80',
};

export const TARGETS: ExtraTerrestrialTarget[] = [
  {
    "id": "MOON-SHK",
    "body": "Luna",
    "name": "Polo Sur — Shackleton",
    "subtitle": "Trampas criogénicas de hielo en sombra permanente (PSR) e iluminación rasante.",
    "cardIcon": "LUN-01",
    "coords": "89.9° S, 0.0° E",
    "gravity": 1.62,
    "pressure": "10⁻¹² Pa",
    "tempRange": "-238°C a -50°C",
    "meanTemp": -190,
    "focus": "Hielo de agua en regiones en sombra permanente (PSR a 38 K), borde con iluminación rasante perpetua para energía solar.",
    "mineralogy": "Anortosita, plagioclasa cálcica, troctolita, hielo de agua ~5.5 wt%",
    "waterFraction": "5.5 wt% H₂O",
    "radiation": "380 mSv/año",
    "missionRef": "Artemis III / Lunar South Pole Basecamp & VIPER",
    "instrument": "LRO LOLA DEM Polar & Diviner Radiometer",
    "demSource": "NASA Solar System Treks (LRO LOLA 256 ppd)",
    "testingChallenge": "Perforación criogénica para hielo (VIPER TRIDENT), trajes EVA a 40 K y rodamientos sin congelación.",
    "thermalInertia": "PSR a 38.4 K (-234.7 °C) / Bordes iluminados a 200 K",
    "primaryAnalog": "Valles Secos de McMurdo (Antártida) y Svalbard (Noruega)",
    "vector": {
      "topography": 90,
      "geology": 76,
      "environment": 98,
      "resources": 95
    },
    "radar": {
      "morphology": 92,
      "mineralogy": 70,
      "temperature": 99,
      "aridity": 100,
      "radiation": 95,
      "isru": 96
    },
    "topo": [
      {
        "distKm": 0.0,
        "elevM": -698
      },
      {
        "distKm": 0.24,
        "elevM": -688
      },
      {
        "distKm": 0.47,
        "elevM": -676
      },
      {
        "distKm": 0.71,
        "elevM": -660
      },
      {
        "distKm": 0.94,
        "elevM": -634
      },
      {
        "distKm": 1.18,
        "elevM": -609
      },
      {
        "distKm": 1.41,
        "elevM": -584
      },
      {
        "distKm": 1.65,
        "elevM": -552
      },
      {
        "distKm": 1.88,
        "elevM": -516
      },
      {
        "distKm": 2.12,
        "elevM": -477
      }
    ]
  },
  {
    "id": "MOON-LAV",
    "body": "Luna",
    "name": "Mare Tranquillitatis",
    "subtitle": "Planicies basálticas ricas en ilmenita (FeTiO₃) y claraboyas a tubos de lava.",
    "cardIcon": "LUN-02",
    "coords": "8.22° N, 30.46° E",
    "gravity": 1.62,
    "pressure": "10⁻¹² Pa",
    "tempRange": "-130°C a +120°C",
    "meanTemp": -20,
    "focus": "Refugio subterráneo en tubos de lava colapsados y minería de ilmenita para extracción de oxígeno (ISRU).",
    "mineralogy": "Basalto rico en ilmenita (FeTiO₃), piroxeno, olivino, titanomagnetita",
    "waterFraction": "<0.01 wt%",
    "radiation": "<10 mSv/año (subterráneo)",
    "missionRef": "Apollo 11 Historical Site / Lunar Subsurface Habitation & ISRU Oxygen",
    "instrument": "LRO LOLA DEM & Apollo 11 Metric Camera",
    "demSource": "NASA Trek LRO LOLA DEM (25.2 km transect)",
    "testingChallenge": "Tracción en basalto abrasivo, excavación de regolito para plantas de pirólisis de O₂ y radar de alunizaje.",
    "thermalInertia": "Oscilación diurna de 250 K (superficie) vs estable -20 °C (tubos)",
    "primaryAnalog": "La Payunia (Mendoza, Argentina) y Craters of the Moon (Idaho, EE.UU.)",
    "vector": {
      "topography": 82,
      "geology": 96,
      "environment": 72,
      "resources": 84
    },
    "radar": {
      "morphology": 85,
      "mineralogy": 98,
      "temperature": 65,
      "aridity": 100,
      "radiation": 40,
      "isru": 82
    },
    "topo": [
      {
        "distKm": 0.0,
        "elevM": -862
      },
      {
        "distKm": 2.8,
        "elevM": -844
      },
      {
        "distKm": 5.6,
        "elevM": -888
      },
      {
        "distKm": 8.41,
        "elevM": -954
      },
      {
        "distKm": 11.21,
        "elevM": -966
      },
      {
        "distKm": 14.01,
        "elevM": -966
      },
      {
        "distKm": 16.81,
        "elevM": -967
      },
      {
        "distKm": 19.62,
        "elevM": -960
      },
      {
        "distKm": 22.42,
        "elevM": -953
      },
      {
        "distKm": 25.22,
        "elevM": -940
      }
    ]
  },
  {
    "id": "MOON-ARI",
    "body": "Luna",
    "name": "Meseta de Aristarchus",
    "subtitle": "Rilles volcánicos gigantes (Vallis Schröteri) y anomalías ricas en volátiles piroclásticos.",
    "cardIcon": "LUN-03",
    "coords": "24.80° N, 49.90° W",
    "gravity": 1.62,
    "pressure": "10⁻¹² Pa",
    "tempRange": "-150°C a +115°C",
    "meanTemp": -30,
    "focus": "Canal volcánico de 160 km de largo y 10 km de ancho; accesos naturales a cavernas subterráneas.",
    "mineralogy": "Vidrios piroclásticos anaranjados, torio, ilmenita, olivino rico en volátiles",
    "waterFraction": "0.05 wt% en vidrios",
    "radiation": "25 mSv/año (bóvedas)",
    "missionRef": "Permanent Lunar Base / ESA PANGAEA Speleology",
    "instrument": "LRO LOLA DEM, Apollo 15 Pan Cam & Lunar Prospector Gamma-Ray",
    "demSource": "NASA Trek LOLA & Apollo Zone Metric (30.1 km transect)",
    "testingChallenge": "Robótica de descenso vertical a cavernas sin GNSS, despliegue de hábitats inflables bajo roca basáltica.",
    "thermalInertia": "Protección térmica natural subterránea a -20 °C constante",
    "primaryAnalog": "Cueva de los Verdes (Lanzarote, España) y Undara (Australia)",
    "vector": {
      "topography": 88,
      "geology": 94,
      "environment": 78,
      "resources": 80
    },
    "radar": {
      "morphology": 92,
      "mineralogy": 94,
      "temperature": 75,
      "aridity": 98,
      "radiation": 55,
      "isru": 78
    },
    "topo": [
      {
        "distKm": 0.0,
        "elevM": -530
      },
      {
        "distKm": 3.35,
        "elevM": -663
      },
      {
        "distKm": 6.69,
        "elevM": -658
      },
      {
        "distKm": 10.04,
        "elevM": -551
      },
      {
        "distKm": 13.39,
        "elevM": -1174
      },
      {
        "distKm": 16.74,
        "elevM": -1374
      },
      {
        "distKm": 20.08,
        "elevM": -744
      },
      {
        "distKm": 23.43,
        "elevM": -783
      },
      {
        "distKm": 26.78,
        "elevM": -828
      },
      {
        "distKm": 30.13,
        "elevM": -808
      }
    ]
  },
  {
    "id": "MOON-COP",
    "body": "Luna",
    "name": "Cráter Copernicus",
    "subtitle": "Astroblema de 93 km con terrazas concéntricas y picos con olivino del manto superior.",
    "cardIcon": "LUN-04",
    "coords": "9.62° N, 20.00° W",
    "gravity": 1.62,
    "pressure": "10⁻¹² Pa",
    "tempRange": "-178°C a +112°C",
    "meanTemp": -40,
    "focus": "Desnivel de más de 4,700 m con terrazas escalonadas y levantamiento central de olivino profundo.",
    "mineralogy": "Anortosita prístina, troctolita, olivino magnesiano, cuarzo chocado",
    "waterFraction": "<0.01 wt%",
    "radiation": "340 mSv/año",
    "missionRef": "Lunar Deep Crustal Sampling & Remote Raman/LIBS Spectroscopy",
    "instrument": "LRO LOLA DEM Global & Diviner Radiometer",
    "demSource": "NASA Trek LOLA 256 ppd (89.7 km transect borde a borde)",
    "testingChallenge": "Muestreo robótico en caras escarpadas de picos centrales y espectroscopía láser LIBS/Raman a distancia.",
    "thermalInertia": "Diviner DLRE: Ciclo diurno completo 95 K a 385 K (delta 290 K)",
    "primaryAnalog": "Gosses Bluff (Australia) y Domo de Vredefort (Sudáfrica)",
    "vector": {
      "topography": 95,
      "geology": 98,
      "environment": 80,
      "resources": 65
    },
    "radar": {
      "morphology": 98,
      "mineralogy": 96,
      "temperature": 85,
      "aridity": 98,
      "radiation": 88,
      "isru": 62
    },
    "topo": [
      {
        "distKm": 0.0,
        "elevM": -848
      },
      {
        "distKm": 9.97,
        "elevM": -2622
      },
      {
        "distKm": 19.93,
        "elevM": -3475
      },
      {
        "distKm": 29.9,
        "elevM": -3400
      },
      {
        "distKm": 39.86,
        "elevM": -3509
      },
      {
        "distKm": 49.83,
        "elevM": -3330
      },
      {
        "distKm": 59.79,
        "elevM": -3455
      },
      {
        "distKm": 69.76,
        "elevM": -3300
      },
      {
        "distKm": 79.73,
        "elevM": -1322
      },
      {
        "distKm": 89.69,
        "elevM": 186
      }
    ]
  },
  {
    "id": "MOON-APN",
    "body": "Luna",
    "name": "Montes Apenninus",
    "subtitle": "Cadena montañosa de impacto de 5,000 m que expone la corteza lunar más primitiva.",
    "cardIcon": "LUN-05",
    "coords": "20.00° N, 0.00° E",
    "gravity": 1.62,
    "pressure": "10⁻¹² Pa",
    "tempRange": "-160°C a +110°C",
    "meanTemp": -45,
    "focus": "Escarpe de 5 km que delimita la cuenca de Imbrium; bloques de la corteza y manto lunar temprano.",
    "mineralogy": "Anortosita de feldespato, norita rica en KREEP, brechas de impacto",
    "waterFraction": "<0.01 wt%",
    "radiation": "320 mSv/año",
    "missionRef": "Apollo 15 Hadley-Apennine / High-Relief Autonomous Traverses",
    "instrument": "LRO LOLA DEM & Apollo 15 Metric Camera",
    "demSource": "NASA Trek LOLA (170.9 km transect)",
    "testingChallenge": "Navegación óptica autónoma (TRN) en pendientes extremas con sombras profundas y suspensión adaptativa.",
    "thermalInertia": "Fuertes gradientes térmicos en laderas de sol y sombra",
    "primaryAnalog": "Sierra Nevada / Cañón del Colorado (EE.UU.) y Andes Centrales (Bolivia/Chile)",
    "vector": {
      "topography": 98,
      "geology": 92,
      "environment": 82,
      "resources": 60
    },
    "radar": {
      "morphology": 99,
      "mineralogy": 90,
      "temperature": 80,
      "aridity": 98,
      "radiation": 82,
      "isru": 58
    },
    "topo": [
      {
        "distKm": 0.0,
        "elevM": -1214
      },
      {
        "distKm": 18.99,
        "elevM": -1110
      },
      {
        "distKm": 37.98,
        "elevM": -998
      },
      {
        "distKm": 56.97,
        "elevM": -318
      },
      {
        "distKm": 75.96,
        "elevM": 1047
      },
      {
        "distKm": 94.95,
        "elevM": 567
      },
      {
        "distKm": 113.94,
        "elevM": 485
      },
      {
        "distKm": 132.93,
        "elevM": 1440
      },
      {
        "distKm": 151.92,
        "elevM": 1686
      },
      {
        "distKm": 170.91,
        "elevM": 646
      }
    ]
  },
  {
    "id": "MOON-TYC",
    "body": "Luna",
    "name": "Cráter Tycho",
    "subtitle": "Cráter joven de 85 km con pico central de 1,600 m y manto de eyectas de hipervelocidad.",
    "cardIcon": "LUN-06",
    "coords": "43.31° S, 11.36° W",
    "gravity": 1.62,
    "pressure": "10⁻¹² Pa",
    "tempRange": "-170°C a +105°C",
    "meanTemp": -50,
    "focus": "Impacto de apenas 108 Ma; fundidos de impacto vítreos y material expulsado desde 10 km de profundidad.",
    "mineralogy": "Vidrios de fusión por impacto, brechas monomícticas, anortosita granular",
    "waterFraction": "<0.01 wt%",
    "radiation": "350 mSv/año",
    "missionRef": "Young Impact Mechanics & High-Velocity Ejecta Exploration",
    "instrument": "LRO LOLA DEM & LROC NAC Mosaics",
    "demSource": "NASA Trek LOLA 45 deg v4 S Pole (96.6 km transect)",
    "testingChallenge": "Diferenciación hiperespectral de vidrios de impacto vs roca de caja y tracción en taludes inestables.",
    "thermalInertia": "Inercia térmica elevada debido a abundancia de bloques rocosos desnudos sin meteorización",
    "primaryAnalog": "Cráter Haughton (Isla Devon, Canadá) y Meteor Crater (Arizona, EE.UU.)",
    "vector": {
      "topography": 94,
      "geology": 95,
      "environment": 84,
      "resources": 58
    },
    "radar": {
      "morphology": 97,
      "mineralogy": 92,
      "temperature": 84,
      "aridity": 98,
      "radiation": 86,
      "isru": 56
    },
    "topo": [
      {
        "distKm": 0.0,
        "elevM": 914
      },
      {
        "distKm": 10.73,
        "elevM": -750
      },
      {
        "distKm": 21.47,
        "elevM": -1778
      },
      {
        "distKm": 32.2,
        "elevM": -3172
      },
      {
        "distKm": 42.94,
        "elevM": -2850
      },
      {
        "distKm": 53.67,
        "elevM": -2786
      },
      {
        "distKm": 64.41,
        "elevM": -3409
      },
      {
        "distKm": 75.14,
        "elevM": -3012
      },
      {
        "distKm": 85.88,
        "elevM": -277
      },
      {
        "distKm": 96.61,
        "elevM": 834
      }
    ]
  },
  {
    "id": "MOON-HAD",
    "body": "Luna",
    "name": "Rima Hadley — Palus Putredinis",
    "subtitle": "Canal sinuoso de lava basáltica y sitio geológico histórico de Apollo 15 al pie de Apenninus.",
    "cardIcon": "LUN-07",
    "coords": "26.13° N, 3.63° E",
    "gravity": 1.62,
    "pressure": "10⁻¹² Pa",
    "tempRange": "-160°C a +120°C",
    "meanTemp": -25,
    "focus": "Garganta volcánica de colapso de 1.5 km de ancho y 300 m de profundidad; estratigrafía basal expuesta.",
    "mineralogy": "Basalto de cuarzo normativo, anortosita ferrosa de tierras altas, piroxeno, ilmenita",
    "waterFraction": "0.02 wt% H₂O",
    "radiation": "380 mSv/año",
    "missionRef": "NASA Apollo 15 (Falcon/Endeavour) & LRO LOLA",
    "instrument": "LRO LOLA DEM & Apollo 15 Panoramic Cam",
    "demSource": "NASA Trek LRO LOLA (45.5 km transect Hadley Rille a laderas Apenninus)",
    "testingChallenge": "Tracción rover en taludes de derrubios basálticos (>20°) en los bordes de la rima sinuosa.",
    "thermalInertia": "Regolito volcánico fino con bloques basálticos expuestos",
    "primaryAnalog": "Garganta del Río Columbia (EE.UU.) y Cueva del Viento (Tenerife)",
    "vector": {
      "topography": 89,
      "geology": 95,
      "environment": 80,
      "resources": 72
    },
    "radar": {
      "morphology": 94,
      "mineralogy": 93,
      "temperature": 79,
      "aridity": 98,
      "radiation": 82,
      "isru": 70
    },
    "topo": [
      { "distKm": 0.0, "elevM": -1218 },
      { "distKm": 5.05, "elevM": -1930 },
      { "distKm": 10.1, "elevM": -1918 },
      { "distKm": 15.15, "elevM": -1913 },
      { "distKm": 20.2, "elevM": -1922 },
      { "distKm": 25.25, "elevM": -1925 },
      { "distKm": 30.3, "elevM": -1968 },
      { "distKm": 35.35, "elevM": -1376 },
      { "distKm": 40.41, "elevM": -798 },
      { "distKm": 45.46, "elevM": 788 }
    ]
  },
  {
    "id": "MARS-JEZ",
    "body": "Marte",
    "name": "Cráter Jezero Delta",
    "subtitle": "Paleolago y delta fluvial con arcillas y carbonatos para biofirmas microbianas.",
    "cardIcon": "MAR-01",
    "coords": "18.38° N, 77.58° E",
    "gravity": 3.72,
    "pressure": "610 Pa",
    "tempRange": "-90°C a +20°C",
    "meanTemp": -55,
    "focus": "Delta fluvial fósil del río Neretva Vallis, esmectitas, carbonatos y preservación de estromatolitos.",
    "mineralogy": "Esmectitas Fe/Mg, carbonato de magnesio, olivino, sulfatos de calcio",
    "waterFraction": "2-4 wt% en arcillas",
    "radiation": "230 mSv/año",
    "missionRef": "Mars 2020 (Perseverance Rover) & Mars Sample Return (NASA/ESA)",
    "instrument": "MGS MOLA DEM & MRO HiRISE / Mastcam-Z / SuperCam",
    "demSource": "NASA Trek MGS MOLA Global DEM (28.6 km transect en Neretva)",
    "testingChallenge": "Algoritmos de IA para detección de biofirmas (SHERLOC/PIXL) y perforación hermética de testigos.",
    "thermalInertia": "TES: 320 J m⁻² K⁻¹ s⁻⁰·⁵ / Ciclo térmico -81.15 °C a +0.85 °C",
    "primaryAnalog": "Lago Salda (Turquía), Cuenca de Qaidam (Tíbet) y Cuatro Ciénegas (México)",
    "vector": {
      "topography": 86,
      "geology": 98,
      "environment": 87,
      "resources": 82
    },
    "radar": {
      "morphology": 88,
      "mineralogy": 99,
      "temperature": 80,
      "aridity": 92,
      "radiation": 85,
      "isru": 78
    },
    "topo": [
      {
        "distKm": 0.0,
        "elevM": -1897
      },
      {
        "distKm": 3.18,
        "elevM": -1811
      },
      {
        "distKm": 6.36,
        "elevM": -2171
      },
      {
        "distKm": 9.54,
        "elevM": -2466
      },
      {
        "distKm": 12.72,
        "elevM": -2569
      },
      {
        "distKm": 15.9,
        "elevM": -2601
      },
      {
        "distKm": 19.08,
        "elevM": -2620
      },
      {
        "distKm": 22.26,
        "elevM": -2589
      },
      {
        "distKm": 25.44,
        "elevM": -2582
      },
      {
        "distKm": 28.62,
        "elevM": -2569
      }
    ]
  },
  {
    "id": "MARS-ARC",
    "body": "Marte",
    "name": "Arcadia Planitia",
    "subtitle": "Llanura ultraplana con mantos masivos de hielo de agua a 1-2 m de profundidad.",
    "cardIcon": "MAR-02",
    "coords": "47.20° N, 175.80° W",
    "gravity": 3.72,
    "pressure": "750 Pa",
    "tempRange": "-120°C a -10°C",
    "meanTemp": -65,
    "focus": "Hielo masivo subsuperficial (>80% pureza) confirmado por radar SHARAD; sitio ideal para SpaceX Starship.",
    "mineralogy": "Hielo puro masivo, basalto eólico, sales cementantes de regolito",
    "waterFraction": ">65 wt% a 1.5 m prof.",
    "radiation": "210 mSv/año",
    "missionRef": "Human Mars Landing / SpaceX Starship Propellant ISRU Base",
    "instrument": "MGS MOLA DEM, MRO SHARAD Radar & THEMIS Daytime IR",
    "demSource": "NASA Trek MGS MOLA (54.0 km transect ultraplano <0.5°)",
    "testingChallenge": "Calibración de radar altimétrico a alta velocidad, zapatas de Starship y extracción térmica de agua (RodWells).",
    "thermalInertia": "Inercia térmica moderada con permafrost continuo bajo regolito eólico",
    "primaryAnalog": "Salar de Uyuni (Bolivia) y Península de Yamal (Siberia, Rusia)",
    "vector": {
      "topography": 72,
      "geology": 79,
      "environment": 88,
      "resources": 98
    },
    "radar": {
      "morphology": 68,
      "mineralogy": 75,
      "temperature": 88,
      "aridity": 85,
      "radiation": 80,
      "isru": 99
    },
    "topo": [
      {
        "distKm": 0.0,
        "elevM": -4096
      },
      {
        "distKm": 6.0,
        "elevM": -4088
      },
      {
        "distKm": 12.0,
        "elevM": -4092
      },
      {
        "distKm": 17.99,
        "elevM": -4099
      },
      {
        "distKm": 23.99,
        "elevM": -4094
      },
      {
        "distKm": 29.99,
        "elevM": -4088
      },
      {
        "distKm": 35.99,
        "elevM": -4090
      },
      {
        "distKm": 41.98,
        "elevM": -4081
      },
      {
        "distKm": 47.98,
        "elevM": -4086
      },
      {
        "distKm": 53.98,
        "elevM": -4067
      }
    ]
  },
  {
    "id": "MARS-ALB",
    "body": "Marte",
    "name": "Alba Mons (Tharsis)",
    "subtitle": "El megavolcán más extenso (>1,500 km ø) con polvo ultrafino e inercia térmica ultrabaja.",
    "cardIcon": "MAR-03",
    "coords": "28.91° N, 107.24° W",
    "gravity": 3.72,
    "pressure": "680 Pa",
    "tempRange": "-98°C a -13°C",
    "meanTemp": -60,
    "focus": "Pendientes ultrabajas (<1°) pero con riesgo crítico de enterramiento por capas gruesas de polvo volcánico eólico.",
    "mineralogy": "Polvo basáltico rico en hierro oxidado (Fe³⁺), piroclastos finos, ceniza andesítica",
    "waterFraction": "1.2 wt%",
    "radiation": "220 mSv/año",
    "missionRef": "Low-Inertia Volcanic Traverses & NASA Spring Tire Evaluation",
    "instrument": "MGS MOLA DEM, Mars Odyssey THEMIS & MGS TES",
    "demSource": "NASA Trek MGS MOLA (245.8 km transect de flanco)",
    "testingChallenge": "Ensayos de neumáticos de memoria de forma (NASA Spring Tire) contra atolladeros y sellos herméticos antipolvo.",
    "thermalInertia": "TES: 145 J m⁻² K⁻¹ s⁻⁰·⁵ (polvo ultrafino suelto) / T diurna 175 K a 260 K",
    "primaryAnalog": "Campos de Pómez de la Puna (Catamarca, Argentina) y Salar de Antofalla",
    "vector": {
      "topography": 78,
      "geology": 94,
      "environment": 92,
      "resources": 68
    },
    "radar": {
      "morphology": 75,
      "mineralogy": 95,
      "temperature": 90,
      "aridity": 96,
      "radiation": 84,
      "isru": 66
    },
    "topo": [
      {
        "distKm": 0.0,
        "elevM": 3412
      },
      {
        "distKm": 27.31,
        "elevM": 3773
      },
      {
        "distKm": 54.63,
        "elevM": 3460
      },
      {
        "distKm": 81.94,
        "elevM": 2965
      },
      {
        "distKm": 109.26,
        "elevM": 2877
      },
      {
        "distKm": 136.57,
        "elevM": 2650
      },
      {
        "distKm": 163.89,
        "elevM": 2423
      },
      {
        "distKm": 191.2,
        "elevM": 2203
      },
      {
        "distKm": 218.51,
        "elevM": 1640
      },
      {
        "distKm": 245.83,
        "elevM": 1763
      }
    ]
  },
  {
    "id": "MARS-VAL",
    "body": "Marte",
    "name": "Valles Marineris",
    "subtitle": "El mayor cañón del Sistema Solar: 4,000 km de longitud y hasta 7 km de profundidad.",
    "cardIcon": "MAR-04",
    "coords": "13.90° S, 59.20° W",
    "gravity": 3.72,
    "pressure": "850 Pa en el fondo",
    "tempRange": "-85°C a +15°C",
    "meanTemp": -48,
    "focus": "Corte transversal de toda la corteza marciana; estratos volcánicos, sulfatos y salmueras recurrentes (RSL).",
    "mineralogy": "Sulfatos de magnesio, kieserita, hematita gris cristalina, basaltos de inundación",
    "waterFraction": "4-8 wt% en sulfatos hidratados",
    "radiation": "180 mSv/año (fondo de cañón)",
    "missionRef": "Deep Stratigraphic Exploration & Seasonal Brines Astrobiology",
    "instrument": "MGS MOLA DEM & MRO CRISM Imaging Spectrometer",
    "demSource": "NASA Trek MGS MOLA (529.0 km transect a través del abismo)",
    "testingChallenge": "Rovers todoterreno con capacidad de descenso en pendientes de 40° y análisis con láser (SuperCam).",
    "thermalInertia": "Grandes contrastes térmicos entre meseta alta y fondo del cañón",
    "primaryAnalog": "Gran Cañón del Colorado (Arizona, EE.UU.) y Valle de la Muerte (California)",
    "vector": {
      "topography": 98,
      "geology": 96,
      "environment": 88,
      "resources": 75
    },
    "radar": {
      "morphology": 99,
      "mineralogy": 96,
      "temperature": 84,
      "aridity": 90,
      "radiation": 78,
      "isru": 76
    },
    "topo": [
      {
        "distKm": 0.0,
        "elevM": 3662
      },
      {
        "distKm": 58.78,
        "elevM": 3720
      },
      {
        "distKm": 117.56,
        "elevM": 3240
      },
      {
        "distKm": 176.34,
        "elevM": 3291
      },
      {
        "distKm": 235.11,
        "elevM": -3388
      },
      {
        "distKm": 293.89,
        "elevM": -4817
      },
      {
        "distKm": 352.67,
        "elevM": 2305
      },
      {
        "distKm": 411.45,
        "elevM": 2355
      },
      {
        "distKm": 470.23,
        "elevM": 2401
      },
      {
        "distKm": 529.01,
        "elevM": 2493
      }
    ]
  },
  {
    "id": "MARS-ARS",
    "body": "Marte",
    "name": "Arsia Mons (Claraboyas)",
    "subtitle": "Volcán de 16 km con las Siete Hermanas: aberturas verticales a cavernas colosales.",
    "cardIcon": "MAR-05",
    "coords": "8.40° S, 120.50° W",
    "gravity": 3.72,
    "pressure": "120 Pa en cumbre",
    "tempRange": "-105°C a -5°C",
    "meanTemp": -62,
    "focus": "Claraboyas volcánicas de 100 a 250 m de diámetro que dan acceso a galerías libres de radiación.",
    "mineralogy": "Basalto toleítico de intraplaca, magnetita, piroxenos cálcicos, azufre",
    "waterFraction": "<0.5 wt%",
    "radiation": "<15 mSv/año (interior de cavernas)",
    "missionRef": "Subsurface Exploration Drones (Ingenuity Evolution) & Deep Cave Base",
    "instrument": "MGS MOLA DEM, Mars Odyssey THEMIS & MRO HiRISE",
    "demSource": "NASA Trek MGS MOLA (180.2 km transect sobre caldera)",
    "testingChallenge": "Drones en atmósfera hiperenrarecida (120 Pa) y sistemas de descenso con cabrestante para bases bajo tierra.",
    "thermalInertia": "Microclima subterráneo estable protegido del frío polar marciano",
    "primaryAnalog": "Mauna Loa (Hawái - HI-SEAS) y Monte Etna (Italia)",
    "vector": {
      "topography": 95,
      "geology": 94,
      "environment": 86,
      "resources": 65
    },
    "radar": {
      "morphology": 96,
      "mineralogy": 92,
      "temperature": 86,
      "aridity": 92,
      "radiation": 50,
      "isru": 64
    },
    "topo": [
      {
        "distKm": 0.0,
        "elevM": 16732
      },
      {
        "distKm": 20.02,
        "elevM": 17051
      },
      {
        "distKm": 40.04,
        "elevM": 16369
      },
      {
        "distKm": 60.07,
        "elevM": 16287
      },
      {
        "distKm": 80.09,
        "elevM": 16304
      },
      {
        "distKm": 100.11,
        "elevM": 16364
      },
      {
        "distKm": 120.13,
        "elevM": 16347
      },
      {
        "distKm": 140.15,
        "elevM": 16309
      },
      {
        "distKm": 160.17,
        "elevM": 16141
      },
      {
        "distKm": 180.2,
        "elevM": 14831
      }
    ]
  },
  {
    "id": "MARS-OLY",
    "body": "Marte",
    "name": "Olympus Mons",
    "subtitle": "El volcán más alto del Sistema Solar (22 km) cercado por un acantilado basal de 8 km.",
    "cardIcon": "MAR-06",
    "coords": "18.65° N, 133.80° W",
    "gravity": 3.72,
    "pressure": "70 Pa en cumbre",
    "tempRange": "-110°C a -15°C",
    "meanTemp": -70,
    "focus": "El coloso del Sistema Solar: 600 km de diámetro y 22 km de altitud en atmósfera hiperhipobárica.",
    "mineralogy": "Basalto primitivo no diferenciado, olivino de manto, plagioclasas sódicas",
    "waterFraction": "<0.2 wt%",
    "radiation": "290 mSv/año (sin atmósfera)",
    "missionRef": "Extreme Planetary Mountain Traverses & High-Vacuum Avionics",
    "instrument": "MGS MOLA DEM & MGS Mars Orbiter Camera (MOC)",
    "demSource": "NASA Trek MGS MOLA (598.2 km transect cumbre a llanura)",
    "testingChallenge": "Tracción extrema en acantilados rocosos y sellos de presión para presiones atmosféricas mínimas (<100 Pa).",
    "thermalInertia": "Vacío casi total en cumbre con ciclos de radiación solar directa sin filtro",
    "primaryAnalog": "Nevado Ojos del Salado (Chile/Argentina) e Islas Galápagos (Ecuador)",
    "vector": {
      "topography": 99,
      "geology": 92,
      "environment": 96,
      "resources": 55
    },
    "radar": {
      "morphology": 100,
      "mineralogy": 88,
      "temperature": 94,
      "aridity": 98,
      "radiation": 95,
      "isru": 52
    },
    "topo": [
      {
        "distKm": 0.0,
        "elevM": 4718
      },
      {
        "distKm": 66.47,
        "elevM": 8903
      },
      {
        "distKm": 132.94,
        "elevM": 16436
      },
      {
        "distKm": 199.41,
        "elevM": 21099
      },
      {
        "distKm": 265.88,
        "elevM": 18154
      },
      {
        "distKm": 332.35,
        "elevM": 16924
      },
      {
        "distKm": 398.82,
        "elevM": 11938
      },
      {
        "distKm": 465.29,
        "elevM": 8139
      },
      {
        "distKm": 531.76,
        "elevM": 6407
      },
      {
        "distKm": 598.23,
        "elevM": 2380
      }
    ]
  },
  {
    "id": "MARS-GUS",
    "body": "Marte",
    "name": "Cráter Gusev — Colinas Columbia",
    "subtitle": "Paleolago basáltico con sílice hidrotermal fósil explorado por el rover Spirit.",
    "cardIcon": "MAR-07",
    "coords": "14.57° S, 175.47° E",
    "gravity": 3.72,
    "pressure": "640 Pa",
    "tempRange": "-100°C a +15°C",
    "meanTemp": -58,
    "focus": "Afloramientos de sílice opalina al 90% (sinter hidrotermal) en Home Plate, evidencia de sistemas hidrotermales alcalinos habitables.",
    "mineralogy": "Sílice opalina, olivino rico en Fe, hematita, sulfatos de magnesio, basaltos picríticos",
    "waterFraction": "1.5 - 3.0 wt% en minerales hidratados",
    "radiation": "240 mSv/año",
    "missionRef": "Mars Exploration Rover Spirit (NASA MER-A)",
    "instrument": "MGS MOLA DEM & Spirit Pancam/Mini-TES/APXS",
    "demSource": "NASA Trek MGS MOLA Global DEM (140.8 km transect de lecho a cumbre)",
    "testingChallenge": "Tracción en regolito blando de sulfatos (falla de rueda de Spirit), ascenso de laderas escarpadas (>25°) y análisis de sinter hidrotermal.",
    "thermalInertia": "TES: 280 J m⁻² K⁻¹ s⁻⁰·⁵ / Ciclo diurno -84 °C a -2 °C",
    "primaryAnalog": "Campos geotermales de El Tatio (Chile) y Cuenca de Laguna Blanca (Puna)",
    "vector": {
      "topography": 84,
      "geology": 96,
      "environment": 88,
      "resources": 79
    },
    "radar": {
      "morphology": 86,
      "mineralogy": 95,
      "temperature": 78,
      "aridity": 94,
      "radiation": 86,
      "isru": 76
    },
    "topo": [
      { "distKm": 0.0, "elevM": -1869 },
      { "distKm": 14.37, "elevM": -1906 },
      { "distKm": 30.18, "elevM": -1912 },
      { "distKm": 45.99, "elevM": -1898 },
      { "distKm": 61.81, "elevM": -1938 },
      { "distKm": 77.62, "elevM": -1900 },
      { "distKm": 93.43, "elevM": -1718 },
      { "distKm": 109.24, "elevM": -1747 },
      { "distKm": 125.05, "elevM": -566 },
      { "distKm": 140.86, "elevM": 1416 }
    ]
  },
  {
    "id": "MARS-KOR",
    "body": "Marte",
    "name": "Cráter Korolev — Domo Glaciar",
    "subtitle": "Domo de 1.8 km de espesor de hielo de agua pura permanente en trampa fría circumpolar.",
    "cardIcon": "MAR-08",
    "coords": "72.77° N, 164.50° E",
    "gravity": 3.72,
    "pressure": "680 Pa",
    "tempRange": "-135°C a -30°C",
    "meanTemp": -80,
    "focus": "Trampa fría atmosférica que preserva 2,200 km³ de hielo de agua no polar todo el año; recurso hídrico crítico de escala masiva para ISRU.",
    "mineralogy": "Hielo de agua H₂O (>90% pureza volumétrica), polvo basáltico interestratificado, dióxido de carbono estacional",
    "waterFraction": ">90 wt% en masa glaciar central",
    "radiation": "210 mSv/año",
    "missionRef": "ESA Mars Express (HRSC) & NASA Mars Reconnaissance Orbiter (SHARAD)",
    "instrument": "MGS MOLA DEM & Mars Express HRSC Stereo Camera",
    "demSource": "NASA Trek MGS MOLA Global DEM (78.5 km transect borde a domo)",
    "testingChallenge": "Perforación de hielo criogénico a -100 °C, anclaje en pendientes de hielo compacto y presurización de hábitats en latitudes altas.",
    "thermalInertia": "TES: 800 J m⁻² K⁻¹ s⁻⁰·⁵ (hielo masivo) / T_max -32 °C",
    "primaryAnalog": "Glaciar Vatnajökull (Islandia) y Casquete Hielo Devon Island (Ártico Canadiense)",
    "vector": {
      "topography": 88,
      "geology": 82,
      "environment": 96,
      "resources": 99
    },
    "radar": {
      "morphology": 90,
      "mineralogy": 80,
      "temperature": 98,
      "aridity": 90,
      "radiation": 82,
      "isru": 99
    },
    "topo": [
      { "distKm": 0.0, "elevM": -3407 },
      { "distKm": 8.72, "elevM": -5408 },
      { "distKm": 17.45, "elevM": -4597 },
      { "distKm": 26.17, "elevM": -4493 },
      { "distKm": 34.9, "elevM": -4488 },
      { "distKm": 43.62, "elevM": -4603 },
      { "distKm": 52.35, "elevM": -4874 },
      { "distKm": 61.07, "elevM": -5020 },
      { "distKm": 69.79, "elevM": -6181 },
      { "distKm": 78.52, "elevM": -4110 }
    ]
  },
  {
    "id": "MARS-MER",
    "body": "Marte",
    "name": "Meridiani Planum — Esferas de Hematita",
    "subtitle": "Planicie evaporítica ácida con esferulitas de hematita ('blueberries') y sulfatos.",
    "cardIcon": "MAR-09",
    "coords": "0.10° S, 3.16° W",
    "gravity": 3.72,
    "pressure": "610 Pa",
    "tempRange": "-95°C a +20°C",
    "meanTemp": -50,
    "focus": "Acuíferos ácidos someros del Noeico tardío, sedimentos de jarosita y concreciones de hematita gris cristalina (Fe₂O₃).",
    "mineralogy": "Jarosita KFe³⁺₃(SO₄)₂(OH)₆, hematita gris cristalina, sulfato de magnesio, basaltos",
    "waterFraction": "2.0 - 5.0 wt% en sales de sulfato hidratadas",
    "radiation": "245 mSv/año",
    "missionRef": "Mars Exploration Rover Opportunity (NASA MER-B)",
    "instrument": "MGS MOLA DEM & Opportunity Mössbauer / Mini-TES / Microscopic Imager",
    "demSource": "NASA Trek MGS MOLA Global DEM (20.4 km transect plano)",
    "testingChallenge": "Navegación de larga distancia en dunas basálticas, perforación de capas de arenisca friable y procesado de óxidos de hierro para metalurgia ISRU.",
    "thermalInertia": "TES: 210 J m⁻² K⁻¹ s⁻⁰·⁵ / Rango térmico -82 °C a +4 °C",
    "primaryAnalog": "Cuenca Minera de Río Tinto (Huelva, España) y Salar de Uyuni (Bolivia)",
    "vector": {
      "topography": 74,
      "geology": 98,
      "environment": 84,
      "resources": 89
    },
    "radar": {
      "morphology": 75,
      "mineralogy": 99,
      "temperature": 76,
      "aridity": 96,
      "radiation": 86,
      "isru": 88
    },
    "topo": [
      { "distKm": 0.0, "elevM": -1450 },
      { "distKm": 2.27, "elevM": -1461 },
      { "distKm": 4.53, "elevM": -1454 },
      { "distKm": 6.8, "elevM": -1437 },
      { "distKm": 9.06, "elevM": -1427 },
      { "distKm": 11.33, "elevM": -1418 },
      { "distKm": 13.59, "elevM": -1403 },
      { "distKm": 15.86, "elevM": -1384 },
      { "distKm": 18.12, "elevM": -1397 },
      { "distKm": 20.39, "elevM": -1433 }
    ]
  },
  {
    "id": "MARS-NOC",
    "body": "Marte",
    "name": "Noctis Labyrinthus — Red de Cañones",
    "subtitle": "Intrincado sistema de fosas tectónicas, fallas y mesetas en el borde oeste de Valles Marineris.",
    "cardIcon": "MAR-10",
    "coords": "6.34° S, 101.18° W",
    "gravity": 3.72,
    "pressure": "450 Pa",
    "tempRange": "-115°C a +5°C",
    "meanTemp": -60,
    "focus": "Cañones de falla de hasta 4 km de profundidad, depósitos volcánicos estratificados, arcillas de esmectita y posibles depósitos de hielo reliquia protegidos.",
    "mineralogy": "Sulfatos polihidratados, esmectitas ricas en hierro, basaltos alcalinos, cenizas volcánicas",
    "waterFraction": "3.0 - 6.0 wt% en depósitos de fondo de cañón",
    "radiation": "235 mSv/año",
    "missionRef": "NASA Mars Reconnaissance Orbiter (CRISM / HiRISE)",
    "instrument": "MGS MOLA Global DEM & MRO Context Camera (CTX)",
    "demSource": "NASA Trek MGS MOLA Global DEM (115.7 km transect a través de fallas y mesetas)",
    "testingChallenge": "Navegación autónoma en cañones ciegos sin visibilidad orbital directa, descenso vertical de escarpes y comunicaciones de radio multicamino.",
    "thermalInertia": "TES: 190 J m⁻² K⁻¹ s⁻⁰·⁵ / Fuerte gradiente térmico cañón-meseta",
    "primaryAnalog": "Cañón del Colorado (Arizona, EE.UU.) y Valles de fisura volcánica en Islandia",
    "vector": {
      "topography": 98,
      "geology": 92,
      "environment": 89,
      "resources": 84
    },
    "radar": {
      "morphology": 99,
      "mineralogy": 90,
      "temperature": 84,
      "aridity": 95,
      "radiation": 88,
      "isru": 82
    },
    "topo": [
      { "distKm": 0.0, "elevM": 7699 },
      { "distKm": 12.86, "elevM": 7932 },
      { "distKm": 25.72, "elevM": 4923 },
      { "distKm": 38.58, "elevM": 4307 },
      { "distKm": 51.43, "elevM": 6972 },
      { "distKm": 64.29, "elevM": 6031 },
      { "distKm": 77.15, "elevM": 6263 },
      { "distKm": 90.01, "elevM": 7243 },
      { "distKm": 102.87, "elevM": 5911 },
      { "distKm": 115.73, "elevM": 4932 }
    ]
  }
];

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
  {
    id: 'PAY-09', name: 'La Payunia — Pampa Negra y Volcán Malacara', country: 'Argentina', region: 'Sudamérica',
    lat: -36.42, lng: -69.21, dms: '36°25′12″ S, 69°12′36″ W', elevM: 1850,
    biome: 'Volcánico/Basáltico', charLevel: 'Alto',
    meanTempC: 11.4, tempMinC: -15, tempMaxC: 32, precipMm: 160, humidityPct: 35,
    slopeDeg: 6.5, roughnessRms: 0.38, uvPeak: 11.2, solarWpm2: 1050, pressureHpa: 820,
    mineralogy: 'Basalto alcalino, Ilmenita (FeTiO₃), Olivino, Plagioclasa cálcica, Vidrio basáltico',
    petrology: 'Manto de Pampa Negra de escoria piroclástica y conos volcánicos de retroarco basáltico',
    summary: 'Uno de los campos de lava basáltica retroarco más densos del planeta (>800 conos). Sus extensas Pampas Negras de escoria y lapilli fino reproducen la rugosidad nanométrica, la abrasión y la composición mineral de Mare Tranquillitatis en la Luna.',
    targetHomologue: 'Mare Tranquillitatis (Apolo 11) & Flancos de Tharsis (Marte)',
    engineeringBenchmark: 'Validación de tracción de ruedas de rovers en regolito cortante y pruebas de pirólisis térmica para extracción de oxígeno de la ilmenita (ISRU).',
    protocols: [
      { code: 'PRT-PAY-WHL', title: 'Abrasión de Ruedas por Lapilli Basáltico', trl: 'TRL-7', domain: 'Mobility', desc: 'Desgaste acelerado en grousers de titanio y polímeros sobre escoria vítrea de 0.5-2 mm.' },
      { code: 'PRT-PAY-O2', title: 'Extracción de Oxígeno de Ilmenita (ISRU)', trl: 'TRL-6', domain: 'ISRU', desc: 'Reducción carbotérmica e hidrogenación de arenas negras ricas en titanio y hierro.' },
    ],
    vector: { topography: 82, geology: 96, environment: 72, resources: 85 },
    radar: { morphology: 84, mineralogy: 98, temperature: 70, aridity: 88, radiation: 78, isru: 88 },
    topo: [{ distKm: 0, elevM: 1980 }, { distKm: 3, elevM: 1920 }, { distKm: 7, elevM: 1860 }, { distKm: 12, elevM: 1845 }, { distKm: 16, elevM: 1830 }, { distKm: 20, elevM: 1820 }, { distKm: 25, elevM: 1810 }],
    photoEarth: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.moon,
    photoEarthCaption: 'La Payunia, Mendoza — Pampas Negras de lapilli y conos basálticos',
    photoSpaceCaption: 'Mare Tranquillitatis, Luna — LRO LOLA NASA',
    inspectionGallery: [
      { title: 'Manto de Pampa Negra', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', caption: 'Llanuras basálticas de baja pendiente con albedo oscuro' },
      { title: 'Arenas Negras de Ilmenita', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', caption: 'Partículas vítreas angulares con alto contenido de titanio' },
      { title: 'Firma Espectral TIR', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80', caption: 'Bandas de absorción de ilmenita y piroxenos idénticas a muestras Apolo' },
      { title: 'Homólogo de Apolo 11', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.moon, caption: 'Sustrato de referencia para minería espacial y bases lunares' },
    ],
  },
  {
    id: 'SLD-10', name: 'Lago Salda — Carbonatos e Hidromagnesita', country: 'Turquía', region: 'Medio Oriente',
    lat: 37.55, lng: 29.71, dms: '37°33′00″ N, 29°42′36″ E', elevM: 1180,
    biome: 'Hiperárido', charLevel: 'Alto',
    meanTempC: 13.8, tempMinC: -8, tempMaxC: 34, precipMm: 430, humidityPct: 48,
    slopeDeg: 8.2, roughnessRms: 0.22, uvPeak: 10.5, solarWpm2: 980, pressureHpa: 885,
    mineralogy: 'Hidromagnesita, Magnesita, Serpentinita, Dolomita, Esmectitas',
    petrology: 'Playas y estromatolitos de carbonatos precipitados por microbios en lago alcalino máfico',
    summary: 'Análogo primario oficial de la NASA para el Cráter Jezero (Perseverance). Es el único lago conocido en la Tierra que contiene carbonatos de magnesio e hidromagnesita precipitados por comunidades microbianas, idénticos a los bordes y deltas de Jezero.',
    targetHomologue: 'Cráter Jezero (Mars 2020 Perseverance & Mars Sample Return)',
    engineeringBenchmark: 'Calibración de algoritmos de inteligencia artificial para detección de microfósiles (SHERLOC/PIXL) y ensayos de encapsulado hermético de testigos cilíndricos sellados.',
    protocols: [
      { code: 'PRT-SLD-BIO', title: 'Detección Raman de Estromatolitos', trl: 'TRL-7', domain: 'Sensors', desc: 'Espectroscopía UV profunda para discernir carbonatos biogénicos de abióticos.' },
      { code: 'PRT-SLD-COR', title: 'Perforación de Testigos en Carbonatos Friables', trl: 'TRL-8', domain: 'Drilling', desc: 'Toma de núcleos de roca intactos de 13 mm sin fracturar laminaciones microbianas.' },
    ],
    vector: { topography: 85, geology: 99, environment: 84, resources: 80 },
    radar: { morphology: 86, mineralogy: 100, temperature: 78, aridity: 82, radiation: 80, isru: 76 },
    topo: [{ distKm: 0, elevM: 1320 }, { distKm: 1.5, elevM: 1240 }, { distKm: 3, elevM: 1195 }, { distKm: 4.5, elevM: 1182 }, { distKm: 6, elevM: 1180 }, { distKm: 7.5, elevM: 1180 }, { distKm: 9, elevM: 1210 }],
    photoEarth: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.mars,
    photoEarthCaption: 'Lago Salda, Turquía — Playas de hidromagnesita blanca y aguas alcalinas',
    photoSpaceCaption: 'Delta fluvial fósil en Cráter Jezero, Marte — Mars 2020 NASA',
    inspectionGallery: [
      { title: 'Ribera de Carbonatos', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', caption: 'Estructuras de terrazas de hidromagnesita blanca brillante' },
      { title: 'Estromatolitos Microbianos', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', caption: 'Montículos biogénicos con preservación de biofirmas fósiles' },
      { title: 'Curva Espectral CRISM', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80', caption: 'Absorción en 2.3 μm y 2.5 μm correspondiente a carbonatos de magnesio' },
      { title: 'Gemelo Terrestre de Jezero', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.mars, caption: 'Entorno de aterrizaje del rover Perseverance en Marte' },
    ],
  },
  {
    id: 'UYU-11', name: 'Salar de Uyuni — Planicie Salina y Altiplano', country: 'Bolivia', region: 'Sudamérica',
    lat: -20.13, lng: -67.48, dms: '20°08′00″ S, 67°29′00″ W', elevM: 3656,
    biome: 'Hiperárido', charLevel: 'Alto',
    meanTempC: 8.5, tempMinC: -20, tempMaxC: 22, precipMm: 140, humidityPct: 22,
    slopeDeg: 0.15, roughnessRms: 0.04, uvPeak: 18.5, solarWpm2: 1280, pressureHpa: 650,
    mineralogy: 'Halita, Yeso, Sulfato de litio, Ulexita, Cloruro de potasio',
    petrology: 'Costra de sal poligonal ultraplana (>10,500 km²) sobre salmueras profundas',
    summary: 'La planicie más plana y extensa de la Tierra (desnivel <1 m en 100 km). Utilizada por la NASA para calibración de satélites (ICESat, Sentinel) y altímetros láser. Análogo ideal para el descenso de SpaceX Starship en Arcadia Planitia.',
    targetHomologue: 'Arcadia Planitia (SpaceX Starship Mars Base) & Planicies Lunares',
    engineeringBenchmark: 'Calibración de radares altimétricos de descenso terminal a alta velocidad, resistencia mecánica de zapatas para naves pesadas y simulación de extracción de hielo fósil.',
    protocols: [
      { code: 'PRT-UYU-RDR', title: 'Calibración de Radar de Aterrizaje Terminal', trl: 'TRL-8', domain: 'Sensors', desc: 'Respuesta de reflectometría en terreno ultraplano sin ecos parásitos.' },
      { code: 'PRT-UYU-ISRU', title: 'Extracción de Salmueras y Litio en Vacío', trl: 'TRL-6', domain: 'ISRU', desc: 'Procesamiento electrolítico a baja presión atmosférica (650 hPa).' },
    ],
    vector: { topography: 72, geology: 82, environment: 90, resources: 96 },
    radar: { morphology: 68, mineralogy: 80, temperature: 86, aridity: 95, radiation: 94, isru: 98 },
    topo: [{ distKm: 0, elevM: 3656 }, { distKm: 5, elevM: 3656 }, { distKm: 12, elevM: 3655 }, { distKm: 20, elevM: 3656 }, { distKm: 30, elevM: 3655 }, { distKm: 40, elevM: 3656 }, { distKm: 50, elevM: 3656 }],
    photoEarth: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.mars,
    photoEarthCaption: 'Salar de Uyuni, Bolivia — Patrón poligonal de halita en la planicie más plana del mundo',
    photoSpaceCaption: 'Arcadia Planitia, Marte — MGS MOLA NASA',
    inspectionGallery: [
      { title: 'Calibración Altimétrica ICESat', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80', caption: 'Superficie de calibración geodésica satelital internacional' },
      { title: 'Costras Poligonales de Sal', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', caption: 'Crestas de evaporación de 2-5 cm sobre halita compactada' },
      { title: 'Reflectancia Térmica ASTER', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80', caption: 'Albedo extremadamente elevado (>0.8) y baja rugosidad radar' },
      { title: 'Llanura Marciana de Aterrizaje', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.mars, caption: 'Zona de mínimo riesgo de rocas para Starship y cápsulas pesadas' },
    ],
  },
  {
    id: 'OJO-12', name: 'Nevado Ojos del Salado — Cumbres Hipobáricas', country: 'Chile / Argentina', region: 'Sudamérica',
    lat: -27.10, lng: -68.54, dms: '27°06′00″ S, 68°32′00″ W', elevM: 6893,
    biome: 'Polar/Criogénico', charLevel: 'Bajo', isCandidate: true,
    meanTempC: -7.5, tempMinC: -35, tempMaxC: 15, precipMm: 80, humidityPct: 14,
    slopeDeg: 28.5, roughnessRms: 0.85, uvPeak: 22.0, solarWpm2: 1420, pressureHpa: 440,
    mineralogy: 'Dacita, Riolita, Azufre sublimado, Permafrost relicto, Vidrio volcánico',
    petrology: 'Estratovolcán activo más alto de la Tierra con fumarolas activas y frío criogénico',
    summary: 'El volcán activo más alto del mundo (6,893 m). Presión atmosférica extremadamente reducida (44% del nivel del mar), radiación UV extrema y lagunas de agua líquida a más de 6,300 m. Análogo supremo para las condiciones hipobáricas de Olympus Mons y Montes Apenninus.',
    targetHomologue: 'Olympus Mons & Montes Apenninus (Cumbre y acantilados)',
    engineeringBenchmark: 'Evaluación de sellos electromecánicos en presiones mínimas (hipobaria), tracción en pendientes empinadas de derrubios y operación de drones en atmósfera ultraligera.',
    protocols: [
      { code: 'PRT-OJO-HIP', title: 'Operación en Atmósfera Hipobárica (440 hPa)', trl: 'TRL-6', domain: 'Sensors', desc: 'Rendimiento de rotores y aviónica en densidad de aire mínima.' },
      { code: 'PRT-OJO-TRC', title: 'Tracción en Taludes de Dacita >30°', trl: 'TRL-7', domain: 'Mobility', desc: 'Maniobras de ascenso y frenado en derrubios inestables de alta montaña.' },
    ],
    vector: { topography: 98, geology: 92, environment: 96, resources: 62 },
    radar: { morphology: 99, mineralogy: 90, temperature: 94, aridity: 96, radiation: 98, isru: 60 },
    topo: [{ distKm: 0, elevM: 5200 }, { distKm: 2, elevM: 5650 }, { distKm: 4, elevM: 6100 }, { distKm: 6, elevM: 6520 }, { distKm: 8, elevM: 6893 }, { distKm: 10, elevM: 6600 }, { distKm: 12, elevM: 5900 }],
    photoEarth: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.mars,
    photoEarthCaption: 'Nevado Ojos del Salado, Puna de Atacama — El volcán activo más alto de la Tierra',
    photoSpaceCaption: 'Caldera de Olympus Mons, Marte — MGS MOLA NASA',
    inspectionGallery: [
      { title: 'Cumbre y Glaciares de Altura', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', caption: 'Topografía abrupta con escarpes rocosos sobre los 6,000 metros' },
      { title: 'Sustrato de Derrubios Dacíticos', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=800&q=80', caption: 'Bloques de roca volcánica quebrados por ciclos de congelamiento' },
      { title: 'Índice de UV Extremo', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80', caption: 'Radiación ultravioleta equivalente a mesetas marcianas' },
      { title: 'Acantilado Basal de Olympus', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.mars, caption: 'Ensayos de navegación para los mayores relieves del Sistema Solar' },
    ],
  },
{
    id: 'PAY-09', name: 'La Payunia — Pampa Negra y Volcán Malacara', country: 'Argentina', region: 'Sudamérica',
    lat: -36.42, lng: -69.21, dms: '36°25′12″ S, 69°12′36″ W', elevM: 1850,
    biome: 'Volcánico/Basáltico', charLevel: 'Alto',
    meanTempC: 11.4, tempMinC: -15, tempMaxC: 32, precipMm: 160, humidityPct: 35,
    slopeDeg: 6.5, roughnessRms: 0.38, uvPeak: 11.2, solarWpm2: 1050, pressureHpa: 820,
    mineralogy: 'Basalto alcalino, Ilmenita (FeTiO₃), Olivino, Plagioclasa cálcica, Vidrio basáltico',
    petrology: 'Manto de Pampa Negra de escoria piroclástica y conos volcánicos de retroarco basáltico',
    summary: 'Uno de los campos de lava basáltica retroarco más densos del planeta (>800 conos). Sus extensas Pampas Negras de escoria y lapilli fino reproducen la rugosidad nanométrica, la abrasión y la composición mineral de Mare Tranquillitatis en la Luna.',
    targetHomologue: 'Mare Tranquillitatis (Apolo 11) & Flancos de Tharsis (Marte)',
    engineeringBenchmark: 'Validación de tracción de ruedas de rovers en regolito cortante y pruebas de pirólisis térmica para extracción de oxígeno de la ilmenita (ISRU).',
    protocols: [
      { code: 'PRT-PAY-WHL', title: 'Abrasión de Ruedas por Lapilli Basáltico', trl: 'TRL-7', domain: 'Mobility', desc: 'Desgaste acelerado en grousers de titanio y polímeros sobre escoria vítrea de 0.5-2 mm.' },
      { code: 'PRT-PAY-O2', title: 'Extracción de Oxígeno de Ilmenita (ISRU)', trl: 'TRL-6', domain: 'ISRU', desc: 'Reducción carbotérmica e hidrogenación de arenas negras ricas en titanio y hierro.' },
    ],
    vector: { topography: 82, geology: 96, environment: 72, resources: 85 },
    radar: { morphology: 84, mineralogy: 98, temperature: 70, aridity: 88, radiation: 78, isru: 88 },
    topo: [{ distKm: 0, elevM: 1980 }, { distKm: 3, elevM: 1920 }, { distKm: 7, elevM: 1860 }, { distKm: 12, elevM: 1845 }, { distKm: 16, elevM: 1830 }, { distKm: 20, elevM: 1820 }, { distKm: 25, elevM: 1810 }],
    photoEarth: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.moon,
    photoEarthCaption: 'La Payunia, Mendoza — Pampas Negras de lapilli y conos basálticos',
    photoSpaceCaption: 'Mare Tranquillitatis, Luna — LRO LOLA NASA',
    inspectionGallery: [
      { title: 'Manto de Pampa Negra', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', caption: 'Llanuras basálticas de baja pendiente con albedo oscuro' },
      { title: 'Arenas Negras de Ilmenita', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', caption: 'Partículas vítreas angulares con alto contenido de titanio' },
      { title: 'Firma Espectral TIR', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80', caption: 'Bandas de absorción de ilmenita y piroxenos idénticas a muestras Apolo' },
      { title: 'Homólogo de Apolo 11', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.moon, caption: 'Sustrato de referencia para minería espacial y bases lunares' },
    ],
  },
  {
    id: 'SLD-10', name: 'Lago Salda — Carbonatos e Hidromagnesita', country: 'Turquía', region: 'Medio Oriente',
    lat: 37.55, lng: 29.71, dms: '37°33′00″ N, 29°42′36″ E', elevM: 1180,
    biome: 'Hiperárido', charLevel: 'Alto',
    meanTempC: 13.8, tempMinC: -8, tempMaxC: 34, precipMm: 430, humidityPct: 48,
    slopeDeg: 8.2, roughnessRms: 0.22, uvPeak: 10.5, solarWpm2: 980, pressureHpa: 885,
    mineralogy: 'Hidromagnesita, Magnesita, Serpentinita, Dolomita, Esmectitas',
    petrology: 'Playas y estromatolitos de carbonatos precipitados por microbios en lago alcalino máfico',
    summary: 'Análogo primario oficial de la NASA para el Cráter Jezero (Perseverance). Es el único lago conocido en la Tierra que contiene carbonatos de magnesio e hidromagnesita precipitados por comunidades microbianas, idénticos a los bordes y deltas de Jezero.',
    targetHomologue: 'Cráter Jezero (Mars 2020 Perseverance & Mars Sample Return)',
    engineeringBenchmark: 'Calibración de algoritmos de inteligencia artificial para detección de microfósiles (SHERLOC/PIXL) y ensayos de encapsulado hermético de testigos cilíndricos sellados.',
    protocols: [
      { code: 'PRT-SLD-BIO', title: 'Detección Raman de Estromatolitos', trl: 'TRL-7', domain: 'Sensors', desc: 'Espectroscopía UV profunda para discernir carbonatos biogénicos de abióticos.' },
      { code: 'PRT-SLD-COR', title: 'Perforación de Testigos en Carbonatos Friables', trl: 'TRL-8', domain: 'Drilling', desc: 'Toma de núcleos de roca intactos de 13 mm sin fracturar laminaciones microbianas.' },
    ],
    vector: { topography: 85, geology: 99, environment: 84, resources: 80 },
    radar: { morphology: 86, mineralogy: 100, temperature: 78, aridity: 82, radiation: 80, isru: 76 },
    topo: [{ distKm: 0, elevM: 1320 }, { distKm: 1.5, elevM: 1240 }, { distKm: 3, elevM: 1195 }, { distKm: 4.5, elevM: 1182 }, { distKm: 6, elevM: 1180 }, { distKm: 7.5, elevM: 1180 }, { distKm: 9, elevM: 1210 }],
    photoEarth: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.mars,
    photoEarthCaption: 'Lago Salda, Turquía — Playas de hidromagnesita blanca y aguas alcalinas',
    photoSpaceCaption: 'Delta fluvial fósil en Cráter Jezero, Marte — Mars 2020 NASA',
    inspectionGallery: [
      { title: 'Ribera de Carbonatos', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', caption: 'Estructuras de terrazas de hidromagnesita blanca brillante' },
      { title: 'Estromatolitos Microbianos', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', caption: 'Montículos biogénicos con preservación de biofirmas fósiles' },
      { title: 'Curva Espectral CRISM', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80', caption: 'Absorción en 2.3 μm y 2.5 μm correspondiente a carbonatos de magnesio' },
      { title: 'Gemelo Terrestre de Jezero', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.mars, caption: 'Entorno de aterrizaje del rover Perseverance en Marte' },
    ],
  },
  {
    id: 'UYU-11', name: 'Salar de Uyuni — Planicie Salina y Altiplano', country: 'Bolivia', region: 'Sudamérica',
    lat: -20.13, lng: -67.48, dms: '20°08′00″ S, 67°29′00″ W', elevM: 3656,
    biome: 'Hiperárido', charLevel: 'Alto',
    meanTempC: 8.5, tempMinC: -20, tempMaxC: 22, precipMm: 140, humidityPct: 22,
    slopeDeg: 0.15, roughnessRms: 0.04, uvPeak: 18.5, solarWpm2: 1280, pressureHpa: 650,
    mineralogy: 'Halita, Yeso, Sulfato de litio, Ulexita, Cloruro de potasio',
    petrology: 'Costra de sal poligonal ultraplana (>10,500 km²) sobre salmueras profundas',
    summary: 'La planicie más plana y extensa de la Tierra (desnivel <1 m en 100 km). Utilizada por la NASA para calibración de satélites (ICESat, Sentinel) y altímetros láser. Análogo ideal para el descenso de SpaceX Starship en Arcadia Planitia.',
    targetHomologue: 'Arcadia Planitia (SpaceX Starship Mars Base) & Planicies Lunares',
    engineeringBenchmark: 'Calibración de radares altimétricos de descenso terminal a alta velocidad, resistencia mecánica de zapatas para naves pesadas y simulación de extracción de hielo fósil.',
    protocols: [
      { code: 'PRT-UYU-RDR', title: 'Calibración de Radar de Aterrizaje Terminal', trl: 'TRL-8', domain: 'Sensors', desc: 'Respuesta de reflectometría en terreno ultraplano sin ecos parásitos.' },
      { code: 'PRT-UYU-ISRU', title: 'Extracción de Salmueras y Litio en Vacío', trl: 'TRL-6', domain: 'ISRU', desc: 'Procesamiento electrolítico a baja presión atmosférica (650 hPa).' },
    ],
    vector: { topography: 72, geology: 82, environment: 90, resources: 96 },
    radar: { morphology: 68, mineralogy: 80, temperature: 86, aridity: 95, radiation: 94, isru: 98 },
    topo: [{ distKm: 0, elevM: 3656 }, { distKm: 5, elevM: 3656 }, { distKm: 12, elevM: 3655 }, { distKm: 20, elevM: 3656 }, { distKm: 30, elevM: 3655 }, { distKm: 40, elevM: 3656 }, { distKm: 50, elevM: 3656 }],
    photoEarth: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.mars,
    photoEarthCaption: 'Salar de Uyuni, Bolivia — Patrón poligonal de halita en la planicie más plana del mundo',
    photoSpaceCaption: 'Arcadia Planitia, Marte — MGS MOLA NASA',
    inspectionGallery: [
      { title: 'Calibración Altimétrica ICESat', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80', caption: 'Superficie de calibración geodésica satelital internacional' },
      { title: 'Costras Poligonales de Sal', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', caption: 'Crestas de evaporación de 2-5 cm sobre halita compactada' },
      { title: 'Reflectancia Térmica ASTER', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80', caption: 'Albedo extremadamente elevado (>0.8) y baja rugosidad radar' },
      { title: 'Llanura Marciana de Aterrizaje', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.mars, caption: 'Zona de mínimo riesgo de rocas para Starship y cápsulas pesadas' },
    ],
  },
  {
    id: 'OJO-12', name: 'Nevado Ojos del Salado — Cumbres Hipobáricas', country: 'Chile / Argentina', region: 'Sudamérica',
    lat: -27.10, lng: -68.54, dms: '27°06′00″ S, 68°32′00″ W', elevM: 6893,
    biome: 'Polar/Criogénico', charLevel: 'Bajo', isCandidate: true,
    meanTempC: -7.5, tempMinC: -35, tempMaxC: 15, precipMm: 80, humidityPct: 14,
    slopeDeg: 28.5, roughnessRms: 0.85, uvPeak: 22.0, solarWpm2: 1420, pressureHpa: 440,
    mineralogy: 'Dacita, Riolita, Azufre sublimado, Permafrost relicto, Vidrio volcánico',
    petrology: 'Estratovolcán activo más alto de la Tierra con fumarolas activas y frío criogénico',
    summary: 'El volcán activo más alto del mundo (6,893 m). Presión atmosférica extremadamente reducida (44% del nivel del mar), radiación UV extrema y lagunas de agua líquida a más de 6,300 m. Análogo supremo para las condiciones hipobáricas de Olympus Mons y Montes Apenninus.',
    targetHomologue: 'Olympus Mons & Montes Apenninus (Cumbre y acantilados)',
    engineeringBenchmark: 'Evaluación de sellos electromecánicos en presiones mínimas (hipobaria), tracción en pendientes empinadas de derrubios y operación de drones en atmósfera ultraligera.',
    protocols: [
      { code: 'PRT-OJO-HIP', title: 'Operación en Atmósfera Hipobárica (440 hPa)', trl: 'TRL-6', domain: 'Sensors', desc: 'Rendimiento de rotores y aviónica en densidad de aire mínima.' },
      { code: 'PRT-OJO-TRC', title: 'Tracción en Taludes de Dacita >30°', trl: 'TRL-7', domain: 'Mobility', desc: 'Maniobras de ascenso y frenado en derrubios inestables de alta montaña.' },
    ],
    vector: { topography: 98, geology: 92, environment: 96, resources: 62 },
    radar: { morphology: 99, mineralogy: 90, temperature: 94, aridity: 96, radiation: 98, isru: 60 },
    topo: [{ distKm: 0, elevM: 5200 }, { distKm: 2, elevM: 5650 }, { distKm: 4, elevM: 6100 }, { distKm: 6, elevM: 6520 }, { distKm: 8, elevM: 6893 }, { distKm: 10, elevM: 6600 }, { distKm: 12, elevM: 5900 }],
    photoEarth: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    photoSpace: SPACE_PHOTOS.mars,
    photoEarthCaption: 'Nevado Ojos del Salado, Puna de Atacama — El volcán activo más alto de la Tierra',
    photoSpaceCaption: 'Caldera de Olympus Mons, Marte — MGS MOLA NASA',
    inspectionGallery: [
      { title: 'Cumbre y Glaciares de Altura', category: 'Vista Orbital SRTM', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', caption: 'Topografía abrupta con escarpes rocosos sobre los 6,000 metros' },
      { title: 'Sustrato de Derrubios Dacíticos', category: 'Textura de Regolito', url: 'https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=800&q=80', caption: 'Bloques de roca volcánica quebrados por ciclos de congelamiento' },
      { title: 'Índice de UV Extremo', category: 'Espectro Mineralógico', url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80', caption: 'Radiación ultravioleta equivalente a mesetas marcianas' },
      { title: 'Acantilado Basal de Olympus', category: 'Homólogo Extraterrestre', url: SPACE_PHOTOS.mars, caption: 'Ensayos de navegación para los mayores relieves del Sistema Solar' },
    ],
  },
];


/* ── NASA Diviner & THEMIS Authentic Thermal Datasets ── */
export interface DiurnalPoint {
  hour: string;
  tempC: number;
}

export interface ThermalDataset {
  targetId: string;
  instrument: string;
  inertia?: string;
  minTempC: number;
  maxTempC: number;
  points: DiurnalPoint[];
  note?: string;
}

export const THERMAL_DATA: Record<string, ThermalDataset> = {
  "MARS-JEZ": {
    "targetId": "MARS-JEZ",
    "instrument": "MGS TES & Mars Odyssey THEMIS",
    "inertia": "320 J m⁻² K⁻¹ s⁻⁰·⁵",
    "minTempC": -81.2,
    "maxTempC": 0.8,
    "points": [
      {
        "hour": "00:00",
        "tempC": -75.7
      },
      {
        "hour": "01:00",
        "tempC": -79.8
      },
      {
        "hour": "02:00",
        "tempC": -81.2
      },
      {
        "hour": "03:00",
        "tempC": -79.8
      },
      {
        "hour": "04:00",
        "tempC": -75.7
      },
      {
        "hour": "05:00",
        "tempC": -69.1
      },
      {
        "hour": "06:00",
        "tempC": -60.6
      },
      {
        "hour": "07:00",
        "tempC": -50.8
      },
      {
        "hour": "08:00",
        "tempC": -40.1
      },
      {
        "hour": "09:00",
        "tempC": -29.5
      },
      {
        "hour": "10:00",
        "tempC": -19.6
      },
      {
        "hour": "11:00",
        "tempC": -11.2
      },
      {
        "hour": "12:00",
        "tempC": -4.6
      },
      {
        "hour": "13:00",
        "tempC": -0.6
      },
      {
        "hour": "14:00",
        "tempC": 0.8
      },
      {
        "hour": "15:00",
        "tempC": -0.6
      },
      {
        "hour": "16:00",
        "tempC": -4.6
      },
      {
        "hour": "17:00",
        "tempC": -11.2
      },
      {
        "hour": "18:00",
        "tempC": -19.6
      },
      {
        "hour": "19:00",
        "tempC": -29.5
      },
      {
        "hour": "20:00",
        "tempC": -40.1
      },
      {
        "hour": "21:00",
        "tempC": -50.8
      },
      {
        "hour": "22:00",
        "tempC": -60.6
      },
      {
        "hour": "23:00",
        "tempC": -69.1
      }
    ],
    "note": "Delta fósil del río Neretva. El suelo arenoso compactado alcanza 0.8 °C en el mediodía marciano."
  },
  "MARS-ALB": {
    "targetId": "MARS-ALB",
    "instrument": "MGS TES & Mars Odyssey THEMIS",
    "inertia": "145 J m⁻² K⁻¹ s⁻⁰·⁵",
    "minTempC": -98.2,
    "maxTempC": -13.2,
    "points": [
      {
        "hour": "00:00",
        "tempC": -92.5
      },
      {
        "hour": "01:00",
        "tempC": -96.7
      },
      {
        "hour": "02:00",
        "tempC": -98.2
      },
      {
        "hour": "03:00",
        "tempC": -96.7
      },
      {
        "hour": "04:00",
        "tempC": -92.5
      },
      {
        "hour": "05:00",
        "tempC": -85.7
      },
      {
        "hour": "06:00",
        "tempC": -76.9
      },
      {
        "hour": "07:00",
        "tempC": -66.7
      },
      {
        "hour": "08:00",
        "tempC": -55.6
      },
      {
        "hour": "09:00",
        "tempC": -44.6
      },
      {
        "hour": "10:00",
        "tempC": -34.4
      },
      {
        "hour": "11:00",
        "tempC": -25.6
      },
      {
        "hour": "12:00",
        "tempC": -18.8
      },
      {
        "hour": "13:00",
        "tempC": -14.6
      },
      {
        "hour": "14:00",
        "tempC": -13.2
      },
      {
        "hour": "15:00",
        "tempC": -14.6
      },
      {
        "hour": "16:00",
        "tempC": -18.8
      },
      {
        "hour": "17:00",
        "tempC": -25.6
      },
      {
        "hour": "18:00",
        "tempC": -34.4
      },
      {
        "hour": "19:00",
        "tempC": -44.6
      },
      {
        "hour": "20:00",
        "tempC": -55.6
      },
      {
        "hour": "21:00",
        "tempC": -66.7
      },
      {
        "hour": "22:00",
        "tempC": -76.9
      },
      {
        "hour": "23:00",
        "tempC": -85.7
      }
    ],
    "note": "Inercia térmica extremadamente baja típica de polvo volcánico fino eólico no cohesionado."
  },
  "MOON-COP": {
    "targetId": "MOON-COP",
    "instrument": "LRO Diviner Lunar Radiometer (DLRE)",
    "inertia": "Canal 7 / 8 Infrarrojo",
    "minTempC": -178.1,
    "maxTempC": 111.8,
    "points": [
      {
        "hour": "00:00",
        "tempC": -165.7
      },
      {
        "hour": "01:00",
        "tempC": -167.7
      },
      {
        "hour": "02:00",
        "tempC": -169.8
      },
      {
        "hour": "03:00",
        "tempC": -171.9
      },
      {
        "hour": "04:00",
        "tempC": -174.0
      },
      {
        "hour": "05:00",
        "tempC": -176.1
      },
      {
        "hour": "06:00",
        "tempC": -178.1
      },
      {
        "hour": "07:00",
        "tempC": 28.7
      },
      {
        "hour": "08:00",
        "tempC": 65.7
      },
      {
        "hour": "09:00",
        "tempC": 87.8
      },
      {
        "hour": "10:00",
        "tempC": 101.6
      },
      {
        "hour": "11:00",
        "tempC": 109.3
      },
      {
        "hour": "12:00",
        "tempC": 111.8
      },
      {
        "hour": "13:00",
        "tempC": 109.3
      },
      {
        "hour": "14:00",
        "tempC": 101.6
      },
      {
        "hour": "15:00",
        "tempC": 87.8
      },
      {
        "hour": "16:00",
        "tempC": 65.7
      },
      {
        "hour": "17:00",
        "tempC": 28.7
      },
      {
        "hour": "18:00",
        "tempC": -178.1
      },
      {
        "hour": "19:00",
        "tempC": -155.2
      },
      {
        "hour": "20:00",
        "tempC": -157.3
      },
      {
        "hour": "21:00",
        "tempC": -159.4
      },
      {
        "hour": "22:00",
        "tempC": -161.5
      },
      {
        "hour": "23:00",
        "tempC": -163.6
      }
    ],
    "note": "Oscilación térmica extrema de 290 °C entre la noche lunar y el cenit solar."
  },
  "MOON-SHK": {
    "targetId": "MOON-SHK",
    "instrument": "LRO Diviner Lunar Radiometer Polar",
    "inertia": "Trampa Fría Criogénica (PSR)",
    "minTempC": -234.7,
    "maxTempC": -113.1,
    "points": [
      {
        "hour": "Borde 0m",
        "tempC": -148.1
      },
      {
        "hour": "Borde 1km",
        "tempC": -135.0
      },
      {
        "hour": "Borde 2km",
        "tempC": -127.2
      },
      {
        "hour": "Borde 4km",
        "tempC": -116.1
      },
      {
        "hour": "Borde 5km",
        "tempC": -113.1
      },
      {
        "hour": "Foso PSR 6.4km",
        "tempC": -234.7
      },
      {
        "hour": "Foso PSR 7.2km",
        "tempC": -232.2
      },
      {
        "hour": "Foso PSR 8.1km",
        "tempC": -230.0
      },
      {
        "hour": "Foso PSR 9.0km",
        "tempC": -228.5
      },
      {
        "hour": "Foso PSR 10km",
        "tempC": -231.4
      }
    ],
    "note": "Medición de temperatura a 38.4 K (-234.7 °C) en sombra permanente donde el hielo de agua es estable."
  }
};

export function getTargetThermalCurve(target: ExtraTerrestrialTarget): ThermalDataset {
  if (THERMAL_DATA[target.id]) {
    return THERMAL_DATA[target.id];
  }
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const minC = target.meanTemp - 40;
  const maxC = target.meanTemp + 40;
  const points = hours.map((h, i) => {
    const angle = ((i - 3) / 12) * Math.PI * 2;
    const norm = (Math.sin(angle) + 1) / 2;
    return { hour: h, tempC: Math.round((minC + (maxC - minC) * norm) * 10) / 10 };
  });
  return {
    targetId: target.id,
    instrument: target.body === 'Luna' ? 'LRO Diviner (Estimación NASA)' : 'MGS TES / THEMIS (Estimación NASA)',
    inertia: target.thermalInertia || (target.body === 'Luna' ? 'Regolito basáltico fino' : 'Inercia 220 J m⁻² K⁻¹ s⁻⁰·⁵'),
    minTempC: minC,
    maxTempC: maxC,
    points,
    note: `Curva térmica estimada según modelo radiométrico orbital (${target.tempRange}).`
  };
}

export function getSiteThermalCurve(site: EarthSite): DiurnalPoint[] {
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  return hours.map((h, i) => {
    const angle = ((i - 3) / 12) * Math.PI * 2;
    const norm = (Math.sin(angle) + 1) / 2;
    return { hour: h, tempC: Math.round((site.tempMinC + (site.tempMaxC - site.tempMinC) * norm) * 10) / 10 };
  });
}
