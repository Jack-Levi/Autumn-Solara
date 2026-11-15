import React from 'react';

interface FloatingNavProps {
  onOpenTutorial: () => void;
  onOpenCalibration: () => void;
}

export default function FloatingNav({
  onOpenTutorial,
  onOpenCalibration,
}: FloatingNavProps) {
  return (
    <nav className="fixed top-6 left-0 right-0 z-50 px-6 md:px-10 flex items-center justify-between pointer-events-none select-none">
      {/* Top Left: Clean Logo */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <a
          href="#"
          className="transition-opacity hover:opacity-80"
          style={{
            fontSize: '16px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: '#F4F4F6',
            textDecoration: 'none',
          }}
        >
          Autumn Solara
        </a>
      </div>

      {/* Top Right: 2 Luxury Minimalist Pills */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Calibration PFI Pill */}
        <button
          onClick={onOpenCalibration}
          className="px-4 py-2 rounded-full text-xs font-medium text-white/90 bg-[#16171B]/90 hover:bg-[#202227] border border-white/15 transition-all shadow-sm font-sans"
        >
          Calibrar PFI
        </button>

        {/* Tutorial Pill: Pure White with Black Text */}
        <button
          onClick={onOpenTutorial}
          className="px-4 py-2 rounded-full text-xs font-semibold text-[#0A0A0C] bg-white hover:bg-[#E4E4E7] border border-white transition-all shadow-md font-sans"
        >
          Tutorial
        </button>
      </div>
    </nav>
  );
}
