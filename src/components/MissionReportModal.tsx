import React, { useState, useMemo } from 'react';
import type { EarthSite, ExtraTerrestrialTarget, PFIWeights } from '../data';
import { NASA_PFI_DIMENSIONS, fidelityColor, fidelityLabel } from '../data';
import { SITE_SCIENTIFIC_DATA, EARTH_PLANETARY_LIMITS } from '../scientificData';
import { getTargetDatasetSummary } from '../data/nasaExtractedDatasets';
import ScientificEvidenceVault from './ScientificEvidenceVault';

interface MissionReportModalProps {
  site: EarthSite | null;
  target: ExtraTerrestrialTarget;
  pfi: number;
  weights: PFIWeights;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'vault' | 'report';
}

export default function MissionReportModal({
  site,
  target,
  pfi,
  weights,
  isOpen,
  onClose,
  initialTab = 'vault',
}: MissionReportModalProps) {
  const [activeTab, setActiveTab] = useState<'vault' | 'report'>(initialTab);
  const [copied, setCopied] = useState<boolean>(false);

  const scientific = useMemo(() => {
    if (!site) return null;
    return (
      SITE_SCIENTIFIC_DATA[site.id] || {
        strongAnalogy: [site.summary],
        breaksDown: [site.grayZone || 'Divergencias atmosféricas y gravitacionales normales.'],
        explorationCases: site.protocols?.map((p) => ({
          title: p.title,
          instrumentOrSystem: `${p.code} (${p.trl})`,
          objective: p.desc,
        })) || [
          {
            title: 'Calibración de Sensores In-Situ',
            instrumentOrSystem: 'Espectrómetro y Radiómetro',
            objective: 'Validación en tierra de parámetros de reflectancia orbital.',
          },
        ],
      }
    );
  }, [site]);

  // Generate full markdown document
  const markdownContent = useMemo(() => {
    if (!site || !scientific) return '';

    const pfiDisplay = Math.round(pfi);
    const dateStr = new Date().toISOString().split('T')[0];
    const datasetSummary = getTargetDatasetSummary(target.id);

    return `# EXPEDIENTE TÉCNICO DE MISIÓN ANÁLOGA · NASA SPACE APPS CHALLENGE
**Documento**: AUTUMN-SOLARA-REP-${site.id}-${target.id}
**Fecha de Generación**: ${dateStr}
**Objetivo Planetario**: ${target.name} (${target.body})
**Sitio Terrestre**: ${site.name} (${site.id})
**Fidelidad Global PFI**: ${pfiDisplay}% (${fidelityLabel(pfiDisplay)})

---

## 1. RESUMEN EJECUTIVO E IDENTIFICACIÓN DEL SITIO
* **Identificador de Catálogo**: ${site.id}
* **Ubicación Geográfica**: ${site.country} · ${site.region}
* **Coordenadas Geodésicas**: ${site.dms} (Lat: ${site.lat}°, Lng: ${site.lng}°)
* **Elevación Topográfica SRTM**: ${site.elevM} m s.n.m.
* **Bioma Terrestre**: ${site.biome}
* **Micro-Escala Exacta**: ${site.microScale}
* **Proceso Geofísico Activo**: ${site.activeProcess}

### Descripción General
${site.summary}

---

## 2. METODOLOGÍA MULTI-DATASET Y VECTOR DE 8 DIMENSIONES NASA

| Dimensión NASA | Datasets Cruzados | Valor Sitio | Valor Objetivo | Afinidad | Peso Calibrado |
|---|---|---|---|---|---|
| 1. Geología y Litología | TERRA/ASTER TIR vs. MRO-CRISM / LRO-Diviner | ${site.vector.geology}% | ${target.vector.geology}% | ${100 - Math.abs(site.vector.geology - target.vector.geology)}% | ${weights.geology}% |
| 2. Rugosidad y Terreno | NASA SRTM 30m DEM vs. LRO-LOLA / MGS-MOLA | ${site.vector.terrain}% | ${target.vector.terrain}% | ${100 - Math.abs(site.vector.terrain - target.vector.terrain)}% | ${weights.terrain}% |
| 3. Régimen Térmico | MODIS Land Surface Temp vs. LRO-Diviner / MCS MRO | ${site.vector.temperature}% | ${target.vector.temperature}% | ${100 - Math.abs(site.vector.temperature - target.vector.temperature)}% | ${weights.temperature}% |
| 4. Agua y Recursos ISRU | ASTER SWIR / NASA SRTM vs. LAMP LRO / Mars Odyssey GRS | ${site.vector.iceWater}% | ${target.vector.iceWater}% | ${100 - Math.abs(site.vector.iceWater - target.vector.iceWater)}% | ${weights.iceWater}% |
| 5. Dinámica Atmosférica | Open-Meteo Barometría / NASA MERRA-2 vs. Mars 2020 MEDA | ${site.vector.atmosphere}% | ${target.vector.atmosphere}% | ${100 - Math.abs(site.vector.atmosphere - target.vector.atmosphere)}% | ${weights.atmosphere}% |
| 6. Interferencia Biológica | MODIS NDVI Cobertura Vegetal vs. Cero Biota Extraterrestre | ${site.vector.biosphere}% | ${target.vector.biosphere}% | ${100 - Math.abs(site.vector.biosphere - target.vector.biosphere)}% | ${weights.biosphere}% |
| 7. Estructuras Subsuperficie | ASTER Geotérmica / DEM vs. LRO Mini-RF / SHARAD MRO | ${site.vector.subsurface}% | ${target.vector.subsurface}% | ${100 - Math.abs(site.vector.subsurface - target.vector.subsurface)}% | ${weights.subsurface}% |
| 8. Movilidad y Robótica | Pendiente SRTM / RMS Rugosidad vs. Curvature Slope Rover | ${site.vector.robotics}% | ${target.vector.robotics}% | ${100 - Math.abs(site.vector.robotics - target.vector.robotics)}% | ${weights.robotics}% |

---

## 3. EVALUACIÓN CRÍTICA DE LA ANALOGÍA

### 3.1 Analogía Fuerte (Por Qué Coincide)
${scientific.strongAnalogy.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

### 3.2 Dónde se Rompe la Analogía (Where it Breaks Down)
${scientific.breaksDown.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

### 3.3 Límites Planetarios Universales de la Tierra y Mitigación en Ingeniería
${EARTH_PLANETARY_LIMITS.map(
  (lim, idx) => `
#### ${idx + 1}. ${lim.title}
* **Condición Terrestre**: ${lim.earthCondition}
* **Condición Extraterrestre**: ${lim.spaceCondition}
* **Impacto en Ingeniería**: ${lim.engineeringImpact}
* **Estrategia de Mitigación**: ${lim.mitigationStrategy}
`
).join('\n')}

---

## 4. APLICACIONES PARA PREPARACIÓN DE MISIONES (LUNA Y MARTE)
${scientific.explorationCases
  .map(
    (c, idx) => `
### Caso ${idx + 1}: ${c.title}
* **Instrumento o Sistema**: ${c.instrumentOrSystem}
* **Objetivo de Prueba Terrestre**: ${c.objective}
`
  )
  .join('\n')}

---

## 5. DATASETS ESPACIALES EXTRAÍDOS Y TRAZABILIDAD CIENTÍFICA
* **Instrumentación Espacial de Referencia**: ${datasetSummary.instrumentBadge}
* **Modelo Digital de Elevación (DEM)**: ${datasetSummary.demCsvName} (Ruta: \`${datasetSummary.demDownloadUrl}\`)
* **Radiometría Térmica e Inercia**: ${datasetSummary.tempCsvName} (Ruta: \`${datasetSummary.tempDownloadUrl}\`)
* **Resolución y Cobertura**: ${datasetSummary.resolutionInfo}
* **Métricas Geofísicas Extraídas**:
${datasetSummary.metrics.map((m) => `  * ${m.label}: ${m.value}`).join('\n')}
* **Régimen Térmico Extraído**: ${datasetSummary.thermalSummary}
* **Mecánica de Suelos y Sustentación**: ${datasetSummary.bearingCapacityNote}

---
*Informe generado automáticamente por la plataforma Autumn Solara para el NASA International Space Apps Challenge. Datos basados en NASA Earthdata, USGS Astrogeology y modelos abiertos de órbita baja.*
`;
  }, [site, target, pfi, weights, scientific]);

  if (!isOpen || !site || !scientific) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AUTUMN-SOLARA-REPORT-${site.id}-${target.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const pfiDisplay = Math.round(pfi);
  const scoreCol = fidelityColor(pfiDisplay);
  const datasetSummary = getTargetDatasetSummary(target.id);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-xl select-text">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 bg-[#0A0C14] border border-white/10 rounded-2xl max-w-6xl w-full text-[#E8E8EC] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Top Action Header (flex-shrink: 0, fixed at top, never cuts body content) */}
        <div className="px-7 py-5 bg-[#0E0F12] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div>
            <span className="font-sans text-[11px] tracking-wider uppercase text-[#8E9299] block font-medium">
              NASA Space Apps Challenge · Documentación científica
            </span>
            <h3 className="font-sans text-sm md:text-base font-semibold text-white flex items-center gap-2 mt-0.5">
              {activeTab === 'vault' ? (
                <span>Bóveda de Evidencia Científica y Datasets NASA</span>
              ) : (
                <>
                  <span>Informe de Caracterización Analógica —</span>
                  <span className="text-white font-medium">{site.name}</span>
                  <span className="text-white/40">vs.</span>
                  <span className="text-white font-medium">{target.name}</span>
                </>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Switcher Tabs */}
            <div className="inline-flex p-1 rounded-lg bg-[#16171B] border border-white/10 font-sans text-xs">
              <button
                onClick={() => setActiveTab('vault')}
                className={`px-3.5 py-1.5 rounded-md transition-colors font-medium ${
                  activeTab === 'vault'
                    ? 'bg-white text-[#0A0A0C] font-semibold'
                    : 'text-[#8E9299] hover:text-white'
                }`}
              >
                Bóveda de Evidencia y Datasets
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-3.5 py-1.5 rounded-md transition-colors font-medium ${
                  activeTab === 'report'
                    ? 'bg-white text-[#0A0A0C] font-semibold'
                    : 'text-[#8E9299] hover:text-white'
                }`}
              >
                Reporte Escrito (.md)
              </button>
            </div>

            {/* Actions for Written Report View */}
            {activeTab === 'report' && (
              <>
                <button
                  onClick={handleCopy}
                  className={`py-2 px-3.5 rounded-lg font-sans text-xs font-medium transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-white text-[#0A0A0C]'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  }`}
                >
                  <span>{copied ? 'Copiado al portapapeles' : 'Copiar texto'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="py-2 px-4 rounded-lg font-sans text-xs font-semibold bg-white hover:bg-white/90 text-[#0A0A0C] transition-all flex items-center gap-1.5"
                >
                  <span>Descargar informe (.md)</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="py-2 px-3.5 rounded-lg font-sans text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all"
                  title="Imprimir documento o guardar como PDF"
                >
                  <span>Imprimir PDF</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 py-2 px-3 rounded-lg font-sans text-xs font-medium text-[#8E9299] hover:text-white transition-colors border border-transparent hover:border-white/10 hover:bg-white/5"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l8 8M9 1L1 9" />
              </svg>
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        {activeTab === 'vault' ? (
          <div className="flex-1 overflow-y-auto p-7 md:p-9 font-sans text-sm leading-relaxed text-[#D1D5DB]">
            <ScientificEvidenceVault initialFilter={target.id as any} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-7 md:p-9 space-y-8 font-sans text-sm leading-relaxed text-[#D1D5DB] print:p-0 print:text-black">
          {/* Memorandum Top Strip */}
          <div className="py-4 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-sans text-[11px] text-[#8E9299] font-medium block mb-1">
                Documento técnico oficial de caracterización
              </span>
              <h2 className="text-2xl font-semibold text-white">{site.name}</h2>
              <p className="font-mono text-xs text-[#8E929F] mt-1">
                {site.country} · {site.region} · {site.dms} · {site.elevM} m s.n.m.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="font-sans text-[11px] text-[#8E9299] block mb-0.5">
                  Compatibilidad PFI
                </span>
                <span className="font-mono text-xl font-bold text-white tabular-nums">
                  {pfiDisplay}% PFI
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div>
            <h4 className="font-sans text-xs font-semibold text-white uppercase tracking-wider mb-2">
              1. Resumen ejecutivo e identificación del sitio
            </h4>
            <div className="pt-2 border-t border-white/[0.08] space-y-3">
              <p className="text-white/90 leading-relaxed font-light">{site.summary}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="py-2.5 border-t border-white/[0.06]">
                  <span className="text-[#8E9299] font-sans text-xs block mb-0.5">Micro-escala exacta:</span>
                  <p className="text-white font-sans text-sm font-normal">{site.microScale}</p>
                </div>
                <div className="py-2.5 border-t border-white/[0.06]">
                  <span className="text-[#8E9299] font-sans text-xs block mb-0.5">Proceso geofísico activo:</span>
                  <p className="text-white font-sans text-sm font-normal">{site.activeProcess}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Multi-Dataset 8 Dimensions Table */}
          <div>
            <h4 className="font-sans text-xs font-semibold text-white uppercase tracking-wider mb-3">
              2. Metodología multi-dataset y vector de 8 dimensiones NASA
            </h4>
            <div className="overflow-x-auto border-t border-white/[0.08]">
              <table className="w-full text-left font-sans text-xs">
                <thead className="text-[#8E9299] border-b border-white/[0.08]">
                  <tr>
                    <th className="py-3 pr-3 font-medium">Dimensión NASA</th>
                    <th className="py-3 px-3 font-medium">Datasets Cruzados</th>
                    <th className="py-3 px-3 font-medium font-mono">Sitio</th>
                    <th className="py-3 px-3 font-medium font-mono">Objetivo</th>
                    <th className="py-3 pl-3 text-right font-medium">Similitud</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {NASA_PFI_DIMENSIONS.map((dim) => {
                    const siteVal = site.vector[dim.key] ?? 50;
                    const targetVal = target.vector[dim.key] ?? 50;
                    const sim = 100 - Math.abs(siteVal - targetVal);
                    return (
                      <tr key={dim.key} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-3 font-medium text-white">{dim.title}</td>
                        <td className="py-3 px-3 text-[#8E929F] font-light">{dim.datasets}</td>
                        <td className="py-3 px-3 text-white font-mono font-medium">{siteVal}%</td>
                        <td className="py-3 px-3 text-white font-mono font-medium">{targetVal}%</td>
                        <td className="py-3 pl-3 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <span className="font-mono text-sm text-[#F4F4F6] tabular-nums font-medium">
                              {Math.round(sim)}%
                            </span>
                            <div className="w-10 h-[2px] bg-white/10 rounded-full overflow-hidden shrink-0">
                              <div
                                className="h-full bg-white transition-all"
                                style={{ width: `${Math.round(sim)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Critical Scientific Matrix (Open Editorial Grid) */}
          <div className="pt-2">
            <h4 className="font-sans text-xs font-semibold text-white uppercase tracking-wider mb-4">
              3. Evaluación crítica de la analogía
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/[0.08] pt-4">
              {/* Column 1: Alta fidelidad */}
              <div className="space-y-4">
                <span className="font-sans text-xs uppercase tracking-wider text-white font-medium block">
                  Puntos de alta fidelidad analógica
                </span>
                <div className="space-y-3">
                  {scientific.strongAnalogy.map((item, idx) => (
                    <div key={idx} className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-[#52525B] tabular-nums shrink-0 font-medium">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm text-[#CBD5E1] leading-relaxed font-sans font-light">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Límites y ruptura con fine vertical divider */}
              <div className="space-y-4 md:border-l md:border-white/10 md:pl-7">
                <span className="font-sans text-xs uppercase tracking-wider text-white font-medium block">
                  Límites y ruptura de la analogía local
                </span>
                <div className="space-y-3">
                  {scientific.breaksDown.map((item, idx) => (
                    <div key={idx} className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-[#52525B] tabular-nums shrink-0 font-medium">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm text-[#CBD5E1] leading-relaxed font-sans font-light">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Earth Planetary Limits Callout (Open List) */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <span className="font-sans text-xs uppercase tracking-wider text-white font-medium block mb-4">
                Barreras físicas universales de la Tierra y mitigación técnica
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {EARTH_PLANETARY_LIMITS.map((lim, idx) => (
                  <div key={idx} className="pt-3 border-t border-white/[0.08] space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <strong className="text-white text-sm font-sans font-medium">{lim.title}</strong>
                      <span className="font-mono text-[10px] text-[#52525B]">0{idx + 1}</span>
                    </div>
                    <div className="text-[11px] text-[#8E929F] flex gap-3 font-mono py-0.5">
                      <span>Tierra: {lim.earthCondition}</span>
                      <span>·</span>
                      <span>Espacio: {lim.spaceCondition}</span>
                    </div>
                    <p className="text-[#A1A1AA] text-xs leading-relaxed font-light">{lim.engineeringImpact}</p>
                    <p className="text-white/90 text-xs font-mono pt-1">Mitigación: {lim.mitigationStrategy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Hardware & Mission Preparation Cases */}
          <div className="pt-2">
            <h4 className="font-sans text-xs font-semibold text-white uppercase tracking-wider mb-3">
              4. Aplicaciones para preparación de misiones (Luna y Marte)
            </h4>
            <div className="space-y-4 border-t border-white/[0.08] pt-4">
              {scientific.explorationCases.map((c, idx) => (
                <div key={idx} className="pt-3 border-t first:border-t-0 border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <strong className="text-white text-sm font-sans font-medium">{c.title}</strong>
                    <span className="font-mono text-[11px] text-[#8E9299]">
                      TRL 6 a TRL 8
                    </span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] font-light">
                    <strong className="text-white font-medium">Instrumento / Sistema:</strong> {c.instrumentOrSystem}
                  </p>
                  <p className="text-xs text-[#8E929F] font-light">
                    <strong className="text-white font-medium">Objetivo Operacional:</strong> {c.objective}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Extracted NASA Datasets & Soil Mechanics */}
          <div className="pt-2">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              <h4 className="font-sans font-semibold text-white uppercase tracking-wider text-xs">
                5. Datasets espaciales extraídos y trazabilidad científica
              </h4>
              <span className="font-mono text-[11px] text-[#8E9299]">
                {datasetSummary.instrumentBadge}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono border-t border-white/[0.08] pt-4">
              <div className="pt-2 border-t border-white/[0.06] space-y-1">
                <span className="text-[#8E929F] text-[10px] block">TOPOGRAFÍA DEM:</span>
                <span className="text-white block font-medium truncate">{datasetSummary.demCsvName}</span>
                <a href={datasetSummary.demDownloadUrl} download className="text-white underline text-[11px] inline-block mt-0.5">
                  Descargar CSV
                </a>
              </div>
              <div className="pt-2 border-t border-white/[0.06] space-y-1">
                <span className="text-[#8E929F] text-[10px] block">RADIOMETRÍA / INERCIA TÉRMICA:</span>
                <span className="text-white block font-medium truncate">{datasetSummary.tempCsvName}</span>
                <a href={datasetSummary.tempDownloadUrl} download className="text-white underline text-[11px] inline-block mt-0.5">
                  Descargar CSV
                </a>
              </div>
            </div>

            <div className="text-xs text-[#CBD5E1] space-y-1 font-sans pt-3 font-light">
              <p>
                <strong className="text-white font-mono text-[11px] font-medium">Régimen Térmico:</strong> {datasetSummary.thermalSummary}
              </p>
              <p>
                <strong className="text-white font-mono text-[11px] font-medium">Mecánica de Suelos:</strong> {datasetSummary.bearingCapacityNote}
              </p>
            </div>
          </div>

          {/* Footer Sign-off */}
          <div className="pt-6 border-t border-white/10 text-center font-sans text-xs text-[#8E9299]">
            Autumn Solara · NASA International Space Apps Challenge · WGS-84 / Open Data
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
