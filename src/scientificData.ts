// ─── Rigorous Scientific Analysis for the 14 Earth Analog Sites ──────────────
// Conforming to NASA Space Apps Challenge instructions: Strong Analogies,
// Where the Analogy Breaks Down, Earth's Planetary Limits & Multi-Dataset 8D.

export interface ScientificBreakdown {
  strongAnalogy: string[];
  breaksDown: string[];
  explorationCases: {
    title: string;
    instrumentOrSystem: string;
    objective: string;
  }[];
}

export interface PlanetaryLimit {
  id: string;
  title: string;
  earthCondition: string;
  spaceCondition: string;
  engineeringImpact: string;
  mitigationStrategy: string;
}

export const EARTH_PLANETARY_LIMITS: PlanetaryLimit[] = [
  {
    id: 'GRAVITY',
    title: 'Gravedad Reducida (Reduced Gravity Field)',
    earthCondition: '9.81 m/s² (1.00 g)',
    spaceCondition: 'Luna: 1.62 m/s² (0.165 g) / Marte: 3.72 m/s² (0.38 g)',
    engineeringImpact:
      'Reduce drásticamente la fuerza normal de contacto. En la Luna y Marte, las ruedas de rovers sufren mayor deslizamiento y enterramiento en regolito suelto; los taludes de dunas tienen menores ángulos de reposo dinámico y las perforadoras no pueden aplicar el peso sobre broca (weight-on-bit) disponible en la Tierra.',
    mitigationStrategy:
      'Pruebas con suspensiones de gravedad variable por grúas activas (Gravity Offloading Systems), vuelos parabólicos y rovers con lastre o chasis aligerados a escala 1/6.',
  },
  {
    id: 'ATMOSPHERE',
    title: 'Vacío, Presión y Ausencia de Convección Térmica',
    earthCondition: '1013 hPa (1 atm), rica en N₂/O₂, disipación convectiva',
    spaceCondition: 'Luna: 10⁻¹² Pa (vacío absoluto) / Marte: 6.1 hPa (95% CO₂)',
    engineeringImpact:
      'En la Tierra, el calor de los motores y baterías se disipa por convección de aire. En el vacío lunar o el aire tenue marciano, el enfriamiento es puramente radiativo y conductivo. Además, el hielo de agua subterráneo se sublima directamente sin fase líquida, y el polvo no tiene aire que amortigüe su dispersión.',
    mitigationStrategy:
      'Cámaras de vacío térmico (TVAC), radiadores de calor bifásicos con bucles de amoníaco/metanol y sellado hermético IP68/vacío en actuadores.',
  },
  {
    id: 'RADIATION',
    title: 'Entorno de Radiación Cósmica y Solar sin Magnetosfera',
    earthCondition: 'Blindaje magnético dipolo + atmósfera gruesa (0.3 mSv/año)',
    spaceCondition: 'Luna: 380-450 mSv/año / Marte: 240-300 mSv/año (sin dipolo)',
    engineeringImpact:
      'La superficie lunar y marciana recibe impactos directos de Rayos Cósmicos Galácticos (GCR) de alta energía y Eventos de Partículas Solares (SPE). Causa eventos de un solo evento (SEU) en microchips, degradación fotoeléctrica y radiólisis de cualquier compuesto orgánico en los primeros 2 metros del suelo.',
    mitigationStrategy:
      'Uso de electrónica calificada Rad-Hard con arquitecturas redundantes TMR, blindajes de polietileno borado y refugios habitacionales bajo regolito o tubos de lava.',
  },
  {
    id: 'REGOLITH',
    title: 'Abrasividad y Toxicidad Electroestática del Regolito',
    earthCondition: 'Granos redondeados por erosión eólica e hidráulica',
    spaceCondition: 'Fragmentos vítreos agudos, microesquirlas no erosionadas',
    engineeringImpact:
      'Sin viento ni agua que suavicen sus aristas, el regolito lunar consiste en esquirlas de impacto vítreas afiladas como navajas, altamente abrasivas para articulaciones de trajes EVA y sellos mecánicos. Además, en Marte los percloratos (0.5-1 wt%) son oxidantes tóxicos para sistemas de soporte vital humano.',
    mitigationStrategy:
      'Sellos dinámicos magnéticos ferrofluidos, recubrimientos de diamante tipo DLC en engranajes y cámaras de descontaminación de trajes espaciales en esclusas.',
  },
];

export const SITE_SCIENTIFIC_DATA: Record<string, ScientificBreakdown> = {
  'ATC-01': {
    strongAnalogy: [
      'Concentración de percloratos (ClO₄⁻) y sulfatos higroscópicos idéntica a los datos in-situ de Phoenix y Curiosity.',
      'Aridez continua ininterrumpida por más de 15 Ma, el límite de aridez más antiguo de la Tierra.',
      'Suelo coluvial sin horizonte orgánico superficial; biomarcadores preservados únicamente dentro de halita.',
    ],
    breaksDown: [
      'Entradas esporádicas de humedad atmosférica por niebla costera (camanchaca) en las noches de invierno.',
      'Presencia de microbios extremófilos adaptados viables, a diferencia de la probable esterilidad de la superficie marciana.',
      'Temperaturas diurnas que superan los 35°C, muy superiores al rango térmico polar/ecuatorial de Marte (-90°C a +20°C).',
    ],
    explorationCases: [
      {
        title: 'Calibración de Taladro Autónomo de 2 Metros',
        instrumentOrSystem: 'Perforadora rotopercursora ExoMars Rosalind Franklin',
        objective: 'Penetración en costras salinas hiperduras sin refrigeración por agua ni bloqueo por percloratos.',
      },
      {
        title: 'Espectroscopía Raman y Detección de Biomarcadores',
        instrumentOrSystem: 'SHERLOC / RLS Raman Spectrometer',
        objective: 'Detección no destructiva de carotenoides y pigmentos protectores en el interior de cristales de halita.',
      },
      {
        title: 'Supervivencia de Células Fotovoltaicas a Polvo Salino',
        instrumentOrSystem: 'Paneles solares de módulos de aterrizaje ISRU',
        objective: 'Medición de la pérdida de eficiencia por depósito electrostático de polvo de sulfatos y nitratos.',
      },
    ],
  },
  'HGT-02': {
    strongAnalogy: [
      'Astroblema meteorítico de 23 km formado en secuencias carbonatadas y evaporíticas con permafrost continuo.',
      'Manto de brechas de impacto polimícticas y cuarzo chocado con idéntica textura a los cráteres marcianos en sedimentos.',
      'Von Braun Planitia reproduce las redes de canales de desborde y drenaje proglaciar de los valles fluviales de Marte.',
    ],
    breaksDown: [
      'Deshielo estacional activo durante julio y agosto que genera escorrentía superficial de agua líquida libre.',
      'Gravedad terrestre normal (9.81 m/s²) que altera la balística de eyección y el colapso de las paredes del cráter.',
      'Presencia de líquenes y musgos pioneros en microambientes protegidos del viento.',
    ],
    explorationCases: [
      {
        title: 'Operaciones EVA con Trajes Presurizados de Exploración',
        instrumentOrSystem: 'Estación de investigación analógica FMARS / NASA HMP',
        objective: 'Medición del gasto metabólico y fatiga articular en taludes escarpados de brecha de impacto.',
      },
      {
        title: 'Navegación Visual Odometry en Terreno Polar Homogéneo',
        instrumentOrSystem: 'Sistema de navegación autónoma de rovers planetarios',
        objective: 'Conducción autónoma sin GNSS en condiciones de bajo contraste y sombras rasantes polares.',
      },
      {
        title: 'Muestreo de Núcleos de Permafrost Carbonatado',
        instrumentOrSystem: 'Sonda criogénica de muestreo geológico profundo',
        objective: 'Extracción de testigos estratigráficos intactos preservando la estructura del hielo intersticial.',
      },
    ],
  },
  'LNZ-03': {
    strongAnalogy: [
      'Tubo volcánico basáltico continuo de 6.1 km con claraboyas de colapso natural idénticas a las fosas de Marius Hills en la Luna.',
      'Blindaje natural completo contra radiación cósmica y estabilidad térmica constante en las galerías subterráneas.',
      'Basalto toleítico con olivino y piroxeno augítico sin cuarzo, análogo directo a los basaltos de los mares lunares.',
    ],
    breaksDown: [
      'Infiltración de agua marina en el sector distal (Túnel de la Atlántida) con alta humedad relativa interior (>75%).',
      'Temperatura interior templada (~18°C) frente a los -20°C promedio de los tubos lunares protegidos.',
      'Presencia de fauna cavernícola endémica y microflora adaptada ausente en la Luna.',
    ],
    explorationCases: [
      {
        title: 'Descenso Vertical a Claraboyas Lunares (Skylights)',
        instrumentOrSystem: 'Robot trepador y cabrestante robótico Daedalus (ESA)',
        objective: 'Rápel automatizado y anclaje en labios de basalto colapsado para ingreso a cavernas.',
      },
      {
        title: 'Mapeo LiDAR 3D y Fotogrametría sin Señal GNSS',
        instrumentOrSystem: 'Drones autónomos con algoritmos SLAM (ESA PANGAEA)',
        objective: 'Generación en tiempo real del modelo digital de elevación de galerías subterráneas basálticas.',
      },
      {
        title: 'Despliegue de Módulos Habitacionales Subterráneos',
        instrumentOrSystem: 'Estructuras inflables presurizadas para bases lunares',
        objective: 'Evaluación del anclaje y aislamiento frente a caída de escombros en bóvedas de lava.',
      },
    ],
  },
  'PIN-04': {
    strongAnalogy: [
      'Cráter maar freatomagmático El Elegante (1.6 km) formado por contacto violento entre magma basáltico y aguas freáticas.',
      'Presencia de xenolitos peridotíticos del manto superior transportados por erupciones ultrarrápidas.',
      'Mantos de ceniza basáltica negra y dunas estelares análogas a las arenas eólicas oscuras de Marte.',
    ],
    breaksDown: [
      'Clima desértico cálido con temperaturas estivales de 48°C que superan con creces las condiciones marcianas.',
      'Contenido de volátiles magmáticos terrestres superior al del manto deshidratado de la Luna.',
      'Erosión pluvial en las paredes del cráter por tormentas de monzón esporádicas.',
    ],
    explorationCases: [
      {
        title: 'Entrenamiento Geológico Astronautas Programa Artemis',
        instrumentOrSystem: 'Herramientas de muestreo de regolito y martillos geológicos',
        objective: 'Identificación in-situ de xenolitos del manto y estratos de eyección basáltica piroclástica.',
      },
      {
        title: 'Tracción de Rovers en Pendientes Inestables de Lapilli',
        instrumentOrSystem: 'Chasis de rovers de exploración lunar y marciana',
        objective: 'Determinación de ángulos críticos de deslizamiento en taludes de 30° de escoria suelta.',
      },
      {
        title: 'Muestreo Espectral de Afloramientos Volcánicos con Drones',
        instrumentOrSystem: 'Cámaras multiespectrales aerotransportadas',
        objective: 'Identificación de firmas de olivino y espinela en paredes verticales inaccesibles.',
      },
    ],
  },
  'MCM-05': {
    strongAnalogy: [
      'Suelo poligonal estructurado por ciclos de sublimación de hielo en hiperaridez polar extrema.',
      'Temperaturas medias anuales de -20°C a -45°C con vientos catabáticos huracanados desecantes.',
      'Microorganismos endolíticos que viven protegidos en el interior de los poros de la roca como modelo de vida en Marte.',
    ],
    breaksDown: [
      'Gravedad terrestre 9.81 m/s² que duplica la fuerza gravitacional marciana.',
      'Atmósfera densa que permite transferencia térmica convectiva entre el suelo y el aire.',
      'Presencia de capa de ozono que filtra la radiación UVC de longitud de onda corta.',
    ],
    explorationCases: [
      {
        title: 'Perforación Rotopercursora en Hielo Seco Criogénico',
        instrumentOrSystem: 'Taladro IceBite de la NASA / TRIDENT (Artemis VIPER)',
        objective: 'Extracción de testigos de permafrost cementado por hielo a temperaturas de -40°C.',
      },
      {
        title: 'Calibración de Sensores de Hidrógeno y Neutrones',
        instrumentOrSystem: 'Espectrómetros de neutrones LRO LAMP / Mars Odyssey GRS',
        objective: 'Detección cuantitativa de la profundidad de la tabla de hielo bajo suelo seco superficial.',
      },
      {
        title: 'Validación de Protocolos de Protección Planetaria',
        instrumentOrSystem: 'Sistemas de muestreo aséptico de biofirmas',
        objective: 'Demostración de esterilidad absoluta para evitar contaminación biológica hacia adelante.',
      },
    ],
  },
  'PUN-06': {
    strongAnalogy: [
      'Corredor de mega-yardangs de ignimbrita esculpidos por vientos supersónicos a 4,100 m s.n.m.',
      'Presión hipobárica de 610 hPa y radiación ultravioleta extrema que bate récords terrestres.',
      'Homólogo morfológico directo de las crestas eólicas de la Formación Medusae Fossae de Marte.',
    ],
    breaksDown: [
      'Química riolítica con alto contenido de sílice (SiO₂) frente a las llanuras basálticas marcianas.',
      'Densidad atmosférica 100 veces superior a la de la superficie de Marte (6.1 hPa).',
      'Falta de hielo subsuperficial masivo en el sector de las dunas piroclásticas.',
    ],
    explorationCases: [
      {
        title: 'Ensayo de Desgaste de Ruedas Metálicas de Rovers',
        instrumentOrSystem: 'Ruedas de titanio/aluminio tipo Curiosity / Perseverance',
        objective: 'Evaluación del desgarro por aristas afiladas de piedra pómez e ignimbrita abrasiva.',
      },
      {
        title: 'Navegación Visual Odometry en Cañones de Yardangs',
        instrumentOrSystem: 'Cámaras de navegación estéreo Navcam de rovers',
        objective: 'Conducción autónoma en desfiladeros de alto albedo donde el sol cenital elimina contrastes.',
      },
      {
        title: 'Calibración de Estaciones Meteorológicas de Superficie',
        instrumentOrSystem: 'Sensores de viento y polvo tipo MEDA (Mars 2020)',
        objective: 'Medición de la turbulencia y transporte eólico de arena en atmósfera enrarecida.',
      },
    ],
  },
  'ASK-07': {
    strongAnalogy: [
      'Lavas basálticas toleíticas frescas sin vegetación y arenas vítreas oscuras idénticas a los mares lunares.',
      'Estructura de caldera múltiple colapsada y cráter explosivo hidrotermal Víti.',
      'Terreno de entrenamiento geológico oficial de las tripulaciones del programa Apollo.',
    ],
    breaksDown: [
      'Alta humedad ambiental e infiltración de nieve fundida en las arenas basálticas.',
      'Presencia de agua meteórica que causa alteración hidrotermal rápida ausente en la Luna.',
      'Gravedad terrestre 9.81 m/s² que afecta el comportamiento de fluidos y eyectas.',
    ],
    explorationCases: [
      {
        title: 'Tracción de Vehículos Presurizados sobre Arenas Vítreas',
        instrumentOrSystem: 'Rover Lunar Terreno Artemis LTV',
        objective: 'Medición de par motor y resistencia a la rodadura en mantos de arena volcánica suelta.',
      },
      {
        title: 'Operación de Drones en Ambientes Volcánicos Fríos',
        instrumentOrSystem: 'Helicópteros autónomos planetarios tipo Ingenuity',
        objective: 'Estabilidad de vuelo en ráfagas turbulentas y temperaturas bajo cero sobre relieve rugoso.',
      },
      {
        title: 'Muestreo de Basalto Vítreo con Brazo Robótico',
        instrumentOrSystem: 'Brazo articulado con taladro sacanúcleos',
        objective: 'Preservación de texturas de enfriamiento rápido en rocas basálticas frescas.',
      },
    ],
  },
  'DNK-08': {
    strongAnalogy: [
      'Salmueras saturadas de pH < 1 con precipitación activa de halita, jarosita y óxidos de hierro.',
      'Desgasificación volcánica rica en azufre y cloro análoga al Marte hidrotermal primitivo.',
      'Terrazas minerales y chimeneas de evaporación extrema en depresión geotérmica.',
    ],
    breaksDown: [
      'Temperatura ambiente de más de 45°C, superior al promedio de Marte primitivo.',
      'Presión barométrica estándar o superior al ubicarse bajo el nivel del mar (-120 m).',
      'Dominancia de cloruros sobre sulfatos en sectores específicos de las salmueras.',
    ],
    explorationCases: [
      {
        title: 'Resistencia de Materiales y Sellos a Vapores Ácidos',
        instrumentOrSystem: 'Sistemas de sellado de rovers y actuadores mecánicos',
        objective: 'Pruebas de corrosión acelerada en atmósfera de dióxido de azufre y vapores de cloro.',
      },
      {
        title: 'Espectroscopía Raman de Minerales de Hierro y Azufre',
        instrumentOrSystem: 'Espectrómetros Mössbauer y Raman de contacto',
        objective: 'Discriminación de estados redox de hierro (Fe²⁺/Fe³⁺) en precipitados de jarosita.',
      },
      {
        title: 'Límites de Detección de Biofirmas Celulares',
        instrumentOrSystem: 'Microscopios de fluorescencia y secuenciadores de ADN',
        objective: 'Validación de técnicas analíticas en el umbral abiótico donde la vida celular fracasa.',
      },
    ],
  },
  'PAY-09': {
    strongAnalogy: [
      'Vasto manto de lapilli basáltico negro de 38 km² con más de 800 conos de escoria monogenéticos.',
      'Propiedades ópticas y fotométricas idénticas a los basaltos de los mares lunares y planicies de Marte.',
      'Túneles de lava colapsados y cráteres estrombolianos bien conservados en clima árido.',
    ],
    breaksDown: [
      'Semi-aridez templada con lluvias estacionales que humedecen el regolito.',
      'Presencia de matorral xerofítico patagónico que estabiliza parcialmente el sustrato.',
      'Viento terrestre con alto contenido de oxígeno que oxida superficialmente el hierro.',
    ],
    explorationCases: [
      {
        title: 'Pruebas de Movilidad de Rovers en Regolito de Baja Cohesión',
        instrumentOrSystem: 'Ruedas de malla de alambre y resortes con memoria de forma (SMA)',
        objective: 'Evaluación del deslizamiento de ruedas en lapilli basáltico vesicular.',
      },
      {
        title: 'Sinterizado por Microondas de Regolito para Construcción ISRU',
        instrumentOrSystem: 'Planta de fabricación aditiva in-situ (ISRU 3D Printing)',
        objective: 'Fusión térmica de escoria basáltica para producir losas de aterrizaje y hábitats.',
      },
      {
        title: 'Dispersión de Radar de Penetración en Mantos Piroclásticos',
        instrumentOrSystem: 'Georradar RIMFAX / LRO Mini-RF',
        objective: 'Mapeo de la profundidad del manto de ceniza sobre el basamento rocoso.',
      },
    ],
  },
  'SLD-10': {
    strongAnalogy: [
      'Único lago terrestre con estromatolitos de hidromagnesita que precipitan en cuenca de rocas ultramáficas (serpentinitas).',
      'Homólogo mineralógico y morfológico exacto del delta fluvial y abanico aluvial del Cráter Jezero (Perseverance).',
      'Preservación excepcional de microbialitos fosilizados en carbonatos de magnesio.',
    ],
    breaksDown: [
      'Lago de agua líquida perenne con abundante oxígeno disuelto y ecosistema acuático moderno.',
      'Gravedad terrestre normal de 9.81 m/s².',
      'Ausencia de percloratos y sales oxidantes en el agua del lago.',
    ],
    explorationCases: [
      {
        title: 'Calibración de los Sensores SHERLOC y PIXL de Perseverance',
        instrumentOrSystem: 'Espectrómetro DUV de fluorescencia profunda y fluorescencia de rayos X',
        objective: 'Identificación de texturas microbianas en láminas de hidromagnesita antes de la recolección de muestras.',
      },
      {
        title: 'Muestreo Sacanúcleos de Carbonatos Lacustres',
        instrumentOrSystem: 'Taladro de muestreo del rover Mars 2020 (MSR)',
        objective: 'Extracción de testigos de roca sin fracturar las estructuras estromatolíticas delicadas.',
      },
      {
        title: 'Mapeo Multiespectral Aéreo de Deltas Fluviales',
        instrumentOrSystem: 'Cámaras hiperespectrales aerotransportadas',
        objective: 'Diferenciación de serpentinita, magnesita y arcillas esmectíticas a escala decimétrica.',
      },
    ],
  },
  'UYU-11': {
    strongAnalogy: [
      'Planicie salina ultraplana de 10,582 km² con variaciones de elevación menores a 1 metro en decenas de kilómetros.',
      'Costra evaporítica poligonal de halita sobre salmuera de litio; albedo y reflectancia extremos.',
      'Superficie de calibración geodésica utilizada por satélites altimétricos de la NASA (ICESat-2).',
    ],
    breaksDown: [
      'Inundación estacional periódica durante el verano austral que forma una lámina de agua de 10-30 cm.',
      'Presión atmosférica de 648 hPa con aire respirable a pesar de la altitud (3,656 m).',
      'Abundancia de litio y boro que no representan la composición media del suelo lunar.',
    ],
    explorationCases: [
      {
        title: 'Calibración de Altimetría Láser y Sensores LiDAR de Descenso',
        instrumentOrSystem: 'LOLA (LRO) / Sensor LiDAR de Descenso y Aterrizaje Preciso (PL&HA)',
        objective: 'Calibración del retardo de pulso y dispersión óptica sobre una superficie reflectante plana.',
      },
      {
        title: 'Pruebas de Navegación Autónoma de Largo Alcance (Over-the-Horizon)',
        instrumentOrSystem: 'Algoritmos de conducción autónoma de alta velocidad para rovers',
        objective: 'Navegación visual sin relieves ni marcas topográficas en decenas de kilómetros.',
      },
      {
        title: 'Rendimiento de Baterías de Litio en Ciclos Frío/Calor Extremos',
        instrumentOrSystem: 'Bancos de baterías para misiones tripuladas de superficie',
        objective: 'Comportamiento de carga y descarga bajo radiación solar intensa y noches a -15°C.',
      },
    ],
  },
  'OJS-12': {
    strongAnalogy: [
      'El volcán activo más alto de la Tierra (6,893 m) con laguna permanente a 6,390 m s.n.m.',
      'Presión de 465 hPa (45% de la terrestre), frío criogénico perenne y radiación UV récord.',
      'Actividad hidrotermal activa con emanaciones de azufre en medio de permafrost y penitentes de hielo.',
    ],
    breaksDown: [
      'Composición dacítica-andesítica más diferenciada que los basaltos máficos de Marte y la Luna.',
      'Gravedad terrestre 9.81 m/s².',
      'Presencia de atmósfera con suficiente oxígeno para sostener vida animal transitoria.',
    ],
    explorationCases: [
      {
        title: 'Resistencia Térmica y Eléctrica en Hipobaria Fría',
        instrumentOrSystem: 'Electrónica de aviónica para módulos de descenso marcianos',
        objective: 'Operación continua a 450 hPa y temperaturas de -35°C sin sobrecalentamiento interno.',
      },
      {
        title: 'Muestreo de Criobiología en Lagunas Volcánicas de Gran Altura',
        instrumentOrSystem: 'Sondas de inmersión y filtrado biológico estéril',
        objective: 'Identificación de bacterias poliextremófilas que sobreviven a radiación cósmica y congelación.',
      },
      {
        title: 'Fatiga Humana en Trajes Espaciales bajo Hipoxia y Frío',
        instrumentOrSystem: 'Trajes de actividad extravehicular Artemis xEMU',
        objective: 'Evaluación del esfuerzo cardiorrespiratorio en caminatas sobre pendientes de 35°.',
      },
    ],
  },
  'BAR-13': {
    strongAnalogy: [
      'Cráter de impacto meteorítico simple de 1.2 km de diámetro con estrato de eyección invertido conservado.',
      'Presencia de coesita y stishovita (sílice de ultra-alta presión) generadas por metamorfismo de choque hiperveloz.',
      'Terreno de entrenamiento geológico histórico de todos los astronautas del programa Apollo.',
    ],
    breaksDown: [
      'Clima desértico continental con vegetación de matorral y modificación eólica del fondo.',
      'Sedimentos lacustres efímeros del Pleistoceno depositados en el centro del cráter.',
      'Gravedad terrestre que causa colapso de las paredes a un ángulo inferior al de los cráteres lunares.',
    ],
    explorationCases: [
      {
        title: 'Mapeo Subsuperficial de Lentes de Brecha con Georradar',
        instrumentOrSystem: 'Radar de penetración de suelo RIMFAX / LRO Mini-RF',
        objective: 'Determinación del espesor del relleno coluvial sobre el lecho de roca fracturada.',
      },
      {
        title: 'Ascenso y Descenso en Pendientes Empinadas de Cráter',
        instrumentOrSystem: 'Vehículos de exploración tripulados (LTV / Pressurized Rover)',
        objective: 'Tracción y seguridad en pendientes de más de 30° con suelo rocoso suelto.',
      },
      {
        title: 'Identificación de Fragmentos de Proyectil Meteorítico',
        instrumentOrSystem: 'Magnetómetros de superficie y detectores de metales de campo',
        objective: 'Búsqueda de nódulos de hierro-níquel en la pluma de eyección volcánica.',
      },
    ],
  },
  'RIO-14': {
    strongAnalogy: [
      'Aguas ácidas fluviales (pH ~2) con precipitación masiva de jarosita, goethita y hematita férrica.',
      'Análogo mineralógico exacto de las rocas sedimentarias de Meridiani Planum exploradas por Opportunity.',
      'Biolixiviación bacteriana de sulfuros que modela la geoquímica de soluciones ricas en hierro en Marte.',
    ],
    breaksDown: [
      'Flujo fluvial activo continuo de agua líquida en clima mediterráneo templado.',
      'Ecosistema eucariota y fotosintético abundante (algas, hongos, vegetación ribereña).',
      'Concentración de oxígeno disuelto en agua que sostiene ciclos metabólicos aerobios.',
    ],
    explorationCases: [
      {
        title: 'Calibración de Espectrómetros Mössbauer de Superficie',
        instrumentOrSystem: 'Espectrómetro Mössbauer miniaturizado MIMOS II',
        objective: 'Determinación cuantitativa de la relación Fe²⁺/Fe³⁺ en costras de gossan y terrazas.',
      },
      {
        title: 'Ensayos de Campo de Perforación Aséptica MARTE (NASA Ames)',
        instrumentOrSystem: 'Taladro de profundidad de 10 metros del proyecto MARTE',
        objective: 'Detección de microorganismos quimiolitótrofos en testigos de sulfuros masivos.',
      },
      {
        title: 'Detección de Sulfatos de Hierro con Espectrómetro Raman',
        instrumentOrSystem: 'Espectrómetro Raman para misiones a Marte y Encélado',
        objective: 'Distinción rápida de jarosita, copiapita y coquimbita en afloramientos húmedos.',
      },
    ],
  },
};
