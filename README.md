# Autumn Solara

> **Deep Space Planetary Exploration, Real-Time Telemetry & Planetary Analog Interface**

Autumn Solara is an advanced aerospace visualization platform designed to bridge interplanetary telemetry with planetary geology and orbital mechanics. Built with React 19, Vite, TypeScript, and Tailwind CSS, it integrates authentic mission data from NASA instruments (LOLA, MOLA, Diviner, and THEMIS) alongside verified terrestrial geological analogs.

---

## Key Modules & Capabilities

1. **Planetary Analog Explorer**: Comparative analysis between lunar/Martian geological formations and extreme Earth analogs (Icelandic basalt fields, Atacama Desert, Antarctica Dry Valleys, Riotinto, etc.).
2. **LOLA & MOLA Digital Elevation Models (DEM)**: Laser altimeter cross-section profiles rendering authentic topography for Copernicus, Shackleton, Olympus Mons, Jezero Crater, Korolev Water Ice Crater, Gusev Crater, Meridiani Planum, and Noctis Labyrinthus.
3. **Diviner & THEMIS Thermal Inertia Engine**: Diurnal surface temperature curves and thermal inertia calculations modeling regolith particle size and thermal conductivity.
4. **Orbital Gravity Simulator**: Real-time N-body gravitational physics simulator modeling Lagrange points, orbital transfers, and planetary slingshots.
5. **Warp Space Tunnel & Photogrammetry**: High-speed dimensional transitions and before/after planetary surface comparator (high-resolution orbital imagery vs. synthetic aperture radar).
6. **Telemetry & Sensor Calibration Dock**: Real-time interactive calibration controls for sensor sensitivity, frequency spectrums, and optical alignment.

---

## Planetary Exploration Targets

### Luna
* **MOON-SHK**: Shackleton Crater (South Pole Artemis III target, cold trap water ice)
* **MOON-LAV**: Mare Tranquillitatis (Basaltic lava plains, ilmenite FeTiO₃, lava tubes)
* **MOON-ARI**: Aristarchus Plateau (Pyroclastic volcanic deposits & sinuous rilles)
* **MOON-COP**: Copernicus Crater (Complex central peak impact crater)
* **MOON-APN**: Montes Apenninus (Massive lunar mountain range from Imbrium basin impact)
* **MOON-TYC**: Tycho Crater (Prominent rayed impact crater)
* **MOON-HAD**: Hadley Rille (Apollo 15 landing site & sinuous basaltic lava channel)

### Mars
* **MARS-JEZ**: Jezero Crater Delta (Perseverance rover landing site, Neretva Vallis delta)
* **MARS-GUS**: Gusev Crater & Columbia Hills (Spirit rover exploration site, silica sinter)
* **MARS-KOR**: Korolev Crater (81 km crater with 1.8 km thick permanent perennial water ice dome)
* **MARS-MER**: Meridiani Planum (Opportunity rover site, hematite "blueberries" concretions)
* **MARS-NOC**: Noctis Labyrinthus (Vast canyon maze and volcanic graben system at Valles Marineris)
* **MARS-ARC**: Arcadia Planitia (Vast northern smooth plain with shallow subsurface sheet ice)
* **MARS-ALB**: Alba Mons (Extensive low-slope shield volcano on Tharsis)
* **MARS-VAL**: Valles Marineris (Solar system's largest canyon system)
* **MARS-ARS**: Arsia Mons (Tharsis giant shield volcano & collapse caldera)
* **MARS-OLY**: Olympus Mons (Tallest planetary volcano in the Solar System)

---

## Scientific Datasets & Instruments

* **LOLA (Lunar Orbiter Laser Altimeter)**: High-resolution surface elevation profiles (LRO).
* **Diviner Lunar Radiometer Experiment**: Surface thermal environment, brightness temperatures, and bolometric flux.
* **MOLA (Mars Orbiter Laser Altimeter)**: Mars Global Surveyor topographic grids, transects, and crater depths.
* **TES / THEMIS (Thermal Emission Spectrometer & Imaging System)**: Surface mineralogy and thermal inertia measurements (Mars Odyssey).
* **Terrestrial Benchmarks**: NASA ASTER GDEM (ASTGTM V3), MODIS Land Surface Temperature (MOD11), and SMAP Soil Moisture Active Passive data.

---

## Tech Stack

* **Framework**: React 19 + TypeScript + Vite
* **Styling & Design System**: Tailwind CSS (v4), Cosmic Glassmorphism, CSS Custom Properties
* **Interactive Canvas**: Custom HTML5 Canvas Particle Engine & Fluid Trails
* **Mapping**: Leaflet + Custom Planetary Tile Layers
* **Icons**: Lucide React + Custom Aerospace SVG Spritesheet
* **Quality & Linting**: Oxlint

---

## Getting Started

### Prerequisites
* Node.js 18+ or 20+
* Python 3.9+ (for dataset verification suite)

### Installation
```bash
# Clone the repository
git clone https://github.com/Jack-Levi/Autumn-Solara.git

# Navigate into the directory
cd Autumn-Solara

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Automated Dataset Verification
```bash
python -m unittest tests.test_extracted_datasets
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## Scientific Documentation
Detailed dataset catalogs, mathematical derivations, and Earth analog justifications can be found in:
* `DATASETS_CATALOGO.md`
* `MATRIZ_JUSTIFICACION_ANALOGOS_TIERRA.docx`
* `VARIABLES_TIERRA/`
* `LUNA/`
* `MARTE/`
