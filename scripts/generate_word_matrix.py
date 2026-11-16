import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_document():
    doc = Document()
    
    # Page setup - Margins 1 inch
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
    # Styles & Colors
    # NASA Blue: #0B3D91 (RGB: 11, 61, 145)
    # NASA Red: #FC3D21 (RGB: 252, 61, 33)
    # Charcoal Dark: #222222
    # Slate Gray: #555555
    color_nasa_blue = RGBColor(11, 61, 145)
    color_nasa_red = RGBColor(252, 61, 33)
    color_dark = RGBColor(34, 34, 34)
    color_gray = RGBColor(85, 85, 85)
    
    # Normal style
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Calibri'
    font.size = Pt(11)
    font.color.rgb = color_dark
    
    # ------------------ COVER / TITLE BLOCK ------------------
    p_badge = doc.add_paragraph()
    p_badge.paragraph_format.space_before = Pt(0)
    p_badge.paragraph_format.space_after = Pt(4)
    run_badge = p_badge.add_run("NASA SPACE APPS CHALLENGE  |  EARTH ANALOGS FOR MOON & MARS")
    run_badge.font.size = Pt(9.5)
    run_badge.font.bold = True
    run_badge.font.color.rgb = color_nasa_red
    
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(8)
    run_title = p_title.add_run("Matriz de Caracterización y Justificación Científica de Análogos Terrestres")
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = color_nasa_blue
    
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(18)
    run_sub = p_sub.add_run("Guía Técnica de Validación de Terrenos Planetarios, Instrumentos de la NASA y Pruebas de Misión para Futuras Bases y Aterrizajes (Artemis, Starship y Mars Sample Return)")
    run_sub.font.size = Pt(12)
    run_sub.font.italic = True
    run_sub.font.color.rgb = color_gray
    
    # Horizontal separator
    p_line = doc.add_paragraph()
    p_line.paragraph_format.space_before = Pt(0)
    p_line.paragraph_format.space_after = Pt(18)
    r_line = p_line.add_run("―" * 60)
    r_line.font.color.rgb = RGBColor(200, 200, 200)

    # ------------------ SECCIÓN 1: RESUMEN EJECUTIVO ------------------
    h1 = doc.add_heading(level=1)
    r_h1 = h1.add_run("1. Resumen Ejecutivo y Marco de Impacto")
    r_h1.font.color.rgb = color_nasa_blue
    r_h1.font.bold = True
    
    p_exec = doc.add_paragraph(
        "Las misiones de exploración espacial a la Luna y a Marte involucran costos de miles de millones de dólares y márgenes "
        "críticos de seguridad. Antes de enviar rovers, trajes espaciales de actividad extravehicular (EVA), taladros criogénicos "
        "o módulos habitacionales a la superficie lunar o marciana, es imperativo someter estos subsistemas a rigurosas campañas de "
        "ensayo en sitios de la Tierra con características geomorfológicas, geológicas, térmicas y ambientales análogas."
    )
    p_exec.paragraph_format.line_spacing = 1.15
    p_exec.paragraph_format.space_after = Pt(8)
    
    p_exec2 = doc.add_paragraph(
        "Sin embargo, la mayoría de los análogos terrestres clásicos (como el Desierto de Atacama o la Isla Devon) no están completamente "
        "bien caracterizados de manera cuantitativa, ni clasificados según su utilidad de ingeniería. Este proyecto utiliza datos abiertos "
        "de satélites de la NASA y otras agencias espaciales (LOLA, MOLA, Diviner, MGS TES, THEMIS, ASTER GDEM, MODIS LST y SMAP) para "
        "caracterizar 12 ubicaciones planetarias estratégicas (6 en la Luna y 6 en Marte) y mapearlas con precisión contra sus mejores "
        "análogos terrestres, respondiendo con rigor científico y aplicabilidad práctica a la rúbrica oficial de jueces del NASA Space Apps Challenge."
    )
    p_exec2.paragraph_format.line_spacing = 1.15
    p_exec2.paragraph_format.space_after = Pt(18)

    # ------------------ SECCIÓN 2: TABLAS COMPARATIVAS GLOBALES ------------------
    h2 = doc.add_heading(level=1)
    r_h2 = h2.add_run("2. Tablas Comparativas Globales")
    r_h2.font.color.rgb = color_nasa_blue
    r_h2.font.bold = True

    # --- TABLA LUNA ---
    p_t1_title = doc.add_paragraph()
    p_t1_title.paragraph_format.space_before = Pt(8)
    p_t1_title.paragraph_format.space_after = Pt(4)
    r_t1_t = p_t1_title.add_run("Tabla 2.1: Sitios Lunares vs. Análogos Terrestres y Pruebas de Misión")
    r_t1_t.font.bold = True
    r_t1_t.font.size = Pt(12)
    r_t1_t.font.color.rgb = color_nasa_blue

    luna_headers = ["Sitio Lunar", "¿Por qué analizarlo? (NASA)", "Análogo Terrestre", "Pruebas de Ingeniería"]
    luna_rows = [
        [
            "Mare Tranquillitatis\n(Apolo 11)",
            "Planicie basáltica extensa con bajo relieve, rica en ilmenita (FeTiO3) para extracción de oxígeno.",
            "La Payunia (Argentina)\nCraters of the Moon (Idaho, EE.UU.)",
            "Tracción en basalto abrasivo, excavación de regolito para minería ISRU y radar de aterrizaje."
        ],
        [
            "Aristarchus\n(Meseta & Rille)",
            "Rilles volcánicos y tubos de lava colapsados (Vallis Schröteri) candidatos a Base Lunar Permanente.",
            "Cueva de los Verdes (Lanzarote, España)\nUndara Lava Tubes (Australia)",
            "Robótica espeleológica sin GPS, sellado hermético de hábitats inflables bajo tierra contra radiación."
        ],
        [
            "Montes Apenninus\n(Apolo 15)",
            "Escarpe de 5,000 m que expone la corteza lunar profunda levantada por el impacto de Imbrium.",
            "Sierra Nevada / Cañón del Colorado (EE.UU.)\nAndes Centrales (Chile/Bolivia)",
            "Navegación óptica autónoma de aterrizaje (TRN) en pendientes empinadas y sombras profundas."
        ],
        [
            "Tycho Crater\n(Impacto Complejo)",
            "Cráter joven de 85 km con pico central de 1.6 km y eyectas brillantes en todo el disco visible.",
            "Cráter Haughton (Ártico Canadiense)\nMeteor Crater (Arizona, EE.UU.)",
            "Detección de vidrios de impacto con sensores hiperespectrales y ascenso de rovers en pico central."
        ],
        [
            "Copernicus Crater\n(Impacto / Olivino)",
            "Terrazas concéntricas escalonadas y picos que levantaron olivino del manto superior / corteza inferior.",
            "Gosses Bluff (Australia)\nDomo de Vredefort (Sudáfrica)",
            "Muestreo de estratos geológicos profundos y espectroscopía láser LIBS/Raman a distancia."
        ],
        [
            "Shackleton Crater\n(Polo Sur - Artemis)",
            "Interior en sombra permanente a 40 K (-233 °C) con millones de toneladas de hielo de agua.",
            "Valles Secos de McMurdo (Antártida)\nSvalbard (Noruega)",
            "Taladros criogénicos de extracción de hielo (VIPER TRIDENT) y trajes EVA para frío criogénico."
        ]
    ]

    table_luna = doc.add_table(rows=len(luna_rows) + 1, cols=4)
    table_luna.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_luna.autofit = False

    # Widths: 1.3 in, 2.0 in, 1.6 in, 2.1 in (Total = 7.0 in)
    col_widths = [Inches(1.2), Inches(2.0), Inches(1.6), Inches(2.2)]

    # Format Header
    for j, text in enumerate(luna_headers):
        cell = table_luna.cell(0, j)
        cell.width = col_widths[j]
        set_cell_background(cell, "0B3D91") # NASA Blue
        set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        r.font.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)

    # Format Rows
    for i, row in enumerate(luna_rows):
        bg = "F4F7FA" if i % 2 == 1 else "FFFFFF"
        for j, text in enumerate(row):
            cell = table_luna.cell(i + 1, j)
            cell.width = col_widths[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(text)
            r.font.size = Pt(9.5)
            if j == 0:
                r.font.bold = True
                r.font.color.rgb = color_nasa_blue

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # --- TABLA MARTE ---
    p_t2_title = doc.add_paragraph()
    p_t2_title.paragraph_format.space_before = Pt(8)
    p_t2_title.paragraph_format.space_after = Pt(4)
    r_t2_t = p_t2_title.add_run("Tabla 2.2: Sitios Marcianos vs. Análogos Terrestres y Pruebas de Misión")
    r_t2_t.font.bold = True
    r_t2_t.font.size = Pt(12)
    r_t2_t.font.color.rgb = color_nasa_blue

    mars_headers = ["Sitio Marciano", "¿Por qué analizarlo? (NASA)", "Análogo Terrestre", "Pruebas de Ingeniería"]
    mars_rows = [
        [
            "Arcadia Planitia\n(SpaceX Starship)",
            "Planicie lisa en tierras bajas con capas masivas de hielo puro a solo 1-2 m bajo la superficie.",
            "Salar de Uyuni (Bolivia)\nPermafrost de Yamal (Siberia)",
            "Calibración de radar de descenso en terreno ultraplano y extracción de agua subterránea por calor."
        ],
        [
            "Arsia Mons\n(Volcán y Claraboyas)",
            "Volcán escudo de 16 km con las 'Siete Hermanas', aberturas verticales a cavernas colosales.",
            "Mauna Loa (Hawái - HI-SEAS)\nMonte Etna (Italia)",
            "Drones en atmósfera enrarecida (tipo Ingenuity) y descenso con cabrestante para bases bajo tierra."
        ],
        [
            "Olympus Mons\n(Megavolcán)",
            "El volcán más alto del Sistema Solar (22 km) rodeado por un acantilado basal vertical de 8 km.",
            "Nevado Ojos del Salado (Chile/Arg)\nIslas Galápagos (Ecuador)",
            "Tracción extrema en acantilados rocosos y sensores atmosféricos para presiones mínimas (hipobaria)."
        ],
        [
            "Valles Marineris\n(Mega Cañón)",
            "Cañón de 4,000 km y 7 km de profundidad; expone estratigrafía completa y posibles salmueras (RSL).",
            "Gran Cañón del Colorado (EE.UU.)\nValle de la Muerte (California)",
            "Rovers con descenso en pendientes de 40° y análisis con láser a distancia (SuperCam)."
        ],
        [
            "Alba Mons\n(Volcán Suave - URL)",
            "El volcán más extenso (>1,500 km) pero con pendiente suave (<1°) cubierto por polvo fino y suelto.",
            "Campos de Pómez de la Puna (Catamarca)\nSalar de Antofalla (Argentina)",
            "Prevención de enterramiento de ruedas en arena volcánica suelta y sellos herméticos antipolvo."
        ],
        [
            "Jezero Crater\n(Perseverance Rover)",
            "Paleolago y delta fluvial fósil. Epicentro de la búsqueda de vida pasada y biofirmas fósiles.",
            "Lago Salda (Turquía)\nCuenca de Qaidam (Meseta Tibetana)",
            "Algoritmos de IA para detección de microfósiles (SHERLOC/PIXL) y testigos cilíndricos sellados."
        ]
    ]

    table_mars = doc.add_table(rows=len(mars_rows) + 1, cols=4)
    table_mars.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_mars.autofit = False

    for j, text in enumerate(mars_headers):
        cell = table_mars.cell(0, j)
        cell.width = col_widths[j]
        set_cell_background(cell, "0B3D91")
        set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        r.font.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for i, row in enumerate(mars_rows):
        bg = "F4F7FA" if i % 2 == 1 else "FFFFFF"
        for j, text in enumerate(row):
            cell = table_mars.cell(i + 1, j)
            cell.width = col_widths[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(text)
            r.font.size = Pt(9.5)
            if j == 0:
                r.font.bold = True
                r.font.color.rgb = color_nasa_red

    doc.add_paragraph().paragraph_format.space_after = Pt(18)

    # ------------------ SECCIÓN 3: FICHAS TÉCNICAS DE LUNA ------------------
    h3 = doc.add_heading(level=1)
    r_h3 = h3.add_run("3. Fichas Técnicas Monográficas: Sitios Lunares")
    r_h3.font.color.rgb = color_nasa_blue
    r_h3.font.bold = True

    luna_details = [
        {
            "name": "3.1 Mare Tranquillitatis (Mar de la Tranquilidad)",
            "coords": "30.46° E a 30.61° E, 8.22° N a 8.27° N",
            "sensor": "LRO LOLA DEM (Resolución 256 ppd), Apollo 11 & 17 Metric Cam DEM",
            "importance": (
                "Es el terreno de referencia por excelencia tras el alunizaje de Neil Armstrong y Buzz Aldrin en 1969. "
                "Constituye una cuenca de inundación de basaltos mareales con espesores de varios kilómetros. "
                "Su gran ventaja para misiones modernas radica en su bajo gradiente de pendiente (<2°) y su alta "
                "concentración de ilmenita (FeTiO3), el mineral más idóneo para extraer oxígeno gaseoso respirable y "
                "titanio metálico para manufactura en el espacio (ISRU)."
            ),
            "analog": (
                "La Payunia (Mendoza, Argentina) y Craters of the Moon National Monument (Idaho, EE.UU.). "
                "La Payunia presenta uno de los campos de lava basáltica retroarco más densos del planeta, con mantos "
                "de 'Pampa Negra' que reproducen la rugosidad nanométrica y la abrasión del regolito lunar."
            ),
            "testing": (
                "Pruebas de ruedas de rovers (desgaste por bordes vítreos basálticos cortantes), sistemas de excavación "
                "autónoma de tierra para plantas químicas de oxígeno y calibración de radares de alunizaje CLPS."
            )
        },
        {
            "name": "3.2 Meseta y Rille de Aristarchus",
            "coords": "47.0° W a 49.0° W, 23.0° N a 24.5° N",
            "sensor": "LRO LOLA DEM, LROC NAC Mosaics, Lunar Prospector Gamma-Ray",
            "importance": (
                "Es la región volcánica más anómala y rica en volátiles de la Luna. Alberga Vallis Schröteri, un canal "
                "volcánico sinuoso de 160 km de largo y hasta 10 km de ancho. Los techos de lava colapsados revelan claraboyas "
                "que dan acceso a gigantescos tubos de lava intactos. Son los mejores candidatos para la Base Lunar Artemis, "
                "pues el interior de un tubo de lava bloquea el 100% de la radiación ionizante y mantiene una temperatura estable (~ -20 °C)."
            ),
            "analog": (
                "Cueva de los Verdes y Malpaís de la Corona (Lanzarote, Islas Canarias, España) y Undara (Australia). "
                "Lanzarote alberga galerías de lava basáltica de 25 metros de ancho donde la ESA desarrolla el programa de entrenamiento geológico PANGAEA."
            ),
            "testing": (
                "Robótica de acceso vertical a cavernas, despliegue de hábitats presurizados inflables subterráneos y redes de comunicación Mesh sin visión satelital."
            )
        },
        {
            "name": "3.3 Montes Apenninus (Apeninos Lunares)",
            "coords": "3.5° E a 5.0° E, 25.0° N a 26.5° N",
            "sensor": "LRO LOLA DEM, Apollo 15 Metric Camera",
            "importance": (
                "Cadena montañosa de impacto de 5,000 m que rodea la gigantesca cuenca de Mare Imbrium. El impacto inicial "
                "levantó bloques intactos de la corteza profunda y el manto lunar temprano. Proporciona una ventana única a la historia de diferenciación planetaria."
            ),
            "analog": (
                "Sierra Nevada (California, EE.UU.) y Cordillera Real de los Andes Centrales (Bolivia/Chile). "
                "Grandes paredes verticales de roca granítica y basáltica desprovistas de suelo orgánico con fuertes contrastes de luz y sombra."
            ),
            "testing": (
                "Sistemas de navegación relativa al terreno (TRN) sobre sombras abruptas y diseño de rovers trepadores con suspensión adaptativa para terrenos escarpados."
            )
        },
        {
            "name": "3.4 Tycho Crater",
            "coords": "13.26° W a 13.14° W, 44.00° S a 43.96° S",
            "sensor": "LRO LOLA DEM, Diviner Radiometer Thermal Inertia",
            "importance": (
                "Cráter de impacto de 85 km con una edad de apenas 108 millones de años. Su pico central se eleva 1,600 metros "
                "sobre el fondo y su manto de eyectas es el más brillante de la Luna. Permite estudiar la mecánica de fracturamiento "
                "y fusión por hipervelocidad y muestrear material expulsado desde 10 km de profundidad."
            ),
            "analog": (
                "Cráter Haughton (Isla Devon, Nunavut, Canadá) y Meteor Crater (Arizona, EE.UU.). "
                "Haughton es un cráter de impacto de 23 km en clima ártico periglaciar frío, base principal del NASA Haughton-Mars Project."
            ),
            "testing": (
                "Diferenciación hiperespectral de brechas de impacto versus roca de caja autóctona, y evaluación de tracción en taludes de pedregales inestables."
            )
        },
        {
            "name": "3.5 Copernicus Crater",
            "coords": "21.50° W a 18.50° W, 9.62° N",
            "sensor": "LRO LOLA DEM Global 256 ppd, Diviner DLRE",
            "importance": (
                "Cráter de 93 km con terrazas concéntricas escalonadas y un grupo prominente de picos centrales. Mediciones espectrales "
                "confirmaron presencia de anortosita prístina y olivino levantado desde las capas más profundas de la corteza lunar."
            ),
            "analog": (
                "Estructura de impacto Gosses Bluff (Territorio del Norte, Australia) y Domo de Vredefort (Sudáfrica). "
                "Estructuras terrestres donde el levantamiento elástico central expone estratos de gran profundidad."
            ),
            "testing": (
                "Ensayos de muestreo con brazos robóticos articulados sobre caras escarpadas de picos centrales y espectroscopía LIBS/Raman."
            )
        },
        {
            "name": "3.6 Shackleton Crater (Polo Sur Lunar - Artemis III)",
            "coords": "5.0° W a 5.0° E, 89.6° S a 89.9° S",
            "sensor": "LRO LOLA DEM Polar, Diviner Thermal Map, Mini-RF SAR Radar",
            "importance": (
                "El sitio más estratégico del programa Artemis. Su foso interior permanece en sombra permanente (PSR) a 40 Kelvin (-233 °C) "
                "actuando como trampa criogénica de hielo de agua. Sus bordes elevados reciben luz solar casi permanente para generar energía limpia."
            ),
            "analog": (
                "Valles Secos de McMurdo (Antártida) y Domo Concordia (Meseta Antártica). "
                "Desiertos polares hiperáridos con permafrost rico en salmueras y hielo subsuperficial fósil, con las temperaturas terrestres más bajas registradas."
            ),
            "testing": (
                "Perforadoras criogénicas para regolito congelado (proyecto TRIDENT del rover VIPER de NASA), aislamiento térmico de baterías y sistemas de rodamiento sin congelación."
            )
        }
    ]

    for site in luna_details:
        p_name = doc.add_paragraph()
        p_name.paragraph_format.space_before = Pt(12)
        p_name.paragraph_format.space_after = Pt(2)
        r_n = p_name.add_run(site["name"])
        r_n.font.bold = True
        r_n.font.size = Pt(13)
        r_n.font.color.rgb = color_nasa_blue

        p_meta = doc.add_paragraph()
        p_meta.paragraph_format.space_before = Pt(0)
        p_meta.paragraph_format.space_after = Pt(4)
        r_m1 = p_meta.add_run("Coordenadas: ")
        r_m1.font.bold = True
        p_meta.add_run(site["coords"] + "  |  ")
        r_m2 = p_meta.add_run("Sensores NASA: ")
        r_m2.font.bold = True
        p_meta.add_run(site["sensor"])

        p_imp = doc.add_paragraph()
        p_imp.paragraph_format.space_after = Pt(4)
        r_i1 = p_imp.add_run("¿Por qué es crucial para la NASA?: ")
        r_i1.font.bold = True
        p_imp.add_run(site["importance"])

        p_an = doc.add_paragraph()
        p_an.paragraph_format.space_after = Pt(4)
        r_a1 = p_an.add_run("Análogos Terrestres: ")
        r_a1.font.bold = True
        p_an.add_run(site["analog"])

        p_test = doc.add_paragraph()
        p_test.paragraph_format.space_after = Pt(10)
        r_t1 = p_test.add_run("Casos de Prueba de Ingeniería: ")
        r_t1.font.bold = True
        r_t1.font.color.rgb = color_nasa_red
        p_test.add_run(site["testing"])

    doc.add_paragraph().paragraph_format.space_after = Pt(18)

    # ------------------ SECCIÓN 4: FICHAS TÉCNICAS DE MARTE ------------------
    h4 = doc.add_heading(level=1)
    r_h4 = h4.add_run("4. Fichas Técnicas Monográficas: Sitios Marcianos")
    r_h4.font.color.rgb = color_nasa_blue
    r_h4.font.bold = True

    mars_details = [
        {
            "name": "4.1 Arcadia Planitia",
            "coords": "176.40° W a 176.22° W, 47.21° N a 47.22° N",
            "sensor": "MGS MOLA DEM Global, MRO SHARAD Radar, THEMIS Daytime IR",
            "importance": (
                "Llanura volcánica y sedimentaria ultraplana en las tierras bajas del norte de Marte. "
                "Datos de radar SHARAD confirmaron capas masivas de hielo puro de agua a tan solo 1 a 2 metros de profundidad. "
                "Es el candidato #1 para las misiones de aterrizaje de SpaceX Starship y misiones humanas de NASA, "
                "gracias a su baja pendiente (<0.5°), mínimo riesgo de colisión con rocas y disponibilidad masiva de agua para combustible."
            ),
            "analog": (
                "Salar de Uyuni (Bolivia) y Península de Yamal (Siberia, Rusia). "
                "Uyuni es la planicie salina más extensa y plana del mundo, utilizada por la NASA para calibración de satélites y altímetros láser. "
                "Yamal contiene lentes de hielo masivo subsuperficial en permafrost continuo plano."
            ),
            "testing": (
                "Calibración de radares altimétricos de descenso a alta velocidad, zapatas de apoyo de naves espaciales pesadas en regolito salino "
                "y sistemas de extracción de agua por calentamiento subterráneo (RodWells)."
            )
        },
        {
            "name": "4.2 Arsia Mons",
            "coords": "120.0° W a 122.0° W, 8.5° S a 9.5° S",
            "sensor": "MGS MOLA DEM, Mars Odyssey THEMIS, MRO HiRISE",
            "importance": (
                "Volcán escudo gigante de 16 km de elevación sobre el datum. En sus laderas se descubrieron las 'Siete Hermanas', "
                "claraboyas circulares verticales de 100 a 250 metros de diámetro que descienden a cavernas colosales protegidas de la radiación ionizante."
            ),
            "analog": (
                "Mauna Loa y Kilauea (Hawái, EE.UU.) y Monte Etna (Italia). "
                "Hawái es la sede del hábitat de simulación marciana NASA HI-SEAS, donde se evalúan dinámicas humanas en tubos de lava basálticos."
            ),
            "testing": (
                "Vuelo de drones aéreos de exploración en atmósfera enrarecida (tipo Ingenuity/Hexacopter), robots con cabrestante para descenso en rappel "
                "y monitoreo ambiental de habitabilidad en aislamiento."
            )
        },
        {
            "name": "4.3 Olympus Mons",
            "coords": "133.5° W a 135.0° W, 18.0° N a 19.5° N",
            "sensor": "MGS MOLA DEM Global, Mars Express HRSC",
            "importance": (
                "El mayor volcán del Sistema Solar: 22 km de altitud y 600 km de diámetro, cercado por un acantilado basal vertiginoso de hasta 8 km de altura. "
                "Testimonio de la estabilidad de la corteza marciana sin tectónica de placas que permitió el flujo ininterrumpido de magma."
            ),
            "analog": (
                "Nevado Ojos del Salado (Chile/Argentina) e Islas Galápagos (Ecuador). "
                "Ojos del Salado es el volcán activo más alto de la Tierra (6,893 m), caracterizado por frío extremo, atmósfera con baja presión y radiación UV letal."
            ),
            "testing": (
                "Tracción y estabilidad de rovers en acantilados verticales rocosos, sellado de juntas de presión en ambientes hiperhipobáricos."
            )
        },
        {
            "name": "4.4 Valles Marineris",
            "coords": "70.0° W a 75.0° W, 10.0° S a 12.0° S",
            "sensor": "MGS MOLA DEM, MRO CRISM (Compact Reconnaissance Imaging Spectrometer)",
            "importance": (
                "El mayor sistema de cañones del Sistema Solar: 4,000 km de longitud y hasta 7 km de profundidad. "
                "Corta transversalmente toda la corteza marciana exponiendo miles de millones de años de historia estratigráfica y posibles salmueras estacionales (RSL)."
            ),
            "analog": (
                "Gran Cañón del Colorado (Arizona, EE.UU.) y Valle de la Muerte (Death Valley, California). "
                "Death Valley representa una depresión hiperárida por debajo del nivel del mar con depósitos masivos de evaporitas y abanicos aluviales secos."
            ),
            "testing": (
                "Rovers todoterreno capaces de descender laderas de 35° a 45°, análisis espectrométrico de paredes verticales con láser (SuperCam) y muestreo de sales evaporíticas."
            )
        },
        {
            "name": "4.5 Alba Mons (Enlace de NASA Trek)",
            "coords": "108.98° W a 105.50° W, 30.32° N a 27.50° N",
            "sensor": "MGS MOLA DEM, Mars Odyssey THEMIS Day/Night IR, MGS TES Thermal Inertia",
            "importance": (
                "El volcán más extenso de Marte en superficie (>1,500 km de diámetro) pero con una pendiente casi plana (<1°). "
                "Está cubierto por un manto profundo de polvo volcánico eólico ultrafino con baja inercia térmica (145 J m^-2 K^-1 s^-0.5). "
                "Es un reto de ingeniería único: terreno plano pero con riesgo de enterramiento y atasco de ruedas por baja cohesión del suelo."
            ),
            "analog": (
                "Campos de Pómez de la Puna (Antofagasta de la Sierra, Catamarca, Argentina) y Salar de Antofalla. "
                "Vastas llanuras de material piroclástico suelto y ceniza volcánica a gran altitud (>3,500 m) con baja tracción y alta abrasión."
            ),
            "testing": (
                "Ensayos de neumáticos elásticos de memoria de forma (NASA Spring Tire) para evitar atolladeros como el del rover Spirit, "
                "y sellos electromecánicos contra polvo ultrafino abrasivo."
            )
        },
        {
            "name": "4.6 Jezero Crater (Misión Perseverance)",
            "coords": "77.25° E a 77.65° E, 18.25° N a 18.55° N",
            "sensor": "MGS MOLA DEM, MRO HiRISE, Mars 2020 Perseverance Mastcam-Z & SuperCam",
            "importance": (
                "Paleolago y delta fluvial fósil activo hace 3,500 millones de años. Es el epicentro de la búsqueda de vida en Marte. "
                "Sus depósitos de arcillas, limos y carbonatos son ideales para preservar estromatolitos y biofirmas fósiles microscópicas. "
                "Las muestras recogidas aquí serán devueltas a la Tierra en la misión Mars Sample Return."
            ),
            "analog": (
                "Lago Salda (Turquía), Cuenca de Qaidam (Meseta Tibetana) y Cuatro Ciénegas (Coahuila, México). "
                "Lago Salda es el análogo primario de Jezero según la NASA debido a sus carbonatos microbianos (hidromagnesita) en un entorno lacustre máfico alcalino."
            ),
            "testing": (
                "Algoritmos de inteligencia artificial para selección autónoma de muestras biológicas (SHERLOC y PIXL de NASA), "
                "perforación y encapsulado hermético de testigos rocosos cilíndricos y tránsito en lechos de cantos rodados."
            )
        }
    ]

    for site in mars_details:
        p_name = doc.add_paragraph()
        p_name.paragraph_format.space_before = Pt(12)
        p_name.paragraph_format.space_after = Pt(2)
        r_n = p_name.add_run(site["name"])
        r_n.font.bold = True
        r_n.font.size = Pt(13)
        r_n.font.color.rgb = color_nasa_red

        p_meta = doc.add_paragraph()
        p_meta.paragraph_format.space_before = Pt(0)
        p_meta.paragraph_format.space_after = Pt(4)
        r_m1 = p_meta.add_run("Coordenadas: ")
        r_m1.font.bold = True
        p_meta.add_run(site["coords"] + "  |  ")
        r_m2 = p_meta.add_run("Sensores NASA: ")
        r_m2.font.bold = True
        p_meta.add_run(site["sensor"])

        p_imp = doc.add_paragraph()
        p_imp.paragraph_format.space_after = Pt(4)
        r_i1 = p_imp.add_run("¿Por qué es crucial para la NASA?: ")
        r_i1.font.bold = True
        p_imp.add_run(site["importance"])

        p_an = doc.add_paragraph()
        p_an.paragraph_format.space_after = Pt(4)
        r_a1 = p_an.add_run("Análogos Terrestres: ")
        r_a1.font.bold = True
        p_an.add_run(site["analog"])

        p_test = doc.add_paragraph()
        p_test.paragraph_format.space_after = Pt(10)
        r_t1 = p_test.add_run("Casos de Prueba de Ingeniería: ")
        r_t1.font.bold = True
        r_t1.font.color.rgb = color_nasa_blue
        p_test.add_run(site["testing"])

    doc.add_paragraph().paragraph_format.space_after = Pt(18)

    # ------------------ SECCIÓN 5: GUÍA PARA EL PITCH DE HACKATHON ------------------
    h5 = doc.add_heading(level=1)
    r_h5 = h5.add_run("5. Guía Estratégica para el Pitch y Evaluación de Jueces")
    r_h5.font.color.rgb = color_nasa_blue
    r_h5.font.bold = True

    p_pitch = doc.add_paragraph(
        "Para obtener la máxima puntuación en la evaluación del NASA Space Apps Challenge, el equipo debe estructurar su presentación "
        "en 4 pilares fundamentales:"
    )
    p_pitch.paragraph_format.space_after = Pt(8)

    pillars = [
        ("1. El Problema Real (Impacto): ", "Probar equipos en el espacio cuesta $100,000 por kilogramo. Un fallo de una rueda de rover (como Spirit) o de un taladro (como InSight) arruina misiones de $1,000M. Los análogos terrestres son la póliza de seguro de la NASA."),
        ("2. El Aporte Innovador (Creatividad): ", "No nos limitamos a los 3 desiertos conocidos. Identificamos nuevos análogos no caracterizados (La Payunia, Lago Salda, Campos de Pómez de la Puna, Lanzarote) cruzando datos abiertos de satélites."),
        ("3. Validez Científica (Rigor de Datos): ", "Demostramos el uso de datos abiertos de satélites oficiales de NASA (LOLA DEM, MOLA DEM, Diviner, MGS TES, THEMIS) vinculados con misiones actuales como Artemis III y Mars 2020 Perseverance."),
        ("4. Relevancia Práctica (Ingeniería de Misión): ", "Nuestra herramienta no es solo un mapa visual: es un motor de decisión que le dice al ingeniero de la NASA exactamente a qué desierto de la Tierra ir a probar sus ruedas, sus taladros o sus trajes espaciales.")
    ]

    for p_title_text, p_body_text in pillars:
        p_pil = doc.add_paragraph()
        p_pil.paragraph_format.left_indent = Inches(0.25)
        p_pil.paragraph_format.space_after = Pt(6)
        r_p_t = p_pil.add_run(p_title_text)
        r_p_t.font.bold = True
        r_p_t.font.color.rgb = color_nasa_blue
        p_pil.add_run(p_body_text)

    # Save document
    output_dir = "DATASETS_EXTRAIDOS_NUEVOS"
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "MATRIZ_JUSTIFICACION_ANALOGOS_TIERRA.docx")
    doc.save(out_path)
    print(f"Document saved successfully at: {out_path}")

if __name__ == "__main__":
    create_document()
