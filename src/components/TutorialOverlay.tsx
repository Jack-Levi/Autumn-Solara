import React, { useState, useEffect } from 'react';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToSection?: (sectionId: string) => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: 'Paso 1: Elige tu Destino Espacial',
    desc: 'Selecciona una de las 4 misiones extraterrestres (Polo Sur Lunar, Mare Tranquillitatis, Cráter Jezero o Arcadia Planitia). Cada destino calibra en tiempo real los algoritmos de compatibilidad.',
    actionLabel: 'Ver Cartas de Misión',
    targetSection: 'missions-section',
  },
  {
    step: 2,
    title: 'Paso 2: Explorador Satelital Real',
    desc: 'Navega por la Tierra desde el espacio usando imágenes satelitales Esri y de relieve topográfico sin restricciones de API Key. Haz clic en los marcadores para sobrevolar cráteres reales.',
    actionLabel: 'Ir al Mapa Satelital',
    targetSection: 'satellite-section',
  },
  {
    step: 3,
    title: 'Paso 3: Comparador Fotográfico Deslizable',
    desc: 'Abre cualquier sitio análogo para activar la cortina interactiva: arrastra el divisor para ver cara a cara las fotos reales de la Tierra frente a las fotos de los rovers y sondas de la NASA.',
    actionLabel: 'Explorar Galería',
    targetSection: 'gallery-section',
  },
  {
    step: 4,
    title: 'Paso 4: Calibración PFI & Nuevos Candidatos',
    desc: 'Usa el Dock Flotante para priorizar Topografía, Geología, Clima o Recursos ISRU según las necesidades de tu misión, o descubre zonas grises satelitales como El Pinacate o la Puna.',
    actionLabel: 'Finalizar y Explorar',
    targetSection: 'missions-section',
  },
];

export default function TutorialOverlay({
  isOpen,
  onClose,
  onJumpToSection,
}: TutorialOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1 = Welcome Card

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartTour = () => {
    setCurrentStepIndex(0);
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (onJumpToSection && TOUR_STEPS[nextIndex].targetSection) {
        onJumpToSection(TOUR_STEPS[nextIndex].targetSection);
      }
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      if (onJumpToSection && TOUR_STEPS[prevIndex].targetSection) {
        onJumpToSection(TOUR_STEPS[prevIndex].targetSection);
      }
    } else {
      setCurrentStepIndex(-1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* 1. WELCOME CARD (Step -1) */}
      {currentStepIndex === -1 ? (
        <div className="relative z-10 bg-[#0F1015] border border-[rgba(255,255,255,0.12)] rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-[#2544FF]/20 border border-[#2544FF] flex items-center justify-center mx-auto mb-4 text-[#2544FF] font-bold text-xl">
            T
          </div>

          <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B6F7B] block mb-2">
            ONBOARDING // SYS-04
          </span>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            Bienvenido a TERRA—ANALOG™
          </h2>

          <p className="text-sm text-[#8E929F] leading-relaxed mb-6 font-light">
            Una plataforma de exploración planetaria y cartografía científica que compara los
            lugares más extremos de la Tierra con futuros sitios de aterrizaje en la Luna y Marte.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartTour}
              className="pill-btn pill-btn-cobalt w-full justify-center py-3 text-xs"
            >
              Iniciar Tour Guiado (4 Pasos · 30s) →
            </button>
            <button
              onClick={onClose}
              className="text-xs font-mono text-[#6B6F7B] hover:text-white transition-colors py-2"
            >
              Saltar Tutorial e Ir a la Plataforma
            </button>
          </div>
        </div>
      ) : (
        /* 2. STEP CARD (Step 0 to 3) */
        <div className="relative z-10 bg-[#0F1015] border border-[#2544FF]/50 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-[#2544FF] font-bold bg-[#2544FF]/10 px-3 py-1 rounded-full border border-[#2544FF]/30">
              PASO {TOUR_STEPS[currentStepIndex].step} DE {TOUR_STEPS.length}
            </span>
            <button
              onClick={onClose}
              className="text-xs font-mono text-[#6B6F7B] hover:text-white transition-colors"
            >
              Cerrar (Esc) [X]
            </button>
          </div>

          {/* Title & Desc */}
          <h3 className="text-xl font-bold text-white mb-2">
            {TOUR_STEPS[currentStepIndex].title}
          </h3>
          <p className="text-sm text-[#8E929F] leading-relaxed mb-6 font-light">
            {TOUR_STEPS[currentStepIndex].desc}
          </p>

          {/* Step Indicator Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {TOUR_STEPS.map((s, idx) => (
              <span
                key={s.step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-8 bg-[#2544FF]'
                    : 'w-2 bg-[rgba(255,255,255,0.2)]'
                }`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[rgba(255,255,255,0.08)]">
            <button
              onClick={handlePrev}
              className="pill-btn pill-btn-dark py-2 px-4 text-xs"
            >
              ← Anterior
            </button>

            <button
              onClick={handleNext}
              className="pill-btn pill-btn-cobalt py-2 px-5 text-xs"
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? '¡Finalizar!' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
