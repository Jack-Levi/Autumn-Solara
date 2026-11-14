# Autumn Solara

> **Deep Space Planetary Exploration, Real-Time Telemetry & Planetary Analog Interface**

Autumn Solara is an advanced aerospace visualization platform designed to bridge interplanetary telemetry with planetary geology and orbital mechanics. Built with React 18, Vite, TypeScript, and Tailwind CSS, it integrates authentic mission data from NASA instruments (LOLA, MOLA, Diviner, and THEMIS) alongside verified terrestrial geological analogs.

---

## Key Modules & Capabilities

1. **Planetary Analog Explorer**: Comparative analysis between lunar/Martian geological formations and extreme Earth analogs (Icelandic basalt fields, Atacama Desert, Antarctica Dry Valleys).
2. **LOLA & MOLA Digital Elevation Models (DEM)**: Laser altimeter cross-section profiles rendering authentic topography for Copernicus, Shackleton, Olympus Mons, Jezero Crater, and Valles Marineris.
3. **Diviner & THEMIS Thermal Inertia Engine**: Diurnal surface temperature curves and thermal inertia calculations modeling regolith particle size and thermal conductivity.
4. **Orbital Gravity Simulator**: Real-time N-body gravitational physics simulator modeling Lagrange points, orbital transfers, and planetary slingshots.
5. **Warp Space Tunnel & Photogrammetry**: High-speed dimensional transitions and before/after planetary surface comparator (high-resolution orbital imagery vs. synthetic aperture radar).
6. **Telemetry & Sensor Calibration Dock**: Real-time interactive calibration controls for sensor sensitivity, frequency spectrums, and optical alignment.

---

## Scientific Datasets & Instruments

* **LOLA (Lunar Orbiter Laser Altimeter)**: High-resolution surface elevation profiles (LRO).
* **Diviner Lunar Radiometer Experiment**: Surface thermal environment, brightness temperatures, and bolometric flux.
* **MOLA (Mars Orbiter Laser Altimeter)**: Mars Global Surveyor topographic grids and crater depths.
* **TES / THEMIS (Thermal Emission Spectrometer & Imaging System)**: Surface mineralogy and thermal inertia measurements (Mars Odyssey).
* **Terrestrial Benchmarks**: NASA ASTER GDEM (ASTGTM V3), MODIS Land Surface Temperature (MOD11), and SMAP Soil Moisture Active Passive data.

---

## Tech Stack

* **Framework**: React 18 + TypeScript + Vite
* **Styling & Design System**: Tailwind CSS (v4), Cosmic Glassmorphism, CSS Custom Properties
* **Interactive Canvas**: Custom HTML5 Canvas Particle Engine & Fluid Trails
* **Mapping**: Leaflet + Custom Planetary Tile Layers
* **Icons**: Lucide React + Custom Aerospace SVG Spritesheet
* **Quality & Linting**: Oxlint

---

## Getting Started

### Prerequisites
* Node.js 18+ or 20+
* npm or pnpm

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

### Build for Production
```bash
npm run build
npm run preview
```

---

## Scientific Documentation
Detailed dataset catalogs, mathematical derivations, and Earth analog justifications can be found in:
* `DATASETS_CATALOGO.md` — Complete catalog and indexing of all NASA Trek profiles.
* `MATRIZ_JUSTIFICACION_ANALOGOS_TIERRA.docx` — Terrestrial analog geological justification matrix.
* `VARIABLES_TIERRA/` — NASA Earth observation user guides (ASTER, MODIS, SMAP).
* `LUNA/` — LOLA DEM elevation cross-sections & Diviner thermal datasets.
* `MARTE/` — MOLA DEM elevation cross-sections & THEMIS/TES thermal inertia datasets.
