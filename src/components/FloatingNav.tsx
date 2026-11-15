import React, { useRef } from 'react';

interface FloatingNavProps {
  onOpenTutorial: () => void;
  onOpenCalibration: () => void;
  onUploadCsv?: (file: File) => void;
  onScrollToGravity?: () => void;
}

export default function FloatingNav({
  onOpenTutorial,
  onOpenCalibration,
  onUploadCsv,
  onScrollToGravity,
}: FloatingNavProps) {
  const navFileInputRef = useRef<HTMLInputElement>(null);

  const handleNavCsvClick = () => {
    if (onScrollToGravity) {
      onScrollToGravity();
    }
    navFileInputRef.current?.click();
  };

  const handleNavFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadCsv) {
      onUploadCsv(file);
    }
    // Reset so multiple files can be uploaded repeatedly
    e.target.value = '';
  };

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

      {/* Top Right: Minimalist Pills */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Hidden File Input for Calibrar CSV */}
        <input
          ref={navFileInputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={handleNavFileChange}
        />

        {/* Global Calibrar CSV Pill */}
        <button
          onClick={handleNavCsvClick}
          className="px-4 py-2 rounded-full text-xs font-medium text-white/90 bg-[#16171B]/90 hover:bg-[#202227] border border-white/15 transition-all shadow-sm font-sans flex items-center gap-1.5"
          title="Subir datos altimétricos CSV (LOLA o MOLA)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
          <span>Calibrar CSV</span>
        </button>

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
