/* === Autumn Solara Complete Data & Types === */
/* Enriquecido con datos oficiales de NASA Trek, LRO LOLA, MGS MOLA, Diviner, THEMIS y SRTM */

/* -- Types -- */
export type BiomeType =
  | 'Todos'
  | 'Hiperárido'
  | 'Polar/Criogénico'
  | 'Volcánico/Basáltico'
  | 'Impacto/Cráter'
  | 'Subterráneo/Cueva';

export type CharLevel = 'Alto' | 'Medio' | 'Bajo';

/* 8 Dimensiones Oficiales de la NASA para Caracterización de Sitios Análogos */
export interface PFIWeights {
  geology: number;      // 1. Geología, Mineralogía y Materiales Superficiales
  terrain: number;      // 2. Terreno, Elevación, Pendiente, Rugosidad y Cráteres
  temperature: number;  // 3. Temperatura, Iluminación y Extremos Ambientales
  iceWater: number;     // 4. Agua, Hielo, Permafrost y Recursos ISRU
  atmosphere: number;   // 5. Polvo, Viento, Erosión y Procesos Atmosféricos
  biosphere: number;    // 6. Biología, Extremófilos, Habitabilidad y Biofirmas
  subsurface: number;   // 7. Cuevas, Tubos de Lava y Ambientes Subterráneos
  robotics: number;     // 8. Operaciones Robóticas, Aterrizaje, Movilidad y Construcción
}

export type VectorScores = PFIWeights;

export interface PFIDimensionInfo {
  key: keyof PFIWeights;
  title: string;
  datasets: string;
}

export const NASA_PFI_DIMENSIONS: PFIDimensionInfo[] = [
  {
    key: 'geology',
    title: 'Geología, Mineralogía y Materiales Superficiales',
    datasets: 'TERRA/ASTER TIR vs. MRO-CRISM / LRO-Diviner',
  },
  {
    key: 'terrain',
    title: 'Terreno, Elevación, Pendiente, Rugosidad y Cráteres',
    datasets: 'NASA SRTM 30m DEM vs. LRO-LOLA / MGS-MOLA',
  },
  {
    key: 'temperature',
    title: 'Temperatura, Iluminación y Extremos Ambientales',
    datasets: 'MODIS Land Surface Temp vs. LRO-Diviner / MCS',
  },
  {
    key: 'iceWater',
    title: 'Agua, Hielo, Permafrost y Recursos ISRU',
    datasets: 'NSIDC / GRACE-FO vs. LRO-LAMP / Mars Odyssey GRS',
  },
  {
    key: 'atmosphere',
    title: 'Polvo, Viento, Erosión y Procesos Atmosféricos',
    datasets: 'MODIS Aerosol Optical Depth vs. MEDA / MARCI',
  },
  {
    key: 'biosphere',
    title: 'Biología, Extremófilos, Habitabilidad y Biofirmas',
    datasets: 'Landsat 9 NDVI vs. Perseverance SHERLOC',
  },
  {
    key: 'subsurface',
    title: 'Cuevas, Tubos de Lava y Ambientes Subterráneos',
    datasets: 'GPR / LiDAR Terrestre vs. GRAIL / LRO Mini-RF',
  },
  {
    key: 'robotics',
    title: 'Operaciones Robóticas, Aterrizaje, Movilidad y Construcción',
    datasets: 'NASA Field Trials vs. Artemis / Mars Landing Specs',
  },
];

export const PFI_PRESETS: { name: string; weights: PFIWeights }[] = [
  {
    name: 'Balanceado NASA',
    weights: {
      geology: 50,
      terrain: 50,
      temperature: 50,
      iceWater: 50,
      atmosphere: 50,
      biosphere: 50,
      subsurface: 50,
      robotics: 50,
    },
  },
  {
    name: 'Prioridad Geológica',
    weights: {
      geology: 95,
      terrain: 85,
      temperature: 40,
      iceWater: 30,
      atmosphere: 45,
      biosphere: 70,
      subsurface: 35,
      robotics: 50,
    },
  },
  {
    name: 'Prioridad Subterránea/Cuevas',
    weights: {
      geology: 60,
      terrain: 70,
      temperature: 40,
      iceWater: 30,
      atmosphere: 20,
      biosphere: 35,
      subsurface: 98,
      robotics: 85,
    },
  },
  {
    name: 'Prioridad Hielo/ISRU',
    weights: {
      geology: 50,
      terrain: 65,
      temperature: 85,
      iceWater: 98,
      atmosphere: 40,
      biosphere: 30,
      subsurface: 55,
      robotics: 75,
    },
  },
];

export interface RadarAxes {
  morphology: number;
  mineralogy: number;
  temperature: number;
  aridity: number;
  radiation: number;
  isru: number;
}

export interface TopoPoint {
  distKm: number;
  elevM: number;
}

export interface TestProtocol {
  code: string;
  title: string;
  trl: string;
  domain: string;
  desc: string;
}

export interface ExtraTerrestrialTarget {
  id: string;
  body: 'Luna' | 'Marte';
  name: string;
  subtitle: string;
  cardIcon: string;
  coords: string;
  gravity: number;
  pressure: string;
  tempRange: string;
  meanTemp: number;
  focus: string;
  mineralogy: string;
  waterFraction: string;
  radiation: string;
  missionRef: string;
  instrument?: string;
  demSource?: string;
  testingChallenge?: string;
  thermalInertia?: string;
  primaryAnalog?: string;
  vector: VectorScores;
  radar: RadarAxes;
  topo: TopoPoint[];
}

export interface GeologicalInspectionPhoto {
  title: string;
  category: 'Vista Orbital SRTM' | 'Textura de Regolito' | 'Espectro Mineralógico' | 'Homólogo Extraterrestre';
  url: string;
  caption: string;
}

export interface EarthSite {
  id: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  dms: string;
  elevM: number;
  biome: BiomeType;
  charLevel: CharLevel;
  isCandidate?: boolean;
  isUserCandidate?: boolean;
  microScale: string;
  activeProcess: string;
  nasaDatasets?: string;
  meanTempC: number;
  tempMinC: number;
  tempMaxC: number;
  precipMm: number;
  humidityPct: number;
  slopeDeg: number;
  roughnessRms: number;
  uvPeak: number;
  solarWpm2: number;
  pressureHpa: number;
  mineralogy: string;
  petrology: string;
  summary: string;
  grayZone?: string;
  protocols: TestProtocol[];
  vector: VectorScores;
  radar: RadarAxes;
  topo: TopoPoint[];
  photoEarth: string;
  photoSpace: string;
  photoEarthCaption: string;
  photoSpaceCaption: string;
  inspectionGallery: GeologicalInspectionPhoto[];
  targetHomologue?: string;
  engineeringBenchmark?: string;
}

export interface RankedSite {
  site: EarthSite;
  pfi: number;
  breakdown: VectorScores;
  rank: number;
}

/* -- PFI Calculation Engine (8 Official NASA Dimensions) -- */
export function calculatePFI(
  site: EarthSite,
  target: ExtraTerrestrialTarget,
  w: PFIWeights
): { pfi: number; breakdown: VectorScores } {
  const keys: (keyof PFIWeights)[] = [
    'geology',
    'terrain',
    'temperature',
    'iceWater',
    'atmosphere',
    'biosphere',
    'subsurface',
    'robotics',
  ];

  let totalWeight = 0;
  keys.forEach((k) => {
    totalWeight += (w[k] ?? 0);
  });
  if (totalWeight <= 0) totalWeight = 1;

  let weightedSum = 0;
  const breakdown: any = {};

  keys.forEach((k) => {
    const sVal = site.vector[k] ?? 50;
    const tVal = target.vector[k] ?? 50;
    const fidelity = Math.max(0, 100 - Math.abs(sVal - tVal));
    breakdown[k] = Math.round(fidelity * 10) / 10;
    weightedSum += fidelity * (w[k] ?? 0);
  });

  const pfi = Math.round((weightedSum / totalWeight) * 10) / 10;
  return { pfi, breakdown: breakdown as VectorScores };
}

export function rankSites(
  sites: EarthSite[],
  target: ExtraTerrestrialTarget,
  w: PFIWeights
): RankedSite[] {
  return sites
    .map((site) => {
      const { pfi, breakdown } = calculatePFI(site, target, w);
      return { site, pfi, breakdown, rank: 0 };
    })
    .sort((a, b) => b.pfi - a.pfi)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

export function fidelityColor(score: number): string {
  if (score >= 82) return '#0A0A0C';
  if (score >= 68) return '#18181B';
  return '#27272A';
}

export function fidelityLabel(score: number): string {
  if (score >= 82) return 'Alta fidelidad';
  if (score >= 68) return 'Fidelidad media';
  return 'Fidelidad exploratoria';
}

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
    "name": "Polo Sur — Cráter Shackleton",
    "subtitle": "Regiones en sombra permanente (PSR), trampas criogénicas de hielo de agua a -203°C, iluminación solar rasante y regolito anortosítico.",
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
      "geology": 78,
      "terrain": 90,
      "temperature": 99,
      "iceWater": 96,
      "atmosphere": 10,
      "biosphere": 0,
      "subsurface": 45,
      "robotics": 95
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
    "name": "Mare Tranquillitatis (Tubos de Lava)",
    "subtitle": "Claraboyas basálticas (skylights) y túneles volcánicos subsuperficiales con blindaje natural contra radiación cósmica y micrometeoritos.",
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
      "geology": 96,
      "terrain": 82,
      "temperature": 65,
      "iceWater": 20,
      "atmosphere": 10,
      "biosphere": 0,
      "subsurface": 98,
      "robotics": 88
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
      "geology": 94,
      "terrain": 88,
      "temperature": 75,
      "iceWater": 25,
      "atmosphere": 10,
      "biosphere": 0,
      "subsurface": 90,
      "robotics": 82
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
      "geology": 95,
      "terrain": 94,
      "temperature": 80,
      "iceWater": 20,
      "atmosphere": 10,
      "biosphere": 0,
      "subsurface": 50,
      "robotics": 85
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
      "geology": 90,
      "terrain": 96,
      "temperature": 78,
      "iceWater": 15,
      "atmosphere": 10,
      "biosphere": 0,
      "subsurface": 40,
      "robotics": 86
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
      "geology": 92,
      "terrain": 95,
      "temperature": 82,
      "iceWater": 15,
      "atmosphere": 10,
      "biosphere": 0,
      "subsurface": 45,
      "robotics": 88
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
      "geology": 94,
      "terrain": 90,
      "temperature": 74,
      "iceWater": 18,
      "atmosphere": 10,
      "biosphere": 0,
      "subsurface": 85,
      "robotics": 85
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
      {
        "distKm": 0.0,
        "elevM": -1218
      },
      {
        "distKm": 5.05,
        "elevM": -1930
      },
      {
        "distKm": 10.1,
        "elevM": -1918
      },
      {
        "distKm": 15.15,
        "elevM": -1913
      },
      {
        "distKm": 20.2,
        "elevM": -1922
      },
      {
        "distKm": 25.25,
        "elevM": -1925
      },
      {
        "distKm": 30.3,
        "elevM": -1968
      },
      {
        "distKm": 35.35,
        "elevM": -1376
      },
      {
        "distKm": 40.41,
        "elevM": -798
      },
      {
        "distKm": 45.46,
        "elevM": 788
      }
    ]
  },
  {
    "id": "MARS-JEZ",
    "body": "Marte",
    "name": "Cráter Jezero (Delta Fluvial)",
    "subtitle": "Antiguo sistema lacustre con arcillas filosilicatadas, carbonatos, dunas eólicas y terreno rocoso para navegación autónoma de rovers.",
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
      "geology": 98,
      "terrain": 85,
      "temperature": 75,
      "iceWater": 65,
      "atmosphere": 70,
      "biosphere": 95,
      "subsurface": 40,
      "robotics": 98
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
    "name": "Arcadia Planitia (Planicie Volcánica)",
    "subtitle": "Llanuras basálticas de baja elevación con sábanas de hielo subsuperficial somero ideales para aterrizaje humano e ISRU.",
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
      "geology": 82,
      "terrain": 70,
      "temperature": 80,
      "iceWater": 98,
      "atmosphere": 75,
      "biosphere": 40,
      "subsurface": 75,
      "robotics": 92
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
      "geology": 92,
      "terrain": 80,
      "temperature": 75,
      "iceWater": 50,
      "atmosphere": 72,
      "biosphere": 30,
      "subsurface": 80,
      "robotics": 80
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
      "geology": 95,
      "terrain": 98,
      "temperature": 70,
      "iceWater": 55,
      "atmosphere": 80,
      "biosphere": 50,
      "subsurface": 65,
      "robotics": 90
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
      "geology": 90,
      "terrain": 88,
      "temperature": 78,
      "iceWater": 45,
      "atmosphere": 65,
      "biosphere": 35,
      "subsurface": 98,
      "robotics": 90
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
      "geology": 96,
      "terrain": 99,
      "temperature": 82,
      "iceWater": 40,
      "atmosphere": 60,
      "biosphere": 20,
      "subsurface": 75,
      "robotics": 85
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
      "geology": 92,
      "terrain": 86,
      "temperature": 74,
      "iceWater": 45,
      "atmosphere": 78,
      "biosphere": 60,
      "subsurface": 50,
      "robotics": 92
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
      {
        "distKm": 0.0,
        "elevM": -1869
      },
      {
        "distKm": 14.37,
        "elevM": -1906
      },
      {
        "distKm": 30.18,
        "elevM": -1912
      },
      {
        "distKm": 45.99,
        "elevM": -1898
      },
      {
        "distKm": 61.81,
        "elevM": -1938
      },
      {
        "distKm": 77.62,
        "elevM": -1900
      },
      {
        "distKm": 93.43,
        "elevM": -1718
      },
      {
        "distKm": 109.24,
        "elevM": -1747
      },
      {
        "distKm": 125.05,
        "elevM": -566
      },
      {
        "distKm": 140.86,
        "elevM": 1416
      }
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
      "geology": 85,
      "terrain": 88,
      "temperature": 95,
      "iceWater": 99,
      "atmosphere": 70,
      "biosphere": 45,
      "subsurface": 70,
      "robotics": 90
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
      {
        "distKm": 0.0,
        "elevM": -3407
      },
      {
        "distKm": 8.72,
        "elevM": -5408
      },
      {
        "distKm": 17.45,
        "elevM": -4597
      },
      {
        "distKm": 26.17,
        "elevM": -4493
      },
      {
        "distKm": 34.9,
        "elevM": -4488
      },
      {
        "distKm": 43.62,
        "elevM": -4603
      },
      {
        "distKm": 52.35,
        "elevM": -4874
      },
      {
        "distKm": 61.07,
        "elevM": -5020
      },
      {
        "distKm": 69.79,
        "elevM": -6181
      },
      {
        "distKm": 78.52,
        "elevM": -4110
      }
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
      "geology": 98,
      "terrain": 68,
      "temperature": 70,
      "iceWater": 40,
      "atmosphere": 72,
      "biosphere": 75,
      "subsurface": 45,
      "robotics": 88
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
      {
        "distKm": 0.0,
        "elevM": -1450
      },
      {
        "distKm": 2.27,
        "elevM": -1461
      },
      {
        "distKm": 4.53,
        "elevM": -1454
      },
      {
        "distKm": 6.8,
        "elevM": -1437
      },
      {
        "distKm": 9.06,
        "elevM": -1427
      },
      {
        "distKm": 11.33,
        "elevM": -1418
      },
      {
        "distKm": 13.59,
        "elevM": -1403
      },
      {
        "distKm": 15.86,
        "elevM": -1384
      },
      {
        "distKm": 18.12,
        "elevM": -1397
      },
      {
        "distKm": 20.39,
        "elevM": -1433
      }
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
      "geology": 92,
      "terrain": 96,
      "temperature": 76,
      "iceWater": 50,
      "atmosphere": 75,
      "biosphere": 40,
      "subsurface": 88,
      "robotics": 86
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
      {
        "distKm": 0.0,
        "elevM": 7699
      },
      {
        "distKm": 12.86,
        "elevM": 7932
      },
      {
        "distKm": 25.72,
        "elevM": 4923
      },
      {
        "distKm": 38.58,
        "elevM": 4307
      },
      {
        "distKm": 51.43,
        "elevM": 6972
      },
      {
        "distKm": 64.29,
        "elevM": 6031
      },
      {
        "distKm": 77.15,
        "elevM": 6263
      },
      {
        "distKm": 90.01,
        "elevM": 7243
      },
      {
        "distKm": 102.87,
        "elevM": 5911
      },
      {
        "distKm": 115.73,
        "elevM": 4932
      }
    ]
  }
];

export const SITES: EarthSite[] = [
  {
    "id": "ATC-01",
    "name": "Desierto de Atacama (Cuenca de Yungay)",
    "country": "Chile",
    "region": "Antofagasta / Sudamérica",
    "lat": -24.088,
    "lng": -69.916,
    "dms": "24°05′17″ S, 69°54′58″ W",
    "elevM": 1020,
    "biome": "Hiperárido",
    "charLevel": "Alto",
    "isCandidate": false,
    "microScale": "Cuenca hiperárida de Yungay y domos salinos de la Cordillera de la Sal (12 km²).",
    "activeProcess": "Precipitación hiperárida de percloratos/sulfatos, oxidación fotoquímica UV extrema y erosión eólica sin intemperismo pluvial.",
    "nasaDatasets": "TERRA/ASTER TIR, MODIS LST, SRTM 30m DEM",
    "meanTempC": 18.2,
    "tempMinC": 1.5,
    "tempMaxC": 36.4,
    "precipMm": 1.2,
    "humidityPct": 8.5,
    "slopeDeg": 4.8,
    "roughnessRms": 0.12,
    "uvPeak": 14.5,
    "solarWpm2": 1140,
    "pressureHpa": 898,
    "mineralogy": "Halita, Anhidrita, Percloratos (ClO₄⁻), Nitratos, Yeso",
    "petrology": "Costra evaporítica sobre regolito coluvial sin materia orgánica",
    "summary": "Límite de sequedad extrema de la Tierra con aridez ininterrumpida por más de 15 Ma. Concentraciones de percloratos idénticas a las detectadas por Phoenix y Curiosity en Marte.",
    "protocols": [
      {
        "code": "PRT-ATC-DRL",
        "title": "Perforación Autónoma en Subsuelo Seco",
        "trl": "TRL-6",
        "domain": "Drilling",
        "desc": "Penetración de 2 m en costra de halita sin lubricación fluida para rovers marcianos."
      },
      {
        "code": "PRT-ATC-BIO",
        "title": "Fluorescencia Raman de Biofirmas",
        "trl": "TRL-7",
        "domain": "Sensors",
        "desc": "Detección no destructiva de carotenoides y pigmentos protectores en endolitos."
      }
    ],
    "vector": {
      "geology": 94,
      "terrain": 72,
      "temperature": 80,
      "iceWater": 15,
      "atmosphere": 88,
      "biosphere": 90,
      "subsurface": 45,
      "robotics": 85
    },
    "radar": {
      "morphology": 70,
      "mineralogy": 98,
      "temperature": 75,
      "aridity": 100,
      "radiation": 96,
      "isru": 44
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 1040
      },
      {
        "distKm": 3,
        "elevM": 1030
      },
      {
        "distKm": 7,
        "elevM": 1020
      },
      {
        "distKm": 12,
        "elevM": 1015
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Valle_de_la_Luna_-_Atacama_Desert.jpg/1280px-Valle_de_la_Luna_-_Atacama_Desert.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Valle de la Luna, Cuenca de Atacama — Domos salinos y cuencas hiperáridas",
    "photoSpaceCaption": "Marte, Cráter Gale / Jezero — NASA/JPL",
    "inspectionGallery": [
      {
        "title": "Vista Satelital SRTM",
        "category": "Vista Orbital SRTM",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Valle_de_la_Luna_-_Atacama_Desert.jpg/1280px-Valle_de_la_Luna_-_Atacama_Desert.jpg",
        "caption": "Topografía SRTM de la cuenca salina de Atacama"
      },
      {
        "title": "Costra de Sal y Percloratos",
        "category": "Textura de Regolito",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Valle_de_la_Luna_-_Atacama_Desert.jpg/1280px-Valle_de_la_Luna_-_Atacama_Desert.jpg",
        "caption": "Microestructura de cristales halíticos y percloratos"
      }
    ]
  },
  {
    "id": "HGT-02",
    "name": "Cráter de Impacto Haughton",
    "country": "Canadá",
    "region": "Isla Devon / Nunavut / Ártico",
    "lat": 75.383,
    "lng": -89.666,
    "dms": "75°22′59″ N, 89°39′58″ W",
    "elevM": 240,
    "biome": "Impacto/Cráter",
    "charLevel": "Alto",
    "isCandidate": false,
    "microScale": "Anillo central de brechas de impacto y valle de deshielo estacional Von Braun Planitia (23 km de diámetro).",
    "activeProcess": "Cratering de impacto meteorítico sobre sustrato carbonatado en permafrost continuo y ciclos criogénicos de congelación-descongelación.",
    "nasaDatasets": "ArcticDEM, Radarsat, Landsat 8/9",
    "meanTempC": -16.4,
    "tempMinC": -48,
    "tempMaxC": 12,
    "precipMm": 120,
    "humidityPct": 76,
    "slopeDeg": 14.5,
    "roughnessRms": 0.48,
    "uvPeak": 3.2,
    "solarWpm2": 480,
    "pressureHpa": 988,
    "mineralogy": "Brechas de impacto, Dolomita, Cuarzo chocado, Esmectitas, Yeso",
    "petrology": "Astroblema de 23 km en secuencias carbonatadas paleozoicas con permafrost continuo",
    "summary": "Cráter de impacto de 23 km formado hace ~39 Ma en desierto polar con permafrost continuo. Sede del proyecto Haughton-Mars Project (HMP) de NASA.",
    "protocols": [
      {
        "code": "PRT-HGT-EVA",
        "title": "Operaciones EVA con Trajes Presurizados",
        "trl": "TRL-7",
        "domain": "EVA",
        "desc": "Evaluación de movilidad articular y consumo metabólico en terreno pedregoso."
      }
    ],
    "vector": {
      "geology": 92,
      "terrain": 90,
      "temperature": 95,
      "iceWater": 90,
      "atmosphere": 65,
      "biosphere": 60,
      "subsurface": 65,
      "robotics": 92
    },
    "radar": {
      "morphology": 94,
      "mineralogy": 88,
      "temperature": 96,
      "aridity": 82,
      "radiation": 40,
      "isru": 85
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 320
      },
      {
        "distKm": 5,
        "elevM": 180
      },
      {
        "distKm": 11.5,
        "elevM": 140
      },
      {
        "distKm": 23,
        "elevM": 310
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Haughton_impact_crater_Devon_Island.jpg/1280px-Haughton_impact_crater_Devon_Island.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1545156521-77bd85671d30?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Cráter Haughton en Isla Devon — Brechas de impacto y permafrost",
    "photoSpaceCaption": "Marte, Cráter Holden / Jezero — NASA/JPL",
    "inspectionGallery": []
  },
  {
    "id": "LNZ-03",
    "name": "Tubo Volcánico de La Corona",
    "country": "España",
    "region": "Lanzarote / Islas Canarias",
    "lat": 29.141,
    "lng": -13.468,
    "dms": "29°08′28″ N, 13°28′05″ W",
    "elevM": 145,
    "biome": "Subterráneo/Cueva",
    "charLevel": "Alto",
    "isCandidate": false,
    "microScale": "Tramo basáltico subterráneo Cueva de los Verdes y jameos de colapso (6.1 km de galería).",
    "activeProcess": "Drenaje de flujos de lava pahoehoe con solidificación de techo cortical y formación de claraboyas naturales (skylights).",
    "nasaDatasets": "Terrestrial LiDAR, GPR, Sentinel-2 MSI",
    "meanTempC": 19.8,
    "tempMinC": 12.0,
    "tempMaxC": 31.0,
    "precipMm": 110,
    "humidityPct": 68,
    "slopeDeg": 8.2,
    "roughnessRms": 0.65,
    "uvPeak": 10.2,
    "solarWpm2": 920,
    "pressureHpa": 1002,
    "mineralogy": "Basalto toleítico, Olivino, Piroxeno augítico, Plagioclasa",
    "petrology": "Tubo lávico cuaternario de 6.1 km emergido y 1.6 km sumergido (Túnel de la Atlántida)",
    "summary": "Uno de los mayores tubos volcánicos del planeta. Terreno de entrenamiento para las campañas PANGAEA de la ESA para exploración de claraboyas en la Luna y Marte.",
    "protocols": [
      {
        "code": "PRT-LNZ-CAV",
        "title": "Mapeo 3D LiDAR en Cavidades Sin GNSS",
        "trl": "TRL-7",
        "domain": "Speleology",
        "desc": "Navegación SLAM y fotogrametría en túneles lávicos sin señal de satélite."
      }
    ],
    "vector": {
      "geology": 95,
      "terrain": 75,
      "temperature": 60,
      "iceWater": 25,
      "atmosphere": 30,
      "biosphere": 40,
      "subsurface": 99,
      "robotics": 94
    },
    "radar": {
      "morphology": 88,
      "mineralogy": 96,
      "temperature": 55,
      "aridity": 75,
      "radiation": 20,
      "isru": 78
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 210
      },
      {
        "distKm": 2,
        "elevM": 145
      },
      {
        "distKm": 6.1,
        "elevM": 20
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Cueva_de_los_Verdes_Lanzarote.jpg/1280px-Cueva_de_los_Verdes_Lanzarote.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Cueva de los Verdes — Bóveda basáltica de tubo de lava",
    "photoSpaceCaption": "Luna, Marius Hills Skylight — LRO LOLA NASA",
    "inspectionGallery": []
  },
  {
    "id": "PIN-04",
    "name": "Campo Volcánico El Pinacate",
    "country": "México",
    "region": "Desierto de Sonora",
    "lat": 31.773,
    "lng": -113.518,
    "dms": "31°46′23″ N, 113°31′05″ W",
    "elevM": 260,
    "biome": "Volcánico/Basáltico",
    "charLevel": "Alto",
    "isCandidate": true,
    "microScale": "Cráter maar freatomagmático El Elegante (1.6 km de diámetro, 250 m de profundidad) y campo de ceniza basáltica circundante.",
    "activeProcess": "Explosión freatomagmática por interacción magma-agua subterránea (análogo directo de cráteres marcianos con volátiles) y transporte eólico de dunas estelares.",
    "nasaDatasets": "SRTM 30m DEM, ASTER TIR, Landsat 9",
    "meanTempC": 23.5,
    "tempMinC": 2.0,
    "tempMaxC": 48.0,
    "precipMm": 85,
    "humidityPct": 18,
    "slopeDeg": 26.0,
    "roughnessRms": 0.58,
    "uvPeak": 13.8,
    "solarWpm2": 1120,
    "pressureHpa": 985,
    "mineralogy": "Basalto alcalino, Xenolitos del manto (Peridotita, Espinela), Lapilli",
    "petrology": "Cráteres maar gigantes y conos de escoria sobre basamento granítico precámbrico",
    "summary": "Campo de cráteres gigantes tipo maar donde los astronautas del programa Apollo entrenaron geología lunar entre 1965 y 1970.",
    "protocols": [
      {
        "code": "PRT-PIN-MAR",
        "title": "Simulación de Descenso a Maar Volcánico",
        "trl": "TRL-6",
        "domain": "Mobility",
        "desc": "Navegación sobre pendientes inestables de ceniza basáltica y regolito granular."
      }
    ],
    "vector": {
      "geology": 90,
      "terrain": 92,
      "temperature": 82,
      "iceWater": 30,
      "atmosphere": 80,
      "biosphere": 50,
      "subsurface": 60,
      "robotics": 88
    },
    "radar": {
      "morphology": 92,
      "mineralogy": 92,
      "temperature": 84,
      "aridity": 94,
      "radiation": 88,
      "isru": 55
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 310
      },
      {
        "distKm": 0.8,
        "elevM": 60
      },
      {
        "distKm": 1.6,
        "elevM": 305
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Pinacate_peaks_and_crater.jpg/1280px-Pinacate_peaks_and_crater.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1545156521-77bd85671d30?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Cráter maar El Elegante en El Pinacate, Sonora",
    "photoSpaceCaption": "Marte, Cráter volcánico en Tharsis — NASA MGS",
    "inspectionGallery": []
  },
  {
    "id": "MCM-05",
    "name": "Valles Secos de McMurdo",
    "country": "Antártida",
    "region": "Tierra de Victoria / Antártida Oriental",
    "lat": -77.528,
    "lng": 161.693,
    "dms": "77°31′41″ S, 161°41′35″ E",
    "elevM": 850,
    "biome": "Polar/Criogénico",
    "charLevel": "Alto",
    "isCandidate": false,
    "microScale": "Suelo poligonal criogénico sobre permafrost cementado por hielo en el piso superior del Valle Universitario (4.5 km de largo).",
    "activeProcess": "Sublimación directa de hielo subsuperficial sin fase líquida bajo hiperaridez polar y vientos catabáticos.",
    "nasaDatasets": "REMA DEM, Landsat 8 LST, IceBridge LiDAR",
    "meanTempC": -19.8,
    "tempMinC": -56.0,
    "tempMaxC": 4.0,
    "precipMm": 10,
    "humidityPct": 12,
    "slopeDeg": 12.0,
    "roughnessRms": 0.35,
    "uvPeak": 8.5,
    "solarWpm2": 520,
    "pressureHpa": 890,
    "mineralogy": "Arenisca Beacon, Kimberlita, Halita, Yeso, Sales de nitrato",
    "petrology": "Desierto frío sin cubierta de nieve retenido por vientos catabáticos supersónicos",
    "summary": "El ecosistema terrestre más frío y seco. Homólogo por excelencia de las llanuras polares marcianas y de las trampas frías de la Luna.",
    "protocols": [
      {
        "code": "PRT-MCM-ICE",
        "title": "Perforación Criogénica en Hielo Seco",
        "trl": "TRL-7",
        "domain": "Cryogenics",
        "desc": "Muestreo subsuperficial de hielos milenarios a temperaturas bajo -40°C."
      }
    ],
    "vector": {
      "geology": 88,
      "terrain": 88,
      "temperature": 98,
      "iceWater": 96,
      "atmosphere": 85,
      "biosphere": 80,
      "subsurface": 80,
      "robotics": 94
    },
    "radar": {
      "morphology": 90,
      "mineralogy": 84,
      "temperature": 100,
      "aridity": 98,
      "radiation": 85,
      "isru": 95
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 920
      },
      {
        "distKm": 2.2,
        "elevM": 850
      },
      {
        "distKm": 4.5,
        "elevM": 810
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/McMurdo_Dry_Valleys.jpg/1280px-McMurdo_Dry_Valleys.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Valles Secos de McMurdo — Terreno poligonal periglaciar",
    "photoSpaceCaption": "Marte, Llanuras del Polo Norte — NASA Phoenix",
    "inspectionGallery": []
  },
  {
    "id": "PUN-06",
    "name": "Puna de Atacama (Campo de Piedra Pómez)",
    "country": "Argentina",
    "region": "Catamarca / Cordillera de los Andes",
    "lat": -26.685,
    "lng": -67.485,
    "dms": "26°41′06″ S, 67°29′06″ W",
    "elevM": 4100,
    "biome": "Hiperárido",
    "charLevel": "Alto",
    "isCandidate": true,
    "microScale": "Corredor de mega-yardangs de ignimbrita a 4,100 m s.n.m. (25 km²).",
    "activeProcess": "Abrasión eólica supersónica de depósitos piroclásticos bajo hipobaria (610 hPa) e irradiación UV récord mundial.",
    "nasaDatasets": "SRTM 30m DEM, Sentinel-2 MSI, MODIS AOD",
    "meanTempC": 6.2,
    "tempMinC": -24.0,
    "tempMaxC": 22.0,
    "precipMm": 30,
    "humidityPct": 14,
    "slopeDeg": 11.5,
    "roughnessRms": 0.44,
    "uvPeak": 18.2,
    "solarWpm2": 1340,
    "pressureHpa": 612,
    "mineralogy": "Piedra pómez riolítica, Ignimbrita rica en cuarzo y sanidina, Vidrio volcánico",
    "petrology": "Manto piroclástico esculpido por vientos catabáticos andinos en mega-yardangs",
    "summary": "Laberinto gigante de yardangs blancos de ignimbrita a más de 4,000 m. Análogo geofísico directo de la Formación Medusae Fossae de Marte.",
    "protocols": [
      {
        "code": "PRT-PUN-YRD",
        "title": "Navegación Autónoma entre Mega-Yardangs",
        "trl": "TRL-6",
        "domain": "Autonomous",
        "desc": "Evasión de corredores de viento extremo y arena piroclástica abrasiva."
      }
    ],
    "vector": {
      "geology": 88,
      "terrain": 90,
      "temperature": 84,
      "iceWater": 25,
      "atmosphere": 95,
      "biosphere": 55,
      "subsurface": 40,
      "robotics": 86
    },
    "radar": {
      "morphology": 96,
      "mineralogy": 85,
      "temperature": 88,
      "aridity": 96,
      "radiation": 98,
      "isru": 50
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 4150
      },
      {
        "distKm": 3,
        "elevM": 4100
      },
      {
        "distKm": 6,
        "elevM": 4080
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Campo_de_Piedra_P%C3%B3mez_Catamarca.jpg/1280px-Campo_de_Piedra_P%C3%B3mez_Catamarca.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Campo de Piedra Pómez en Catamarca — Mega-yardangs de ignimbrita",
    "photoSpaceCaption": "Marte, Medusae Fossae — NASA MRO HiRISE",
    "inspectionGallery": []
  },
  {
    "id": "ASK-07",
    "name": "Caldera de Askja y Holuhraun",
    "country": "Islandia",
    "region": "Tierras Altas Centrales / Ódáðahraun",
    "lat": 65.033,
    "lng": -16.75,
    "dms": "65°02′00″ N, 16°45′00″ W",
    "elevM": 1100,
    "biome": "Volcánico/Basáltico",
    "charLevel": "Alto",
    "isCandidate": false,
    "microScale": "Cráter explosivo Víti y llanura de inundación basáltica de Holuhraun (85 km²).",
    "activeProcess": "Vulcanismo fisural toleítico e interacción glacio-volcánica con sedimentación de arenas basálticas vítreas.",
    "nasaDatasets": "TanDEM-X, Sentinel-1 InSAR, Landsat 8/9",
    "meanTempC": -2.4,
    "tempMinC": -32.0,
    "tempMaxC": 14.0,
    "precipMm": 450,
    "humidityPct": 75,
    "slopeDeg": 18.0,
    "roughnessRms": 0.72,
    "uvPeak": 4.5,
    "solarWpm2": 580,
    "pressureHpa": 880,
    "mineralogy": "Basalto toleítico vítreo, Piroxeno, Vidrio riolítico, Azufre",
    "petrology": "Caldera de colapso múltiple y campos de lava fisural fresca (erupción 2014-2015)",
    "summary": "Campo de lava basáltica y arenas oscuras donde los astronautas del Apollo 11 realizaron sus entrenamientos de geología de campo.",
    "protocols": [
      {
        "code": "PRT-ASK-LAV",
        "title": "Tracción sobre Arenas Basálticas Vítreas",
        "trl": "TRL-7",
        "domain": "Locomotion",
        "desc": "Pruebas de hundimiento de ruedas rígidas en regolito granular basáltico."
      }
    ],
    "vector": {
      "geology": 96,
      "terrain": 86,
      "temperature": 85,
      "iceWater": 65,
      "atmosphere": 70,
      "biosphere": 45,
      "subsurface": 60,
      "robotics": 90
    },
    "radar": {
      "morphology": 92,
      "mineralogy": 98,
      "temperature": 86,
      "aridity": 65,
      "radiation": 45,
      "isru": 82
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 1450
      },
      {
        "distKm": 4,
        "elevM": 1050
      },
      {
        "distKm": 8,
        "elevM": 1100
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Askja_Caldera_Iceland.jpg/1280px-Askja_Caldera_Iceland.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Caldera de Askja y cráter hidrotermal Víti en Islandia",
    "photoSpaceCaption": "Luna, Mare Imbrium — NASA LRO",
    "inspectionGallery": []
  },
  {
    "id": "DNK-08",
    "name": "Depresión de Danakil (Domo Dallol)",
    "country": "Etiopía",
    "region": "Triángulo de Afar",
    "lat": 14.241,
    "lng": 40.298,
    "dms": "14°14′28″ N, 40°17′53″ E",
    "elevM": -120,
    "biome": "Hiperárido",
    "charLevel": "Alto",
    "isCandidate": true,
    "microScale": "Terrazas de salmuera hiperácida del cráter freático Dallol (120 m bajo el nivel del mar).",
    "activeProcess": "Desgasificación magmática subaérea y precipitación hidrotermal de halita, jarosita y óxidos de hierro a pH < 1.",
    "nasaDatasets": "SRTM 30m, ASTER TIR, MODIS LST",
    "meanTempC": 34.6,
    "tempMinC": 21.0,
    "tempMaxC": 52.0,
    "precipMm": 80,
    "humidityPct": 22,
    "slopeDeg": 6.5,
    "roughnessRms": 0.28,
    "uvPeak": 14.8,
    "solarWpm2": 1180,
    "pressureHpa": 1025,
    "mineralogy": "Halita clorurada, Jarosita, Óxidos de hierro, Azufre nativo, Silvita",
    "petrology": "Domo freático hidrotermal sobre manto evaporítico de 2 km de espesor",
    "summary": "Punto hidrotermal poliextremófilo más extremo del planeta: acidez hiperbólica (pH < 1), salinidad saturada y temperaturas que superan los 50°C.",
    "protocols": [
      {
        "code": "PRT-DNK-ACD",
        "title": "Resistencia a Vapores Ácidos Corrosivos",
        "trl": "TRL-6",
        "domain": "Materials",
        "desc": "Evaluación de aleaciones y sellos frente a emanaciones de HCl y SO₂."
      }
    ],
    "vector": {
      "geology": 98,
      "terrain": 78,
      "temperature": 96,
      "iceWater": 20,
      "atmosphere": 85,
      "biosphere": 98,
      "subsurface": 70,
      "robotics": 84
    },
    "radar": {
      "morphology": 84,
      "mineralogy": 100,
      "temperature": 98,
      "aridity": 92,
      "radiation": 90,
      "isru": 60
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": -130
      },
      {
        "distKm": 1.5,
        "elevM": -85
      },
      {
        "distKm": 3,
        "elevM": -120
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Dallol_Ethiopia.jpg/1280px-Dallol_Ethiopia.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1545156521-77bd85671d30?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Terrazas de azufre y salmuera hidrotermal en Dallol, Etiopía",
    "photoSpaceCaption": "Marte, Depósitos hidrotermales en Gusev / Nili Fossae — NASA MRO",
    "inspectionGallery": []
  },
  {
    "id": "PAY-09",
    "name": "Reserva Volcánica La Payunia",
    "country": "Argentina",
    "region": "Mendoza / Malargüe",
    "lat": -36.416,
    "lng": -69.216,
    "dms": "36°25′00″ S, 69°13′00″ W",
    "elevM": 1850,
    "biome": "Volcánico/Basáltico",
    "charLevel": "Alto",
    "isCandidate": true,
    "microScale": "Campo de lapilli basáltico negro y cono de escoria Morado (38 km²).",
    "activeProcess": "Erupción estromboliana monogenética de alta densidad (más de 800 conos) y mantos de piroclastos oscuros análogos a los mares lunares.",
    "nasaDatasets": "SRTM 30m DEM, Sentinel-2 MSI, ALOS PALSAR",
    "meanTempC": 11.5,
    "tempMinC": -18.0,
    "tempMaxC": 32.0,
    "precipMm": 180,
    "humidityPct": 35,
    "slopeDeg": 16.0,
    "roughnessRms": 0.62,
    "uvPeak": 11.2,
    "solarWpm2": 980,
    "pressureHpa": 815,
    "mineralogy": "Basalto alcalino, Lapilli, Olivino, Magnetita, Vidrio volcánico",
    "petrology": "Mayor concentración de conos volcánicos monogenéticos del hemisferio sur",
    "summary": "La Pampa Negra es el análogo morfológico y fotométrico más fiel en Sudamérica a los basaltos de los mares lunares y las planicies volcánicas de Marte.",
    "protocols": [
      {
        "code": "PRT-PAY-LPL",
        "title": "Dinámica de Ruedas en Lapilli Flotante",
        "trl": "TRL-6",
        "domain": "Mobility",
        "desc": "Medición de coeficiente de fricción sobre mantos de escoria negra suelta."
      }
    ],
    "vector": {
      "geology": 95,
      "terrain": 84,
      "temperature": 75,
      "iceWater": 30,
      "atmosphere": 75,
      "biosphere": 35,
      "subsurface": 70,
      "robotics": 89
    },
    "radar": {
      "morphology": 90,
      "mineralogy": 96,
      "temperature": 78,
      "aridity": 80,
      "radiation": 70,
      "isru": 75
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 1720
      },
      {
        "distKm": 5,
        "elevM": 1850
      },
      {
        "distKm": 10,
        "elevM": 2100
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Payunia_Mendoza.jpg/1280px-Payunia_Mendoza.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Pampa Negra en La Payunia, Mendoza — Conos de escoria basáltica",
    "photoSpaceCaption": "Luna, Mare Tranquillitatis — NASA Apollo 11",
    "inspectionGallery": []
  },
  {
    "id": "SLD-10",
    "name": "Lago Salda (Terrazas de Hidromagnesita)",
    "country": "Turquía",
    "region": "Provincia de Burdur / Anatolia",
    "lat": 37.552,
    "lng": 29.673,
    "dms": "37°33′07″ N, 29°40′23″ E",
    "elevM": 1163,
    "biome": "Impacto/Cráter",
    "charLevel": "Alto",
    "isCandidate": true,
    "microScale": "Deltas costeros blancos y montículos estromatolíticos de hidromagnesita (44 km²).",
    "activeProcess": "Meteorización de rocas ultramáficas (serpentinitas) y precipitación de carbonatos de magnesio mediados por microbialitos (homólogo mineralógico exacto del Cráter Jezero).",
    "nasaDatasets": "Landsat 9 OLI-2, Sentinel-2 MSI, SRTM 30m",
    "meanTempC": 13.8,
    "tempMinC": -6.0,
    "tempMaxC": 34.0,
    "precipMm": 435,
    "humidityPct": 52,
    "slopeDeg": 8.0,
    "roughnessRms": 0.18,
    "uvPeak": 9.4,
    "solarWpm2": 890,
    "pressureHpa": 882,
    "mineralogy": "Hidromagnesita, Huntita, Serpentinita, Magnesita, Crisotilo",
    "petrology": "Depósitos lacustres carbonatados precipitados por microbialitos en cuenca ultramáfica",
    "summary": "Estudiado activamente por la NASA como el gemelo mineralógico terrestre del Cráter Jezero donde el rover Perseverance busca biofirmas microbianas fósiles.",
    "protocols": [
      {
        "code": "PRT-SLD-CAR",
        "title": "Espectroscopía UV de Carbonatos Fósiles",
        "trl": "TRL-7",
        "domain": "Astrobiology",
        "desc": "Protocolo SHERLOC/PIXL para mapeo de hidromagnesita en playas lacustres."
      }
    ],
    "vector": {
      "geology": 99,
      "terrain": 74,
      "temperature": 65,
      "iceWater": 60,
      "atmosphere": 50,
      "biosphere": 98,
      "subsurface": 45,
      "robotics": 88
    },
    "radar": {
      "morphology": 82,
      "mineralogy": 100,
      "temperature": 68,
      "aridity": 50,
      "radiation": 48,
      "isru": 90
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 1220
      },
      {
        "distKm": 2,
        "elevM": 1163
      },
      {
        "distKm": 5,
        "elevM": 1163
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lake_Salda_NASA_Earth_Observatory.jpg/1280px-Lake_Salda_NASA_Earth_Observatory.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1545156521-77bd85671d30?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Lago Salda — Playas blancas de hidromagnesita (NASA Earth Observatory)",
    "photoSpaceCaption": "Marte, Delta de Jezero — NASA/JPL/MRO",
    "inspectionGallery": []
  },
  {
    "id": "UYU-11",
    "name": "Salar de Uyuni (Sector Tahua)",
    "country": "Bolivia",
    "region": "Potosí / Altiplano Andino",
    "lat": -20.133,
    "lng": -67.489,
    "dms": "20°08′01″ S, 67°29′21″ W",
    "elevM": 3656,
    "biome": "Hiperárido",
    "charLevel": "Alto",
    "isCandidate": true,
    "microScale": "Costra evaporítica poligonal de halita y salmuera de litio a 3,656 m s.n.m.",
    "activeProcess": "Desecación de paleolagos pleistocenos y cristalización poligonal por evaporación extrema y alto albedo.",
    "nasaDatasets": "ICESat-2 ATLAS, SRTM 30m DEM, Sentinel-2",
    "meanTempC": 8.9,
    "tempMinC": -14.0,
    "tempMaxC": 21.0,
    "precipMm": 160,
    "humidityPct": 28,
    "slopeDeg": 0.2,
    "roughnessRms": 0.05,
    "uvPeak": 16.5,
    "solarWpm2": 1280,
    "pressureHpa": 648,
    "mineralogy": "Halita (NaCl), Yeso, Cloruro de litio, Ulexita, Sulfato de magnesio",
    "petrology": "Manto salino continuo de 10,582 km² con variaciones altimétricas < 1 metro",
    "summary": "El mayor salar del mundo. Empleado por satélites de la NASA (ICESat-2) como superficie de calibración altimétrica global debido a su planitud perfecta.",
    "protocols": [
      {
        "code": "PRT-UYU-ALT",
        "title": "Calibración de Altimetría Láser Orbitador",
        "trl": "TRL-8",
        "domain": "Remote Sensing",
        "desc": "Ajuste de sesgo vertical en bandas LiDAR espaciales sobre plano reflectivo."
      }
    ],
    "vector": {
      "geology": 92,
      "terrain": 88,
      "temperature": 82,
      "iceWater": 50,
      "atmosphere": 86,
      "biosphere": 65,
      "subsurface": 55,
      "robotics": 91
    },
    "radar": {
      "morphology": 98,
      "mineralogy": 92,
      "temperature": 85,
      "aridity": 94,
      "radiation": 96,
      "isru": 82
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 3656
      },
      {
        "distKm": 20,
        "elevM": 3656
      },
      {
        "distKm": 50,
        "elevM": 3656
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Salar_de_Uyuni_Bolivia.jpg/1280px-Salar_de_Uyuni_Bolivia.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Salar de Uyuni — Patrones poligonales de evaporación halítica",
    "photoSpaceCaption": "Marte, Arcadia Planitia — NASA MRO",
    "inspectionGallery": []
  },
  {
    "id": "OJS-12",
    "name": "Nevado Ojos del Salado (Laguna de Cráter)",
    "country": "Chile / Argentina",
    "region": "Atacama / Catamarca / Andes Centrales",
    "lat": -27.109,
    "lng": -68.541,
    "dms": "27°06′34″ S, 68°32′28″ W",
    "elevM": 6390,
    "biome": "Polar/Criogénico",
    "charLevel": "Alto",
    "isCandidate": true,
    "microScale": "Fumarolas y laguna glaciar perenne en el cráter cumbre (6,390 m s.n.m.).",
    "activeProcess": "Actividad hidrotermal volcánica de gran altitud bajo congelamiento criogénico y presión atmosférica del 45% terrestre.",
    "nasaDatasets": "SRTM 30m, ASTER GDEM, MODIS Terra LST",
    "meanTempC": -12.4,
    "tempMinC": -38.0,
    "tempMaxC": 6.0,
    "precipMm": 65,
    "humidityPct": 16,
    "slopeDeg": 32.0,
    "roughnessRms": 0.85,
    "uvPeak": 21.0,
    "solarWpm2": 1420,
    "pressureHpa": 465,
    "mineralogy": "Dacita, Andesita, Azufre nativo, Sulfatos hidrotermales, Hielo perenne",
    "petrology": "Estratovolcán activo más alto del planeta con la masa de agua superficial más elevada",
    "summary": "Entorno andino hiper-extremo: presión de 465 hPa (45% de la terrestre), radiación UV máxima absoluta y laguna permanente en permafrost volcánico.",
    "protocols": [
      {
        "code": "PRT-OJS-HYP",
        "title": "Aviónica y Baterías en Hipobaria Fría",
        "trl": "TRL-6",
        "domain": "Avionics",
        "desc": "Ciclos térmicos en electrónica a 450 hPa y temperaturas inferiores a -30°C."
      }
    ],
    "vector": {
      "geology": 88,
      "terrain": 95,
      "temperature": 98,
      "iceWater": 92,
      "atmosphere": 96,
      "biosphere": 82,
      "subsurface": 65,
      "robotics": 90
    },
    "radar": {
      "morphology": 96,
      "mineralogy": 88,
      "temperature": 99,
      "aridity": 95,
      "radiation": 100,
      "isru": 92
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 5200
      },
      {
        "distKm": 3,
        "elevM": 5850
      },
      {
        "distKm": 6,
        "elevM": 6390
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Ojos_del_Salado_volcano.jpg/1280px-Ojos_del_Salado_volcano.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Nevado Ojos del Salado — Cumbres volcánicas y lagunas criogénicas",
    "photoSpaceCaption": "Marte, Olympus Mons — NASA Viking / MGS",
    "inspectionGallery": []
  },
  {
    "id": "BAR-13",
    "name": "Cráter Barringer (Meteor Crater)",
    "country": "Estados Unidos",
    "region": "Coconino County / Arizona",
    "lat": 35.027,
    "lng": -111.022,
    "dms": "35°01′38″ N, 111°01′20″ W",
    "elevM": 1740,
    "biome": "Impacto/Cráter",
    "charLevel": "Alto",
    "isCandidate": false,
    "microScale": "Pared invertida de estratos de arenisca Coconino y piso del cráter (1.2 km de diámetro, 170 m de profundidad).",
    "activeProcess": "Metamorfismo de choque por impacto hiperveloz (coesita/stishovita) y depósito de manto de eyección invertido.",
    "nasaDatasets": "USGS 3DEP 1m LiDAR, SRTM 30m, ASTER TIR",
    "meanTempC": 12.8,
    "tempMinC": -15.0,
    "tempMaxC": 38.0,
    "precipMm": 210,
    "humidityPct": 26,
    "slopeDeg": 38.0,
    "roughnessRms": 0.68,
    "uvPeak": 11.5,
    "solarWpm2": 1050,
    "pressureHpa": 825,
    "mineralogy": "Coesita, Stishovita, Meteorita de hierro-níquel (Taenita, Kamacita), Arenisca chocado",
    "petrology": "Cráter de impacto meteórico simple de 1.2 km de diámetro conservado en clima árido",
    "summary": "El cráter de impacto meteorítico mejor preservado de la Tierra. Emplazamiento pionero de entrenamiento de astronautas Apollo y pruebas de tracción en taludes empinados.",
    "protocols": [
      {
        "code": "PRT-BAR-IMP",
        "title": "Estudio de Eyección y Manto Volcado",
        "trl": "TRL-7",
        "domain": "Geology",
        "desc": "Mapeo de estratigrafía invertida análoga a cráteres lunares simples."
      }
    ],
    "vector": {
      "geology": 96,
      "terrain": 94,
      "temperature": 75,
      "iceWater": 25,
      "atmosphere": 70,
      "biosphere": 30,
      "subsurface": 55,
      "robotics": 95
    },
    "radar": {
      "morphology": 98,
      "mineralogy": 96,
      "temperature": 75,
      "aridity": 85,
      "radiation": 65,
      "isru": 60
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 1740
      },
      {
        "distKm": 0.6,
        "elevM": 1570
      },
      {
        "distKm": 1.2,
        "elevM": 1740
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Meteor_Crater_-_Arizona.jpg/1280px-Meteor_Crater_-_Arizona.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1545156521-77bd85671d30?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Meteor Crater en Winslow, Arizona — Bol de impacto intacto",
    "photoSpaceCaption": "Luna, Cráter Linné — NASA LRO",
    "inspectionGallery": []
  },
  {
    "id": "RIO-14",
    "name": "Río Tinto (Nacimiento en Peña de Hierro)",
    "country": "España",
    "region": "Huelva / Andalucía",
    "lat": 37.697,
    "lng": -6.564,
    "dms": "37°41′50″ N, 6°33′51″ W",
    "elevM": 320,
    "biome": "Hiperárido",
    "charLevel": "Alto",
    "isCandidate": false,
    "microScale": "Terrazas fluviales de sulfatos férricos y jarosita en la Faja Pirítica Ibérica (5 km de cabecera).",
    "activeProcess": "Biolixiviación quimiolitótrofa de sulfuros metálicos generando aguas ácidas (pH 2.2) y precipitación de jarosita/goethita (análoga a Meridiani Planum en Marte).",
    "nasaDatasets": "Sentinel-2 MSI, ASTER TIR, Airborne HyMap",
    "meanTempC": 17.5,
    "tempMinC": 2.0,
    "tempMaxC": 42.0,
    "precipMm": 580,
    "humidityPct": 58,
    "slopeDeg": 12.0,
    "roughnessRms": 0.42,
    "uvPeak": 9.8,
    "solarWpm2": 950,
    "pressureHpa": 978,
    "mineralogy": "Jarosita, Goethita, Hematita, Pirita, Copiapita, Cuarzo",
    "petrology": "Aguas fluviales ácidas hiperférricas (pH 1.5 - 2.5) sobre sulfuros masivos volcánicos",
    "summary": "Laboratorio natural de astrobiología para Marte. La jarosita de Río Tinto es idéntica a la descubierta por el rover Opportunity en Meridiani Planum.",
    "protocols": [
      {
        "code": "PRT-RIO-JAR",
        "title": "Detección de Biofirmas Férricas",
        "trl": "TRL-7",
        "domain": "Astrobiology",
        "desc": "Calibración de espectrómetros Mössbauer y Raman en terrazas de gossan."
      }
    ],
    "vector": {
      "geology": 98,
      "terrain": 76,
      "temperature": 65,
      "iceWater": 55,
      "atmosphere": 50,
      "biosphere": 99,
      "subsurface": 75,
      "robotics": 90
    },
    "radar": {
      "morphology": 80,
      "mineralogy": 100,
      "temperature": 65,
      "aridity": 60,
      "radiation": 40,
      "isru": 85
    },
    "topo": [
      {
        "distKm": 0,
        "elevM": 410
      },
      {
        "distKm": 2.5,
        "elevM": 320
      },
      {
        "distKm": 5,
        "elevM": 260
      }
    ],
    "photoEarth": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Rio_Tinto_mine_water.jpg/1280px-Rio_Tinto_mine_water.jpg",
    "photoSpace": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    "photoEarthCaption": "Aguas rojas ricas en hierro y jarosita en Río Tinto, España",
    "photoSpaceCaption": "Marte, Meridiani Planum — NASA Opportunity",
    "inspectionGallery": []
  }
];


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
