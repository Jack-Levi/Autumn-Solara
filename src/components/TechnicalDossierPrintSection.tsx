import React, { useMemo } from 'react';
import type { EarthSite, ExtraTerrestrialTarget, PFIWeights } from '../data';
import { NASA_PFI_DIMENSIONS, fidelityLabel } from '../data';
import { SITE_SCIENTIFIC_DATA, EARTH_PLANETARY_LIMITS } from '../scientificData';
import { getTargetDatasetSummary } from '../data/nasaExtractedDatasets';

interface TechnicalDossierPrintSectionProps {
  site: EarthSite;
  activeTarget: ExtraTerrestrialTarget;
  weights: PFIWeights;
  pfi: number;
}

export default function TechnicalDossierPrintSection({
  site,
  activeTarget,
  weights,
  pfi,
}: TechnicalDossierPrintSectionProps) {
  const dateStr = useMemo(
    () =>
      new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const scientific = useMemo(
    () =>
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
      },
    [site]
  );

  const datasetSummary = useMemo(
    () => getTargetDatasetSummary(activeTarget.id),
    [activeTarget.id]
  );

  const pfiDisplay = Math.round(pfi);

  return (
    <section id="technical-dossier-print-section" className="print-dossier-root">
      {/* ── 1. Official Header ── */}
      <header className="print-dossier-header border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-600 block">
              NASA International Space Apps Challenge — Documentación Científica Oficial
            </span>
            <h1 className="text-2xl font-bold font-serif tracking-tight text-black mt-1">
              Expediente Técnico de Validación Análoga
            </h1>
            <p className="text-xs text-neutral-700 mt-1">
              Evaluación geocientífica y física de fidelidad — {site.name} ({site.id}) vs. {activeTarget.name} ({activeTarget.body})
            </p>
          </div>
          <div className="text-right font-mono text-[10px] text-neutral-600 shrink-0 space-y-0.5">
            <div>DOC: AUTUMN-SOLARA-REP-{site.id}-{activeTarget.id}</div>
            <div>FECHA: {dateStr}</div>
            <div>FIDELIDAD PFI: {pfiDisplay}% ({fidelityLabel(pfiDisplay).toUpperCase()})</div>
          </div>
        </div>
      </header>

      {/* ── 2. Executive Summary & Geodetic Profile ── */}
      <section className="print-block mb-6">
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-black border-b border-black/20 pb-1 mb-2">
          1. Resumen Ejecutivo y Perfil Geodésico del Sitio
        </h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[10px] text-neutral-700 mb-3 bg-neutral-50 p-3 border border-neutral-300">
          <div><strong className="text-black">Identificador de Catálogo:</strong> {site.id}</div>
          <div><strong className="text-black">Bioma Terrestre:</strong> {site.biome}</div>
          <div><strong className="text-black">Ubicación Geográfica:</strong> {site.country} — {site.region}</div>
          <div><strong className="text-black">Micro-Escala Morfológica:</strong> {site.microScale}</div>
          <div><strong className="text-black">Coordenadas Geodésicas:</strong> {site.dms} (Lat: {site.lat}°, Lng: {site.lng}°)</div>
          <div><strong className="text-black">Proceso Geofísico Activo:</strong> {site.activeProcess}</div>
          <div><strong className="text-black">Elevación Topográfica SRTM:</strong> {site.elevM} m s.n.m.</div>
          <div><strong className="text-black">Pendiente y Rugosidad:</strong> {site.slopeDeg}° / RMS: {site.roughnessRms}</div>
        </div>
        <p className="text-xs text-neutral-800 leading-relaxed text-justify">
          {site.summary}
        </p>
      </section>

      {/* ── 3. NASA 8-Dimension Correlation Matrix ── */}
      <section className="print-block mb-6">
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-black border-b border-black/20 pb-1 mb-2">
          2. Metodología Multi-Dataset y Vector de 8 Dimensiones NASA
        </h2>
        <table className="print-table w-full">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Dimensión NASA</th>
              <th style={{ width: '32%' }}>Datasets Cruzados Terrestre vs. Espacial</th>
              <th style={{ width: '11%', textAlign: 'center' }}>Sitio</th>
              <th style={{ width: '11%', textAlign: 'center' }}>{activeTarget.name}</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Afinidad</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Peso PFI</th>
            </tr>
          </thead>
          <tbody>
            {NASA_PFI_DIMENSIONS.map((dim) => {
              const sVal = site.vector[dim.key];
              const tVal = activeTarget.vector[dim.key];
              const affinity = Math.max(0, 100 - Math.abs(sVal - tVal));
              const wVal = weights[dim.key];
              return (
                <tr key={dim.key}>
                  <td className="font-semibold text-black">{dim.title}</td>
                  <td className="font-mono text-[9px] text-neutral-600">{dim.datasets}</td>
                  <td className="font-mono text-center">{sVal}%</td>
                  <td className="font-mono text-center">{tVal}%</td>
                  <td className="font-mono text-center font-bold text-black">{affinity}%</td>
                  <td className="font-mono text-center text-neutral-600">{wVal}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* ── 4. Critical Analogy Breakdown ── */}
      <section className="print-block mb-6">
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-black border-b border-black/20 pb-1 mb-2">
          3. Evaluación Crítica de la Analogía
        </h2>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-neutral-50 border border-neutral-300">
            <h3 className="font-bold text-[10px] uppercase tracking-wider text-black mb-1.5">
              Convergencias Físicas y Químicas (Analogía Fuerte)
            </h3>
            <ul className="space-y-1.5 text-[10px] text-neutral-800 leading-snug">
              {scientific.strongAnalogy.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="font-mono font-bold text-black shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-300">
            <h3 className="font-bold text-[10px] uppercase tracking-wider text-black mb-1.5">
              Divergencias Críticas (Dónde se Rompe la Analogía)
            </h3>
            <ul className="space-y-1.5 text-[10px] text-neutral-800 leading-snug">
              {scientific.breaksDown.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="font-mono font-bold text-black shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 5. Universal Earth Planetary Limits & Mitigation ── */}
      <section className="print-block mb-6">
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-black border-b border-black/20 pb-1 mb-2">
          4. Límites Planetarios Universales Terrestres y Mitigación en Ingeniería
        </h2>
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          {EARTH_PLANETARY_LIMITS.map((lim, idx) => (
            <div key={lim.id} className="p-2.5 bg-neutral-50 border border-neutral-300">
              <div className="font-bold uppercase tracking-wider text-black text-[10px] mb-1">
                {idx + 1}. {lim.title}
              </div>
              <div className="text-neutral-700 leading-tight space-y-0.5">
                <div><span className="font-semibold text-neutral-900">Condición Terrestre:</span> {lim.earthCondition}</div>
                <div><span className="font-semibold text-neutral-900">Condición Espacial:</span> {lim.spaceCondition}</div>
                <div><span className="font-semibold text-neutral-900">Impacto en Ingeniería:</span> {lim.engineeringImpact}</div>
                <div className="italic text-neutral-800 pt-0.5"><span className="font-semibold not-italic text-black">Mitigación:</span> {lim.mitigationStrategy}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Mission Preparation & TRL Protocols ── */}
      {scientific.explorationCases && scientific.explorationCases.length > 0 && (
        <section className="print-block mb-6">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-black border-b border-black/20 pb-1 mb-2">
            5. Aplicaciones para Preparación de Misiones (Protocolos TRL 6-8)
          </h2>
          <div className="space-y-2">
            {scientific.explorationCases.map((c, i) => (
              <div key={i} className="p-2.5 border border-neutral-300 bg-neutral-50 text-[10px] text-neutral-800">
                <div className="flex justify-between items-baseline mb-0.5">
                  <strong className="text-black text-[11px]">{c.title}</strong>
                  <span className="font-mono text-neutral-600 font-medium">{c.instrumentOrSystem}</span>
                </div>
                <p className="leading-snug text-neutral-700">{c.objective}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 7. Extracted Planetary Datasets ── */}
      <section className="print-block mb-6">
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-black border-b border-black/20 pb-1 mb-2">
          6. Trazabilidad Científica y Datasets Espaciales Extraídos
        </h2>
        <div className="grid grid-cols-2 gap-3 text-[10px] bg-neutral-50 p-3 border border-neutral-300">
          <div><strong className="text-black">Instrumentación Orbital de Referencia:</strong> {datasetSummary.instrumentBadge}</div>
          <div><strong className="text-black">Resolución y Cobertura:</strong> {datasetSummary.resolutionInfo}</div>
          <div><strong className="text-black">Modelo Digital de Elevación (DEM):</strong> {datasetSummary.demCsvName}</div>
          <div><strong className="text-black">Radiometría e Inercia Térmica:</strong> {datasetSummary.tempCsvName}</div>
          <div className="col-span-2"><strong className="text-black">Régimen Térmico:</strong> {datasetSummary.thermalSummary}</div>
          <div className="col-span-2"><strong className="text-black">Mecánica de Suelos y Sustentación:</strong> {datasetSummary.bearingCapacityNote}</div>
        </div>
      </section>

      {/* ── 8. Official Certification Footer ── */}
      <footer className="print-block border-t border-black/40 pt-3 text-[9px] font-mono text-neutral-600 flex justify-between items-center">
        <span>AUTUMN SOLARA // NASA INTERNATIONAL SPACE APPS CHALLENGE</span>
        <span>DATOS ABIERTOS NASA EARTHDATA / USGS / ARTEMIS / MARS 2020</span>
        <span>CERTIFICACIÓN CIENTÍFICA V2</span>
      </footer>
    </section>
  );
}
