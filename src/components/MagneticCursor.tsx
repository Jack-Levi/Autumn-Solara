import React, { useEffect, useRef, useState } from 'react';

interface MagneticCursorProps {
  onSoundTrigger?: () => void;
}

export default function MagneticCursor({ onSoundTrigger }: MagneticCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  const posRef = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 500 });
  const targetPosRef = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 500 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosRef.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Expand ONLY on large content cards / hero / gallery / comparator / mission cards
      const isBigCard = target.closest(
        '.gallery-card, .mission-card, .comparator-handle, .comparator-container, .carousel-card, .interactive-card, .hero-interactive'
      );

      if (isBigCard) {
        setIsExpanded(true);
      } else {
        // Small buttons, sliders, map controls, nav pills keep the tiny 10px dot
        setIsExpanded(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animId: number;
    let lastX = targetPosRef.current.x;
    let lastY = targetPosRef.current.y;
    let currentAngle = 0;

    const updateLoop = () => {
      // Fast reactive lerp 0.28 (zero heavy delay)
      const lerp = 0.28;
      posRef.current.x += (targetPosRef.current.x - posRef.current.x) * lerp;
      posRef.current.y += (targetPosRef.current.y - posRef.current.y) * lerp;

      // Calculate velocity
      const vx = targetPosRef.current.x - lastX;
      const vy = targetPosRef.current.y - lastY;
      lastX = targetPosRef.current.x;
      lastY = targetPosRef.current.y;
      velocityRef.current = { vx, vy };

      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > 0.4) {
        currentAngle = (Math.atan2(vy, vx) * 180) / Math.PI;
      }

      if (cursorRef.current) {
        // Apply elastic stretch along movement vector when fast
        const stretchX = 1 + Math.min(speed * 0.008, 0.25);
        const stretchY = 1 - Math.min(speed * 0.005, 0.15);

        cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%) scale(${stretchX}, ${stretchY})`;
      }

      if (arrowRef.current && isExpanded) {
        arrowRef.current.style.transform = `rotate(${currentAngle}deg)`;
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [isExpanded]);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center transition-[width,height,background-color] duration-300 ease-out"
      style={{
        width: isExpanded ? '80px' : '10px',
        height: isExpanded ? '80px' : '10px',
        backgroundColor: '#2544FF',
        boxShadow: isExpanded ? '0 10px 30px rgba(37,68,255,0.45)' : 'none',
      }}
    >
      {/* Clean large white vector arrow, strictly NO text inside */}
      <svg
        ref={arrowRef}
        className="text-white transition-opacity duration-200 pointer-events-none"
        style={{
          width: '28px',
          height: '28px',
          opacity: isExpanded ? 1 : 0,
        }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" y1="12" x2="20" y2="12" />
        <polyline points="13 5 20 12 13 19" />
      </svg>
    </div>
  );
}
