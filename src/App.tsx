import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { TARGETS, SITES as INITIAL_SITES, rankSites, calculatePFI } from './data';
import type { BiomeType, EarthSite, PFIWeights } from './data';

import FloatingNav from './components/FloatingNav';
import LiquidFluidCursor from './components/LiquidFluidCursor';
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
import MissionReportModal from './components/MissionReportModal';

export function App() {
  // Sites state with support for newly discovered analog sites from the Satellite Scanner
  const [sites, setSites] = useState<EarthSite[]>(INITIAL_SITES);

  // Global Mission Report Modal State
  const [isGlobalReportOpen, setIsGlobalReportOpen] = useState(false);

  // Active Target state (Default: Luna Shackleton)
  const [selectedTargetId, setSelectedTargetId] = useState<string>('MOON-SHK');
  const activeTarget = useMemo(
    () => TARGETS.find((t) => t.id === selectedTargetId) || TARGETS[0],
    [selectedTargetId]
  );

  // Calibration Weights (8 Official NASA Dimensions)
  const [weights, setWeights] = useState<PFIWeights>({
    geology: 50,
    terrain: 50,
    temperature: 50,
    iceWater: 50,
    atmosphere: 50,
    biosphere: 50,
    subsurface: 50,
    robotics: 50,
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

  // Scroll progress (0 to 1) throttled with RAF
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Locomotive Smooth Scroll Engine (Lenis + GSAP ScrollTrigger)
  useEffect(() => {
    const LenisClass = (window as any).Lenis;
    const gsap = (window as any).gsap;
    const ScrollTrigger = (window as any).ScrollTrigger;

    let lenis: any = null;

    if (LenisClass) {
      lenis = new LenisClass({
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 1.05,
        touchMultiplier: 1.6,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });

      (window as any).__lenis = lenis;

      if (gsap && ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        lenis.on('scroll', ScrollTrigger.update);

        const tickerFn = (time: number) => {
          lenis.raf(time * 1000);
        };
        gsap.ticker.add(tickerFn);
        gsap.ticker.lagSmoothing(0);

        // Sticky Curtain progressive depth scrubbing
        const heroTrigger = ScrollTrigger.create({
          trigger: '#hero-curtain-wrap',
          start: 'top top',
          endTrigger: '#slide2-curtain-wrap',
          end: 'top top',
          pin: true,
          pinSpacing: false,
          scrub: true,
          onUpdate: (self: any) => {
            gsap.set('#hero-section', {
              scale: 1 - self.progress * 0.04,
              filter: `brightness(${1 - self.progress * 0.35})`,
            });
          },
        });

        const slide2Tween = gsap.to('#editorial-slide-2-inner', {
          scale: 0.96,
          filter: 'brightness(0.65)',
          ease: 'none',
          scrollTrigger: {
            trigger: '#spacetunnel-curtain-wrap',
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        });

        const spaceTween = gsap.to('#space-tunnel-inner', {
          scale: 0.96,
          filter: 'brightness(0.65)',
          ease: 'none',
          scrollTrigger: {
            trigger: '#missions-section',
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        });

        // Trigger editorial reveal titles with luxury clip-path mask
        ScrollTrigger.batch('.editorial-reveal-title', {
          start: 'top 88%',
          onEnter: (batch: Element[]) => {
            batch.forEach((el) => el.classList.add('is-revealed'));
          },
          once: true,
        });

        return () => {
          gsap.ticker.remove(tickerFn);
          if (heroTrigger) heroTrigger.kill();
          if (slide2Tween.scrollTrigger) slide2Tween.scrollTrigger.kill();
          slide2Tween.kill();
          if (spaceTween.scrollTrigger) spaceTween.scrollTrigger.kill();
          spaceTween.kill();
          if (lenis) {
            lenis.destroy();
            delete (window as any).__lenis;
          }
        };
      } else {
        let rafId: number;
        const fallbackRaf = (time: number) => {
          lenis.raf(time);
          rafId = requestAnimationFrame(fallbackRaf);
        };
        rafId = requestAnimationFrame(fallbackRaf);

        return () => {
          cancelAnimationFrame(rafId);
          if (lenis) {
            lenis.destroy();
            delete (window as any).__lenis;
          }
        };
      }
    }
  }, []);

  // IntersectionObserver backup for Editorial Mask Reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.editorial-reveal-title');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
          const currentScroll = window.scrollY;
          setScrollProgress(totalScroll > 0 ? Math.min(1, currentScroll / totalScroll) : 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
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

  // Scroll to section helper with Lenis smooth inertia
  const scrollToSection = useCallback((sectionId: string) => {
    const lenis = (window as any).__lenis;
    const el = document.getElementById(sectionId);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Reset weights handler (Balanced 50%)
  const handleResetWeights = useCallback(() => {
    playClickSound();
    setWeights({
      geology: 50,
      terrain: 50,
      temperature: 50,
      iceWater: 50,
      atmosphere: 50,
      biosphere: 50,
      subsurface: 50,
      robotics: 50,
    });
  }, [playClickSound]);

  return (
    <div className="relative min-h-screen bg-[#050508] text-[#E8E8EC] selection:bg-white selection:text-black m-0 p-0 overflow-x-clip">
      {/* 1. WebGL Fluid Surface & Thin-Film Iridescence Shader */}
      <LiquidFluidCursor />

      {/* 2. Top Floating Pill Navigation (Logo + CALIBRAR PFI + TUTORIAL) */}
      <FloatingNav
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenCalibration={() => setCalibrationOpen(true)}
      />

      {/* 3. Hero Section (Sticky Curtain Base Layer) */}
      <div id="hero-curtain-wrap" className="sticky-curtain-section">
        <HeroSection scrollProgress={scrollProgress} />
      </div>

      {/* 4. Editorial Slide 2 (Sticky Curtain Overlayer 1) */}
      <div id="slide2-curtain-wrap" className="sticky-curtain-layer">
        <EditorialSlide2 />
      </div>

      {/* 5. Scroll-Linked 3D Space Tunnel (Sticky Curtain Overlayer 2) */}
      <div id="spacetunnel-curtain-wrap" className="sticky-curtain-layer">
        <SpaceTunnel />
      </div>

      {/* 6. Extraterrestrial Mission Selector (Sticky Curtain Overlayer 3) */}
      <div id="missions-section" className="sticky-curtain-layer">
        <MissionCards
          selectedTargetId={selectedTargetId}
          onSelectTarget={handleSelectTarget}
        />
      </div>

      {/* 7. Earth Analog Site Gallery (2-Column Spacious Cards) */}
      <div id="gallery-section">
        <SiteGallery
          rankedSites={rankedSites}
          onSelectSite={handleSelectSite}
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
          onOpenDetailModal={(id) => {
            playClickSound();
            setSelectedSiteId(id);
            setIsDetailModalOpen(true);
          }}
          activeTarget={activeTarget}
          onAddNewSite={handleAddNewSite}
        />
      </div>

      {/* 9. Physics Sandbox (280 Spheres on Architectural Dark Background, 60fps Physics) */}
      <div id="gravity-section">
        <GravitySimulator />
      </div>

      {/* 9.5 NASA Scientific Mission Documentation Card */}
      <section className="section-dark py-16 px-6 border-t border-[rgba(255,255,255,0.08)] bg-[#07080E]">
        <div className="max-w-[1400px] mx-auto bg-[#0E1014] border border-[rgba(255,255,255,0.1)] rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-none">
          <div className="max-w-2xl">
            <span className="font-sans text-[11px] uppercase tracking-wider text-[#8E9299] font-medium block mb-2">
              Documentación científica oficial · NASA Space Apps Challenge
            </span>
            <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-snug mb-3">
              Expediente técnico de validación análoga
            </h3>
            <p className="text-[14px] text-[#A1A1AA] font-normal leading-[1.65] max-w-[65ch]">
              Descarga o imprime el informe técnico completo cruzando las 8 dimensiones oficiales de la NASA para el sitio activo (<strong className="text-white">{selectedSite.name}</strong>) frente a la misión (<strong className="text-white">{activeTarget.name}</strong>). Incluye calibración TRL 6-8, firma espectral ASTER y mitigación de barreras planetarias.
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            <button
              onClick={() => {
                playClickSound();
                setIsGlobalReportOpen(true);
              }}
              className="py-3 px-6 rounded-lg font-sans text-xs font-semibold bg-white hover:bg-white/90 text-[#0A0A0C] transition-all flex items-center gap-2"
            >
              <span>Generar reporte científico escrito</span>
            </button>
          </div>
        </div>
      </section>

      {/* 10. Editorial Footer */}
      <footer className="section-dark py-16 px-8 border-t border-[rgba(255,255,255,0.08)] font-sans text-xs text-[#8E9299]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <strong className="text-white text-sm font-sans">Autumn Solara · Catálogo de validación planetaria</strong>
            </div>
            <p className="max-w-md text-xs text-[#8E929F]">
              Plataforma cartográfica y geomorfológica para validación de sitios análogos a la Luna y Marte con datos abiertos de NASA JPL.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>WGS-84</span>
            <span>·</span>
            <span>ESRI WORLD IMAGERY</span>
            <span>·</span>
            <span>NASA EARTHDATA</span>
            <span>·</span>
            <button
              onClick={() => {
                const lenis = (window as any).__lenis;
                if (lenis) {
                  lenis.scrollTo(0, { duration: 1.4, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="text-white hover:underline transition-colors font-sans text-xs"
            >
              ↑ Volver arriba
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
          allSites={sites}
          allTargets={TARGETS}
          onSelectSite={setSelectedSiteId}
          onSelectTarget={setSelectedTargetId}
          onClose={() => setIsDetailModalOpen(false)}
          weights={weights}
        />
      )}

      {/* 13. Guided Onboarding Tour Spotlight */}
      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onJumpToSection={scrollToSection}
      />

      {/* 14. Global Mission Report Modal */}
      {isGlobalReportOpen && (
        <MissionReportModal
          site={selectedSite}
          target={activeTarget}
          pfi={selectedSitePFIData.pfi}
          weights={weights}
          isOpen={isGlobalReportOpen}
          onClose={() => setIsGlobalReportOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
