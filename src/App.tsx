import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TARGETS, SITES as INITIAL_SITES, rankSites, calculatePFI } from './data';
import type { BiomeType, EarthSite, PFIWeights } from './data';

import FloatingNav from './components/FloatingNav';
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
import TechnicalDossierPrintSection from './components/TechnicalDossierPrintSection';
import { parseTopographicCsv, type CraterScenario } from './utils/csvTopoParser';
import { printDossierIframe } from './utils/printDossier';

const DISCOVERED_SITES_STORAGE_KEY = 'autumn_solara_discovered_sites';

function getStoredDiscoveredSites(): EarthSite[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DISCOVERED_SITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((s) => s && typeof s.id === 'string' && s.name);
    }
  } catch (e) {
    console.warn('Failed to parse discovered sites from localStorage', e);
  }
  return [];
}

export function App() {
  // Sites state with support for newly discovered analog sites from the Satellite Scanner & localStorage
  const [sites, setSites] = useState<EarthSite[]>(() => {
    const discovered = getStoredDiscoveredSites();
    if (!discovered.length) return INITIAL_SITES;
    const initialIds = new Set(INITIAL_SITES.map((s) => s.id));
    const uniqueDiscovered = discovered.filter((s) => !initialIds.has(s.id));
    return [...uniqueDiscovered, ...INITIAL_SITES];
  });

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

  // External calibrated CSV scenario for Section 04 Topography Simulator
  const [externalScenario, setExternalScenario] = useState<CraterScenario | null>(null);

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

  // Handler for newly discovered analog site from Satellite Scanner (Persisted in localStorage)
  const handleAddNewSite = useCallback(
    (newSite: EarthSite) => {
      playClickSound();
      setSites((prev) => {
        const filtered = prev.filter((s) => s.id !== newSite.id);
        const updated = [newSite, ...filtered];
        try {
          const initialIds = new Set(INITIAL_SITES.map((s) => s.id));
          const customDiscovered = updated.filter(
            (s) => !initialIds.has(s.id) || s.isUserCandidate || s.id.startsWith('DISC-')
          );
          localStorage.setItem(DISCOVERED_SITES_STORAGE_KEY, JSON.stringify(customDiscovered));
        } catch (e) {
          console.warn('Failed to save discovered site to localStorage', e);
        }
        return updated;
      });
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

  const scrollToGravitySection = useCallback(() => {
    playClickSound();
    const lenis = (window as any).__lenis;
    const targetEl = document.getElementById('gravity-section');
    if (lenis && targetEl) {
      lenis.scrollTo(targetEl, {
        offset: -40,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, [playClickSound]);

  const handleGlobalCsvUpload = useCallback(
    (file: File) => {
      playClickSound();
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (!text) return;
        const parsed = parseTopographicCsv(text, file.name);
        if (parsed) {
          setExternalScenario(parsed);
          scrollToGravitySection();
        }
      };
      reader.readAsText(file);
    },
    [playClickSound, scrollToGravitySection]
  );

  const handlePrintFullDossier = useCallback(() => {
    playClickSound();
    printDossierIframe('technical-dossier-print-section');
  }, [playClickSound]);

  return (
    <div className="relative min-h-screen bg-[#050508] text-[#E8E8EC] selection:bg-white selection:text-black m-0 p-0 overflow-x-clip">
      {/* 1. Top Floating Pill Navigation (Logo + CALIBRAR CSV + CALIBRAR PFI + TUTORIAL) */}
      <FloatingNav
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenCalibration={() => setCalibrationOpen(true)}
        onUploadCsv={handleGlobalCsvUpload}
        onScrollToGravity={scrollToGravitySection}
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

      {/* 9. Topographic Transect & Rover Mobility Simulator */}
      <div id="gravity-section">
        <GravitySimulator externalScenario={externalScenario} />
      </div>

      {/* 9.5 Editorial NASA Scientific Mission Documentation Section */}
      <section className="border-t border-b border-white/12 py-12 px-6 bg-transparent">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 block mb-2">
              05 / DOCUMENTACIÓN CIENTÍFICA OFICIAL
            </span>
            <h3 className="text-2xl md:text-3xl font-serif font-light text-[#F2F0EA] tracking-tight leading-snug">
              Expediente técnico de validación análoga
            </h3>
            <p className="text-sm text-[#A09E97] font-normal leading-relaxed max-w-[65ch] mt-3">
              Descarga o imprime el informe técnico oficial cruzando las 8 dimensiones de la NASA para el sitio activo ({selectedSite.name}) frente a la misión ({activeTarget.name}). Incluye calibración TRL 6-8, firma espectral ASTER y mitigación de barreras planetarias.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePrintFullDossier}
              className="py-2.5 px-5 rounded-[2px] font-mono text-xs uppercase tracking-wider bg-[#161616] hover:bg-[#ECEAE4] hover:text-[#0B0B0B] text-[#ECEAE4] border border-white/28 transition-colors flex items-center gap-2.5"
              title="Imprimir expediente técnico oficial del sitio activo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Imprimir / Descargar PDF</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setIsGlobalReportOpen(true);
              }}
              className="py-2.5 px-4 rounded-[2px] font-mono text-xs uppercase tracking-wider bg-transparent hover:border-white/30 hover:text-white text-[#A09E97] border border-white/12 transition-colors flex items-center gap-2"
            >
              <span>Ver reporte individual (.md)</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9.6 Full Technical Dossier Print Section (Hidden on screen, rendered exclusively in @media print) */}
      <TechnicalDossierPrintSection
        site={selectedSite}
        activeTarget={activeTarget}
        weights={weights}
        pfi={selectedSitePFIData.pfi}
      />

      {/* 10. Editorial Footer */}
      <footer className="section-dark py-16 px-8 border-t border-[rgba(255,255,255,0.08)] font-sans text-xs text-[#8E9299]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <strong className="text-white text-sm font-sans">Autumn Solara — Catálogo de validación planetaria</strong>
            </div>
            <p className="max-w-md text-xs text-[#8E929F]">
              Plataforma cartográfica y geomorfológica para validación de sitios análogos a la Luna y Marte con datos abiertos de NASA JPL.
            </p>
          </div>

          <div className="flex items-center text-[11px] font-mono" style={{ gap: '28px' }}>
            <span>WGS-84</span>
            <span>ESRI WORLD IMAGERY</span>
            <span>NASA EARTHDATA</span>
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
