import React, { useState } from 'react';
import { EXTRACTED_DATASETS_REGISTRY } from '../data/nasaExtractedDatasets';
import type { ExtractedDatasetMetadata } from '../data/nasaExtractedDatasets';
import ScientificEvidenceVault from './ScientificEvidenceVault';

interface DatasetExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetFilter?: 'all' | 'Luna' | 'Marte';
}

export default function DatasetExtractionModal({
  isOpen,
  onClose,
  initialTargetFilter = 'all',
}: DatasetExtractionModalProps) {
  const [viewMode, setViewMode] = useState<'vault' | 'inspector'>('vault');
  const [filter, setFilter] = useState<'all' | 'Luna' | 'Marte'>(initialTargetFilter);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(
    EXTRACTED_DATASETS_REGISTRY[0].id
  );

  if (!isOpen) return null;

  const filteredDatasets = EXTRACTED_DATASETS_REGISTRY.filter(
    (d) => filter === 'all' || d.body === filter
  );

  const selectedDataset: ExtractedDatasetMetadata =
    EXTRACTED_DATASETS_REGISTRY.find((d) => d.id === selectedDatasetId) ||
    EXTRACTED_DATASETS_REGISTRY[0];

  return (
    <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 select-none">
      <div
        className="bg-[#0C0E17] border border-white/15 w-full max-w-6xl max-h-[88vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Top Header (flex-shrink: 0, fixed at top) */}
        <div className="px-7 py-5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4 bg-[#0E0F12] shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[11px] font-medium text-[#8E9299] tracking-wider uppercase">
                Repositorio científico oficial — NASA Space Apps Challenge
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
              {viewMode === 'vault'
                ? 'Bóveda de Evidencia Científica y Datasets NASA'
                : 'Metodología de Extracción y Descarga de Datasets'}
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Switcher */}
            <div className="inline-flex p-1 rounded-lg bg-[#16171B] border border-white/10 font-sans text-xs">
              <button
                onClick={() => setViewMode('vault')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'vault'
                    ? 'bg-white text-[#0A0A0C] font-semibold'
                    : 'text-[#8E9299] hover:text-white'
                }`}
              >
                Bóveda y Matriz (14 Sitios)
              </button>
              <button
                onClick={() => setViewMode('inspector')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'inspector'
                    ? 'bg-white text-[#0A0A0C] font-semibold'
                    : 'text-[#8E9299] hover:text-white'
                }`}
              >
                Inspector Individual (8 Datasets)
              </button>
            </div>

            {/* Filter buttons as Segmented Control (only in Inspector mode) */}
            {viewMode === 'inspector' && (
              <div className="inline-flex p-1 rounded-lg bg-[#16171B] border border-white/10 font-sans text-xs">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    filter === 'all'
                      ? 'bg-white text-[#0A0A0C] font-semibold'
                      : 'text-[#8E9299] hover:text-white'
                  }`}
                >
                  Todos (8)
                </button>
                <button
                  onClick={() => setFilter('Luna')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    filter === 'Luna'
                      ? 'bg-white text-[#0A0A0C] font-semibold'
                      : 'text-[#8E9299] hover:text-white'
                  }`}
                >
                  Luna (4)
                </button>
                <button
                  onClick={() => setFilter('Marte')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    filter === 'Marte'
                      ? 'bg-white text-[#0A0A0C] font-semibold'
                      : 'text-[#8E9299] hover:text-white'
                  }`}
                >
                  Marte (4)
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-sans text-xs font-medium text-[#8E9299] hover:text-white transition-colors border border-white/10 hover:border-white/20 hover:bg-white/5"
              aria-label="Cerrar modal"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l8 8M9 1L1 9" />
              </svg>
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* Methodology Notice Banner (only in Inspector mode) */}
        {viewMode === 'inspector' && (
          <div className="px-7 py-3 bg-[#111317] border-b border-white/[0.06] font-sans text-xs text-[#94A3B8] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">Orígenes certificados:</span>
              <span>NASA Solar System Treks · LRO LOLA · LRO Diviner (DLRE) · MGS MOLA · Mars Odyssey THEMIS · MGS TES</span>
            </div>
            <span className="text-[#8E9299] text-[11px] font-mono">8 series extraídas en CSV UTF-8</span>
          </div>
        )}

        {/* Content Body */}
        {viewMode === 'vault' ? (
          <div className="flex-1 overflow-y-auto p-7 md:p-9 font-sans text-sm leading-relaxed text-[#D1D5DB]">
            <ScientificEvidenceVault
              initialFilter={
                initialTargetFilter === 'Luna'
                  ? 'MOON-SHK'
                  : initialTargetFilter === 'Marte'
                  ? 'MARS-JEZ'
                  : 'all'
              }
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Left Column: Dataset List */}
            <div className="md:col-span-5 p-5 md:p-6 space-y-2.5 overflow-y-auto">
            <span className="font-sans text-[11px] text-[#8E9299] uppercase tracking-wider block mb-2 font-medium">
              Selecciona un dataset para inspeccionar
            </span>

            {filteredDatasets.map((ds) => {
              const isSelected = ds.id === selectedDataset.id;

              return (
                <div
                  key={ds.id}
                  onClick={() => setSelectedDatasetId(ds.id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'bg-[#18191E] border-white/30 shadow-none'
                      : 'bg-[#0E1014] border-white/5 hover:border-white/20 hover:bg-[#141519]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/15">
                      {ds.body} — {ds.id}
                    </span>
                    <span className="font-mono text-[10px] text-[#8E9299]">.CSV</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white leading-snug mb-1">
                    {ds.name}
                  </h4>

                  <p className="font-sans text-[11px] text-[#8E9299] truncate font-light">
                    {ds.instrument}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Scientific Inspector */}
          <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="font-mono text-xs px-2.5 py-1 rounded-md font-medium bg-white/15 text-white border border-white/20">
                  {selectedDataset.id}
                </span>
                <span className="font-sans text-xs text-[#8E9299]">
                  Cuerpo: {selectedDataset.body}
                </span>
              </div>

              <h3 className="text-2xl font-semibold text-white mb-4">
                {selectedDataset.name}
              </h3>

              {/* Technical Specifications Grid (Open Editorial Lines) */}
              <div className="border-t border-b border-white/[0.08] my-4 divide-y divide-white/[0.06] font-sans text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-[#8E9299]">Instrumento:</span>
                  <span className="text-white font-medium text-right">{selectedDataset.instrument}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#8E9299]">Resolución / Transecto:</span>
                  <span className="text-white font-medium text-right font-mono">{selectedDataset.resolution}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#8E9299]">Nombre de archivo:</span>
                  <span className="text-[#E2E4EC] text-right truncate max-w-[280px] font-mono">
                    {selectedDataset.csvFileName}
                  </span>
                </div>
              </div>

              {/* Scientific Context */}
              <div className="mb-4">
                <span className="font-sans text-xs font-semibold text-white uppercase tracking-wider block mb-1">
                  Contexto geocientífico:
                </span>
                <p className="text-sm text-[#CBD5E1] leading-relaxed font-light">
                  {selectedDataset.scientificContext}
                </p>
              </div>

              {/* Engineering Relevance */}
              <div className="mb-6">
                <span className="font-sans text-xs font-semibold text-white uppercase tracking-wider block mb-1">
                  Relevancia de ingeniería y misiones Artemis / Mars:
                </span>
                <p className="text-sm text-[#CBD5E1] leading-relaxed font-light">
                  {selectedDataset.engineeringRelevance}
                </p>
              </div>
            </div>

            {/* Direct Download Action Bar */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="font-mono text-[11px] text-[#8E9299]">
                <span>RUTA: </span>
                <code className="text-white bg-black/40 px-2 py-1 rounded">
                  {selectedDataset.csvDownloadPath}
                </code>
              </div>

              <a
                href={selectedDataset.csvDownloadPath}
                download={selectedDataset.csvFileName}
                className="bg-white hover:bg-white/90 text-[#0A0A0C] px-5 py-2.5 rounded-lg font-sans text-xs font-semibold transition-all shadow-none flex items-center gap-2 border border-white/20"
              >
                <span>Descargar archivo CSV</span>
              </a>
            </div>
          </div>
        </div>
        )}

        {/* Modal Footer */}
        <div className="px-7 py-3.5 bg-[#0A0C10] border-t border-white/10 flex flex-wrap items-center justify-between text-xs font-sans text-[#8E9299] shrink-0">
          <span>NASA Planetary Data System (PDS) & Solar System Treks API</span>
          <button
            onClick={onClose}
            className="text-white hover:underline transition-colors font-medium"
          >
            Cerrar panel
          </button>
        </div>
      </div>
    </div>
  );
}
