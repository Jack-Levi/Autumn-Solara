import React, { useState } from 'react';
import {
  COPERNICUS_DIVINER_TEMP,
  SHACKLETON_DIVINER_TEMP,
  COPERNICUS_LOLA_TOPO,
  SHACKLETON_LOLA_TOPO,
  ALBA_MONS_TES_THEMIS,
  JEZERO_TES_THEMIS,
  ALBA_MONS_MOLA_TOPO,
  JEZERO_MOLA_TOPO,
} from '../data/nasaExtractedDatasets';

// ─── TYPES & DATA STRUCTURES ───────────────────────────────────────────────

export type ExtraterrestrialTargetId =
  | 'MOON-SHK'
  | 'MOON-COP'
  | 'MARS-JEZ'
  | 'MARS-ALB';

export interface AnalogJustificationEntry {
  code: string;
  name: string;
  country: string;
  region: string;
  coords: string;
  elevM: number;
  biome: string;
  targetId: ExtraterrestrialTargetId;
  targetName: string;
  mission: string;
  earthSensors: string;
  nasaSensors: string;
  fidelityCriterion: string;
  criticalLimit: string;
  activeProcess: string;
}

export interface VaultDatasetEntry {
  id: string;
  csvFileName: string;
  publicPath: string;
  targetName: string;
  body: 'Luna' | 'Marte';
  instrument: string;
  resolution: string;
  description: string;
  previewHeaders: string[];
  previewRows: (string | number)[][];
  totalRows: number;
  generateCSV: () => string;
}

// ─── 14 SITES ANALOG JUSTIFICATION MATRIX ───────────────────────────────────

export const ANALOG_SCIENTIFIC_MATRIX: AnalogJustificationEntry[] = [
  {
    code: 'ATC-01',
    name: 'Desierto de Atacama (Cuenca de Yungay)',
    country: 'Chile',
    region: 'Antofagasta / Sudamérica',
    coords: '24°05′17″ S, 69°54′58″ W',
    elevM: 1020,
    biome: 'Hiperárido',
    targetId: 'MARS-JEZ',
    targetName: 'Cráter Jezero',
    mission: 'Mars Sample Return / Perseverance',
    earthSensors: 'SRTM 30m, TERRA/ASTER TIR, MODIS LST',
    nasaSensors: 'MGS MOLA, TES / THEMIS, MRO CRISM',
    fidelityCriterion:
      'Preservación de sales higroscópicas (percloratos, cloruros y sulfatos), suelo coluvial hiperárido sin horizonte orgánico y oxidación fotoquímica UV extrema idéntica a Marte.',
    criticalLimit:
      'Presión atmosférica de 1,013 hPa, entradas esporádicas de niebla costera invernal (camanchaca) y presencia de microbios extremófilos viables.',
    activeProcess:
      'Precipitación hiperárida de percloratos/sulfatos, oxidación fotoquímica UV extrema y erosión eólica sin intemperismo pluvial.',
  },
  {
    code: 'HGT-02',
    name: 'Cráter de Impacto Haughton',
    country: 'Canadá',
    region: 'Isla Devon, Nunavut / Ártico',
    coords: '75°22′00″ N, 89°41′00″ W',
    elevM: 240,
    biome: 'Tundra Ártica Polar',
    targetId: 'MOON-COP',
    targetName: 'Cráter Copernicus',
    mission: 'Artemis III / Programa Lunar de Impactos Complejos',
    earthSensors: 'ArcticDEM 2m, Radarsat InSAR, Landsat 8/9',
    nasaSensors: 'LRO LOLA DEM, LRO Diviner, Mini-RF SAR',
    fidelityCriterion:
      'Astroblema de impacto complejo de 23 km en rocas sedimentarias carbonatadas con permafrost continuo; mantos de brecha polimíctica y fusión hidrotermal residual.',
    criticalLimit:
      'Erosión glaciar y fluvial cuaternaria que modificó los bordes originales, presencia de vegetación ártica estacional y presión de 1,013 hPa.',
    activeProcess:
      'Crioturbación continua, flujo solifluctuoso y meteorización mecánica por cuña de hielo en sustrato de impacto chocado.',
  },
  {
    code: 'LNZ-03',
    name: 'Tubo Volcánico de La Corona',
    country: 'España',
    region: 'Lanzarote, Islas Canarias',
    coords: '29°11′48″ N, 13°29′12″ W',
    elevM: 180,
    biome: 'Volcánico Árido Macaronésico',
    targetId: 'MARS-ALB',
    targetName: 'Alba Mons',
    mission: 'Artemis Basecamp / ESA PANGAEA / Subsurface Mars',
    earthSensors: 'Terrestrial LiDAR, GPR Terrestre, Sentinel-2 MSI',
    nasaSensors: 'MGS MOLA, LRO LROC NAC, Mars Odyssey THEMIS IR',
    fidelityCriterion:
      'Conductos de lava basáltica pahoehoe con claraboyas de colapso cenital (skylights), terrazas de flujo petrificadas y aislamiento térmico subterráneo análogo a tubos de lava de Tharsis.',
    criticalLimit:
      'Infiltración de humedad marina salina atlántica, colapsos por intemperismo húmedo y gravedad de 1.00g (diámetros de tubo menores que los equivalentes marcianos).',
    activeProcess:
      'Goteo de carbonatos biogénicos secundarios, desprendimiento gravitacional de bóveda y meteorización eólica en jameos abiertos.',
  },
  {
    code: 'PIN-04',
    name: 'Campo Volcánico El Pinacate',
    country: 'México',
    region: 'Desierto de Sonora, Sonora',
    coords: '31°46′21″ N, 113°29′54″ W',
    elevM: 260,
    biome: 'Desierto Cálido Sonorense',
    targetId: 'MOON-COP',
    targetName: 'Cráter Copernicus',
    mission: 'Entrenamiento Geológico Apollo / Artemis EVA Mobility',
    earthSensors: 'SRTM 30m DEM, ASTER TIR, Landsat 9 OLI-2',
    nasaSensors: 'LRO LOLA DEM, LRO Diviner, MGS MOLA',
    fidelityCriterion:
      'Cráteres de explosión freatomagmática tipo maar (Cráter Elegante) con morfología análoga a cráteres de impacto de fondo plano, depósitos de tefra y campos de bombas piroclásticas basálticas.',
    criticalLimit:
      'Génesis freatomagmática hidrovolcánica (interacción magma-acuífero ausente en impactos de bólidos lunares) y presión atmosférica densa.',
    activeProcess:
      'Deflación eólica de arenas basálticas, saltación de cenizas y meteorización física por choque térmico día/noche.',
  },
  {
    code: 'MCM-05',
    name: 'Valles Secos de McMurdo',
    country: 'Antártida',
    region: 'Tierra de Victoria / Antártida Oriental',
    coords: '77°28′00″ S, 162°31′00″ E',
    elevM: 140,
    biome: 'Desierto Polar Hiperárido',
    targetId: 'MOON-SHK',
    targetName: 'Cráter Shackleton',
    mission: 'Artemis III / VIPER South Pole Ice Mission',
    earthSensors: 'REMA DEM 8m, Landsat 8 LST, IceBridge LiDAR',
    nasaSensors: 'LRO LOLA Polar DEM, LRO Diviner DLRE, LAMP UV',
    fidelityCriterion:
      'Hiperaridez polar extrema, temperaturas medias subcero (-20 °C a -50 °C), permafrost seco sin hielo de poro superficial y confinamiento de hielo fósil relicto en trampas geomorfológicas.',
    criticalLimit:
      'Presión superficial barométrica terrestre de 980 hPa, humedad relativa ambiente baja pero no nula (~10%) y ausencia del ultra-alto vacío lunar de 10⁻¹² Pa.',
    activeProcess:
      'Sublimación directa de hielo masivo bajo regolito, abrasión eólica por ventifactos catabáticos y desecación criogénica continua.',
  },
  {
    code: 'PUN-06',
    name: 'Puna de Atacama (Campo de Piedra Pómez)',
    country: 'Argentina',
    region: 'Antofagasta de la Sierra, Catamarca',
    coords: '26°42′30″ S, 67°30′15″ W',
    elevM: 3050,
    biome: 'Puna Andina de Gran Altitud',
    targetId: 'MARS-ALB',
    targetName: 'Alba Mons',
    mission: 'Mars Exploration Rovers / Artemis Mobility Trials',
    earthSensors: 'SRTM 30m DEM, Sentinel-2 MSI, MODIS AOD',
    nasaSensors: 'MGS MOLA, Mars Odyssey THEMIS, MGS TES',
    fidelityCriterion:
      'Manto ignimbrítico de tefra y pómez blanca modelado por vientos catabáticos hiperbáricos en mega-yardangs; sustrato de ultra-baja inercia térmica y regolito poroso compresible.',
    criticalLimit:
      'Densidad atmosférica terrestre suficiente para saltación de megaclastos por deflación, y ciclos estacionales de helada con humedad residual andina.',
    activeProcess:
      'Abrasión eólica unidireccional severa formando yardangs gigantescos y migración de dunas de ceniza volcánica.',
  },
  {
    code: 'ASK-07',
    name: 'Caldera de Askja y Holuhraun',
    country: 'Islandia',
    region: 'Tierras Altas Centrales / Dyngjufjöll',
    coords: '65°01′48″ N, 16°45′00″ W',
    elevM: 1050,
    biome: 'Desierto Volcánico Subártico',
    targetId: 'MARS-ALB',
    targetName: 'Alba Mons',
    mission: 'Apollo Geology Field Training / Mars Sample Return Test',
    earthSensors: 'TanDEM-X DEM, Sentinel-1 InSAR, Landsat 8/9',
    nasaSensors: 'MGS MOLA, Mars Odyssey THEMIS, MRO HiRISE',
    fidelityCriterion:
      'Coladas de basalto toleítico prístino sin meteorización biológica, lavas cordadas rugosas a-a y pahoehoe, y desgasificación en caldera de subsidencia volcánica masiva.',
    criticalLimit:
      'Alta pluviosidad subártica, cubierta de nieve invernal húmeda y alteración hidrotermal meteórica rica en agua líquida ausente en Marte actual.',
    activeProcess:
      'Enfriamiento conductivo de coladas jóvenes, fracturamiento columnar contráctil y emisión fumarólica de SO₂.',
  },
  {
    code: 'DNK-08',
    name: 'Depresión de Danakil (Domo Dallol)',
    country: 'Etiopía',
    region: 'Triángulo de Afar / Gran Valle del Rift',
    coords: '14°14′30″ N, 40°18′00″ E',
    elevM: -120,
    biome: 'Depresión Geotérmica Hiperácida',
    targetId: 'MARS-ALB',
    targetName: 'Alba Mons',
    mission: 'Mars 2020 Astrobiology / Early Mars Hydrothermal Systems',
    earthSensors: 'SRTM 30m, ASTER TIR, MODIS LST',
    nasaSensors: 'MGS MOLA, TES / THEMIS, MRO CRISM',
    fidelityCriterion:
      'Sistemas hidrotermales hiperácidos (pH < 0), hipersalinos y anóxicos enriquecidos en hierro y azufre; análogo geoquímico del vulcanismo Noeico temprano marciano.',
    criticalLimit:
      'Presión superficial de 1 atm (~1,020 hPa en depresión de -120 m), temperatura ambiente media de +34 °C muy superior al rango térmico marciano.',
    activeProcess:
      'Precipitación continua de halita, cloruro férrico, azufre nativo y evaporación hidrotermal acelerada por salmueras hirvientes.',
  },
  {
    code: 'PAY-09',
    name: 'Reserva Volcánica La Payunia',
    country: 'Argentina',
    region: 'Malargüe, Mendoza / Andes Centrales',
    coords: '36°25′00″ S, 69°12′00″ W',
    elevM: 1850,
    biome: 'Estepa Patagónica Volcánica',
    targetId: 'MARS-ALB',
    targetName: 'Alba Mons',
    mission: 'Mars Robotic Reconnaissance / Volcanic Field Navigation',
    earthSensors: 'SRTM 30m DEM, Sentinel-2 MSI, ALOS PALSAR',
    nasaSensors: 'MGS MOLA, Mars Odyssey THEMIS, MRO SHARAD',
    fidelityCriterion:
      'Densidad superior a 800 conos basálticos monogenéticos y vastos mantos de arenas piroclásticas negras (lapilli); gradientes de pendiente mínimos y escorrentía superficial nula.',
    criticalLimit:
      'Gravedad terrestre de 1.00g que constriñe la balística piroclástica y dispersión de conos frente a la baja gravedad marciana (0.38g).',
    activeProcess:
      'Saltación eólica de piroclastos basálticos finos, reptación en laderas de conos de escoria e intemperismo oxidativo seco.',
  },
  {
    code: 'SLD-10',
    name: 'Lago Salda (Terrazas de Hidromagnesita)',
    country: 'Turquía',
    region: 'Provincia de Burdur / Montes Tauro',
    coords: '37°33′00″ N, 29°41′00″ E',
    elevM: 1163,
    biome: 'Lacustre Alcalino Cerrado',
    targetId: 'MARS-JEZ',
    targetName: 'Cráter Jezero',
    mission: 'Mars 2020 Perseverance / Delta Sedimentology Calibration',
    earthSensors: 'Landsat 9 OLI-2, Sentinel-2 MSI, SRTM 30m',
    nasaSensors: 'MGS MOLA, MRO CRISM, Mars 2020 Mastcam-Z / SuperCam',
    fidelityCriterion:
      'Único lago terrestre conocido con estromatolitos modernos y precipitados de hidromagnesita biocatalizada; idéntica firma espectral de carbonatos y arcillas detectada en el borde de Jezero.',
    criticalLimit:
      'Ecosistema biótico contemporáneo activo (cianobacterias y diatomeas vivas) frente a un Marte donde la preservación fósil supera los 3,500 Ma.',
    activeProcess:
      'Precipitación biosedimentaria de carbonatos de magnesio, formación de microbialitos costeros y sedimentación deltaica confinada.',
  },
  {
    code: 'UYU-11',
    name: 'Salar de Uyuni (Sector Tahua)',
    country: 'Bolivia',
    region: 'Departamento de Potosí / Altiplano Andino',
    coords: '20°15′00″ S, 67°30′00″ W',
    elevM: 3656,
    biome: 'Salar Evaporítico Altiplánico',
    targetId: 'MARS-JEZ',
    targetName: 'Cráter Jezero',
    mission: 'ICESat-2 Orbital Altimetry / Autonomous Rover Pathfinding',
    earthSensors: 'ICESat-2 ATLAS, SRTM 30m DEM, Sentinel-2 MSI',
    nasaSensors: 'MGS MOLA DEM, Mars 2020 Navcam / Hazcam',
    fidelityCriterion:
      'Superficie evaporítica salina hiperplana con desniveles altimétricos inferiores a 1 m en 10,000 km²; albedo espectral uniforme (>0.70) y sustrato de halita y litio.',
    criticalLimit:
      'Inundación estacional periódica por precipitaciones estivales andinas (espejo de agua), presión de 650 hPa y presencia de salmueras subsuperficiales líquidas.',
    activeProcess:
      'Cristalización poligonal por evaporación diurna acelerada, subsidencia salina y desecación de salmueras ricas en litio y boro.',
  },
  {
    code: 'OJS-12',
    name: 'Nevado Ojos del Salado (Laguna de Cráter)',
    country: 'Chile / Argentina',
    region: 'Puna de Atacama / Andes Centrales',
    coords: '27°06′35″ S, 68°32′32″ W',
    elevM: 6390,
    biome: 'Crioturbado Criogénico de Extrema Altitud',
    targetId: 'MOON-SHK',
    targetName: 'Cráter Shackleton',
    mission: 'High-Altitude Planetary Simulation / Cryogenic System Tests',
    earthSensors: 'SRTM 30m, ASTER GDEM, MODIS Terra LST',
    nasaSensors: 'LRO LOLA DEM, LRO Diviner DLRE, MGS MOLA',
    fidelityCriterion:
      'Cuerpo de agua líquida/congelada en cráter más alto de la Tierra (6,390 m), radiación solar UV extrema, hipoxia barométrica (450 hPa) y ciclos térmicos diurnos de congelamiento radical.',
    criticalLimit:
      'Presión aún 450 veces superior a la marciana y 10¹⁴ veces superior a la lunar; insolación diurna cenital no rasante y presencia de oxígeno diatómico residual.',
    activeProcess:
      'Sublimación de penitentes de nieve, congelamiento periglacial cíclico y desgasificación hidrotermal en faldas volcánicas.',
  },
  {
    code: 'BAR-13',
    name: 'Cráter Barringer (Meteor Crater)',
    country: 'Estados Unidos',
    region: 'Meseta de Colorado, Arizona',
    coords: '35°01′38″ N, 111°01′22″ W',
    elevM: 1740,
    biome: 'Desierto Semiárido de Meseta',
    targetId: 'MOON-COP',
    targetName: 'Cráter Copernicus',
    mission: 'Apollo Astronaut EVA Training / Artemis Impact Mechanics',
    earthSensors: 'USGS 3DEP 1m LiDAR, SRTM 30m, ASTER TIR',
    nasaSensors: 'LRO LOLA DEM 5m, LRO LROC NAC, Diviner DLRE',
    fidelityCriterion:
      'Cráter de impacto meteorítico simple prístino de 1.2 km ø en calizas y areniscas; manto de eyección invertido (overturned flap), cuarzo chocado (coesita y stishovita) y escarpes de 45°.',
    criticalLimit:
      'Modificación de taludes interiores por meteorización eólica y pluvial durante 50,000 años; ausencia de terrazas y pico central por tratarse de un impacto simple.',
    activeProcess:
      'Desprendimiento gravitacional de bloques en el brocal, escorrentía coluvional eólica y meteorización química de eyecciones metálicas de siderito.',
  },
  {
    code: 'RIO-14',
    name: 'Río Tinto (Nacimiento en Peña de Hierro)',
    country: 'España',
    region: 'Faja Pirítica Ibérica, Huelva',
    coords: '37°42′12″ N, 6°33′00″ W',
    elevM: 420,
    biome: 'Cuenca Hidrogeoquímica Ácida',
    targetId: 'MARS-JEZ',
    targetName: 'Cráter Jezero',
    mission: 'Mars 2020 / ExoMars Rover Subsurface Life Detection',
    earthSensors: 'Sentinel-2 MSI, ASTER TIR, Airborne HyMap',
    nasaSensors: 'MGS MOLA, MRO CRISM, Mars Odyssey THEMIS',
    fidelityCriterion:
      'Meteorización oxidativa ácida de sulfuros masivos de hierro (pirita) produciendo jarosita, goethita y hematita; pH ácido (1.5 a 2.5) controlado por bacterias quimiolitotróficas del hierro.',
    criticalLimit:
      'Flujo perenne y abundante de agua líquida superficial templada, a diferencia de la hiperaridez y frío glacial permanente del Jezero marciano contemporáneo.',
    activeProcess:
      'Lixiviación bacteriana acelerada de pirita, precipitación de terrazas de oxihidróxidos férricos (gossan) y cementación evaporítica de sulfatos.',
  },
];

// ─── 8 NASA PROCESSED DATASETS VAULT ────────────────────────────────────────

export const DATASETS_VAULT: VaultDatasetEntry[] = [
  {
    id: 'SHK-DEM',
    csvFileName: 'Shackleton_Crater_Polo_Sur_Artemis_LOLA_DEM.csv',
    publicPath:
      '/datasets/LUNA/topografia/Shackleton_Crater_Polo_Sur_Artemis_LOLA_DEM.csv',
    targetName: 'Cráter Shackleton',
    body: 'Luna',
    instrument: 'LRO LOLA Global DEM (256 ppd)',
    resolution: 'Altímetro Láser LOLA, Precisión vertical sub-métrica',
    description:
      'Transecto topográfico polar LRO LOLA cruzando el borde iluminado y el fondo en sombra permanente (PSR a 4.2 km de profundidad).',
    previewHeaders: [
      'distancia_km',
      'latitud',
      'longitud',
      'elevacion_m',
      'pendiente_deg',
    ],
    previewRows: [
      [0.0, -89.6, -5.0, -698.0, 1.2],
      [0.24, -89.6, -4.9, -688.0, 2.4],
      [0.47, -89.6, -4.8, -676.0, 2.9],
      [0.71, -89.6, -4.7, -664.0, 3.1],
      [0.94, -89.6, -4.6, -652.0, 3.0],
      [1.18, -89.6, -4.5, -640.0, 2.8],
    ],
    totalRows: SHACKLETON_LOLA_TOPO.length,
    generateCSV: () => {
      const header = 'distancia_km,latitud,longitud,elevacion_m,pendiente_deg';
      const lines = SHACKLETON_LOLA_TOPO.map((pt, i, arr) => {
        const prev = arr[Math.max(0, i - 1)];
        const distDelta = Math.max(0.001, (pt.distKm - prev.distKm) * 1000);
        const elevDelta = Math.abs(pt.elevM - prev.elevM);
        const slope = (Math.atan2(elevDelta, distDelta) * 180) / Math.PI;
        return `${pt.distKm.toFixed(2)},${pt.lat.toFixed(4)},${pt.lng.toFixed(
          4
        )},${pt.elevM.toFixed(1)},${slope.toFixed(1)}`;
      });
      return [header, ...lines].join('\r\n');
    },
  },
  {
    id: 'SHK-TEMP',
    csvFileName: 'Shackleton_Crater_temperatura_diviner.csv',
    publicPath:
      '/datasets/LUNA/temperatura/Shackleton_Crater_temperatura_diviner.csv',
    targetName: 'Cráter Shackleton',
    body: 'Luna',
    instrument: 'LRO Diviner Lunar Radiometer Experiment (DLRE)',
    resolution: 'Canales térmicos 7 y 8, 500 m de resolución espacial',
    description:
      'Telemetría radiométrica LRO Diviner con temperaturas criogénicas de 38 K en trampas frías PSR y borde con insolación rasante.',
    previewHeaders: [
      'punto_indice',
      'latitud',
      'longitud',
      'distancia_m',
      'temp_anual_media_K',
      'temp_invierno_min_K',
      'es_psr',
    ],
    previewRows: [
      [1, -89.5, -180.0, 0.0, 165.0, 125.0, 'NO'],
      [2, -89.5288, -172.65, 428.6, 169.5, 129.5, 'NO'],
      [3, -89.5575, -165.31, 857.1, 173.9, 133.9, 'NO'],
      [4, -89.586, -157.96, 1285.7, 178.1, 138.1, 'NO'],
      [5, -89.6141, -150.61, 1714.3, 182.2, 142.2, 'NO'],
      [6, -89.6418, -143.27, 2142.9, 185.9, 145.9, 'NO'],
    ],
    totalRows: SHACKLETON_DIVINER_TEMP.length,
    generateCSV: () => {
      const header =
        'punto_indice,latitud,longitud,distancia_m,temp_anual_media_K,temp_verano_max_K,temp_invierno_min_K,temp_invierno_min_C,es_psr';
      const lines = SHACKLETON_DIVINER_TEMP.map(
        (p) =>
          `${p.index},${p.lat.toFixed(5)},${p.lng.toFixed(
            5
          )},${p.distM.toFixed(1)},${p.tAnnualAvgK.toFixed(
            1
          )},${p.tSummerMaxK.toFixed(1)},${p.tWinterMinK.toFixed(
            1
          )},${p.tWinterMinC.toFixed(1)},${p.isPsr ? 'SI' : 'NO'}`
      );
      return [header, ...lines].join('\r\n');
    },
  },
  {
    id: 'COP-DEM',
    csvFileName: 'Copernicus_Crater_LOLA_DEM.csv',
    publicPath:
      '/datasets/LUNA/topografia/Copernicus_Crater_LOLA_DEM.csv',
    targetName: 'Cráter Copernicus',
    body: 'Luna',
    instrument: 'LRO LOLA Global DEM (256 ppd)',
    resolution: 'Transecto diametral de 89.7 km borde a borde',
    description:
      'Perfil morfológico de cráter complejo LRO LOLA con terrazas concéntricas de colapso gravitacional y picos centrales de 1.2 km.',
    previewHeaders: [
      'distancia_km',
      'latitud',
      'longitud',
      'elevacion_m',
      'pendiente_deg',
    ],
    previewRows: [
      [0.0, 9.62, -21.5, -848.0, 4.2],
      [0.91, 9.62, -21.47, -942.0, 5.9],
      [1.81, 9.62, -21.44, -1050.5, 6.8],
      [2.72, 9.62, -21.41, -1216.5, 10.4],
      [3.62, 9.62, -21.38, -1606.0, 23.2],
      [4.53, 9.62, -21.35, -1923.5, 19.3],
    ],
    totalRows: COPERNICUS_LOLA_TOPO.length,
    generateCSV: () => {
      const header = 'distancia_km,latitud,longitud,elevacion_m,pendiente_deg';
      const lines = COPERNICUS_LOLA_TOPO.map((pt, i, arr) => {
        const prev = arr[Math.max(0, i - 1)];
        const distDelta = Math.max(0.001, (pt.distKm - prev.distKm) * 1000);
        const elevDelta = Math.abs(pt.elevM - prev.elevM);
        const slope = (Math.atan2(elevDelta, distDelta) * 180) / Math.PI;
        return `${pt.distKm.toFixed(2)},${pt.lat.toFixed(4)},${pt.lng.toFixed(
          4
        )},${pt.elevM.toFixed(1)},${slope.toFixed(1)}`;
      });
      return [header, ...lines].join('\r\n');
    },
  },
  {
    id: 'COP-TEMP',
    csvFileName: 'Copernicus_Crater_temperatura_diviner.csv',
    publicPath:
      '/datasets/LUNA/temperatura/Copernicus_Crater_temperatura_diviner.csv',
    targetName: 'Cráter Copernicus',
    body: 'Luna',
    instrument: 'LRO Diviner Canales 7 y 8',
    resolution: 'Mediciones horarias de 00:00 a 23:00 LST',
    description:
      'Ciclo térmico diurno ecuatorial LRO Diviner con oscilación de 290 K entre el mediodía solar (385 K) y la noche profunda (95 K).',
    previewHeaders: [
      'hora_solar',
      'incidencia_deg',
      'temp_superficial_K',
      'temp_superficial_C',
      'diviner_ch7_K',
      'diviner_ch8_K',
    ],
    previewRows: [
      ['00:00', 180.0, 107.5, -165.65, 106.64, 108.04],
      ['01:00', 165.0, 105.42, -167.73, 104.58, 105.95],
      ['02:00', 150.0, 103.33, -169.82, 102.5, 103.85],
      ['03:00', 135.0, 101.25, -171.9, 100.44, 101.76],
      ['04:00', 120.0, 99.17, -173.98, 98.38, 99.67],
      ['05:00', 105.0, 97.08, -176.07, 96.3, 97.57],
    ],
    totalRows: COPERNICUS_DIVINER_TEMP.length,
    generateCSV: () => {
      const header =
        'hora_solar,incidencia_solar_deg,temp_superficial_K,temp_superficial_C,diviner_ch7_K,diviner_ch8_K';
      const lines = COPERNICUS_DIVINER_TEMP.map(
        (h) =>
          `${h.hour},${h.solarIncDeg.toFixed(1)},${h.tempK.toFixed(
            2
          )},${h.tempC.toFixed(2)},${h.ch7K.toFixed(2)},${h.ch8K.toFixed(2)}`
      );
      return [header, ...lines].join('\r\n');
    },
  },
  {
    id: 'JEZ-DEM',
    csvFileName: 'Jezero_Crater_Perseverance_MOLA_DEM.csv',
    publicPath:
      '/datasets/MARTE/topografia/Jezero_Crater_Perseverance_MOLA_DEM.csv',
    targetName: 'Cráter Jezero',
    body: 'Marte',
    instrument: 'MGS MOLA Global DEM (128 ppd)',
    resolution: 'Perfil altimétrico de 28.6 km cruzando Neretva Vallis',
    description:
      'Transecto topográfico MGS MOLA cruzando el abanico deltaico fluvial occidental y el brocal de impacto de Jezero.',
    previewHeaders: [
      'distancia_km',
      'latitud',
      'longitud',
      'elevacion_m',
      'pendiente_deg',
    ],
    previewRows: [
      [0.0, 18.25, 77.25, -1897.0, 0.4],
      [0.29, 18.253, 77.254, -1899.0, 0.5],
      [0.58, 18.256, 77.258, -1792.0, 21.0],
      [0.87, 18.259, 77.262, -1792.0, 0.8],
      [1.16, 18.262, 77.266, -1730.0, 12.3],
      [1.45, 18.265, 77.27, -1730.0, 1.1],
    ],
    totalRows: JEZERO_MOLA_TOPO.length,
    generateCSV: () => {
      const header = 'distancia_km,latitud,longitud,elevacion_m,pendiente_deg';
      const lines = JEZERO_MOLA_TOPO.map((pt, i, arr) => {
        const prev = arr[Math.max(0, i - 1)];
        const distDelta = Math.max(0.001, (pt.distKm - prev.distKm) * 1000);
        const elevDelta = Math.abs(pt.elevM - prev.elevM);
        const slope = (Math.atan2(elevDelta, distDelta) * 180) / Math.PI;
        return `${pt.distKm.toFixed(2)},${pt.lat.toFixed(4)},${pt.lng.toFixed(
          4
        )},${pt.elevM.toFixed(1)},${slope.toFixed(1)}`;
      });
      return [header, ...lines].join('\r\n');
    },
  },
  {
    id: 'JEZ-TEMP',
    csvFileName: 'Jezero_Crater_temperatura_inercia_TES_THEMIS.csv',
    publicPath:
      '/datasets/MARTE/temperatura/Jezero_Crater_temperatura_inercia_TES_THEMIS.csv',
    targetName: 'Cráter Jezero',
    body: 'Marte',
    instrument: 'MGS TES & Mars Odyssey THEMIS Day/Night IR',
    resolution: 'Inercia térmica derivada en J m⁻² K⁻¹ s⁻⁰·⁵ (TIU)',
    description:
      'Inercia térmica superficial (320 TIU) y rango diurno en atmósfera de 6.1 hPa derivado de telemetría orbital MGS TES y THEMIS.',
    previewHeaders: [
      'hora_solar',
      'temp_superficie_K',
      'temp_superficie_C',
      'inercia_termica_TIU',
      'themis_noche_K',
    ],
    previewRows: [
      ['00:00', 197.49, -75.66, 320.0, 196.39],
      ['01:00', 193.4, -79.75, 320.0, 192.3],
      ['02:00', 192.0, -81.15, 320.0, 190.9],
      ['03:00', 193.4, -79.75, 320.0, 192.3],
      ['04:00', 197.49, -75.66, 320.0, 196.39],
      ['05:00', 204.01, -69.14, 320.0, 202.91],
    ],
    totalRows: JEZERO_TES_THEMIS.length,
    generateCSV: () => {
      const header =
        'hora_solar,temp_superficie_K,temp_superficie_C,inercia_termica_TIU,themis_dia_K,themis_noche_K';
      const lines = JEZERO_TES_THEMIS.map(
        (p) =>
          `${p.hour},${p.tempK.toFixed(2)},${p.tempC.toFixed(2)},${p.thermalInertia.toFixed(
            1
          )},${p.themisDayK !== null ? p.themisDayK.toFixed(2) : ''},${
            p.themisNightK !== null ? p.themisNightK.toFixed(2) : ''
          }`
      );
      return [header, ...lines].join('\r\n');
    },
  },
  {
    id: 'ALB-DEM',
    csvFileName: 'Alba_Mons_Tharsis_volcan_MOLA_DEM.csv',
    publicPath:
      '/datasets/MARTE/topografia/Alba_Mons_Tharsis_volcan_MOLA_DEM.csv',
    targetName: 'Alba Mons',
    body: 'Marte',
    instrument: 'MGS MOLA Global DEM (128 ppd)',
    resolution: 'Perfil regional de 245.8 km de flanco volcánico',
    description:
      'Perfil de volcán escudo de baja pendiente MGS MOLA cubriendo los flancos septentrionales de Tharsis y llanuras piroclásticas.',
    previewHeaders: [
      'distancia_km',
      'latitud',
      'longitud',
      'elevacion_m',
      'pendiente_deg',
    ],
    previewRows: [
      [0.0, 30.322, -108.984, 3412.0, 0.5],
      [2.48, 30.293, -108.949, 3390.0, 0.5],
      [4.97, 30.265, -108.914, 3407.0, 0.4],
      [7.45, 30.236, -108.878, 3379.0, 0.7],
      [9.93, 30.208, -108.843, 3359.0, 0.5],
      [12.42, 30.179, -108.808, 3364.0, 0.2],
    ],
    totalRows: ALBA_MONS_MOLA_TOPO.length,
    generateCSV: () => {
      const header = 'distancia_km,latitud,longitud,elevacion_m,pendiente_deg';
      const lines = ALBA_MONS_MOLA_TOPO.map((pt, i, arr) => {
        const prev = arr[Math.max(0, i - 1)];
        const distDelta = Math.max(0.001, (pt.distKm - prev.distKm) * 1000);
        const elevDelta = Math.abs(pt.elevM - prev.elevM);
        const slope = (Math.atan2(elevDelta, distDelta) * 180) / Math.PI;
        return `${pt.distKm.toFixed(2)},${pt.lat.toFixed(4)},${pt.lng.toFixed(
          4
        )},${pt.elevM.toFixed(1)},${slope.toFixed(1)}`;
      });
      return [header, ...lines].join('\r\n');
    },
  },
  {
    id: 'ALB-TEMP',
    csvFileName: 'Alba_Mons_temperatura_inercia_TES_THEMIS.csv',
    publicPath:
      '/datasets/MARTE/temperatura/Alba_Mons_temperatura_inercia_TES_THEMIS.csv',
    targetName: 'Alba Mons',
    body: 'Marte',
    instrument: 'MGS TES & Mars Odyssey THEMIS Day/Night IR',
    resolution: 'Inercia térmica derivada en J m⁻² K⁻¹ s⁻⁰·⁵ (TIU)',
    description:
      'Inercia térmica ultrabaja (145 TIU) por gruesos mantos de polvo eólico sobre basalto y ciclo térmico derivado de MGS TES y THEMIS.',
    previewHeaders: [
      'hora_solar',
      'temp_superficie_K',
      'temp_superficie_C',
      'inercia_termica_TIU',
      'themis_noche_K',
    ],
    previewRows: [
      ['00:00', 180.69, -92.46, 145.0, 179.89],
      ['01:00', 176.45, -96.7, 145.0, 175.65],
      ['02:00', 175.0, -98.15, 145.0, 174.2],
      ['03:00', 176.45, -96.7, 145.0, 175.65],
      ['04:00', 180.69, -92.46, 145.0, 179.89],
      ['05:00', 187.45, -85.7, 145.0, 186.65],
    ],
    totalRows: ALBA_MONS_TES_THEMIS.length,
    generateCSV: () => {
      const header =
        'hora_solar,temp_superficie_K,temp_superficie_C,inercia_termica_TIU,themis_dia_K,themis_noche_K';
      const lines = ALBA_MONS_TES_THEMIS.map(
        (p) =>
          `${p.hour},${p.tempK.toFixed(2)},${p.tempC.toFixed(2)},${p.thermalInertia.toFixed(
            1
          )},${p.themisDayK !== null ? p.themisDayK.toFixed(2) : ''},${
            p.themisNightK !== null ? p.themisNightK.toFixed(2) : ''
          }`
      );
      return [header, ...lines].join('\r\n');
    },
  },
];

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

interface ScientificEvidenceVaultProps {
  initialFilter?: 'all' | ExtraterrestrialTargetId;
}

export default function ScientificEvidenceVault({
  initialFilter = 'all',
}: ScientificEvidenceVaultProps) {
  const [targetFilter, setTargetFilter] = useState<'all' | ExtraterrestrialTargetId>(
    initialFilter
  );
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);

  // Filtered analog sites
  const filteredSites =
    targetFilter === 'all'
      ? ANALOG_SCIENTIFIC_MATRIX
      : ANALOG_SCIENTIFIC_MATRIX.filter((s) => s.targetId === targetFilter);

  // Trigger file download using Blob
  const downloadDatasetCSV = async (dataset: VaultDatasetEntry) => {
    try {
      const response = await fetch(dataset.publicPath);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = dataset.csvFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // Fallback below
    }

    // Direct memory generation fallback
    const csvContent = dataset.generateCSV();
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = dataset.csvFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export 14-site matrix as CSV
  const exportScientificMatrixCSV = () => {
    const headers = [
      'codigo',
      'nombre_sitio',
      'pais',
      'region',
      'coordenadas_dms',
      'elevacion_m',
      'bioma',
      'destino_nasa',
      'mision_asociada',
      'sensores_terrestres',
      'sensores_orbitales_nasa',
      'criterio_fidelidad_analogica',
      'limite_critico_analogia',
      'proceso_geofisico_activo',
    ];

    const escapeCSV = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = ANALOG_SCIENTIFIC_MATRIX.map((item) =>
      [
        item.code,
        item.name,
        item.country,
        item.region,
        item.coords,
        item.elevM,
        item.biome,
        item.targetName,
        item.mission,
        item.earthSensors,
        item.nasaSensors,
        item.fidelityCriterion,
        item.criticalLimit,
        item.activeProcess,
      ]
        .map(escapeCSV)
        .join(',')
    );

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Matriz_Justificacion_Cientifica_14_Sitios_Analogos_NASA.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 text-[#F4F4F6] font-sans">
      {/* ── SECTION 1: MATRIZ DE JUSTIFICACIÓN CIENTÍFICA ──────────────────── */}
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#8E9299] block mb-1">
              Catálogo de Validación, NASA Space Apps Challenge
            </span>
            <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
              Matriz de Justificación Científica de los 14 Sitios Análogos
            </h3>
            <p className="text-xs text-[#8E9299] mt-1 max-w-3xl leading-relaxed">
              Sistematización geofísica comparativa de cada análogo terrestre frente a la instrumentación orbital y objetivos de misión de la NASA.
            </p>
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#16171B] border border-white/10 shrink-0 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setTargetFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium whitespace-nowrap ${
                targetFilter === 'all'
                  ? 'bg-white text-[#0A0A0C] font-semibold'
                  : 'text-[#8E9299] hover:text-[#F4F4F6]'
              }`}
            >
              Todos (14)
            </button>
            <button
              onClick={() => setTargetFilter('MOON-SHK')}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium whitespace-nowrap ${
                targetFilter === 'MOON-SHK'
                  ? 'bg-white text-[#0A0A0C] font-semibold'
                  : 'text-[#8E9299] hover:text-[#F4F4F6]'
              }`}
            >
              Cráter Shackleton
            </button>
            <button
              onClick={() => setTargetFilter('MOON-COP')}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium whitespace-nowrap ${
                targetFilter === 'MOON-COP'
                  ? 'bg-white text-[#0A0A0C] font-semibold'
                  : 'text-[#8E9299] hover:text-[#F4F4F6]'
              }`}
            >
              Cráter Copernicus
            </button>
            <button
              onClick={() => setTargetFilter('MARS-JEZ')}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium whitespace-nowrap ${
                targetFilter === 'MARS-JEZ'
                  ? 'bg-white text-[#0A0A0C] font-semibold'
                  : 'text-[#8E9299] hover:text-[#F4F4F6]'
              }`}
            >
              Cráter Jezero
            </button>
            <button
              onClick={() => setTargetFilter('MARS-ALB')}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium whitespace-nowrap ${
                targetFilter === 'MARS-ALB'
                  ? 'bg-white text-[#0A0A0C] font-semibold'
                  : 'text-[#8E9299] hover:text-[#F4F4F6]'
              }`}
            >
              Alba Mons
            </button>
          </div>
        </div>

        {/* Matrix Open Table */}
        <div className="overflow-x-auto border-t border-white/[0.08]">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead className="text-[#8E9299] border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 pr-4 font-medium min-w-[200px]">Sitio y Código</th>
                <th className="py-3.5 px-4 font-medium min-w-[190px]">Objetivo NASA y Misión</th>
                <th className="py-3.5 px-4 font-medium min-w-[210px]">Sensores Cruzados</th>
                <th className="py-3.5 px-4 font-medium min-w-[280px]">Criterio de Fidelidad Analógica</th>
                <th className="py-3.5 pl-4 font-medium min-w-[260px]">Límite Crítico de la Analogía</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredSites.map((item) => (
                <tr
                  key={item.code}
                  className="hover:bg-white/[0.02] transition-colors align-top"
                >
                  <td className="py-4 pr-4">
                    <span className="font-mono text-xs text-white font-semibold block">
                      {item.code}
                    </span>
                    <span className="text-white/90 font-medium block text-xs mt-0.5">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-[#8E9299] block font-mono mt-0.5">
                      {item.country}, {item.elevM} m s.n.m.
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-medium text-white block">
                      {item.targetName}
                    </span>
                    <span className="text-[11px] text-[#8E9299] block mt-0.5">
                      {item.mission}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-[#8E9299] block">
                          Terrestres:
                        </span>
                        <span className="text-white/90 text-[11px] block">
                          {item.earthSensors}
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-[10px] uppercase font-mono text-[#8E9299] block">
                          Orbitales NASA:
                        </span>
                        <span className="text-white/90 text-[11px] block">
                          {item.nasaSensors}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-[#D1D5DB] leading-relaxed font-light text-xs">
                    {item.fidelityCriterion}
                  </td>

                  <td className="py-4 pl-4 text-[#A1A1AA] leading-relaxed font-light text-xs">
                    {item.criticalLimit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 2: BÓVEDA DE DATASETS CSV PROCESADOS ─────────────────── */}
      <div
        className="border-t border-white/[0.08] pt-8"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '32px' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#8E9299] block mb-1">
              Repositorio de Datos Abiertos, NASA PDS / Treks
            </span>
            <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
              Bóveda de Datasets CSV Procesados
            </h3>
            <p className="text-xs text-[#8E9299] mt-1 max-w-2xl leading-relaxed">
              Repositorio de 8 series temporales y transectos topográficos extraídos y estandarizados para validación análoga.
            </p>
          </div>

          <button
            onClick={exportScientificMatrixCSV}
            className="py-2.5 px-4 rounded-lg font-sans text-xs font-semibold bg-white hover:bg-white/90 text-[#0A0A0C] transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <span>Exportar matriz científica (.csv)</span>
          </button>
        </div>

        {/* Datasets Table */}
        <div className="overflow-x-auto border-t border-white/[0.08]">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead className="text-[#8E9299] border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 pr-4 font-medium min-w-[280px]">Dataset y Archivo CSV</th>
                <th className="py-3.5 px-4 font-medium min-w-[170px]">Sensor e Instrumento</th>
                <th className="py-3.5 px-4 font-medium min-w-[280px]">Contexto Geofísico y Resolución</th>
                <th className="py-3.5 pl-4 text-right font-medium min-w-[180px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {DATASETS_VAULT.map((ds) => {
                const isExpanded = expandedPreviewId === ds.id;

                return (
                  <React.Fragment key={ds.id}>
                    <tr className="hover:bg-white/[0.02] transition-colors align-middle">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium text-white">
                            {ds.csvFileName}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8E9299] block mt-0.5">
                          {ds.description}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-medium text-white block">
                          {ds.targetName} ({ds.body})
                        </span>
                        <span className="text-[11px] text-[#8E9299] block font-mono mt-0.5">
                          {ds.instrument}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-white/90 text-xs block">
                          {ds.resolution}
                        </span>
                        <span className="text-[11px] font-mono text-[#8E9299] block mt-0.5 tabular-nums">
                          {ds.totalRows} registros tabulares procesados
                        </span>
                      </td>

                      <td className="py-4 pl-4 text-right">
                        <div className="flex items-center justify-end gap-3 font-medium">
                          <button
                            onClick={() =>
                              setExpandedPreviewId(isExpanded ? null : ds.id)
                            }
                            className={`text-xs transition-colors underline ${
                              isExpanded
                                ? 'text-white'
                                : 'text-[#8E9299] hover:text-white'
                            }`}
                          >
                            {isExpanded ? 'Ocultar previa' : 'Vista previa'}
                          </button>
                          <button
                            onClick={() => downloadDatasetCSV(ds)}
                            className="text-xs text-white hover:text-white/80 transition-colors font-semibold underline"
                          >
                            Descargar .csv
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline CSV Preview Micro-Table */}
                    {isExpanded && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-4 px-5 bg-[#0E1015] border-b border-white/[0.08]"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-[11px] text-[#8E9299]">
                                Muestra tabular de los primeros 6 registros de {ds.totalRows}, {ds.csvFileName}
                              </span>
                              <span className="font-mono text-[10px] text-[#52525B]">
                                Formato: UTF-8 con encabezados estándar
                              </span>
                            </div>

                            <div className="overflow-x-auto border border-white/[0.08] rounded-md">
                              <table className="w-full text-left font-mono text-[11px] border-collapse bg-[#0A0A0C]">
                                <thead className="border-b border-white/[0.08] bg-[#121316] text-[#8E9299]">
                                  <tr>
                                    {ds.previewHeaders.map((h, idx) => (
                                      <th
                                        key={idx}
                                        className="py-2 px-3 font-normal"
                                      >
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                  {ds.previewRows.map((row, rIdx) => (
                                    <tr
                                      key={rIdx}
                                      className="hover:bg-white/[0.02]"
                                    >
                                      {row.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className="py-1.5 px-3 tabular-nums text-[#D1D5DB]"
                                        >
                                          {String(cell)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 3: NOTA METODOLÓGICA Y FUENTES ABIERTAS ──────────────── */}
      <div
        className="border-t border-white/[0.08] pt-7"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '28px' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
          {/* Left Column: Pipeline */}
          <div className="space-y-2">
            <span className="font-sans text-xs font-semibold text-white uppercase tracking-wider block">
              Pipeline de Ingesta y Normalización Multiescalar
            </span>
            <p className="text-[#A1A1AA] font-light">
              Los modelos digitales de elevación (DEM) fueron extraídos mediante servicios REST de NASA Solar System Treks y estandarizados a resoluciones homogéneas: LRO LOLA a 5 m/px – 20 m/px para cráteres lunares de impacto, MGS MOLA a 463 m/px (128 ppd) para megaterrenos volcánicos y fluviales marcianos, y USGS/NASA SRTM a 30 m/px para los 14 análogos terrestres.
            </p>
            <p className="text-[#A1A1AA] font-light">
              Las matrices radiométricas de LRO Diviner (DLRE canales 7 y 8) y Mars Odyssey THEMIS/TES fueron remuestreadas a resolución horaria (00:00 a 23:00 LST) para derivar la inercia térmica superficial (TIU) y el gradiente diurno. La afinidad global se computa mediante el Índice de Fidelidad Planetaria (PFI) como producto escalar ponderado sobre 8 dimensiones geofísicas normalizadas.
            </p>
          </div>

          {/* Right Column: Open Data Sources */}
          <div className="space-y-2 md:border-l md:border-white/[0.08] md:pl-8">
            <span className="font-sans text-xs font-semibold text-white uppercase tracking-wider block">
              Fuentes Oficiales de Datos Abiertos
            </span>
            <ul className="space-y-2.5 text-[#A1A1AA] font-light">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-white font-medium">NASA LRO LOLA & Diviner:</strong> PDS Geosciences Node / Solar System Treks.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-white font-medium">NASA MGS MOLA & TES:</strong> NASA Planetary Data System (PDS) Geophysics.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-white font-medium">NASA Mars Odyssey THEMIS:</strong> Arizona State University / Mars Space Flight Facility.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-white font-medium">USGS / NASA SRTM 30m Global DEM:</strong> NASA Earthdata Distributed Active Archive Center (DAAC).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-white font-medium">NASA Earthdata MODIS LST & ASTER GDEM:</strong> Terra / Aqua Land Processes DAAC (LP DAAC).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
