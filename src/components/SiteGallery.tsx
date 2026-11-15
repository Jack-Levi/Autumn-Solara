import React, { useState, useRef, useCallback, useEffect } from 'react';
import { fidelityColor, fidelityLabel } from '../data';
import type { RankedSite, EarthSite, BiomeType } from '../data';
import { useWikipediaImage, WIKIPEDIA_TARGET_REGISTRY } from '../services/wikipediaImages';

interface SiteGalleryProps {
  rankedSites: RankedSite[];
  onSelectSite: (siteId: string) => void;
  scrollVelocity?: number;
}

// ─── Procedural Geologic Palettes for Guaranteed Canvas Fallback ─────────────
const SITE_GEOLOGY_PALETTES: Record<
  string,
  { bg: string; grad: string[]; accent: string; contour: string }
> = {
  'ATC-01': {
    bg: '#451F10',
    grad: ['#7A3816', '#A65B32', '#C87D55', '#E09F67'],
    accent: '#FFE6D5',
    contour: 'rgba(255, 230, 213, 0.3)',
  },
  'HGT-02': {
    bg: '#182232',
    grad: ['#334155', '#475569', '#64748B', '#94A3B8'],
    accent: '#F1F5F9',
    contour: 'rgba(241, 245, 249, 0.32)',
  },
  'LNZ-03': {
    bg: '#0C0D11',
    grad: ['#18181B', '#27272A', '#3F3F46', '#52525B'],
    accent: '#E4E4E7',
    contour: 'rgba(228, 228, 231, 0.25)',
  },
  'PIN-04': {
    bg: '#3B0C11',
    grad: ['#701A25', '#881337', '#4C0519', '#1C1917'],
    accent: '#FECDD3',
    contour: 'rgba(254, 205, 211, 0.32)',
  },
  'MCM-05': {
    bg: '#081B33',
    grad: ['#0369A1', '#0284C7', '#38BDF8', '#BAE6FD'],
    accent: '#F0F9FF',
    contour: 'rgba(240, 249, 255, 0.35)',
  },
  'PUN-06': {
    bg: '#334155',
    grad: ['#64748B', '#94A3B8', '#CBD5E1', '#F8FAFC'],
    accent: '#FFFFFF',
    contour: 'rgba(255, 255, 255, 0.45)',
  },
  'ASK-07': {
    bg: '#080C16',
    grad: ['#0F172A', '#1E293B', '#0E7490', '#06B6D4'],
    accent: '#67E8F9',
    contour: 'rgba(103, 232, 249, 0.35)',
  },
  'DNK-08': {
    bg: '#292524',
    grad: ['#44403C', '#57534E', '#78716C', '#44403C'],
    accent: '#E7E5E4',
    contour: 'rgba(231, 229, 228, 0.35)',
  },
  'PAY-09': {
    bg: '#09090B',
    grad: ['#18181B', '#27272A', '#3F3F46', '#18181B'],
    accent: '#D4D4D8',
    contour: 'rgba(212, 212, 216, 0.28)',
  },
  'SLD-10': {
    bg: '#18181B',
    grad: ['#27272A', '#3F3F46', '#71717A', '#FFFFFF'],
    accent: '#FFFFFF',
    contour: 'rgba(255, 255, 255, 0.45)',
  },
  'UYU-11': {
    bg: '#27272A',
    grad: ['#3F3F46', '#52525B', '#71717A', '#FFFFFF'],
    accent: '#FFFFFF',
    contour: 'rgba(255, 255, 255, 0.55)',
  },
  'OJS-12': {
    bg: '#18181B',
    grad: ['#27272A', '#3F3F46', '#52525B', '#71717A'],
    accent: '#E4E4E7',
    contour: 'rgba(228, 228, 231, 0.35)',
  },
  'BAR-13': {
    bg: '#3D1501',
    grad: ['#78350F', '#92400E', '#B45309', '#D97706'],
    accent: '#FDE68A',
    contour: 'rgba(253, 230, 138, 0.35)',
  },
  'RIO-14': {
    bg: '#3B0808',
    grad: ['#7F1D1D', '#991B1B', '#B91C1C', '#D97706'],
    accent: '#FCA5A5',
    contour: 'rgba(252, 165, 165, 0.35)',
  },
};

// ─── Intelligent Geological Site Image Component ─────────────────────────────
// Dynamic Wikipedia REST API image with verified static Wikimedia backup
// and procedural SRTM satellite topography canvas fallback on network failure.
export function GeologicalSiteImage({ site }: { site: EarthSite }) {
  const wikiUrl = useWikipediaImage(site.id);
  const [imgSrc, setImgSrc] = useState<string>(
    () => wikiUrl || WIKIPEDIA_TARGET_REGISTRY[site.id]?.staticBackup || site.photoEarth
  );
  const [useFallback, setUseFallback] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (wikiUrl) {
      setImgSrc(wikiUrl);
      setUseFallback(false);
    }
  }, [wikiUrl]);

  // Draw procedural high-res SRTM satellite topography on canvas fallback
  useEffect(() => {
    if (!useFallback) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 500;
    canvas.width = W;
    canvas.height = H;

    const pal = SITE_GEOLOGY_PALETTES[site.id] || {
      bg: '#18191E',
      grad: ['#27272A', '#18181B', '#0A0A0C'],
      accent: '#FFFFFF',
      contour: 'rgba(255,255,255,0.25)',
    };

    // 1. Satellite Base Gradient
    const baseGrad = ctx.createLinearGradient(0, 0, W, H);
    baseGrad.addColorStop(0, pal.bg);
    baseGrad.addColorStop(0.35, pal.grad[0] || pal.bg);
    baseGrad.addColorStop(0.7, pal.grad[1] || pal.bg);
    baseGrad.addColorStop(1, pal.grad[2] || pal.bg);
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Realistic Topographic Elevation Curves (SRTM Iso-Elevation Lines)
    const centerX = W * 0.52;
    const centerY = H * 0.5;

    for (let r = 30; r < 460; r += 26) {
      ctx.beginPath();
      ctx.strokeStyle = pal.contour;
      ctx.lineWidth = r % 78 === 0 ? 1.6 : 0.8;

      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.08) {
        const noise =
          Math.sin(a * 4 + r * 0.04) * 16 +
          Math.sin(a * 9) * 8 +
          Math.cos(a * 2 + r * 0.08) * 10;
        const rad = r + noise;
        const px = centerX + Math.cos(a) * rad * 1.25;
        const py = centerY + Math.sin(a) * rad * 0.85;

        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // 3. Central Mineral Peak / Geological Target Reticle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = pal.accent;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshairs
    ctx.strokeStyle = pal.contour;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY);
    ctx.lineTo(centerX + 40, centerY);
    ctx.moveTo(centerX, centerY - 40);
    ctx.lineTo(centerX, centerY + 40);
    ctx.stroke();

    // 4. NASA Orbital Telemetry HUD Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, H - 42, W, 42);

    ctx.font = "600 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = pal.accent;
    ctx.fillText(`NASA Earth Observatory · SRTM 30m DEM · ${site.id}`, 20, H - 24);

    ctx.font = "400 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'right';
    ctx.fillText(`${site.dms} · ELEV: ${site.elevM}m · PEND: ${site.slopeDeg}°`, W - 20, H - 24);
    ctx.textAlign = 'left';
  }, [useFallback, site]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0A0D14]">
      {/* Primary Real Photo (Dynamic Wikipedia / Static Backup) */}
      <img
        src={imgSrc}
        alt={site.name}
        className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
          useFallback ? 'hidden' : 'block'
        }`}
        onLoad={() => {
          setUseFallback(false);
        }}
        onError={() => {
          const backup = WIKIPEDIA_TARGET_REGISTRY[site.id]?.staticBackup;
          if (backup && imgSrc !== backup) {
            setImgSrc(backup);
          } else {
            setUseFallback(true);
          }
        }}
        loading="lazy"
      />

      {/* Procedural Canvas Fallback */}
      {useFallback && (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}

      {/* Subtle Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />
    </div>
  );
}

// ─── Lusion Cyber/Matrix Scramble Text Decode Component ─────────────────────
const SCRAMBLE_GLYPHS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789!@#$%&*+=-_~?';

export function ScrambleText({
  text,
  isHovered = false,
  duration = 650,
  className = '',
  as: Component = 'span',
}: {
  text: string;
  isHovered?: boolean;
  duration?: number;
  className?: string;
  as?: any;
}) {
  const [display, setDisplay] = useState(text);
  const elemRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const hasAnimatedInitial = useRef(false);

  const scramble = useCallback(
    (customDuration?: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const totalTime = customDuration || duration;
      const startTime = performance.now();
      const chars = text.split('');

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / totalTime);
        const revealIdx = Math.floor(progress * chars.length);

        const result = chars
          .map((c, i) => {
            if (c === ' ' || c === '·' || c === '•' || c === '/' || c === '(' || c === ')' || c === ',' || c === '-') return c;
            if (i < revealIdx) return c;
            return SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
          })
          .join('');

        setDisplay(result);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(text);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [text, duration]
  );

  // Trigger scramble when entering viewport (Lusion scroll text decode)
  useEffect(() => {
    const el = elemRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedInitial.current) {
          hasAnimatedInitial.current = true;
          scramble(duration);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scramble, duration]);

  // Trigger quick scramble wave on card hover
  useEffect(() => {
    if (isHovered && hasAnimatedInitial.current) {
      scramble(420);
    }
  }, [isHovered, scramble]);

  return (
    <Component ref={elemRef} className={className}>
      {display}
    </Component>
  );
}

// ─── Single Site Gallery Card (Lusion Aesthetics & Kinetic Arrow) ───────────
const SiteCard = React.memo(function SiteCard({
  rankedSite,
  onSelect,
}: {
  rankedSite: RankedSite;
  onSelect: () => void;
}) {
  const { site, pfi } = rankedSite;
  const cardRef = useRef<HTMLDivElement>(null);
  const imgFrameRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Parallax window frame effect (Locomotive / GSAP ScrollTrigger)
  useEffect(() => {
    const gsap = (window as any).gsap;
    const ScrollTrigger = (window as any).ScrollTrigger;
    const frame = imgFrameRef.current;
    const card = cardRef.current;
    if (!gsap || !ScrollTrigger || !frame || !card) return;

    const tween = gsap.fromTo(
      frame,
      { yPercent: -6, scale: 1.06 },
      {
        yPercent: 6,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

    return () => {
      if (tween.scrollTrigger) {
        tween.scrollTrigger.kill();
      }
      tween.kill();
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 9;
    const rotateX = (0.5 - y) * 9;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  }, []);

  const pfiDisplay = Math.round(pfi);

  return (
    <div
      ref={cardRef}
      className="lusion-card group cursor-pointer flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseLeave();
      }}
      onClick={onSelect}
    >
      {/* ── 1. Hero Media Frame (Full-bleed 28px rounded with glass badges) ── */}
      <div className="lusion-card-media relative w-full h-[340px] sm:h-[390px] md:h-[420px] mb-5">
        <div ref={imgFrameRef} className="w-full h-full parallax-frame-img">
          <GeologicalSiteImage site={site} />
        </div>

        {/* Top Floating Glass Badges */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Top Left: Site ID & Biome */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-sm">
              {site.id}
            </span>
            <span className="font-sans text-[11px] uppercase tracking-wider text-white/90 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 hidden sm:inline-block">
              {site.biome}
            </span>
          </div>

          {/* Top Right: Candidate & PFI Score */}
          <div className="flex items-center gap-2">
            {site.isCandidate && (
              <span className="font-sans text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-white text-[#0A0A0C] shadow-sm">
                {site.id.startsWith('DISC-') ? 'Satélite' : 'Candidato'}
              </span>
            )}
            <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white border border-white/15 tabular-nums shadow-sm">
              {pfiDisplay}% PFI
            </span>
          </div>
        </div>

        {/* Bottom Coordinates & Fidelity HUD */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <span className="font-mono text-[10px] text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 tabular-nums">
            {site.dms} · {site.elevM.toLocaleString()} m s.n.m.
          </span>
          <span className="font-sans text-[10px] text-white/85 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 font-medium">
            {fidelityLabel(pfiDisplay)}
          </span>
        </div>
      </div>

      {/* ── 2. Editorial Typography & Kinetic Arrow (Lusion Design) ── */}
      <div className="flex-1 flex flex-col justify-between px-1">
        <div>
          {/* Uppercase Mono Micro-label with Lusion Scramble Reveal */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8E9299] uppercase tracking-[0.14em] mb-1.5 overflow-hidden whitespace-nowrap">
            <ScrambleText
              text={`${site.biome.toUpperCase()} • ${site.nasaDatasets || 'NASA SRTM 30M'} • ANALOGÍA NASA`}
              isHovered={isHovered}
              duration={700}
              className="truncate"
            />
          </div>

          {/* Title Row with Lusion Expanding Kinetic Arrow & Character Scramble */}
          <div className="lusion-arrow-wrap mb-1.5">
            <span
              className="lusion-arrow group-hover:w-[26px] group-hover:opacity-100 group-hover:translate-x-0 group-hover:mr-2"
              aria-hidden="true"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <polyline points="13 5 20 12 13 19"></polyline>
              </svg>
            </span>
            <ScrambleText
              as="h3"
              text={site.name}
              isHovered={isHovered}
              duration={650}
              className="lusion-card-title text-2xl md:text-[28px] font-bold text-[#0A0A0E] tracking-tight leading-tight font-sans group-hover:translate-x-1 transition-transform"
            />
          </div>

          {/* Geographic Subtitle */}
          <p className="font-sans text-xs text-[#71717A] mb-4">
            {site.country} · {site.region}
          </p>

          {/* Clean Editorial Micro-Details (Micro-escala & Proceso activo) */}
          <div className="pt-3 border-t border-[#E5E7EB] mb-4 text-xs font-sans space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
              <span className="text-[#71717A] font-medium shrink-0">Proceso activo:</span>
              <span className="text-[#18181B] truncate text-left sm:text-right font-normal">{site.activeProcess}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
              <span className="text-[#71717A] font-medium shrink-0">Micro-escala:</span>
              <span className="text-[#18181B] truncate text-left sm:text-right font-normal">{site.microScale}</span>
            </div>
          </div>

          {/* Summary */}
          <p className="text-[13px] text-[#4B5563] leading-[1.65] line-clamp-2 font-normal font-sans mb-4">
            {site.summary}
          </p>
        </div>

        {/* Bottom CTA Link: Explorar caso de estudio geológico → */}
        <div className="pt-3.5 border-t border-[#E5E7EB]/80 flex items-center justify-between text-xs font-semibold text-[#0A0A0E] font-sans">
          <span className="relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#0A0A0E] group-hover:after:w-full after:transition-all after:duration-300">
            Explorar caso de estudio geológico
          </span>
          <span className="text-sm transform group-hover:translate-x-1.5 transition-transform duration-300 font-normal">
            →
          </span>
        </div>
      </div>
    </div>
  );
});

// ─── Filter Bar Options ──────────────────────────────────────────────────────
const GALLERY_FILTERS: { key: string; label: string }[] = [
  { key: 'Todos', label: 'Todos (14)' },
  { key: 'Candidatos', label: 'Nuevos candidatos (7)' },
  { key: 'Hiperárido', label: 'Hiperárido' },
  { key: 'Polar/Criogénico', label: 'Polar / Criogénico' },
  { key: 'Volcánico', label: 'Volcánico' },
  { key: 'Impacto/Cráter', label: 'Impacto / Cráter' },
  { key: 'Subterráneo/Cueva', label: 'Subterráneo / Cueva' },
];

export default function SiteGallery({
  rankedSites,
  onSelectSite,
  scrollVelocity = 0,
}: SiteGalleryProps) {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const filterTrackRef = useRef<HTMLDivElement>(null);
  const filterBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // ── High-Performance Scroll Velocity & Flexion Physics Engine ─────────────
  const [internalVelocity, setInternalVelocity] = useState(0);
  const targetVelocityRef = useRef(0);
  const currentVelocityRef = useRef(0);
  const lastScrollYRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const lastTimeRef = useRef(performance.now());
  const rafVelocityRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTimeRef.current);
      const sy = window.scrollY;
      const dy = sy - lastScrollYRef.current;

      const v = (dy / dt) * 16;
      targetVelocityRef.current = Math.min(Math.max(v, -60), 60);

      lastScrollYRef.current = sy;
      lastTimeRef.current = now;
    };

    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.on('scroll', (e: any) => {
        if (typeof e.velocity === 'number') {
          targetVelocityRef.current = Math.min(Math.max(e.velocity * 1.2, -60), 60);
        } else {
          handleScroll();
        }
      });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Inertial physics loop: smooth lerp with rapid decay to flat when scrolling stops
    const tick = () => {
      targetVelocityRef.current *= 0.82;
      currentVelocityRef.current += (targetVelocityRef.current - currentVelocityRef.current) * 0.18;

      const v = currentVelocityRef.current;
      if (Math.abs(v) < 0.04) {
        if (currentVelocityRef.current !== 0) {
          currentVelocityRef.current = 0;
          setInternalVelocity(0);
        }
      } else {
        setInternalVelocity(v);
      }
      rafVelocityRef.current = requestAnimationFrame(tick);
    };

    rafVelocityRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafVelocityRef.current) cancelAnimationFrame(rafVelocityRef.current);
    };
  }, []);

  // Calculate sliding magnetic bubble position
  const updatePillPosition = useCallback(() => {
    const activeBtn = filterBtnRefs.current.get(activeFilter);
    const track = filterTrackRef.current;
    if (activeBtn && track) {
      const trackRect = track.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setPillStyle({
        left: btnRect.left - trackRect.left,
        width: btnRect.width,
        opacity: 1,
      });
    }
  }, [activeFilter]);

  useEffect(() => {
    updatePillPosition();
    window.addEventListener('resize', updatePillPosition);
    return () => window.removeEventListener('resize', updatePillPosition);
  }, [updatePillPosition]);

  // Filter ranked sites based on user-selected filter chip
  const filteredRankedSites = rankedSites.filter((rs) => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Candidatos') return rs.site.isCandidate === true;
    if (activeFilter === 'Volcánico') {
      return rs.site.biome === 'Volcánico/Basáltico';
    }
    return rs.site.biome === activeFilter;
  });

  // Effective velocity combines internal physics engine and external prop
  const effectiveVelocity = Math.abs(internalVelocity) > Math.abs(scrollVelocity) ? internalVelocity : scrollVelocity;
  // Lusion Flexion Skew: between -4.8deg and +4.8deg with vertical elastic stretch
  const skewDeg = Math.min(Math.max(-effectiveVelocity * 0.15, -4.8), 4.8);
  const stretchY = 1 + Math.min(Math.abs(effectiveVelocity) * 0.0018, 0.048);

  return (
    <section
      id="gallery-section"
      className="section-light py-28 px-6 select-none"
      style={{
        background: '#F5F5F3',
        backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.04) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span
              className="font-sans uppercase tracking-wider block mb-3 text-[#686B75]"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              02 — Laboratorio de campo terrestre · 14 sitios análogos
            </span>
            <h2
              className="editorial-reveal-title"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 'clamp(30px, 3.5vw, 44px)',
                color: '#0A0A0E',
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: '-0.03em',
              }}
            >
              Sitios análogos caracterizados
            </h2>
            <p className="text-[#4B5563] text-[15px] mt-3 max-w-[65ch] font-normal leading-[1.65]">
              Catálogo de los 14 sitios de prueba terrestres caracterizados para misiones Artemis en la Luna y bases en Marte. Reordenados dinámicamente por afinidad con el destino y las 8 dimensiones oficiales de la NASA.
            </p>
          </div>

          <div className="font-sans text-xs text-[#686B75] bg-white px-4 py-2.5 rounded-full border border-[#E2E4EC] shadow-sm shrink-0 self-start md:self-end">
            Catálogo: <strong className="text-[#0A0A0E] font-semibold">{rankedSites.length} sitios activos</strong>
          </div>
        </div>

        {/* ── Magnetic Sliding Pill Filter Bar (Lusion Interactive Bubble) ── */}
        <div className="mb-14 overflow-x-auto pb-2 scrollbar-none">
          <div
            ref={filterTrackRef}
            className="relative inline-flex items-center gap-1 p-1.5 bg-white/90 backdrop-blur-md rounded-full border border-[#E2E4EC] shadow-sm"
          >
            {/* Sliding Elastic Active Pill */}
            <div
              className="absolute rounded-full bg-[#0A0A0E] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm"
              style={{
                left: `${pillStyle.left}px`,
                width: `${pillStyle.width}px`,
                top: '6px',
                bottom: '6px',
                opacity: pillStyle.opacity,
              }}
            />

            {GALLERY_FILTERS.map((f) => {
              const isSelected = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  ref={(el) => {
                    if (el) filterBtnRefs.current.set(f.key, el);
                    else filterBtnRefs.current.delete(f.key);
                  }}
                  onClick={() => setActiveFilter(f.key)}
                  className={`relative z-10 font-sans text-xs px-4 py-2 rounded-full transition-colors duration-200 whitespace-nowrap ${
                    isSelected
                      ? 'text-white font-semibold'
                      : 'text-[#686B75] hover:text-[#0A0A0E] font-medium'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2-Column Spacious Editorial Grid with Lusion Velocity Flexion ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 items-start"
          style={{
            willChange: 'transform',
            transform: Math.abs(effectiveVelocity) > 0.08
              ? `skewY(${skewDeg.toFixed(2)}deg) scaleY(${stretchY.toFixed(3)})`
              : 'none',
            transformOrigin: 'center center',
            transition: Math.abs(effectiveVelocity) <= 0.08 ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          {filteredRankedSites.map((rs) => (
            <SiteCard
              key={rs.site.id}
              rankedSite={rs}
              onSelect={() => onSelectSite(rs.site.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
