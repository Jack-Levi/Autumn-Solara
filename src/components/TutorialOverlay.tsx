import React, { useState, useEffect } from 'react';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToSection?: (sectionId: string) => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: 'Misiones Destino (Luna y Marte)',
    desc: 'Las 4 cartas de misión en abanico 3D definen las condiciones ambientales objetivo: Polo Sur Lunar (Cráter Shackleton), Tubos de Lava en Mare Tranquillitatis, Cráter Jezero o Arcadia Planitia en Marte.',
    targetSection: 'missions-section',
  },
  {
    step: 2,
    title: 'Calibración PFI de 8 Dimensiones NASA',
    desc: 'El botón superior CALIBRAR PFI despliega el motor de las 8 dimensiones oficiales de la NASA. Ajusta los controles de geología, pendientes, régimen térmico o hielo ISRU para recalcular los índices de fidelidad en vivo.',
    targetSection: 'missions-section',
  },
  {
    step: 3,
    title: 'Galería de Análogos y Estudio "Dive-In"',
    desc: 'Haz clic en cualquiera de las 14 tarjetas geológicas para desplegar el estudio inmersivo: carrusel con Motion Blur dinámico, cortina fotográfica deslizable (Tierra vs. Rover espacial) y matriz de "Dónde se rompe la analogía".',
    targetSection: 'gallery-section',
  },
  {
    step: 4,
    title: 'Mapa Orbital NASA GIBS y Escáner en Vivo',
    desc: 'Alterna entre capas térmicas NASA MODIS WMTS, relieve SRTM e imágenes ópticas. Activa el Modo Escáner y haz clic en cualquier coordenada terrestre para consultar elevación SRTM y atmósfera real, discriminando océanos y continentes.',
    targetSection: 'satellite-section',
  },
  {
    step: 5,
    title: 'Telemetría de Rover y Transectos Altimétricos',
    desc: 'Conduce el rover con inercia física (lerp) sobre los perfiles topográficos reales de LOLA y MOLA para evaluar pendientes, riesgo de vuelco (>15°), esfuerzo de tracción y dónde se rompen los análogos terrestres.',
    targetSection: 'gravity-section',
  },
];

export default function TutorialOverlay({
  isOpen,
  onClose,
  onJumpToSection,
}: TutorialOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1 = Welcome card

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
    if (onJumpToSection) {
      onJumpToSection(TOUR_STEPS[0].targetSection);
    }
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* 1. WELCOME CARD (Step -1) */}
      {currentStepIndex === -1 ? (
        <div className="relative z-10 bg-[#0A0C14] border border-[rgba(255,255,255,0.12)] rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 text-white font-sans font-semibold text-lg">
            A
          </div>

          <span className="font-sans text-[11px] uppercase tracking-wider text-[#8E9299] block mb-2 font-medium">
            Onboarding científico: NASA Space Apps
          </span>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            Guía Interactiva de Autumn Solara
          </h2>

          <p className="text-sm text-[#8E929F] leading-relaxed mb-6 font-light">
            Recorre en 5 pasos esenciales la arquitectura de caracterización: desde la selección del objetivo extraterrestre y la calibración multivariable de 8 dimensiones hasta el escaneo orbital en tiempo real y el reporte técnico exportable.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartTour}
              className="py-3 px-6 rounded-full font-sans text-xs font-semibold bg-white hover:bg-white/90 text-[#0A0A0C] transition-all flex items-center justify-center gap-2"
            >
              <span>Iniciar tour guiado (5 pasos) →</span>
            </button>
            <button
              onClick={onClose}
              className="text-xs font-sans text-[#8E9299] hover:text-white transition-colors py-2"
            >
              Saltar tutorial e ir a la plataforma
            </button>
          </div>
        </div>
      ) : (
        /* 2. STEP CARD (Step 0 to 4) */
        <div className="relative z-10 bg-[#0A0C14] border border-white/15 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-sans text-xs text-white font-medium bg-white/10 px-2.5 py-1 rounded-md border border-white/20">
              Paso {TOUR_STEPS[currentStepIndex].step} de {TOUR_STEPS.length}
            </span>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-sans text-[#8E9299] hover:text-white transition-colors py-1 px-2 rounded-md hover:bg-white/5"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l8 8M9 1L1 9" />
              </svg>
              <span>Cerrar</span>
            </button>
          </div>

          {/* Title & Desc */}
          <h3 className="text-xl font-bold text-white mb-2 leading-snug">
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
                    ? 'w-8 bg-white'
                    : 'w-2 bg-[rgba(255,255,255,0.2)]'
                }`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[rgba(255,255,255,0.08)]">
            <button
              onClick={handlePrev}
              className="py-2 px-4 rounded-lg font-sans text-xs text-[#8E9299] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              ← Anterior
            </button>

            <button
              onClick={handleNext}
              className="py-2.5 px-5 rounded-lg font-sans text-xs font-semibold bg-white hover:bg-white/90 text-[#0A0A0C] transition-all"
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finalizar tour' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
