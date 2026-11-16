import React, { useRef, useCallback, useState, useEffect } from 'react';
import * as THREE from 'three';
import { TARGETS } from '../data';
import type { ExtraTerrestrialTarget } from '../data';
import { getTargetDatasetSummary } from '../data/nasaExtractedDatasets';
import DatasetExtractionModal from './DatasetExtractionModal';

interface MissionCardsProps {
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
}

// 4 Primary NASA Flagship Reference Targets corresponding to extracted CSV datasets
const FLAGSHIP_TARGET_IDS = ['MOON-SHK', 'MOON-COP', 'MARS-JEZ', 'MARS-ALB'];

/**
 * High-speed Warp Starfield Background
 * Extends the SpaceTunnel starfield at reduced opacity (0.28)
 * for seamless visual continuity into Section 01.
 */
function MissionStarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mini star texture with 4 diffraction spikes (identical to SpaceTunnel)
    const createMiniStarTexture = () => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      if (!ctx) return new THREE.Texture();
      const cx = 32;
      const cy = 32;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      grad.addColorStop(0, 'rgba(255,255,255,1.0)');
      grad.addColorStop(0.18, 'rgba(210,240,255,0.75)');
      grad.addColorStop(0.5, 'rgba(0,180,255,0.22)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);

      // Diffraction cross
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(cx - 1, 4, 2, 56);
      ctx.fillRect(4, cy - 1, 56, 2);

      const texture = new THREE.CanvasTexture(c);
      texture.needsUpdate = true;
      return texture;
    };

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08090c, 0.0016);

    const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);
    camera.position.z = 0;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const STAR_COUNT = 4800;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starSpeeds = new Float32Array(STAR_COUNT);
    const starColors = new Float32Array(STAR_COUNT * 3);

    for (let s = 0; s < STAR_COUNT; s++) {
      const angle = Math.random() * Math.PI * 2;
      const rad = 2.0 + Math.pow(Math.random(), 0.72) * 80.0;

      starPositions[s * 3] = Math.cos(angle) * rad;
      starPositions[s * 3 + 1] = Math.sin(angle) * rad;
      starPositions[s * 3 + 2] = -Math.random() * 650;

      starSpeeds[s] = 2.4 + Math.random() * 4.6;

      const cRand = Math.random();
      if (cRand < 0.72) {
        starColors[s * 3] = 1.0;
        starColors[s * 3 + 1] = 1.0;
        starColors[s * 3 + 2] = 1.0;
      } else if (cRand < 0.90) {
        starColors[s * 3] = 0.0;
        starColors[s * 3 + 1] = 0.9;
        starColors[s * 3 + 2] = 1.0;
      } else {
        starColors[s * 3] = 0.2;
        starColors[s * 3 + 1] = 0.5;
        starColors[s * 3 + 1] = 1.0;
      }
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starTexture = createMiniStarTexture();
    const starMat = new THREE.PointsMaterial({
      size: 0.62,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starSystem = new THREE.Points(starGeo, starMat);
    scene.add(starSystem);

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let isVisible = true;
    let animationFrameId: number;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          animationFrameId = requestAnimationFrame(animate);
        }
      },
      { rootMargin: '120px' }
    );
    observer.observe(canvas);

    const animate = () => {
      if (!isVisible) return;

      const posArr = starGeo.attributes.position.array as Float32Array;
      for (let s = 0; s < STAR_COUNT; s++) {
        posArr[s * 3 + 2] += starSpeeds[s];
        if (posArr[s * 3 + 2] > camera.position.z + 5) {
          posArr[s * 3 + 2] = camera.position.z - 650;
          const angle = Math.random() * Math.PI * 2;
          const rad = 2.0 + Math.pow(Math.random(), 0.72) * 80.0;
          posArr[s * 3] = Math.cos(angle) * rad;
          posArr[s * 3 + 1] = Math.sin(angle) * rad;
        }
      }
      starGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      starTexture.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.28,
      }}
    />
  );
}

export default function MissionCards({ selectedTargetId, onSelectTarget }: MissionCardsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);

  // Locomotive kinetic velocity skew & tilt connected to Lenis
  useEffect(() => {
    let rafId: number | null = null;
    let currentSkew = 0;
    let targetSkew = 0;
    let isRunning = true;

    const updateSkew = () => {
      if (!isRunning) return;
      const lenis = (window as any).__lenis;
      const velocity = lenis?.velocity || 0;

      // Dynamic micro-deformation: skew proportional to velocity, clamped strictly to max ±3deg
      targetSkew = Math.max(-3, Math.min(3, velocity * 0.08));

      // Damped return to 0 with silky inertia
      currentSkew += (targetSkew - currentSkew) * 0.12;

      if (gridRef.current) {
        if (Math.abs(currentSkew) > 0.005) {
          gridRef.current.style.transform = `translate3d(0,0,0) skewY(${currentSkew.toFixed(3)}deg)`;
        } else {
          gridRef.current.style.transform = 'translate3d(0,0,0) skewY(0deg)';
        }
      }

      if (Math.abs(currentSkew) <= 0.005 && Math.abs(targetSkew) <= 0.005) {
        rafId = null;
        return;
      }

      rafId = requestAnimationFrame(updateSkew);
    };

    const startSkew = () => {
      if (!rafId && isRunning) {
        rafId = requestAnimationFrame(updateSkew);
      }
    };

    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.on('scroll', startSkew);
    }
    window.addEventListener('scroll', startSkew, { passive: true });

    return () => {
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', startSkew);
    };
  }, []);

  // Filter down to the 4 reference destinations
  const referenceTargets: ExtraTerrestrialTarget[] = FLAGSHIP_TARGET_IDS.map(
    (id) => TARGETS.find((t) => t.id === id) || TARGETS[0]
  );

  // Initial fan angles in degrees
  const initialFanAngles = [-6, -2, 2, 6];

  // IntersectionObserver to trigger fan unfurl animation when entering viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Smooth tilt: rotateX from vertical motion, rotateY from horizontal
    const rotateY = (x - 0.5) * 14;
    const rotateX = (0.5 - y) * 14;

    card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateY(-6px)`;
  }, []);

  const handleMouseLeave = useCallback((index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)';
  }, []);

  return (
    <section
      ref={sectionRef}
      className="pt-8 pb-24 md:pt-10 md:pb-28 px-6 relative select-none overflow-hidden text-[#ECEAE4]"
      style={{
        backgroundColor: '#08090C',
      }}
    >
      {/* 1. Continuous High-Speed Warp Starfield Background */}
      <MissionStarfieldBackground />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span
              className="font-mono uppercase tracking-widest block mb-2 text-[#9A9891]"
              style={{ fontSize: '11px', letterSpacing: '0.14em' }}
            >
              01 — SELECCIÓN DE MISIÓN DESTINO — 4 OBJETIVOS DE REFERENCIA
            </span>
            <h2
              className="editorial-reveal-title font-sans font-semibold tracking-tight"
              style={{
                fontSize: 'clamp(30px, 3.5vw, 44px)',
                color: '#ECEAE4',
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: '-0.03em',
              }}
            >
              Elige tu destino extraterrestre
            </h2>
            <p className="text-[#9A9891] text-[15px] mt-3 max-w-[65ch] font-normal leading-[1.65]">
              Selecciona uno de los 4 destinos espaciales de referencia para recalcular en tiempo real el Índice de Fidelidad Planetaria (PFI) sobre las 8 dimensiones oficiales de la NASA.
            </p>
          </div>

          {/* Technical Plain Monospace Indicators (Zero Pills, Zero AI Dashboard Badges) */}
          <div className="flex items-center gap-3 font-mono text-xs text-[#9A9891]">
            <button
              onClick={() => setIsDatasetModalOpen(true)}
              className="hover:text-[#ECEAE4] transition-colors underline-offset-4 hover:underline cursor-pointer"
              title="Abrir panel de datasets extraídos de NASA Trek"
            >
              DATASETS REALES (6 ARCHIVOS CSV)
            </button>
            <span className="text-white/20">|</span>
            <span className="tracking-wider">4 DESTINOS DE REFERENCIA</span>
          </div>
        </div>

        {/* Strict 4-Column Single Row Grid with Kinetic Velocity Skew */}
        <div
          ref={gridRef}
          className="kinetic-skew-wrap lg:grid-cols-4"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            alignItems: 'stretch',
          }}
        >
          {referenceTargets.map((target, index) => {
            const isSelected = target.id === selectedTargetId;
            const fanAngle = initialFanAngles[index % initialFanAngles.length];
            const summary = getTargetDatasetSummary(target.id);

            // Initial transition from fan angle to 0deg
            const baseTransform = hasEntered
              ? 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)'
              : `perspective(1000px) rotate(${fanAngle}deg) translateY(12px)`;

            return (
              <div
                key={target.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="mission-card group cursor-pointer transition-all duration-300 w-full min-h-[520px] flex flex-col justify-between p-7 relative overflow-hidden"
                style={{
                  borderRadius: '0px',
                  boxShadow: 'none',
                  background: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(14, 15, 19, 0.72)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  border: isSelected ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderTop: isSelected ? '2px solid #ECEAE4' : '1px solid rgba(255, 255, 255, 0.12)',
                  transform: baseTransform,
                  transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease, border-color 0.3s ease',
                  willChange: 'transform',
                }}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseLeave={() => handleMouseLeave(index)}
                onClick={() => onSelectTarget(target.id)}
              >
                {/* Technical Blueprint Vector Overlay */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 320 500"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                  style={{ opacity: isSelected ? 0.09 : 0.04 }}
                >
                  <circle cx="160" cy="220" r="130" strokeDasharray="3,3" />
                  <circle cx="160" cy="220" r="90" />
                  <circle cx="160" cy="220" r="40" strokeDasharray="4,2" />
                  <line x1="20" y1="220" x2="300" y2="220" strokeDasharray="4,4" />
                  <line x1="160" y1="60" x2="160" y2="380" strokeDasharray="4,4" />
                  <rect x="25" y="25" width="270" height="450" strokeDasharray="6,6" />
                </svg>

                {/* Top Row: Number 01-04 & Flat Celestial Body Label */}
                <div className="relative z-10 flex items-start justify-between">
                  <span
                    className="font-extralight text-5xl leading-none select-none font-sans"
                    style={{
                      color: isSelected ? 'rgba(236, 234, 228, 0.45)' : 'rgba(255, 255, 255, 0.18)',
                    }}
                  >
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#9A9891]">
                    {target.body.toUpperCase()}
                  </span>
                </div>

                {/* Center Content: Title, Mission Code, Single-Line Sensors & Real Metrics */}
                <div className="relative z-10 my-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="font-mono text-[11px] font-bold tracking-wider"
                      style={{ color: isSelected ? '#ECEAE4' : '#C2C0B8' }}
                    >
                      {target.id}
                    </span>
                    <span className="font-mono text-[10px] tracking-wider text-[#9A9891] uppercase">
                      DESTINO DE REFERENCIA
                    </span>
                  </div>

                  <h3
                    className="text-lg font-semibold tracking-tight leading-snug"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: '#ECEAE4',
                    }}
                  >
                    {target.name}
                  </h3>

                  <p className="text-xs mt-2 leading-relaxed font-light line-clamp-2 text-[#9A9891]">
                    {target.subtitle}
                  </p>

                  {/* Clean Single-Line Sensors List Separated by Diagonals */}
                  <div className="font-mono text-[10px] text-[#8E9299] uppercase tracking-wider mt-3 mb-2">
                    {target.body === 'Luna'
                      ? 'SENSORES: LRO-LOLA / LRO-DIVINER / M3'
                      : 'SENSORES: MGS-MOLA / TES / CRISM'}
                  </div>

                  {/* 4 Real Extracted Metrics Grid */}
                  <div
                    className="grid grid-cols-2 gap-2 my-2.5 pt-2.5 pb-2 border-y"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    {summary.metrics.map((m, idx) => (
                      <div key={idx} className="font-mono leading-tight">
                        <span className="block text-[8.5px] uppercase font-medium tracking-wider mb-0.5 text-[#8E9299]">
                          {m.label}
                        </span>
                        <strong className="text-[11px] text-[#ECEAE4]">
                          {m.value}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Physical Specs & Integrated Flat Bottom Strip */}
                <div className="relative z-10 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center font-mono text-[11px] mb-1 text-[#8E9299]">
                    <span>GRAVEDAD:</span>
                    <strong className="text-[#ECEAE4]">
                      {target.gravity} m/s²
                    </strong>
                  </div>

                  <div className="flex justify-between items-center font-mono text-[11px] mb-4 text-[#8E9299]">
                    <span>COORDENADAS:</span>
                    <strong className="text-[10px] text-[#ECEAE4]">
                      {target.coords}
                    </strong>
                  </div>

                  {/* Integrated Full-Width Flat Strip Button (Zero Rounded Corners, Zero Bright AI Glow) */}
                  <div
                    className="-mx-7 -mb-7 py-3 px-4 font-mono text-xs uppercase tracking-wider text-center transition-colors select-none"
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: 0,
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      color: isSelected ? '#ECEAE4' : '#9A9891',
                    }}
                  >
                    {isSelected ? '[ DESTINO ACTIVO ]' : 'ACTIVAR MISIÓN →'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real NASA Datasets Extraction Modal */}
      {isDatasetModalOpen && (
        <DatasetExtractionModal
          isOpen={isDatasetModalOpen}
          onClose={() => setIsDatasetModalOpen(false)}
          initialTargetFilter="all"
        />
      )}
    </section>
  );
}
