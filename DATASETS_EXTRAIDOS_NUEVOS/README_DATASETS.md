# REPOSITORIO DE DATASETS CIENTÍFICOS EXTRAÍDOS // NASA SPACE APPS CHALLENGE
## Misiones de Referencia: Lunar Reconnaissance Orbiter (LRO) y Mars Global Surveyor / Mars Odyssey

Este directorio contiene las series de datos reales extraídas desde los servicios oficiales de la NASA (**NASA Solar System Treks**, **NASA PDS Geosciences Node**, **LRO Diviner Lunar Radiometer Experiment** y **MGS MOLA / TES Data Archive**).

---

### 1. DATASETS DE LA LUNA (`/LUNA/`)

#### 1.1 Topografía de Alta Resolución (LRO LOLA DEM)
* **Instrumento**: Lunar Orbiter Laser Altimeter (LOLA) a bordo del *Lunar Reconnaissance Orbiter* (LRO).
* **Resolución**: 256 píxeles por grado (~118 metros por píxel en el ecuador, sub-métrica en polos).
* **Archivos**:
  * `topografia/Shackleton_Crater_Polo_Sur_Artemis_LOLA_DEM.csv`: Transecto polar a través del Cráter Shackleton (89.6° S a 89.9° S). Muestra el salto abrupto de 4,200 metros entre el borde iluminado y el fondo en sombra permanente.
  * `topografia/Copernicus_Crater_LOLA_DEM.csv`: Transecto diametral de 89.7 km cruzando el Cráter Copernicus (9.62° N, 21.5° W a 18.5° W), revelando las terrazas de colapso y el complejo de picos centrales de 1.2 km de elevación.

#### 1.2 Radiometría Térmica (LRO Diviner DLRE)
* **Instrumento**: Diviner Lunar Radiometer Experiment (DLRE), Canales térmicos 7 (25-41 µm) y 8 (50-100 µm).
* **Archivos**:
  * `temperatura/Shackleton_Crater_temperatura_diviner.csv`: Mediciones estacionales de temperatura en el polo sur lunar. Demuestra temperaturas de 40 Kelvin (-233 °C) en las regiones en sombra permanente (PSR), idóneas para atrapar volátiles de hielo de agua.
  * `temperatura/Copernicus_Crater_temperatura_diviner.csv`: Ciclo térmico diurno de 24 horas solares lunares (00:00 a 23:00 LST). Cuantifica la oscilación térmica de 290 K entre el mediodía solar (385 K / +112 °C) y la medianoche lunar (95 K / -178 °C).

---

### 2. DATASETS DE MARTE (`/MARTE/`)

#### 2.1 Modelo Digital de Elevación (MGS MOLA DEM)
* **Instrumento**: Mars Orbiter Laser Altimeter (MOLA) a bordo de *Mars Global Surveyor* (MGS).
* **Resolución**: 128 píxeles por grado (~463 metros por píxel).
* **Archivos**:
  * `topografia/Jezero_Crater_Perseverance_MOLA_DEM.csv`: Transecto de 28.6 km a través del abanico deltaico del Cráter Jezero (18.25° N a 18.55° N, 77.25° E a 77.65° E), sitio de exploración del rover Perseverance (Mars 2020).
  * `topografia/Alba_Mons_Tharsis_volcan_MOLA_DEM.csv`: Transecto regional de 245.8 km en el flanco de Alba Mons (30.32° N a 27.50° N, 108.98° W a 105.50° W), demostrando sus pendientes suaves (<1°) a lo largo de cientos de kilómetros.

#### 2.2 Temperatura e Inercia Térmica (MGS TES & Mars Odyssey THEMIS)
* **Instrumentos**: Thermal Emission Spectrometer (TES, MGS) y Thermal Emission Imaging System (THEMIS, Mars Odyssey).
* **Archivos**:
  * `temperatura/Jezero_Crater_temperatura_inercia_TES_THEMIS.csv`: Curva diurna de temperatura superficial y valor de inercia térmica de 320 J·m⁻²·K⁻¹·s⁻⁰·⁵, representativo de cantos rodados, arenas gruesas y lechos fluviales consolidados.
  * `temperatura/Alba_Mons_temperatura_inercia_TES_THEMIS.csv`: Curva diurna y valor de inercia térmica ultrabaja de 145 J·m⁻²·K⁻¹·s⁻⁰·⁵, confirmando un manto eólico continuo de polvo volcánico ultrafino con riesgo de atrapamiento de ruedas de rovers.

---

### 3. VINCULACIÓN CON ANÁLOGOS TERRESTRES EN TERRA—ANALOG™

| Sitio Extraterrestre | Instrumentos NASA | Enfoque Geocientífico | Análogo Terrestre Principal | Prueba de Misión Clave |
|---|---|---|---|---|
| **Cráter Shackleton** | LRO LOLA / Diviner | Trampas criogénicas de hielo permanente (PSR) | Valles Secos de McMurdo (Antártida) | Taladro de hielo criogénico VIPER TRIDENT |
| **Cráter Copernicus** | LRO LOLA / Diviner | Terrazas de impacto y olivino profundo | Gosses Bluff / Domo de Vredefort | Espectroscopía láser LIBS/Raman a distancia |
| **Cráter Jezero** | MGS MOLA / THEMIS | Delta lacustre, carbonatos y estromatolitos | Lago Salda (Turquía) / Cuatro Ciénegas | Detección autónoma de biofirmas (SHERLOC/PIXL) |
| **Alba Mons** | MGS MOLA / MGS TES | Megavolcán suave, polvo de baja inercia térmica | Campos de Pómez de la Puna (Catamarca) | Pruebas de neumáticos de memoria (NASA Spring Tire) |

---
*Compilado por el equipo Autumn Solara para el NASA International Space Apps Challenge.*
