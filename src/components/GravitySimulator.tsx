import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { parseTopographicCsv, type CraterScenario, type TopoPoint } from '../utils/csvTopoParser';

const DEFAULT_SCENARIOS: CraterScenario[] = [
  // ─── LUNA (NASA LRO LOLA DEM) ───────────────────────────────────────────────
  {
    id: 'SHK-01',
    name: 'Polo Sur — Cráter Shackleton (Artemis III)',
    category: 'LUNA',
    targetBody: 'Luna',
    gravity: 1.62,
    gravityLabel: '1.62 m/s² (0.16g)',
    lengthKm: 2.12,
    earthAnalogName: 'Valles Secos de McMurdo (Antártida)',
    earthSensor: 'TERRA ASTER GDEM 30m',
    targetPts: [
      { x: 0.0, y: -698.0 }, { x: 0.15, y: -690.0 }, { x: 0.3, y: -681.5 },
      { x: 0.45, y: -680.0 }, { x: 0.6, y: -669.5 }, { x: 0.75, y: -659.0 },
      { x: 0.9, y: -639.0 }, { x: 1.05, y: -621.5 }, { x: 1.2, y: -606.5 },
      { x: 1.35, y: -594.0 }, { x: 1.5, y: -575.0 }, { x: 1.65, y: -552.0 },
      { x: 1.8, y: -528.0 }, { x: 1.95, y: -506.0 }, { x: 2.12, y: -477.0 }
    ],
    earthPts: [
      { x: 0.0, y: 1250.0 }, { x: 0.25, y: 1180.0 }, { x: 0.5, y: 950.0 },
      { x: 0.8, y: 720.0 }, { x: 1.1, y: 510.0 }, { x: 1.4, y: 380.0 },
      { x: 1.7, y: 320.0 }, { x: 1.9, y: 310.0 }, { x: 2.12, y: 305.0 }
    ],
    breakdownTitle: 'Trampas criogénicas a 40 K y vacío espacial absoluto',
    breakdownDesc: 'Los valles antárticos imitan pendientes escarpadas (>25°), pero la atmósfera a 1 atm disipa calor por convección. En la Luna (10⁻¹² Pa), la ausencia total de aire provoca fragilización criogénica en polímeros y sobrecalentamiento crítico de actuadores.',
    facility: 'Cámara Criogénica de Vacío Espacial (NASA Glenn 30-Foot Vacuum Facility)',
    thermal: '-238 °C a -50 °C',
    drag: '0.00 N (Vacío total 10⁻¹² Pa)',
    rad: '380 mSv/año'
  },
  {
    id: 'COP-02',
    name: 'Cráter Copernicus (Pico Central)',
    category: 'LUNA',
    targetBody: 'Luna',
    gravity: 1.62,
    gravityLabel: '1.62 m/s² (0.16g)',
    lengthKm: 101.8,
    earthAnalogName: 'Cráter Haughton (Devon Island, Ártico)',
    earthSensor: 'ArcticDEM High-Res Altimetry',
    targetPts: [
      { x: 0.0, y: 108.0 }, { x: 12.5, y: -1632.0 }, { x: 24.9, y: -3458.5 },
      { x: 43.6, y: -3529.5 }, { x: 57.1, y: -3149.0 }, { x: 58.1, y: -2923.5 },
      { x: 64.4, y: -3436.0 }, { x: 76.8, y: -3349.0 }, { x: 89.3, y: -1398.5 }, { x: 101.8, y: 4.0 }
    ],
    earthPts: [
      { x: 0.0, y: 340.0 }, { x: 15.0, y: 390.0 }, { x: 28.0, y: 410.0 },
      { x: 42.0, y: 180.0 }, { x: 55.0, y: 260.0 }, { x: 68.0, y: 190.0 },
      { x: 85.0, y: 380.0 }, { x: 101.8, y: 330.0 }
    ],
    breakdownTitle: 'Erosión glaciaria terrestre vs. Aristas basálticas vírgenes',
    breakdownDesc: 'Haughton ha sido erosionado durante 23 millones de años por agua líquida y deshielos. Copernicus conserva escarpes basálticos cortantes de 3.5 km sin intemperismo que desgastan prematuramente bandas de rodadura convencionales.',
    facility: 'Banco de Desgaste Mecánico y Terramecánica de Ruedas (JPL Mobility Rig)',
    thermal: '-165 °C a +115 °C',
    drag: '0.00 N (Vacío ultra-alto)',
    rad: '390 mSv/año'
  },
  {
    id: 'HAD-03',
    name: 'Rima Hadley (Apollo 15)',
    category: 'LUNA',
    targetBody: 'Luna',
    gravity: 1.62,
    gravityLabel: '1.62 m/s² (0.16g)',
    lengthKm: 45.5,
    earthAnalogName: 'Reserva Volcánica La Payunia (Argentina)',
    earthSensor: 'NASA SRTM 30m DEM',
    targetPts: [
      { x: 0.0, y: -1218.0 }, { x: 5.0, y: -1930.0 }, { x: 10.1, y: -1918.0 },
      { x: 15.1, y: -1913.0 }, { x: 20.2, y: -1922.5 }, { x: 25.2, y: -1925.0 },
      { x: 30.3, y: -1968.0 }, { x: 35.3, y: -1375.5 }, { x: 40.4, y: -797.5 }, { x: 45.5, y: 787.5 }
    ],
    earthPts: [
      { x: 0.0, y: 1820.0 }, { x: 7.5, y: 1790.0 }, { x: 15.0, y: 1740.0 },
      { x: 22.0, y: 1690.0 }, { x: 30.0, y: 1710.0 }, { x: 38.0, y: 1850.0 }, { x: 45.5, y: 1920.0 }
    ],
    breakdownTitle: 'Canal de colapso de tubo lávico sin atmósfera',
    breakdownDesc: 'Los canales basálticos de La Payunia reproducen la morfometría meándrica, pero la gravedad lunar de 1.62 m/s² reduce la fuerza normal a un sexto, incrementando el coeficiente de patinamiento lateral en bordes inestables.',
    facility: 'Simulador Terramecánico de Gravedad Reducida (NASA GRC SLOPE Lab)',
    thermal: '-180 °C a +120 °C',
    drag: '0.00 N (Vacío total)',
    rad: '370 mSv/año'
  },
  {
    id: 'APN-04',
    name: 'Montes Apenninus (Cordillera de Impacto)',
    category: 'LUNA',
    targetBody: 'Luna',
    gravity: 1.62,
    gravityLabel: '1.62 m/s² (0.16g)',
    lengthKm: 56.8,
    earthAnalogName: 'Estrato-volcán Pico de Orizaba (México)',
    earthSensor: 'INEGI LiDAR 5m & SRTM DEM',
    targetPts: [
      { x: 0.0, y: -1604.0 }, { x: 6.2, y: -1645.0 }, { x: 12.4, y: -1880.0 },
      { x: 18.6, y: -2010.0 }, { x: 24.8, y: -2150.0 }, { x: 31.0, y: -2410.0 },
      { x: 37.2, y: -2380.0 }, { x: 43.4, y: -2050.0 }, { x: 49.6, y: -1890.0 }, { x: 56.8, y: -1720.0 }
    ],
    earthPts: [
      { x: 0.0, y: 3100.0 }, { x: 10.0, y: 3450.0 }, { x: 20.0, y: 3900.0 },
      { x: 30.0, y: 4400.0 }, { x: 40.0, y: 4900.0 }, { x: 50.0, y: 5300.0 }, { x: 56.8, y: 5636.0 }
    ],
    breakdownTitle: 'Relieve montañoso anorogénico sin tectónica de placas',
    breakdownDesc: 'Los Montes Apenninus se formaron por eyección balística del impacto del Mare Imbrium, no por plegamiento orogénico como en la Tierra. El regolito es micrométrico, anguloso y altamente abrasivo.',
    facility: 'Cámara de Regolito Lunar Electrostático Simulado (NASA KSC Granular Mechanics)',
    thermal: '-170 °C a +110 °C',
    drag: '0.00 N (Vacío)',
    rad: '385 mSv/año'
  },
  // ─── MARTE (NASA MGS MOLA DEM) ──────────────────────────────────────────────
  {
    id: 'JEZ-05',
    name: 'Cráter Jezero — Delta Fluvial (Perseverance)',
    category: 'MARTE',
    targetBody: 'Marte',
    gravity: 3.72,
    gravityLabel: '3.72 m/s² (0.38g)',
    lengthKm: 28.62,
    earthAnalogName: 'Quebrada Salar del Carmen (Desierto de Atacama)',
    earthSensor: 'NASA SRTM 30m DEM',
    targetPts: [
      { x: 0.0, y: -1897.0 }, { x: 1.16, y: -1730.0 }, { x: 2.31, y: -1757.0 },
      { x: 3.47, y: -1867.0 }, { x: 4.63, y: -2020.0 }, { x: 5.78, y: -2138.0 },
      { x: 6.94, y: -2215.0 }, { x: 8.1, y: -2244.0 }, { x: 9.25, y: -2438.0 },
      { x: 10.41, y: -2503.0 }, { x: 11.57, y: -2543.0 }, { x: 12.72, y: -2569.0 },
      { x: 13.88, y: -2582.0 }, { x: 15.04, y: -2588.0 }, { x: 16.19, y: -2613.0 },
      { x: 17.35, y: -2636.0 }, { x: 18.5, y: -2636.0 }, { x: 19.66, y: -2610.0 },
      { x: 20.82, y: -2609.0 }, { x: 21.97, y: -2589.0 }, { x: 23.13, y: -2586.0 },
      { x: 24.29, y: -2581.0 }, { x: 25.44, y: -2582.0 }, { x: 26.6, y: -2580.0 },
      { x: 27.76, y: -2576.0 }, { x: 28.62, y: -2569.0 }
    ],
    earthPts: [
      { x: 0.0, y: 1040.0 }, { x: 2.5, y: 1032.0 }, { x: 5.0, y: 1025.0 },
      { x: 7.5, y: 1020.0 }, { x: 10.0, y: 1018.0 }, { x: 13.5, y: 1015.0 },
      { x: 17.0, y: 1012.0 }, { x: 21.0, y: 1010.0 }, { x: 25.0, y: 1008.0 },
      { x: 28.62, y: 1005.0 }
    ],
    breakdownTitle: 'Atmósfera tenue (6 mbar CO₂) y percloratos fuertemente oxidantes',
    breakdownDesc: 'Atacama proporciona la aridez y granulometría ideales para validar los algoritmos de navegación autónoma AutoNav. Sin embargo, la presión de 610 Pa reduce la convección forzada un 99% y los percloratos marcianos degradan sellos elastoméricos.',
    facility: 'Túnel de Viento y Atmósfera Marciana (NASA Ames MAST Facility)',
    thermal: '-90 °C a +20 °C',
    drag: '0.012 N (6 mbar CO₂)',
    rad: '230 mSv/año'
  },
  {
    id: 'KOR-06',
    name: 'Cráter Korolev (Domo Glaciar de Agua Pura)',
    category: 'MARTE',
    targetBody: 'Marte',
    gravity: 3.72,
    gravityLabel: '3.72 m/s² (0.38g)',
    lengthKm: 78.52,
    earthAnalogName: 'Caldera de Askja & Glaciar Vatnajökull (Islandia)',
    earthSensor: 'ArcticDEM Stereo Photogrammetry',
    targetPts: [
      { x: 0.0, y: -3407.0 }, { x: 5.55, y: -4991.0 }, { x: 11.1, y: -4991.0 },
      { x: 19.83, y: -4556.0 }, { x: 30.14, y: -4476.0 }, { x: 40.45, y: -4537.0 },
      { x: 50.76, y: -4816.0 }, { x: 60.28, y: -5005.0 }, { x: 69.0, y: -6202.0 },
      { x: 75.35, y: -5180.0 }, { x: 78.52, y: -4110.0 }
    ],
    earthPts: [
      { x: 0.0, y: 850.0 }, { x: 10.0, y: 980.0 }, { x: 22.0, y: 1250.0 },
      { x: 35.0, y: 1650.0 }, { x: 48.0, y: 1950.0 }, { x: 60.0, y: 1750.0 },
      { x: 70.0, y: 1350.0 }, { x: 78.52, y: 920.0 }
    ],
    breakdownTitle: 'Hielo perenne a -80 °C vs. Glaciares templados terrestres',
    breakdownDesc: 'Los glaciares en Islandia presentan películas de agua líquida subglaciar a 0 °C que lubrican el suelo. En Korolev, el domo de hielo de 1.8 km de espesor permanece a -80 °C: adquiere una dureza análoga al granito macizo sin lubricación.',
    facility: 'Laboratorio de Criomecánica de Hielo Glaciar Planetario (JPL Ice Testbed)',
    thermal: '-135 °C a -30 °C',
    drag: '0.015 N (680 Pa CO₂)',
    rad: '210 mSv/año'
  },
  {
    id: 'GUS-07',
    name: 'Cráter Gusev — Colinas Columbia (Rover Spirit)',
    category: 'MARTE',
    targetBody: 'Marte',
    gravity: 3.72,
    gravityLabel: '3.72 m/s² (0.38g)',
    lengthKm: 140.86,
    earthAnalogName: 'Campos Geotermales de El Tatio (Chile)',
    earthSensor: 'NASA SRTM 30m DEM',
    targetPts: [
      { x: 0.0, y: -1869.0 }, { x: 14.37, y: -1906.0 }, { x: 30.18, y: -1912.0 },
      { x: 45.99, y: -1898.0 }, { x: 61.81, y: -1938.0 }, { x: 77.62, y: -1900.0 },
      { x: 93.43, y: -1718.0 }, { x: 109.24, y: -1747.0 }, { x: 125.05, y: -566.0 }, { x: 140.86, y: 1416.0 }
    ],
    earthPts: [
      { x: 0.0, y: 4200.0 }, { x: 20.0, y: 4230.0 }, { x: 45.0, y: 4280.0 },
      { x: 70.0, y: 4320.0 }, { x: 95.0, y: 4390.0 }, { x: 120.0, y: 4510.0 }, { x: 140.86, y: 4650.0 }
    ],
    breakdownTitle: 'Patinamiento en regolito blando de sulfatos deshidratados',
    breakdownDesc: 'El Tatio reproduce los depósitos de sílice hidrotermal fósil. Sin embargo, bajo la gravedad marciana reducida (0.38g), las ruedas motrices de Spirit perdieron adherencia en suelo pulverizado de sulfatos, inmovilizándolo permanentemente en Troya.',
    facility: 'Cisterna Terramecánica de Suelo Marciano Simulado (JPL MarsYard)',
    thermal: '-100 °C a +15 °C',
    drag: '0.014 N (640 Pa)',
    rad: '240 mSv/año'
  },
  {
    id: 'VAL-08',
    name: 'Valles Marineris (Cañón Gigante Marciano)',
    category: 'MARTE',
    targetBody: 'Marte',
    gravity: 3.72,
    gravityLabel: '3.72 m/s² (0.38g)',
    lengthKm: 529.0,
    earthAnalogName: 'Gran Cañón del Colorado (Arizona, EE.UU.)',
    earthSensor: 'USGS National Elevation Dataset (NED)',
    targetPts: [
      { x: 0.0, y: 3662.0 }, { x: 58.8, y: 3720.0 }, { x: 117.6, y: 3240.0 },
      { x: 176.3, y: 3291.0 }, { x: 235.1, y: -3388.0 }, { x: 293.9, y: -4817.0 },
      { x: 352.7, y: 2305.0 }, { x: 411.5, y: 2355.0 }, { x: 470.2, y: 2401.0 }, { x: 529.0, y: 2493.0 }
    ],
    earthPts: [
      { x: 0.0, y: 2150.0 }, { x: 80.0, y: 2120.0 }, { x: 180.0, y: 2050.0 },
      { x: 260.0, y: 750.0 }, { x: 320.0, y: 720.0 }, { x: 420.0, y: 2020.0 }, { x: 529.0, y: 2100.0 }
    ],
    breakdownTitle: 'Desnivel vertical de 7 kilómetros y gradiente de presión atmosférica',
    breakdownDesc: 'El Gran Cañón alcanza 1.8 km de profundidad máxima. Valles Marineris supera los 7 km de desnivel, ocasionando gradientes barométricos desde 200 Pa en la meseta superior hasta 850 Pa en el fondo del cañón, afectando la aerodinámica.',
    facility: 'Túnel de Viento de Hipobaria y Vuelo Atmosférico Marciano (NASA Langley)',
    thermal: '-85 °C a +15 °C',
    drag: '0.022 N (Fondo de cañón)',
    rad: '180 mSv/año'
  }
];

interface GravitySimulatorProps {
  externalScenario?: CraterScenario | null;
}

export default function GravitySimulator({ externalScenario }: GravitySimulatorProps = {}) {
  const [scenarios, setScenarios] = useState<CraterScenario[]>(DEFAULT_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('SHK-01');
  const [selectedFilter, setSelectedFilter] = useState<'TODOS' | 'LUNA' | 'MARTE' | 'CUSTOM'>('TODOS');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printSnapshotRef = useRef<HTMLImageElement>(null);

  // Directly update telemetry DOM text nodes without re-rendering React tree at 60fps
  const distTextRef = useRef<HTMLSpanElement>(null);
  const slopeTextRef = useRef<HTMLSpanElement>(null);
  const targetElevTextRef = useRef<HTMLSpanElement>(null);
  const earthElevTextRef = useRef<HTMLSpanElement>(null);
  const powerTextRef = useRef<HTMLSpanElement>(null);
  const earthPowerTextRef = useRef<HTMLSpanElement>(null);
  const slopeMatchTextRef = useRef<HTMLSpanElement>(null);
  const slopeStatusRef = useRef<HTMLSpanElement>(null);

  // Real-time DOM refs for top masthead telemetry
  const mastheadTargetElevRef = useRef<HTMLSpanElement>(null);
  const mastheadTargetSlopeRef = useRef<HTMLSpanElement>(null);
  const mastheadEarthElevRef = useRef<HTMLSpanElement>(null);

  // Sync external scenario from global navbar "Calibrar CSV" if provided
  useEffect(() => {
    if (externalScenario) {
      setScenarios((prev) => {
        const exists = prev.some((s) => s.id === externalScenario.id);
        if (exists) return prev;
        return [externalScenario, ...prev];
      });
      setActiveScenarioId(externalScenario.id);
      setSelectedFilter('CUSTOM');
      simState.current.targetNormX = 0.25;
      simState.current.currentNormX = 0.25;
    }
  }, [externalScenario]);

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === activeScenarioId) || scenarios[0],
    [scenarios, activeScenarioId]
  );

  const filteredScenarios = useMemo(() => {
    if (selectedFilter === 'TODOS') return scenarios;
    return scenarios.filter((s) => s.category === selectedFilter);
  }, [scenarios, selectedFilter]);

  // Physics Simulation Coordinates State
  const simState = useRef({
    targetNormX: 0.28,
    currentNormX: 0.28,
    isHovering: false,
  });

  // Hermite Spline Interpolator with Derivative Evaluation
  const evaluateSpline = useCallback((pts: TopoPoint[], normX: number) => {
    if (!pts || pts.length < 2) return { distKm: 0, elevM: 0, slopeDeg: 0 };
    const maxD = pts[pts.length - 1].x || 1;
    const targetD = Math.max(0, Math.min(maxD, normX * maxD));

    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      if (targetD >= p1.x && targetD <= p2.x) {
        const segDist = p2.x - p1.x || 0.001;
        const t = (targetD - p1.x) / segDist;

        const h00 = 2 * t * t * t - 3 * t * t + 1;
        const h10 = t * t * t - 2 * t * t + t;
        const h01 = -2 * t * t * t + 3 * t * t;
        const h11 = t * t * t - t * t;

        const m0 = i > 0 ? (p2.y - pts[i - 1].y) * 0.5 : p2.y - p1.y;
        const m1 = i < pts.length - 2 ? (pts[i + 2].y - p1.y) * 0.5 : p2.y - p1.y;

        const elev = h00 * p1.y + h10 * m0 + h01 * p2.y + h11 * m1;

        const deltaD = 0.01;
        const t2 = Math.min(1, t + deltaD);
        const elev2 = p1.y + (p2.y - p1.y) * t2;
        const dzM = elev2 - elev;
        const dxM = deltaD * segDist * 1000.0;
        const slopeRad = Math.atan(dzM / (dxM || 1));
        const slopeDeg = (slopeRad * 180.0) / Math.PI;

        return { distKm: targetD, elevM: elev, slopeDeg };
      }
    }
    const last = pts[pts.length - 1];
    return { distKm: last.x, elevM: last.y, slopeDeg: 0 };
  }, []);

  // Update DOM telemetry nodes smoothly without React state re-renders
  const updateTelemetryDOM = useCallback(
    (
      targetSamp: { distKm: number; elevM: number; slopeDeg: number },
      earthSamp: { distKm: number; elevM: number; slopeDeg: number },
      isCritical: boolean,
      gravity: number
    ) => {
      // 1. Distance
      if (distTextRef.current) {
        distTextRef.current.innerText = `${targetSamp.distKm.toFixed(2)} km`;
      }

      // 2. Slope angle and status (100% Monochrome)
      if (slopeTextRef.current) {
        const sign = targetSamp.slopeDeg >= 0 ? '+' : '';
        slopeTextRef.current.innerText = `${sign}${targetSamp.slopeDeg.toFixed(1)}°`;
      }

      if (slopeStatusRef.current) {
        if (isCritical) {
          slopeStatusRef.current.innerText = 'PENDIENTE CRÍTICA (> 15.0°)';
          slopeStatusRef.current.className =
            'font-mono text-[10px] text-white/80 uppercase tracking-widest block';
        } else {
          slopeStatusRef.current.innerText = 'TRACCIÓN NOMINAL CONTROLADA';
          slopeStatusRef.current.className =
            'font-mono text-[10px] text-white/40 uppercase tracking-widest block';
        }
      }

      // 3. Altitudes
      if (targetElevTextRef.current) {
        targetElevTextRef.current.innerText = `${Math.round(targetSamp.elevM).toLocaleString()} m`;
      }
      if (earthElevTextRef.current) {
        earthElevTextRef.current.innerText = `${Math.round(earthSamp.elevM).toLocaleString()} m`;
      }

      // 4. Power consumption (Physical model: Rover mass 1025 kg, rolling resistance 0.06, velocity 1.2 m/s)
      const mass = 1025; // kg
      const theta = (Math.abs(targetSamp.slopeDeg) * Math.PI) / 180.0;
      const velocity = 1.2; // m/s
      const pTarget = Math.max(30, mass * gravity * (0.06 + Math.sin(theta)) * velocity);
      const pEarth = Math.max(30, mass * 9.81 * (0.06 + Math.sin(theta)) * velocity);

      if (powerTextRef.current) {
        powerTextRef.current.innerText = `${pTarget.toFixed(0)} W`;
      }
      if (earthPowerTextRef.current) {
        const diffPct = Math.round(((pEarth - pTarget) / pTarget) * 100);
        earthPowerTextRef.current.innerText = `${pEarth.toFixed(0)} W (+${diffPct}%)`;
      }

      // 5. Similarity
      if (slopeMatchTextRef.current) {
        const slopeDelta = Math.abs(targetSamp.slopeDeg - earthSamp.slopeDeg);
        const similarity = Math.max(48, Math.min(98.8, 100 - slopeDelta * 2.7));
        slopeMatchTextRef.current.innerText = `${similarity.toFixed(1)}%`;
      }

      // 6. Masthead Top Readings
      if (mastheadTargetElevRef.current) {
        mastheadTargetElevRef.current.innerText = `${Math.round(targetSamp.elevM).toLocaleString()} m`;
      }
      if (mastheadTargetSlopeRef.current) {
        const sign = targetSamp.slopeDeg >= 0 ? '+' : '';
        mastheadTargetSlopeRef.current.innerText = `${sign}${targetSamp.slopeDeg.toFixed(1)}°`;
      }
      if (mastheadEarthElevRef.current) {
        mastheadEarthElevRef.current.innerText = `${Math.round(earthSamp.elevM).toLocaleString()} m`;
      }
    },
    []
  );

  // ─── Main 60 FPS Architectural Monochrome Canvas Loop ────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let isVisible = false;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const h = Math.max(420, Math.min(520, window.innerHeight * 0.55));
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${h}px`;
    };

    resize();
    window.addEventListener('resize', resize);

    // 100% Monochromatic fine vertical dotted pattern for slopes > 15°
    const hatchCanvas = document.createElement('canvas');
    hatchCanvas.width = 6;
    hatchCanvas.height = 6;
    const hctx = hatchCanvas.getContext('2d');
    if (hctx) {
      hctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      hctx.lineWidth = 1;
      hctx.beginPath();
      hctx.moveTo(3, 0);
      hctx.lineTo(3, 6);
      hctx.stroke();
    }
    const hatchPattern = ctx.createPattern(hatchCanvas, 'repeat');

    const animate = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const state = simState.current;
      // Smooth interpolation toward target hover coordinate
      state.currentNormX += (state.targetNormX - state.currentNormX) * 0.18;

      // Margins
      const padLeft = 70;
      const padRight = 40;
      const padTop = 45;
      const padBottom = 50;
      const plotW = Math.max(10, w - padLeft - padRight);
      const plotH = Math.max(10, h - padTop - padBottom);

      const tPts = activeScenario.targetPts;
      const tElevs = tPts.map((p) => p.y);
      const minElev = Math.min(...tElevs) - 60;
      const maxElev = Math.max(...tElevs) + 60;
      const elevRange = maxElev - minElev || 1;
      const maxDist = activeScenario.lengthKm;

      const toScreenX = (normX: number) => padLeft + normX * plotW;
      const toScreenY = (elev: number) =>
        padTop + plotH - ((elev - minElev) / elevRange) * plotH;

      const ePts = activeScenario.earthPts;
      const eElevs = ePts.map((p) => p.y);
      const eMin = Math.min(...eElevs);
      const eMax = Math.max(...eElevs);
      const eRange = eMax - eMin || 1;

      const toEarthScreenY = (elevM: number) => {
        const normElev = minElev + ((elevM - eMin) / eRange) * (elevRange * 0.65);
        return toScreenY(normElev);
      };

      // Active Telemetry Samples & Physical Model
      const activeSample = evaluateSpline(tPts, state.currentNormX);
      const earthSample = evaluateSpline(ePts, state.currentNormX);
      const scannerX = toScreenX(state.currentNormX);
      const isCriticalSlope = Math.abs(activeSample.slopeDeg) >= 15.0;

      // Power calculation for HUD callouts
      const mass = 1025; // kg
      const theta = (Math.abs(activeSample.slopeDeg) * Math.PI) / 180.0;
      const velocity = 1.2; // m/s
      const pTarget = Math.max(30, mass * activeScenario.gravity * (0.06 + Math.sin(theta)) * velocity);

      // 1. Technical Swiss Monochrome Grid & Coordinates
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;

      // Horizontal altitude lines
      for (let i = 0; i <= 4; i++) {
        const y = padTop + (plotH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(w - padRight, y);
        ctx.stroke();

        const elevVal = Math.round(maxElev - (elevRange / 4) * i);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${elevVal} m`, padLeft - 10, y + 3.5);
      }

      // Vertical distance lines + Architectural '+' intersection crosses
      for (let i = 0; i <= 5; i++) {
        const x = padLeft + (plotW / 5) * i;
        ctx.beginPath();
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, padTop + plotH);
        ctx.stroke();

        // Subtle technical plus markers at grid intersections
        for (let j = 0; j <= 4; j++) {
          const crossY = padTop + (plotH / 4) * j;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
          ctx.beginPath();
          ctx.moveTo(x - 3, crossY);
          ctx.lineTo(x + 3, crossY);
          ctx.moveTo(x, crossY - 3);
          ctx.lineTo(x, crossY + 3);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        }

        const kmVal = ((maxDist / 5) * i).toFixed(1);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${kmVal} km`, x, padTop + plotH + 18);
      }

      // 2. High-Risk Zones: Fine Monochromatic Vertical Dotted Pattern (Slope > 15°)
      const samplesCount = 160;
      if (hatchPattern) {
        for (let i = 0; i < samplesCount; i++) {
          const sNormX = i / samplesCount;
          const samp = evaluateSpline(tPts, sNormX);
          if (Math.abs(samp.slopeDeg) >= 15.0) {
            const x1 = toScreenX(sNormX);
            const x2 = toScreenX((i + 1) / samplesCount);
            ctx.fillStyle = hatchPattern;
            ctx.fillRect(x1, padTop, x2 - x1 + 0.5, plotH);
          }
        }
      }

      // 3. Curve B: Terrestrial Analog Profile (Fine Dashed Line, 1.2px, [8, 5])
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const nX = i / 120;
        const eSamp = evaluateSpline(ePts, nX);
        const sx = toScreenX(nX);
        const sy = toEarthScreenY(eSamp.elevM);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([8, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Curve A: Extraterrestrial Profile (Continuous Bone White #F2F0EA, 2.0px)
      ctx.beginPath();
      ctx.moveTo(toScreenX(0), padTop + plotH);
      for (let i = 0; i <= 140; i++) {
        const nX = i / 140;
        const tSamp = evaluateSpline(tPts, nX);
        const sx = toScreenX(nX);
        const sy = toScreenY(tSamp.elevM);
        ctx.lineTo(sx, sy);
      }
      ctx.lineTo(toScreenX(1), padTop + plotH);
      ctx.closePath();

      const gradFill = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
      gradFill.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      gradFill.addColorStop(1, 'rgba(11, 11, 11, 0.0)');
      ctx.fillStyle = gradFill;
      ctx.fill();

      // Sharp Solid Line
      ctx.beginPath();
      for (let i = 0; i <= 140; i++) {
        const nX = i / 140;
        const tSamp = evaluateSpline(tPts, nX);
        const sx = toScreenX(nX);
        const sy = toScreenY(tSamp.elevM);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = '#F2F0EA';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // ── 5. Organic On-Curve Cartographic Lettering (Rotated Along Screen Slopes)
      // Primary Extraterrestrial Contour Label (~14%-16% canvas width)
      const targetNormX1 = 0.14;
      const targetNormX2 = 0.16;
      const tX1 = toScreenX(targetNormX1);
      const tY1 = toScreenY(evaluateSpline(tPts, targetNormX1).elevM);
      const tX2 = toScreenX(targetNormX2);
      const tY2 = toScreenY(evaluateSpline(tPts, targetNormX2).elevM);
      const targetAngleRad = Math.atan2(tY2 - tY1, tX2 - tX1);
      const clampedTargetAngle = Math.max(-0.32, Math.min(0.32, targetAngleRad));
      const targetLabelX = tX1;
      const targetLabelY = Math.max(padTop + 24, tY1 - 10);

      ctx.save();
      ctx.translate(targetLabelX, targetLabelY);
      ctx.rotate(clampedTargetAngle);
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#F2F0EA';
      ctx.textAlign = 'left';
      const targetTitle =
        activeScenario.category === 'CUSTOM'
          ? `DATASET: ${activeScenario.name.toUpperCase()}`
          : `${activeScenario.targetBody.toUpperCase()}: ${activeScenario.name.toUpperCase()}`;
      ctx.fillText(targetTitle, 0, 0);
      ctx.restore();

      // Terrestrial Analog Contour Label (~22%-24% canvas width)
      const earthNormX1 = 0.22;
      const earthNormX2 = 0.24;
      const eX1 = toScreenX(earthNormX1);
      const eY1 = toEarthScreenY(evaluateSpline(ePts, earthNormX1).elevM);
      const eX2 = toScreenX(earthNormX2);
      const eY2 = toEarthScreenY(evaluateSpline(ePts, earthNormX2).elevM);
      const earthAngleRad = Math.atan2(eY2 - eY1, eX2 - eX1);
      const clampedEarthAngle = Math.max(-0.32, Math.min(0.32, earthAngleRad));
      const earthLabelX = eX1;
      const earthLabelY = Math.max(padTop + 24, eY1 - 10);

      ctx.save();
      ctx.translate(earthLabelX, earthLabelY);
      ctx.rotate(clampedEarthAngle);
      ctx.font = '400 9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.textAlign = 'left';
      ctx.fillText(
        `ANÁLOGO TIERRA: ${activeScenario.earthAnalogName.toUpperCase()}`,
        0,
        0
      );
      ctx.restore();

      // Vertical Laser Guide / Hairline at Hover Position
      ctx.beginPath();
      ctx.moveTo(scannerX, padTop);
      ctx.lineTo(scannerX, padTop + plotH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── 6. Rocker-Bogie CAD Rover Drawing (100% Monochrome Architecture)
      const renderCadRover = (
        pts: TopoPoint[],
        getY: (elevM: number) => number,
        isGhost: boolean
      ) => {
        const spreadPx = 20;
        const spreadNorm = spreadPx / plotW;
        const normR = Math.max(0, Math.min(1, state.currentNormX - spreadNorm));
        const normM = state.currentNormX;
        const normF = Math.max(0, Math.min(1, state.currentNormX + spreadNorm));

        const sampR = evaluateSpline(pts, normR);
        const sampM = evaluateSpline(pts, normM);
        const sampF = evaluateSpline(pts, normF);

        const xR = toScreenX(normR);
        const yR = getY(sampR.elevM);
        const xM = toScreenX(normM);
        const yM = getY(sampM.elevM);
        const xF = toScreenX(normF);
        const yF = getY(sampF.elevM);

        const wheelR = 6.5;
        const cRear = { x: xR, y: yR - wheelR };
        const cMid = { x: xM, y: yM - wheelR };
        const cFront = { x: xF, y: yF - wheelR };

        // Pitch Angle & Center of Chassis
        const dx = cFront.x - cRear.x;
        const dy = cFront.y - cRear.y;
        const chassisPitch = Math.atan2(dy, dx);
        // Numerical pitch: positive when climbing uphill (-dy > 0), negative when descending (-dy < 0)
        const displayPitchDeg = -((chassisPitch * 180.0) / Math.PI);

        const chassisX = (cRear.x + cFront.x) * 0.5;
        const chassisY = (cRear.y + cFront.y) * 0.5 - 13;

        // Monochrome palette
        const strokeColor = isGhost ? 'rgba(255, 255, 255, 0.45)' : '#F2F0EA';
        const bodyFill = '#0B0B0B';
        const rivetColor = isGhost ? 'rgba(255, 255, 255, 0.45)' : '#F2F0EA';

        ctx.save();

        // ── Frontal LiDAR Beam & Subsurface Radar (Main rover only)
        if (!isGhost) {
          const cosP = Math.cos(chassisPitch);
          const sinP = Math.sin(chassisPitch);
          const mastHeadX = chassisX + cosP * 14 - sinP * (-19);
          const mastHeadY = chassisY + sinP * 14 + cosP * (-19);

          const forwardNorm = Math.min(1, state.currentNormX + 65 / plotW);
          const forwardSamp = evaluateSpline(pts, forwardNorm);
          const targetGroundX = toScreenX(forwardNorm);
          const targetGroundY = getY(forwardSamp.elevM);

          const lidarCone = ctx.createLinearGradient(
            mastHeadX,
            mastHeadY,
            targetGroundX,
            targetGroundY
          );
          lidarCone.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
          lidarCone.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

          ctx.beginPath();
          ctx.moveTo(mastHeadX, mastHeadY);
          ctx.lineTo(targetGroundX - 16, targetGroundY - 4);
          ctx.lineTo(targetGroundX + 26, targetGroundY + 4);
          ctx.closePath();
          ctx.fillStyle = lidarCone;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(targetGroundX - 5, targetGroundY);
          ctx.lineTo(targetGroundX + 5, targetGroundY);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // ── Rocker-Bogie Mechanical Suspension Linkages
        const bogiePivotX = (cRear.x + cMid.x) * 0.5;
        const bogiePivotY = Math.min(cRear.y, cMid.y) - 7.5;

        const rockerPivotX = bogiePivotX * 0.45 + cFront.x * 0.55;
        const rockerPivotY = Math.min(bogiePivotY, cFront.y) - 9;

        // Bogie Bar
        ctx.beginPath();
        ctx.moveTo(cRear.x, cRear.y);
        ctx.lineTo(bogiePivotX, bogiePivotY);
        ctx.lineTo(cMid.x, cMid.y);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Bogie Rivet
        ctx.beginPath();
        ctx.arc(bogiePivotX, bogiePivotY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = rivetColor;
        ctx.fill();

        // Rocker Bar
        ctx.beginPath();
        ctx.moveTo(bogiePivotX, bogiePivotY);
        ctx.lineTo(rockerPivotX, rockerPivotY);
        ctx.lineTo(cFront.x, cFront.y);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Rocker Pivot
        ctx.beginPath();
        ctx.arc(rockerPivotX, rockerPivotY, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = rivetColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rockerPivotX, rockerPivotY, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = bodyFill;
        ctx.fill();

        // ── Rotating Aerospace Wheels (with outer rim, hub and 6 spokes)
        const wheelAngle = state.currentNormX * plotW * 0.14;
        const wheels = [cRear, cMid, cFront];

        for (const wPt of wheels) {
          ctx.beginPath();
          ctx.arc(wPt.x, wPt.y, wheelR, 0, Math.PI * 2);
          ctx.fillStyle = bodyFill;
          ctx.fill();
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.3;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(wPt.x, wPt.y, wheelR - 1.4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(wPt.x, wPt.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = strokeColor;
          ctx.fill();

          ctx.beginPath();
          for (let s = 0; s < 6; s++) {
            const a = wheelAngle + (s * Math.PI) / 3;
            ctx.moveTo(wPt.x + Math.cos(a) * 1.8, wPt.y + Math.sin(a) * 1.8);
            ctx.lineTo(
              wPt.x + Math.cos(a) * (wheelR - 1.4),
              wPt.y + Math.sin(a) * (wheelR - 1.4)
            );
          }
          ctx.strokeStyle = isGhost ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }

        // ── Technical Aerospace Chassis
        ctx.save();
        ctx.translate(chassisX, chassisY);
        ctx.rotate(chassisPitch);

        ctx.beginPath();
        ctx.moveTo(-18, -3);
        ctx.lineTo(12, -3);
        ctx.lineTo(17, 2);
        ctx.lineTo(14, 8);
        ctx.lineTo(-17, 8);
        ctx.lineTo(-20, 2);
        ctx.closePath();
        ctx.fillStyle = bodyFill;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-4, -3);
        ctx.lineTo(-4, 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(6, -3);
        ctx.lineTo(6, 8);
        ctx.stroke();

        // RTG Generator
        ctx.save();
        ctx.translate(-18, 1);
        ctx.rotate(-0.55);
        ctx.fillStyle = bodyFill;
        ctx.fillRect(-8, -3.5, 8, 7);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-8, -3.5, 8, 7);
        for (let f = -6; f <= -2; f += 2) {
          ctx.beginPath();
          ctx.moveTo(f, -5);
          ctx.lineTo(f, 5);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.restore();

        // Mastcam & Optical Head
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(9, -3);
        ctx.lineTo(9, -17);
        ctx.stroke();

        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(5, -3);
        ctx.lineTo(9, -11);
        ctx.stroke();

        ctx.fillStyle = bodyFill;
        ctx.fillRect(7, -22, 8, 5);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(7, -22, 8, 5);

        ctx.fillStyle = '#F2F0EA';
        ctx.beginPath();
        ctx.arc(15, -20.5, 1.2, 0, Math.PI * 2);
        ctx.arc(15, -18, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // High-Gain Antenna
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-8, -3);
        ctx.lineTo(-8, -8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-8, -12, 5, 0.4, 2.2);
        ctx.stroke();

        // Center of Gravity (CG)
        const cgY = 14;
        ctx.beginPath();
        ctx.arc(0, cgY, 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-3, cgY);
        ctx.lineTo(3, cgY);
        ctx.moveTo(0, cgY - 3);
        ctx.lineTo(0, cgY + 3);
        ctx.stroke();

        ctx.restore();

        // ── Micro-HUD Engineering Callout Lines (Pure Text, No Boxes)
        const flipX = chassisX + 130 > w - padRight;
        const dir = flipX ? -1 : 1;

        if (!isGhost) {
          // Attitude / Pitch Callout
          const l1StartX = chassisX + dir * 8;
          const l1StartY = chassisY - 14;
          const l1MidX = l1StartX + dir * 18;
          const l1MidY = l1StartY - 16;
          const l1EndX = l1MidX + dir * 85;

          ctx.beginPath();
          ctx.moveTo(l1StartX, l1StartY);
          ctx.lineTo(l1MidX, l1MidY);
          ctx.lineTo(l1EndX, l1MidY);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(l1StartX, l1StartY, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#F2F0EA';
          ctx.fill();

          ctx.font = '500 9px "JetBrains Mono", monospace';
          ctx.fillStyle = '#F2F0EA';
          ctx.textAlign = flipX ? 'right' : 'left';
          const sign = displayPitchDeg >= 0 ? '+' : '';
          const pitchText = `PITCH: ${sign}${displayPitchDeg.toFixed(1)}° (${isCriticalSlope ? 'CRITICAL LIMIT' : 'NOMINAL'})`;
          ctx.fillText(pitchText, flipX ? l1EndX : l1MidX + 4, l1MidY - 3.5);

          // Traction Callout (offset safely below wheels)
          const l2StartX = cMid.x;
          const l2StartY = cMid.y + wheelR + 18;
          const l2MidX = l2StartX + dir * 16;
          const l2MidY = l2StartY + 14;
          const l2EndX = l2MidX + dir * 85;

          ctx.beginPath();
          ctx.moveTo(l2StartX, l2StartY);
          ctx.lineTo(l2MidX, l2MidY);
          ctx.lineTo(l2EndX, l2MidY);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(l2StartX, l2StartY, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fill();

          ctx.font = '500 9px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.textAlign = flipX ? 'right' : 'left';
          const tracText = `TRACTION: ${pTarget.toFixed(0)} W (BOGIE ACTIVE)`;
          ctx.fillText(tracText, flipX ? l2EndX : l2MidX + 4, l2MidY - 3.5);
        } else {
          // Ghost Rover Earth Callout
          const glStartX = chassisX + dir * 6;
          const glStartY = chassisY - 10;
          const glMidX = glStartX + dir * 14;
          const glMidY = glStartY - 12;
          const glEndX = glMidX + dir * 85;

          ctx.beginPath();
          ctx.moveTo(glStartX, glStartY);
          ctx.lineTo(glMidX, glMidY);
          ctx.lineTo(glEndX, glMidY);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.font = '500 9px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.textAlign = flipX ? 'right' : 'left';
          const eSign = displayPitchDeg >= 0 ? '+' : '';
          ctx.fillText(
            `ANÁLOGO TIERRA · PITCH: ${eSign}${displayPitchDeg.toFixed(1)}°`,
            flipX ? glEndX : glMidX + 4,
            glMidY - 3.5
          );
        }

        ctx.restore();
        return { midWheelY: yM, chassisY, chassisPitchDeg: displayPitchDeg };
      };

      // ── Draw Terrestrial Ghost Rover (Secondary Curve B)
      const earthRoverInfo = renderCadRover(ePts, toEarthScreenY, true);

      // ── Draw Planetary CAD Rover (Primary Curve A)
      const targetRoverInfo = renderCadRover(tPts, toScreenY, false);

      // ── Vertical Engineering Dimension (Cota de Diferencia entre Rovers, Pure Text, No Boxes)
      const topRoverY = Math.min(targetRoverInfo.midWheelY, earthRoverInfo.midWheelY);
      const botRoverY = Math.max(targetRoverInfo.midWheelY, earthRoverInfo.midWheelY);
      const roverGapPx = botRoverY - topRoverY;
      const deltaElevM = Math.round(Math.abs(activeSample.elevM - earthSample.elevM));

      if (roverGapPx > 24) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(scannerX, topRoverY + 8);
        ctx.lineTo(scannerX, botRoverY - 8);
        ctx.stroke();
        ctx.setLineDash([]);

        // Architectural end ticks
        ctx.beginPath();
        ctx.moveTo(scannerX - 4, topRoverY + 8);
        ctx.lineTo(scannerX + 4, topRoverY + 8);
        ctx.moveTo(scannerX - 4, botRoverY - 8);
        ctx.lineTo(scannerX + 4, botRoverY - 8);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.stroke();

        // Clean text sitting directly between ticks (NO BOX!)
        const midY = (topRoverY + botRoverY) * 0.5;
        ctx.font = '500 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#F2F0EA';
        ctx.textAlign = 'left';
        ctx.fillText(`Δ ${deltaElevM.toLocaleString()} m`, scannerX + 8, midY + 3);
        ctx.restore();
      }

      // Clean Floating Coordinate Text directly above scan hairline (NO BOX!)
      const labelText = `${activeSample.distKm.toFixed(2)} km   ${Math.round(activeSample.elevM)} m   ${activeSample.slopeDeg >= 0 ? '+' : ''}${activeSample.slopeDeg.toFixed(1)}°`;
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#F2F0EA';
      ctx.textAlign = 'left';
      const labelW = ctx.measureText(labelText).width;
      let labelX = scannerX + 10;
      if (labelX + labelW > w - padRight) {
        labelX = scannerX - labelW - 10;
      }
      ctx.fillText(labelText, labelX, padTop + 14);

      // Update real-time DOM specs
      updateTelemetryDOM(
        activeSample,
        earthSample,
        isCriticalSlope,
        activeScenario.gravity
      );

      ctx.restore();
      animId = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          animId = requestAnimationFrame(animate);
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(container);

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
    };
  }, [activeScenario, evaluateSpline, updateTelemetryDOM]);

  // ─── High-Resolution Canvas Freezing for PDF Print Mode ──────────────────────
  const capturePrintSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      if (printSnapshotRef.current) {
        printSnapshotRef.current.src = dataUrl;
      }
    } catch (err) {
      console.warn('Canvas export toDataURL failed:', err);
    }
  }, []);

  useEffect(() => {
    const onBeforePrint = () => {
      capturePrintSnapshot();
    };
    window.addEventListener('beforeprint', onBeforePrint);
    (window as any).__captureRoverCanvasSnapshot = capturePrintSnapshot;
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      delete (window as any).__captureRoverCanvasSnapshot;
    };
  }, [capturePrintSnapshot]);

  // ─── Direct Pointer / Hover Coordinates (Fix for Bug 1) ─────────────────────
  const updatePointerRelativeX = useCallback(
    (clientX: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const padLeft = 70;
      const padRight = 40;
      const plotWidth = rect.width - padLeft - padRight;
      if (plotWidth <= 0) return;

      const cursorWithinPlot = clientX - rect.left - padLeft;
      const relX = Math.max(0, Math.min(1, cursorWithinPlot / plotWidth));
      simState.current.targetNormX = relX;
    },
    []
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    updatePointerRelativeX(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      updatePointerRelativeX(e.touches[0].clientX);
    }
  };

  // ─── Robust Multi-CSV Upload Handler ────────────────────────────────────────
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const parsedScenario = parseTopographicCsv(text, file.name);
      if (parsedScenario) {
        setScenarios((prev) => [parsedScenario, ...prev]);
        setActiveScenarioId(parsedScenario.id);
        setSelectedFilter('CUSTOM');
        simState.current.targetNormX = 0.25;
        simState.current.currentNormX = 0.25;
      }
    };
    reader.readAsText(file);

    // Reset input value so user can upload repeatedly without blocking
    e.target.value = '';
  };

  return (
    <section
      id="gravity-section"
      className="relative w-full overflow-hidden select-none py-16 md:py-24 px-6 md:px-12 text-[#F2F0EA]"
      style={{
        background: '#0B0B0B',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Minimalist Cartographic Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
          <div>
            <h2
              className="text-[#F2F0EA] font-serif font-light tracking-tight leading-[1.1]"
              style={{
                fontSize: 'clamp(32px, 4.5vw, 54px)',
              }}
            >
              Transectos Altimétricos y Simulación de Tracción
            </h2>
            <p className="text-white/55 text-sm md:text-base max-w-[70ch] mt-3 font-sans font-light leading-relaxed">
              Cartografía técnica y análisis comparativo de transitabilidad entre los datos de elevación de la NASA (LRO LOLA / MGS MOLA) y sus análogos terrestres.
            </p>
          </div>

          {/* Filter text links + CSV trigger */}
          <div className="flex items-center gap-6 self-start md:self-auto flex-wrap font-mono text-xs">
            <div className="flex items-center gap-4 text-white/50">
              {(['TODOS', 'LUNA', 'MARTE', 'CUSTOM'] as const).map((filter) => {
                const isSel = selectedFilter === filter;
                const count =
                  filter === 'TODOS'
                    ? scenarios.length
                    : scenarios.filter((s) => s.category === filter).length;
                if (filter === 'CUSTOM' && count === 0) return null;
                return (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`transition-colors uppercase tracking-wider pb-1 ${
                      isSel
                        ? 'text-white border-b border-white font-medium'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {filter === 'TODOS' ? 'TODOS' : filter === 'CUSTOM' ? 'CSV SUBIDOS' : filter}
                    <span className="opacity-40 ml-1">({count})</span>
                  </button>
                );
              })}
            </div>

            <span className="text-white/20">|</span>

            {/* Open typographic CSV link */}
            <label className="text-white/80 hover:text-white transition-colors cursor-pointer uppercase tracking-wider font-mono text-xs flex items-center gap-1.5 underline underline-offset-4 decoration-white/30 hover:decoration-white">
              <span>+ CARGAR CSV</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleCsvFileChange}
              />
            </label>
          </div>
        </div>

        {/* Typographic Scenarios Index Row */}
        <div className="mb-8 flex items-center gap-6 overflow-x-auto pb-3 border-b border-white/5 scrollbar-none font-mono text-xs">
          {filteredScenarios.map((scen, idx) => {
            const isSel = scen.id === activeScenario.id;
            return (
              <button
                key={scen.id}
                onClick={() => {
                  setActiveScenarioId(scen.id);
                  simState.current.targetNormX = 0.25;
                  simState.current.currentNormX = 0.25;
                }}
                className={`whitespace-nowrap transition-colors flex items-center gap-2 shrink-0 ${
                  isSel
                    ? 'text-white font-semibold'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                <span className="opacity-40 text-[10px]">[{String(idx + 1).padStart(2, '0')}]</span>
                <span>{scen.name}</span>
                {isSel && <span className="w-1 h-1 bg-white rounded-full ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Open Cartographic Plate (No rounded container, breathes flush on background) */}
        <div
          ref={containerRef}
          data-lenis-prevent="true"
          onPointerMove={handlePointerMove}
          onTouchMove={handleTouchMove}
          className="w-full relative select-none cursor-crosshair pb-6"
        >
          {/* Open Typographic Masthead (No boxes, no pills, divided by 1px hairline) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between pb-4 mb-6 border-b border-white/15 gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 block">
                {activeScenario.category === 'CUSTOM' ? 'DATASET PROPIO' : activeScenario.targetBody.toUpperCase()}   GRAVEDAD: {activeScenario.gravityLabel}
              </span>
              <h3 className="text-2xl md:text-3xl font-serif text-[#F2F0EA] tracking-tight mt-1 font-light">
                {activeScenario.name}
              </h3>
              <span className="text-xs text-white/50 font-sans mt-1.5 block">
                Análogo de validación: <span className="text-white/80 font-normal">{activeScenario.earthAnalogName}</span>
              </span>
            </div>

            {/* Clean Numbers Aligned to the Right (No clipping, visible overflow) */}
            <div
              className="flex items-end gap-6 md:gap-10 text-right font-mono shrink-0 pt-3 overflow-visible"
              style={{ lineHeight: 1.2 }}
            >
              <div className="overflow-visible">
                <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-0.5">Cota Objetivo</span>
                <span ref={mastheadTargetElevRef} className="text-lg md:text-2xl font-light text-[#F2F0EA] block overflow-visible">0 m</span>
              </div>
              <div className="overflow-visible">
                <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-0.5">Cota Análogo</span>
                <span ref={mastheadEarthElevRef} className="text-lg md:text-2xl font-light text-white/55 block overflow-visible">0 m</span>
              </div>
              <div className="overflow-visible">
                <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-0.5">Pendiente (&alpha;)</span>
                <span ref={mastheadTargetSlopeRef} className="text-lg md:text-2xl font-light text-[#F2F0EA] block overflow-visible">+0.0°</span>
              </div>
              <div className="overflow-visible">
                <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-0.5">Potencia</span>
                <span ref={powerTextRef} className="text-lg md:text-2xl font-light text-[#F2F0EA] block overflow-visible">140 W</span>
              </div>
            </div>
          </div>

          {/* Interactive Altimetry Canvas */}
          <canvas ref={canvasRef} className="w-full block" />

          {/* Frozen Canvas Snapshot for High-Resolution @media print */}
          <img
            ref={printSnapshotRef}
            className="print-only-canvas-snapshot"
            alt={`Transecto topográfico escalado y dinámica de rover — ${activeScenario.name}`}
            style={{ display: 'none' }}
          />

          {/* Technical Drawing Metadata Footer */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono text-white/40 gap-2">
            <span>
              FIG. 04A · TRANSECTO TOPOGRÁFICO CONTINUO ESCALADO · EXTENSIÓN: {activeScenario.lengthKm.toFixed(1)} KM
            </span>
            <span>
              LÍNEA CONTINUA: PERFIL EXTRATERRESTRE · LÍNEA DISCONTINUA: ANÁLOGO TERRESTRE
            </span>
          </div>
        </div>

        {/* 4-Column Swiss Editorial Spec Sheet (No rounded cards, separated by thin hairlines) */}
        <div className="mt-12 pt-8 border-t border-white/15 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1 */}
          <div className="border-l border-white/15 pl-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 block mb-2">
                COTA ALTIMÉTRICA
              </span>
              <div className="font-mono text-2xl font-light text-[#F2F0EA] tracking-tight mb-1">
                <span ref={targetElevTextRef}>0 m</span>
              </div>
              <span className="text-xs text-white/50 block font-sans">
                Elevación en {activeScenario.targetBody}
              </span>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 text-xs font-mono space-y-1">
              <div className="flex justify-between text-white/45">
                <span>Análogo terrestre:</span>
                <span ref={earthElevTextRef} className="text-white/80">0 m</span>
              </div>
              <div className="flex justify-between text-white/45">
                <span>Longitud transecto:</span>
                <span className="text-white/80">{activeScenario.lengthKm.toFixed(1)} km</span>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="border-l border-white/15 pl-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 block mb-2">
                INCLINACIÓN Y ESTABILIDAD
              </span>
              <div className="font-mono text-2xl font-light text-[#F2F0EA] tracking-tight mb-1">
                <span ref={slopeTextRef}>+0.0°</span>
              </div>
              <span ref={slopeStatusRef} className="font-mono text-[10px] text-white/45 block uppercase tracking-widest">
                Tracción nominal controlada
              </span>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 text-xs font-mono space-y-1">
              <div className="flex justify-between text-white/45">
                <span>Límite seguro:</span>
                <span className="text-white/80">15.0°</span>
              </div>
              <div className="flex justify-between text-white/45">
                <span>Similitud de pendientes:</span>
                <span ref={slopeMatchTextRef} className="text-white/80">88.0%</span>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="border-l border-white/15 pl-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 block mb-2">
                ESFUERZO DE TRACCIÓN
              </span>
              <div className="font-mono text-2xl font-light text-[#F2F0EA] tracking-tight mb-1">
                <span ref={powerTextRef}>140 W</span>
              </div>
              <span className="text-xs text-white/50 block font-sans">
                Demanda motriz bajo {activeScenario.gravityLabel}
              </span>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 text-xs font-mono space-y-1">
              <div className="flex justify-between text-white/45">
                <span>Equivalente 1.0g:</span>
                <span ref={earthPowerTextRef} className="text-white/80">476 W (+240%)</span>
              </div>
              <div className="flex justify-between text-white/45">
                <span>Masa rover:</span>
                <span className="text-white/80">1,025 kg</span>
              </div>
            </div>
          </div>

          {/* Column 4 */}
          <div className="border-l border-white/15 pl-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 block mb-2">
                CONDICIÓN DE CONTORNO
              </span>
              <h4 className="font-sans text-xs font-normal text-[#F2F0EA] leading-relaxed mb-2">
                {activeScenario.breakdownTitle}
              </h4>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 text-xs space-y-1">
              <span className="font-mono text-[10px] uppercase text-white/40 block">Cámara requerida:</span>
              <p className="text-[11px] text-white/70 font-sans leading-tight">
                {activeScenario.facility}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
