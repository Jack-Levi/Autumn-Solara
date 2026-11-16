import React, { useState, useEffect, useRef } from 'react';

interface FloatingNavProps {
  onOpenTutorial: () => void;
  onOpenCalibration: () => void;
  onUploadCsv?: (file: File) => void;
  onScrollToGravity?: () => void;
  hidden?: boolean;
}

export default function FloatingNav({
  onOpenTutorial,
  onOpenCalibration,
  onUploadCsv,
  onScrollToGravity,
  hidden = false,
}: FloatingNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
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

  useEffect(() => {
    let ticking = false;
    let isScrolledVal = false;
    let isVisibleVal = true;
    let isLightSectionVal = false;

    const updateNav = () => {
      const currentY = window.scrollY;
      const prevY = lastScrollYRef.current;
      const dy = currentY - prevY;

      const newScrolled = currentY > 40;
      if (newScrolled !== isScrolledVal) {
        isScrolledVal = newScrolled;
        setIsScrolled(newScrolled);
      }

      // Auto-hide when scrolling down continuously past 180px, reveal immediately when scrolling up
      let newVisible = isVisibleVal;
      if (currentY > 180 && dy > 6) {
        newVisible = false;
      } else if (dy < -4 || currentY <= 180) {
        newVisible = true;
      }
      if (newVisible !== isVisibleVal) {
        isVisibleVal = newVisible;
        setIsVisible(newVisible);
      }
      lastScrollYRef.current = currentY;

      // Detect if navbar is currently positioned over a light-background section
      const lightSections = document.querySelectorAll('.section-light');
      let overLight = false;
      const navY = 44; // Vertical position in viewport where nav sits

      for (let i = 0; i < lightSections.length; i++) {
        const rect = lightSections[i].getBoundingClientRect();
        if (rect.top <= navY && rect.bottom >= navY) {
          overLight = true;
          break;
        }
      }
      if (overLight !== isLightSectionVal) {
        isLightSectionVal = overLight;
        setIsLightSection(overLight);
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateNav);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateNav();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shouldShow = !hidden && isVisible;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 pointer-events-none select-none transition-all duration-300 ease-out ${
        shouldShow ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? isLightSection
              ? 'py-3.5 px-6 md:px-10 bg-[#F5F5F3]/85 backdrop-blur-md border-b border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
              : 'py-3.5 px-6 md:px-10 bg-[#050508]/80 backdrop-blur-md border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
            : 'pt-6 pb-2 px-6 md:px-10 bg-transparent'
        } flex items-center justify-between`}
      >
        {/* Top Left: Clean Logo with Dynamic Contrast */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <a
            href="#"
            className="transition-colors duration-200 hover:opacity-80"
            style={{
              fontSize: '16px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: isLightSection ? '#0A0A0E' : '#F4F4F6',
              textDecoration: 'none',
            }}
          >
            Autumn Solara
          </a>
        </div>

        {/* Top Right: Luxury Minimalist Pills with Dynamic Theme */}
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
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm font-sans flex items-center gap-1.5 ${
              isLightSection
                ? 'text-[#0A0A0E] bg-white/90 hover:bg-white border border-[#E2E4EC]'
                : 'text-white/90 bg-[#16171B]/90 hover:bg-[#202227] border border-white/15'
            }`}
            title="Subir datos altimétricos CSV (LOLA o MOLA)"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLightSection ? 'bg-[#0A0A0E]/70' : 'bg-white/70'}`} />
            <span>Calibrar CSV</span>
          </button>

          {/* Calibration PFI Pill */}
          <button
            onClick={onOpenCalibration}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm font-sans ${
              isLightSection
                ? 'text-[#0A0A0E] bg-white/90 hover:bg-white border border-[#E2E4EC]'
                : 'text-white/90 bg-[#16171B]/90 hover:bg-[#202227] border border-white/15'
            }`}
          >
            Calibrar PFI
          </button>

          {/* Tutorial Pill */}
          <button
            onClick={onOpenTutorial}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-md font-sans ${
              isLightSection
                ? 'text-white bg-[#0A0A0E] hover:bg-[#202227] border border-[#0A0A0E]'
                : 'text-[#0A0A0C] bg-white hover:bg-[#E4E4E7] border border-white'
            }`}
          >
            Tutorial
          </button>
        </div>
      </div>
    </header>
  );
}
