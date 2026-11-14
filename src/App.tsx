import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { TARGETS, SITES as INITIAL_SITES, rankSites, calculatePFI } from './data';
import type { BiomeType, EarthSite, PFIWeights } from './data';

import FloatingNav from './components/FloatingNav';
import FluidTrail from './components/FluidTrail';
import HeroSection from './components/HeroSection';
import EditorialSlide2 from './components/EditorialSlide2';
import SpaceTunnel from './components/SpaceTunnel';
import MissionCards from './components/MissionCards';
import SiteGallery from './components/SiteGallery';
import SatelliteMap from './components/SatelliteMap';
import GravitySimulator from './components/GravitySimulator';
import CalibrationDock from './components/CalibrationDock';
import SiteDetailModal from './components/SiteDetailModal';
import TutorialOverlay from './components/TutorialOverlay';

export function App() {
  // Sites state with support for newly discovered analog sites from the Satellite Scanner
  const [sites, setSites] = useState<EarthSite[]>(INITIAL_SITES);

  // Active Target state (Default: Luna Shackleton)
  const [selectedTargetId, setSelectedTargetId] = useState<string>('MOON-SHK');
  const activeTarget = useMemo(
    () => TARGETS.find((t) => t.id === selectedTargetId) || TARGETS[0],
    [selectedTargetId]
  );

  // Calibration Weights
  const [weights, setWeights] = useState<PFIWeights>({
    topography: 25,
    geology: 25,
    environment: 25,
    resources: 25,
  });

  // Biome Filter
  const [selectedBiome, setSelectedBiome] = useState<BiomeType>('Todos');

  // Selected site for modal detail view
  const [selectedSiteId, setSelectedSiteId] = useState<string>('ATC-01');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Tutorial overlay state
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Calibration dock open state (controlled from navbar)
  const [calibrationOpen, setCalibrationOpen] = useState<boolean>(false);

  // Sound FX state (Web Audio API)
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Mouse position tracking
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Scroll progress (0 to 1) & Instantaneous Scroll Velocity for Motion Blur
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [scrollVelocity, setScrollVelocity] = useState<number>(0);
  const lastScrollY = useRef(0);
  const currentVelocityRef = useRef(0);

  // Track mouse coordinates globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track scroll progress and velocity in requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const onScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress(totalScroll > 0 ? Math.min(1, currentScroll / totalScroll) : 0);

      const delta = currentScroll - lastScrollY.current;
      lastScrollY.current = currentScroll;
      currentVelocityRef.current = delta;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Inertial decay loop for scroll velocity (smooth return to 0 with lerp 0.18)
    const velocityLoop = () => {
      currentVelocityRef.current *= 0.82; // lerp smooth damping
      if (Math.abs(currentVelocityRef.current) < 0.05) {
        currentVelocityRef.current = 0;
      }
      setScrollVelocity(currentVelocityRef.current);
      animId = requestAnimationFrame(velocityLoop);
    };

    animId = requestAnimationFrame(velocityLoop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Web Audio subtle click sound
  const playClickSound = useCallback(() => {
    if (!isSoundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio context may be restricted prior to first user gesture
    }
  }, [isSoundEnabled]);

  // Filtered sites based on biome
  const filteredSites = useMemo(() => {
    if (selectedBiome === 'Todos') return sites;
    return sites.filter((s) => s.biome === selectedBiome);
  }, [sites, selectedBiome]);

  // Recalculate ranking dynamically
  const rankedSites = useMemo(() => {
    return rankSites(filteredSites, activeTarget, weights);
  }, [filteredSites, activeTarget, weights]);

  // PFI scores map for map pins
  const pfiScores = useMemo(() => {
    const map: Record<string, number> = {};
    sites.forEach((site) => {
      const { pfi } = calculatePFI(site, activeTarget, weights);
      map[site.id] = pfi;
    });
    return map;
  }, [sites, activeTarget, weights]);

  // Selected site object and its PFI breakdown
  const selectedSite = useMemo(
    () => sites.find((s) => s.id === selectedSiteId) || sites[0],
    [sites, selectedSiteId]
  );

  const selectedSitePFIData = useMemo(
    () => calculatePFI(selectedSite, activeTarget, weights),
    [selectedSite, activeTarget, weights]
  );

  // Handler for site selection from gallery or map
  const handleSelectSite = useCallback(
    (siteId: string) => {
      playClickSound();
      setSelectedSiteId(siteId);
      setIsDetailModalOpen(true);
    },
    [playClickSound]
  );

  // Handler for target selection
  const handleSelectTarget = useCallback(
    (targetId: string) => {
      playClickSound();
      setSelectedTargetId(targetId);
    },
    [playClickSound]
  );

  // Handler for newly discovered analog site from Satellite Scanner
  const handleAddNewSite = useCallback(
    (newSite: EarthSite) => {
      playClickSound();
      setSites((prev) => [newSite, ...prev]);
      setSelectedSiteId(newSite.id);
    },
    [playClickSound]
  );

  // Scroll to section helper
  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Reset weights handler
  const handleResetWeights = useCallback(() => {
    playClickSound();
    setWeights({
      topography: 25,
      geology: 25,
      environment: 25,
      resources: 25,
    });
  }, [playClickSound]);

  return (
    <div className="relative min-h-screen bg-[#F4F4F6] text-[#0A0A0E] selection:bg-[#2544FF] selection:text-white">
      {/* 1. Liquid Mouse Trail (visible only from Slide 2 onwards) */}
      <FluidTrail />

      {/* 2. Top Floating Pill Navigation (Logo + CALIBRAR PFI + TUTORIAL) */}
      <FloatingNav
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenCalibration={() => setCalibrationOpen(true)}
      />

      {/* 3. Hero Section (Deep Space Mode, 48px Signature Blue Spline, 3-Depth Particle Canvas) */}
      <HeroSection scrollProgress={scrollProgress} mousePos={mousePos} />

      {/* 4. Editorial Slide 2 (Scrollytelling: 2-col header, shooting star, morphing video) */}
      <EditorialSlide2 />

      {/* 5. Scroll-Linked 3D Space Tunnel ("STEP INTO ANALOG WORLDS" scaling 1 to 14) */}
      <SpaceTunnel />

      {/* 6. Extraterrestrial Mission Selector (1 Single Row of 4 Columns, Blueprint Vector 3D Fan) */}
      <div id="missions-section">
        <MissionCards
          selectedTargetId={selectedTargetId}
          onSelectTarget={handleSelectTarget}
        />
      </div>

      {/* 7. Earth Analog Site Gallery (2-Column Spacious Cards with Velocity Skew & Motion Blur) */}
      <div id="gallery-section">
        <SiteGallery
          rankedSites={rankedSites}
          onSelectSite={handleSelectSite}
          scrollVelocity={scrollVelocity}
        />
      </div>

      {/* 8. Satellite Map Explorer (Esri World Imagery with maxNativeZoom 13, FlyTo at 11, + Discovery Scanner) */}
      <div id="satellite-section">
        <SatelliteMap
          sites={sites}
          pfiScores={pfiScores}
          selectedSiteId={selectedSiteId}
          onSelectSite={(id) => {
            playClickSound();
            setSelectedSiteId(id);
          }}
          activeTarget={activeTarget}
          onAddNewSite={handleAddNewSite}
        />
      </div>

      {/* 9. Lusion Footer Sandbox (300 White Spheres on Full #2544FF Background, 60fps Physics) */}
      <div id="gravity-section">
        <GravitySimulator />
      </div>

      {/* 10. Editorial Footer */}
      <footer className="section-dark py-16 px-8 border-t border-[rgba(255,255,255,0.08)] font-mono text-xs text-[#6B6F7B]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2544FF]" />
              <strong className="text-white text-sm">TERRA—ANALOG™ // SYS-04</strong>
            </div>
            <p className="max-w-md text-xs text-[#8E929F]">
              Plataforma cartográfica y geomorfológica para validación de sitios análogos a la Luna y Marte con datos abiertos de NASA JPL.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>WGS-84</span>
            <span>·</span>
            <span>ESRI WORLD IMAGERY</span>
            <span>·</span>
            <span>NASA EARTHDATA</span>
            <span>·</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-white hover:text-[#2544FF] transition-colors"
            >
              ↑ VOLVER ARRIBA
            </button>
          </div>
        </div>
      </footer>

      {/* 11. Calibration Dock (controlled from navbar, top-right panel) */}
      <CalibrationDock
        isOpen={calibrationOpen}
        onClose={() => setCalibrationOpen(false)}
        weights={weights}
        onUpdateWeights={setWeights}
        selectedBiome={selectedBiome}
        onSelectBiome={setSelectedBiome}
        onResetWeights={handleResetWeights}
      />

      {/* 12. Fullscreen Dive-In Case Study Modal with Drag Carousel & Motion Blur */}
      {isDetailModalOpen && (
        <SiteDetailModal
          site={selectedSite}
          target={activeTarget}
          pfi={selectedSitePFIData.pfi}
          breakdown={selectedSitePFIData.breakdown}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}

      {/* 13. Guided Onboarding Tour Spotlight */}
      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onJumpToSection={scrollToSection}
      />
    </div>
  );
}

export default App;
