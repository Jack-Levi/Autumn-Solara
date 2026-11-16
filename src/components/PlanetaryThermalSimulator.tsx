import React, { useState } from 'react';
import {
  COPERNICUS_DIVINER_TEMP,
  SHACKLETON_DIVINER_TEMP,
  JEZERO_TES_THEMIS,
  ALBA_MONS_TES_THEMIS,
} from '../data/nasaExtractedDatasets';

interface PlanetaryThermalSimulatorProps {
  targetId: string;
  targetName: string;
  targetBody: 'Luna' | 'Marte';
  earthSiteName?: string;
  earthMeanTempC?: number;
}

export default function PlanetaryThermalSimulator({
  targetId,
  targetName,
  targetBody,
  earthSiteName = 'Sitio Análogo Terrestre',
  earthMeanTempC = 18,
}: PlanetaryThermalSimulatorProps) {
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(12); // Default to noon (12:00)
  const [shackletonPsrView, setShackletonPsrView] = useState<boolean>(targetId === 'MOON-SHK');

  const isMoon = targetBody === 'Luna';

  // Lunar data
  const lunarHourData = COPERNICUS_DIVINER_TEMP[selectedHourIndex] || COPERNICUS_DIVINER_TEMP[12];
  const psrAveragePoint = SHACKLETON_DIVINER_TEMP.find((p) => p.isPsr) || SHACKLETON_DIVINER_TEMP[25];

  // Martian data
  const marsDataArray = targetId === 'MARS-ALB' ? ALBA_MONS_TES_THEMIS : JEZERO_TES_THEMIS;
  const marsHourData = marsDataArray[selectedHourIndex] || marsDataArray[12];
  const isAlbaMons = targetId === 'MARS-ALB';

  // Earth analog comparison baseline
  // Atmospheric diurnal range: +-10 deg C from mean
  const hourFrac = selectedHourIndex / 24;
  const earthSimulatedTempC = Math.round(
    earthMeanTempC + 10 * Math.sin((hourFrac - 0.25) * Math.PI * 2)
  );

  // Active space temperature values
  const spaceTempC = isMoon
    ? shackletonPsrView && targetId === 'MOON-SHK'
      ? psrAveragePoint.tWinterMinC
      : lunarHourData.tempC
    : marsHourData.tempC;

  const spaceTempK = isMoon
    ? shackletonPsrView && targetId === 'MOON-SHK'
      ? psrAveragePoint.tWinterMinK
      : lunarHourData.tempK
    : marsHourData.tempK;

  const thermalDeltaC = Math.round(spaceTempC - earthSimulatedTempC);

  return (
    <div className="bg-[#0A0C14] rounded-3xl p-6 md:p-8 border border-white/10 text-white select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[11px] font-medium tracking-wider uppercase text-[#8E9299]">
              {isMoon
                ? 'LRO Diviner Lunar Radiometer (DLRE): Ciclo diurno 24 horas'
                : 'MGS TES y Mars Odyssey THEMIS: Inercia térmica y emisión IR'}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {isMoon
              ? `Simulador térmico diurno de ${targetName}`
              : `Telemetría térmica e inercia de suelos de ${targetName}`}
          </h3>
        </div>

        {/* Mode Switcher for Shackleton PSR */}
        {targetId === 'MOON-SHK' && (
          <div className="flex items-center bg-black/40 p-1 rounded-full border border-white/10 font-sans text-xs">
            <button
              onClick={() => setShackletonPsrView(false)}
              className={`px-3 py-1 rounded-full transition-colors ${
                !shackletonPsrView ? 'bg-white text-[#0A0A0C] font-semibold' : 'text-[#8E9299] hover:text-white'
              }`}
            >
              Borde iluminado (ciclo)
            </button>
            <button
              onClick={() => setShackletonPsrView(true)}
              className={`px-3 py-1 rounded-full transition-colors ${
                shackletonPsrView ? 'bg-white text-[#0A0A0C] font-semibold' : 'text-[#8E9299] hover:text-white'
              }`}
            >
              Fondo PSR (sombra -235 °C)
            </button>
          </div>
        )}
      </div>

      {/* Main Interactive Solar Hour Slider */}
      {(!shackletonPsrView || targetId !== 'MOON-SHK') && (
        <div className="bg-[#121316] p-5 rounded-2xl border border-white/10 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="font-sans text-xs text-[#8E9299] uppercase tracking-wider">
              Hora solar local ({isMoon ? 'lunar LST' : 'marciana LTST'}):
            </span>
            <div className="font-mono text-base font-bold text-white px-3 py-0.5 rounded-lg bg-black/50 border border-white/10">
              {isMoon ? lunarHourData.hour : marsHourData.hour} horas
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={23}
            step={1}
            value={selectedHourIndex}
            onChange={(e) => setSelectedHourIndex(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex justify-between font-mono text-[10px] text-[#6B6F7B] mt-2">
            <span>00:00 (Medianoche profunda)</span>
            <span>06:00 (Amanecer rasante)</span>
            <span>12:00 (Cenit solar máximo)</span>
            <span>18:00 (Ocaso térmico)</span>
            <span>23:00 (Enfriamiento nocturno)</span>
          </div>
        </div>
      )}

      {/* Dual Telemetry Cards: Space vs. Earth Analog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Space Target Box */}
        <div
          className="p-5 rounded-2xl border border-white/10 bg-[#121316] relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#8E929F] block">
                Lectura superficial extraterrestre
              </span>
              <strong className="text-lg text-white font-bold">{targetName}</strong>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-md font-bold uppercase bg-white/10 text-white border border-white/15">
              {isMoon ? 'Diviner DLRE' : 'TES / THEMIS'}
            </span>
          </div>

          {/* Temperature Value */}
          <div className="flex items-baseline gap-3 my-2">
            <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {spaceTempC > 0 ? `+${spaceTempC.toFixed(1)}` : spaceTempC.toFixed(1)}°C
            </span>
            <span className="font-mono text-sm text-[#8E929F]">
              ({spaceTempK.toFixed(1)} K)
            </span>
          </div>

          {/* Contextual Technical Metrics */}
          <div className="font-mono text-xs space-y-1.5 mt-4 pt-3 border-t border-white/10">
            {isMoon ? (
              shackletonPsrView && targetId === 'MOON-SHK' ? (
                <>
                  <div className="flex justify-between text-[#8E929F]">
                    <span>RÉGIMEN:</span>
                    <span className="text-white font-bold">SOMBRA PERMANENTE (PSR)</span>
                  </div>
                  <div className="flex justify-between text-[#8E929F]">
                    <span>ESTABILIDAD DE HIELO H₂O:</span>
                    <span className="text-white font-bold">ESTABLE CRÓNICO (&lt;110 K)</span>
                  </div>
                  <div className="flex justify-between text-[#8E929F]">
                    <span>ILUMINACIÓN SOLAR:</span>
                    <span className="text-white">0.0% (Oscuridad perpetua)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-[#8E929F]">
                    <span>INCIDENCIA SOLAR:</span>
                    <span className="text-white font-bold">{lunarHourData.solarIncDeg.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between text-[#8E929F]">
                    <span>DIVINER CANAL 7 (25-41 µm):</span>
                    <span className="text-white">{lunarHourData.ch7K.toFixed(1)} K</span>
                  </div>
                  <div className="flex justify-between text-[#8E929F]">
                    <span>DIVINER CANAL 8 (50-100 µm):</span>
                    <span className="text-white">{lunarHourData.ch8K.toFixed(1)} K</span>
                  </div>
                </>
              )
            ) : (
              <>
                <div className="flex justify-between text-[#8E929F]">
                  <span>INERCIA TÉRMICA DERIVADA:</span>
                  <span className="text-white font-bold">
                    {marsHourData.thermalInertia} J m⁻² K⁻¹ s^-0.5
                  </span>
                </div>
                <div className="flex justify-between text-[#8E929F]">
                  <span>THEMIS DÍA IR:</span>
                  <span className="text-white">
                    {marsHourData.themisDayK ? `${marsHourData.themisDayK} K` : 'N/A (Noche)'}
                  </span>
                </div>
                <div className="flex justify-between text-[#8E929F]">
                  <span>THEMIS NOCHE IR:</span>
                  <span className="text-white">
                    {marsHourData.themisNightK ? `${marsHourData.themisNightK} K` : 'N/A (Día)'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Earth Analog Box */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#121316] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#8E929F] block">
                  Análogo terrestre comparado
                </span>
                <strong className="text-lg text-white font-bold">{earthSiteName}</strong>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white/10 text-white font-bold">
                1 atmósfera
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {earthSimulatedTempC > 0 ? `+${earthSimulatedTempC}` : earthSimulatedTempC}°C
              </span>
              <span className="font-mono text-sm text-[#8E929F]">
                ({(earthSimulatedTempC + 273.15).toFixed(1)} K)
              </span>
            </div>

            <div className="font-mono text-xs space-y-1.5 mt-4 pt-3 border-t border-white/10 text-[#8E929F]">
              <div className="flex justify-between">
                <span>AMORTIGUAMIENTO ATMOSFÉRICO:</span>
                <span className="text-white font-bold">Efecto invernadero natural</span>
              </div>
              <div className="flex justify-between">
                <span>PRESIÓN EN SUPERFICIE:</span>
                <span className="text-white font-bold">101.3 kPa (vs {isMoon ? 'Vacío 10⁻¹²' : '0.6 kPa'})</span>
              </div>
            </div>
          </div>

          {/* Thermal Shock / Divergence Delta Pill */}
          <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-xs flex items-center justify-between">
            <span className="text-[#8E929F]">DISCREPANCIA TÉRMICA DIRECTA:</span>
            <strong className="text-sm font-bold text-white">
              {thermalDeltaC > 0 ? `+${thermalDeltaC}` : thermalDeltaC} °C de delta
            </strong>
          </div>
        </div>
      </div>

      {/* Martian Soil Mechanics & Thermal Inertia Analysis Banner */}
      {!isMoon && (
        <div className="p-5 rounded-2xl bg-[#121316] border border-white/10 space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-white font-bold tracking-wide uppercase">
            <span>Evaluación de mecánica de suelos: TES Thermal Inertia</span>
          </div>
          <p className="text-[#CBD5E1] text-xs leading-relaxed font-sans">
            {isAlbaMons ? (
              <>
                <strong className="text-white font-mono">Alba Mons (145 J m⁻² K⁻¹ s^-0.5):</strong> Inercia térmica ultrabaja representativa de un manto continuo de polvo basáltico ultrafino (&lt;10 µm) altamente aislante. Cohesión casi nula y baja capacidad portante. <span className="text-white font-medium">Riesgo crítico de hundimiento (sinkage) de ruedas en rovers; se recomiendan ensayos de neumáticos de resorte helicoidal (NASA Spring Tire).</span>
              </>
            ) : (
              <>
                <strong className="text-white font-mono">Cráter Jezero (320 J m⁻² K⁻¹ s^-0.5):</strong> Inercia térmica moderada-alta representativa de lechos fluviales deltaicos con gravas, arenas gruesas y duricrust cementado. <span className="text-white font-medium">Excelente capacidad de soporte portante para rovers de seis ruedas clase 1,025 kg (Perseverance / Curiosity) con bajo riesgo de atrapamiento.</span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Lunar Thermal Vacuum Analysis Banner */}
      {isMoon && (
        <div className="p-5 rounded-2xl bg-[#121316] border border-white/10 space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-white font-bold tracking-wide uppercase">
            <span>Física del vacío lunar: LRO Diviner DLRE</span>
          </div>
          <p className="text-[#CBD5E1] text-xs leading-relaxed font-sans">
            Al no existir atmósfera, la temperatura lunar está gobernada exclusivamente por balance radiativo puro de Stefan-Boltzmann: <strong className="text-white">oscilación de delta 290 K (+112 °C al cenit solar vs -178 °C en la noche lunar)</strong>. Esta fatiga térmica extrema es el principal factor de fractura en juntas mecánicas y degradación de sellos elastoméricos en trajes de astronautas y rovers de Artemis.
          </p>
        </div>
      )}
    </div>
  );
}
