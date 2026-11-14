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
      {/* Top Left: Logo only */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <a
          href="#"
          className="flex items-center bg-[#0F1015]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[rgba(255,255,255,0.08)] shadow-lg hover:border-[#2544FF] transition-colors"
        >
          <span className="font-bold text-sm tracking-wider text-white">
            TERRA—ANALOG™
          </span>
        </a>
      </div>

      {/* Top Right: 2 pills only */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Calibration PFI Pill */}
        <button
          onClick={onOpenCalibration}
          className="pill-btn pill-btn-dark py-2 px-4 text-xs font-mono"
        >
          <span>CALIBRAR PFI</span>
        </button>

        {/* Tutorial Pill */}
        <button
          onClick={onOpenTutorial}
          className="pill-btn pill-btn-cobalt py-2 px-4 text-xs font-mono"
        >
          <span>TUTORIAL •</span>
        </button>
      </div>
    </nav>
  );
}
