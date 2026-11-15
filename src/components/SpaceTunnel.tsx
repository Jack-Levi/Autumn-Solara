import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface SpaceTunnelProps {
  onEnterEditorial?: () => void;
  heightViewport?: number; // Multiplicador de scroll en viewport (default: 2.15 = 215vh)
}

export default function SpaceTunnel({
  onEnterEditorial,
  heightViewport = 2.15,
}: SpaceTunnelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // ─── 1. Textura de Difracción de Micro-Estrellita (4 Puntas) ─────────────
    const createMiniStarTexture = () => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      if (!ctx) return new THREE.Texture();
      const cx = 32;
      const cy = 32;

      // Halo radial luminoso
      const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
      radGrad.addColorStop(0, '#FFFFFF');
      radGrad.addColorStop(0.2, '#A6F0FF');
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();

      // Picos de difracción de 4 puntas
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, 3);
      ctx.lineTo(cx, 61);
      ctx.moveTo(3, cy);
      ctx.lineTo(61, cy);
      ctx.stroke();

      const texture = new THREE.CanvasTexture(c);
      texture.generateMipmaps = true;
      return texture;
    };

    // ─── 2. Escena, Cámara y Renderer WebGL ──────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020306, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1400
    );
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Iluminación Ambiental y Direccional Suave
    const ambientLight = new THREE.AmbientLight(0x060914, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(0, 15, 20);
    scene.add(keyLight);

    // Luces Móviles Viajeras: Azul Zafiro & Cian Neón Tenue
    const sapphireLight = new THREE.PointLight(0x0d47a1, 6.0, 140);
    scene.add(sapphireLight);

    const cyanLight = new THREE.PointLight(0x00e5ff, 4.8, 120);
    scene.add(cyanLight);

    // ─── 3. Agujero Negro Cósmico con Disco de Acreción Cromático (Shader GLSL) ─
    const haloGeo = new THREE.PlaneGeometry(240, 240);
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorCore: { value: new THREE.Color(0x00e5ff) },   // Cian
        uColorMid: { value: new THREE.Color(0x2979ff) },    // Azul eléctrico
        uColorOuter: { value: new THREE.Color(0xffffff) },  // Blanco puro
        uRadius: { value: 0.35 },
        uThickness: { value: 0.065 },
        uOpacity: { value: 0.95 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        uniform vec3 uColorOuter;
        uniform float uRadius;
        uniform float uThickness;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center);
          float angle = atan(center.y, center.x);

          float swirl = sin(angle * 6.0 + uTime * 2.8 + dist * 14.0) * 0.025;
          float effectiveDist = dist + swirl;

          float ringDist = abs(effectiveDist - uRadius);
          float ringAlpha = smoothstep(uThickness, 0.0, ringDist);

          // Dispersión cromática de arcoíris sutil
          float hueShift = fract(effectiveDist * 4.0 - uTime * 0.4 + angle / 6.28318);
          vec3 col = mix(uColorCore, uColorMid, smoothstep(0.0, 0.5, hueShift));
          col = mix(col, uColorOuter, smoothstep(0.5, 1.0, hueShift));

          // Brillo interno en el horizonte de sucesos
          float innerGlow = smoothstep(uRadius - uThickness * 1.5, uRadius, effectiveDist) *
                            smoothstep(uRadius + uThickness * 2.5, uRadius, effectiveDist);
          col += vec3(0.5, 0.7, 1.0) * innerGlow * 1.8;

          // Desvanecimiento suave en los bordes del plano
          float edgeFade = smoothstep(0.5, 0.45, dist);
          float finalAlpha = ringAlpha * uOpacity * edgeFade;

          gl_FragColor = vec4(col, finalAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const chromaticHalo = new THREE.Mesh(haloGeo, haloMat);
    chromaticHalo.position.set(0, 0, -72);
    scene.add(chromaticHalo);

    // ─── 4. Túnel Vórtice Octogonal Continuo en Azul Oscuro Medio Transparente ───
    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);

    const RING_COUNT = 48;
    const RING_SPACING = 15;
    const TUNNEL_RADIUS = 18;

    // Cristal Azul Oscuro Medio Transparente (Fiel al proyecto original de Autumn Solara)
    const darkBlueTranslucentMat = new THREE.MeshStandardMaterial({
      color: 0x0a224a,
      metalness: 0.88,
      roughness: 0.18,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const cyanRibMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.75,
    });

    const cornerNodeMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
    });

    const cornerNodeGeo = new THREE.SphereGeometry(0.24, 10, 10);
    const tunnelRingMeshes: THREE.Group[] = [];

    for (let i = 0; i < RING_COUNT; i++) {
      const ringGroup = new THREE.Group();
      const zPos = -15 - i * RING_SPACING;
      ringGroup.position.set(0, 0, zPos);

      // Caras cilíndricas de 8 lados (octágono) translúcidas en azul marino
      const shellGeo = new THREE.CylinderGeometry(
        TUNNEL_RADIUS,
        TUNNEL_RADIUS,
        RING_SPACING,
        8,
        1,
        true
      );
      shellGeo.rotateX(Math.PI / 2);

      const shellMesh = new THREE.Mesh(shellGeo, darkBlueTranslucentMat);
      ringGroup.add(shellMesh);

      // Costillas y aristas en cian neón
      const edgesGeo = new THREE.EdgesGeometry(shellGeo);
      const wireframe = new THREE.LineSegments(edgesGeo, cyanRibMat);
      ringGroup.add(wireframe);

      // 8 micro-nodos luminosos por anillo
      for (let v = 0; v < 8; v++) {
        const angle = (v / 8) * Math.PI * 2;
        const node = new THREE.Mesh(cornerNodeGeo, cornerNodeMat);
        node.position.set(
          Math.cos(angle) * TUNNEL_RADIUS,
          Math.sin(angle) * TUNNEL_RADIUS,
          0
        );
        ringGroup.add(node);
      }

      tunnelRingMeshes.push(ringGroup);
      tunnelGroup.add(ringGroup);
    }

    // ─── 5. Campo Estelar Denso de 9,600 Partículas en Vórtice ────────────────
    const STAR_COUNT = 9600;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starSpeeds = new Float32Array(STAR_COUNT);
    const starColors = new Float32Array(STAR_COUNT * 3);

    for (let s = 0; s < STAR_COUNT; s++) {
      const isCore = s < STAR_COUNT * 0.65;
      const angle = Math.random() * Math.PI * 2;
      let rad = 0;

      if (isCore) {
        rad = 1.0 + Math.pow(Math.random(), 0.8) * (TUNNEL_RADIUS * 1.3);
      } else {
        rad = TUNNEL_RADIUS + Math.random() * 55.0;
      }

      starPositions[s * 3] = Math.cos(angle) * rad;
      starPositions[s * 3 + 1] = Math.sin(angle) * rad;
      starPositions[s * 3 + 2] = -Math.random() * 850;

      starSpeeds[s] = 1.0 + Math.random() * 3.4;

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
        starColors[s * 3 + 2] = 1.0;
      }
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starTexture = createMiniStarTexture();
    const starMat = new THREE.PointsMaterial({
      size: 0.52,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starSystem = new THREE.Points(starGeo, starMat);
    scene.add(starSystem);

    // ─── 6. Variables de Interacción, Scroll & Crucero Automático ──────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentScrollPct = 0;
    let lastScrollY = window.scrollY;
    let isAutoFlying = false;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Control de crucero: se activa suavemente al bajar y se libera instantáneamente al subir
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < -5) {
        if (isAutoFlying) isAutoFlying = false;
      } else if (e.deltaY > 5) {
        const rect = container.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.2) {
          if (!isAutoFlying && currentScrollPct < 0.92) {
            isAutoFlying = true;
          }
        }
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const deltaTouch = touchStartY - e.touches[0].clientY;
      if (deltaTouch < -10) {
        if (isAutoFlying) isAutoFlying = false;
      } else if (deltaTouch > 10) {
        const rect = container.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.2) {
          if (!isAutoFlying && currentScrollPct < 0.92) {
            isAutoFlying = true;
          }
        }
      }
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // IntersectionObserver para pausar el cálculo cuando no esté en pantalla
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { rootMargin: '200px' }
    );
    observer.observe(container);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    // ─── 7. Bucle de Animación a 60fps ──────────────────────────────────────
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible && !isAutoFlying) return;

      const elapsedTime = clock.getElapsedTime();

      // Cálculo de progreso de scroll normalizado
      const rect = container.getBoundingClientRect();
      const totalDist = rect.height - window.innerHeight;
      let pct = 0;
      if (totalDist > 0) {
        pct = Math.max(0, Math.min(1, -rect.top / totalDist));
      }
      currentScrollPct += (pct - currentScrollPct) * 0.12;
      setScrollProgress(currentScrollPct);

      const curY = window.scrollY;
      const scrollDelta = curY - lastScrollY;
      lastScrollY = curY;

      if (scrollDelta < -2 && isAutoFlying) {
        isAutoFlying = false;
      }

      // Crucero automático ágil hacia las tarjetas de misión (~3 segundos)
      if (isAutoFlying) {
        const progressNorm = Math.max(0, Math.min(1, currentScrollPct));
        let cruiseBoost = 1.0 + Math.sin(progressNorm * Math.PI) * 3.2;
        if (progressNorm >= 0.85) {
          cruiseBoost = Math.max(cruiseBoost, 3.2 + (progressNorm - 0.85) * 16.0);
        }
        const autoStepY = 7.2 * cruiseBoost;

        const lenis = (window as any).__lenis;
        if (lenis && typeof lenis.scrollTo === 'function') {
          lenis.scrollTo(lenis.scroll + autoStepY, { immediate: true });
        } else {
          window.scrollBy({ top: autoStepY, behavior: 'instant' });
        }

        const missionsEl = document.getElementById('missions-section');
        const missionsTop = missionsEl ? missionsEl.getBoundingClientRect().top : 999;
        if (missionsTop <= 15) {
          isAutoFlying = false;
          if (onEnterEditorial) onEnterEditorial();
        }
      }

      // Inclinación de perspectiva con el ratón
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      camera.position.x = mouseX * 2.2;
      camera.position.y = -mouseY * 2.0;

      // Actualizar shader del halo
      haloMat.uniforms.uTime.value = elapsedTime * 2.0;

      // Animación continua de torsión helicoidal de todo el túnel (Efecto Vórtice)
      tunnelRingMeshes.forEach((ring, idx) => {
        ring.rotation.z = (idx * 0.14) + (elapsedTime * 6.5) + (currentScrollPct * 10.0);
      });

      // ── FASES CINEMÁTICAS SINCRONIZADAS AL SCROLL ────────────────────────
      const p = currentScrollPct;

      if (p < 0.22) {
        // Fase 1: Agujero Negro & Dive Inmersivo
        const p1 = p / 0.22;
        camera.position.z = 18 - p1 * 33; // Desde 18 hasta -15
        camera.fov = 60;
        camera.updateProjectionMatrix();

        chromaticHalo.position.z = camera.position.z - 90;
        haloMat.uniforms.uRadius.value = 0.35;
        haloMat.uniforms.uThickness.value = 0.065;
        haloMat.uniforms.uOpacity.value = 0.95;

        if (p < 0.10) {
          tunnelGroup.visible = false;
        } else {
          tunnelGroup.visible = true;
          darkBlueTranslucentMat.opacity = Math.min(0.52, ((p - 0.10) / 0.12) * 0.52);
        }

        sapphireLight.intensity = 0;
        cyanLight.intensity = 0;
      } else if (p >= 0.22 && p < 0.88) {
        // Fase 2: Vórtice en Túnel Azul Oscuro Translúcido (Warp Extremo)
        const p2 = (p - 0.22) / 0.66;
        tunnelGroup.visible = true;
        darkBlueTranslucentMat.opacity = 0.52;

        camera.position.z = -15 - p2 * 680;
        camera.fov = 60 + Math.sin(p2 * Math.PI) * 18; // Efecto warp hasta 78°
        camera.updateProjectionMatrix();

        chromaticHalo.position.z = camera.position.z - 75;
        haloMat.uniforms.uRadius.value = 0.42;
        haloMat.uniforms.uThickness.value = 0.07;
        haloMat.uniforms.uOpacity.value = Math.max(0.18, 0.85 - p2 * 0.65);

        // Luces viajeras dinámicas
        sapphireLight.intensity = 6.0;
        sapphireLight.position.set(0, 0, camera.position.z - 26);

        cyanLight.intensity = 4.8;
        cyanLight.position.set(
          Math.cos(elapsedTime * 8.0) * 8.5,
          Math.sin(elapsedTime * 8.0) * 8.5,
          camera.position.z - 18
        );
      } else {
        // Fase 3: Singularidad Óptica & Salida a Tarjetas de Misión
        const p3 = (p - 0.88) / 0.12;
        haloMat.uniforms.uOpacity.value = Math.max(0, 0.75 - p3 * 2.5);

        // Desvanecimiento del túnel en la salida para dejar espacio limpio
        if (p < 0.94) {
          tunnelGroup.visible = true;
        } else {
          tunnelGroup.visible = false;
        }

        camera.position.z = -705 - p3 * 25;
        camera.fov = 60;
        camera.updateProjectionMatrix();

        sapphireLight.intensity = 0;
        cyanLight.intensity = 0;
      }

      // Estrellas hiperespaciales
      const starPosArr = starGeo.attributes.position.array as Float32Array;
      const speedMult = 1.0 + (p > 0.15 ? Math.min(18.0, Math.pow(p - 0.15, 1.25) * 14.0) : 0);
      starMat.size = 0.52 + (p > 0.35 ? Math.min(1.2, (p - 0.35) * 1.5) : 0);

      for (let s = 0; s < STAR_COUNT; s++) {
        starPosArr[s * 3 + 2] += starSpeeds[s] * speedMult;
        if (starPosArr[s * 3 + 2] > camera.position.z + 5) {
          starPosArr[s * 3 + 2] = camera.position.z - 750;
          starPosArr[s * 3] = (Math.random() - 0.5) * 110;
          starPosArr[s * 3 + 1] = (Math.random() - 0.5) * 80;
        }
      }
      starGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      darkBlueTranslucentMat.dispose();
      cyanRibMat.dispose();
      cornerNodeMat.dispose();
      cornerNodeGeo.dispose();
      starGeo.dispose();
      starMat.dispose();
    };
  }, [onEnterEditorial]);

  // Escala y desvanecimiento de la tipografía de 3 líneas
  const pNorm = Math.min(1, scrollProgress / 0.22);
  const textScale = 1.0 + Math.pow(pNorm, 2.2) * 9.5;
  const textOpacity = pNorm < 0.5 ? 1.0 : Math.max(0, 1.0 - (pNorm - 0.5) / 0.5);

  // Destello de singularidad suave al finalizar el túnel
  const singularityFlashAlpha =
    scrollProgress < 0.88 ? 0 : Math.min(1, Math.sin(((scrollProgress - 0.88) / 0.08) * Math.PI) * 1.5);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{
        height: `${heightViewport * 100}vh`,
        background: '#020306',
      }}
    >
      {/* Viewport Fijo con la Experiencia WebGL */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Canvas de Three.js */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
          style={{ willChange: 'transform' }}
        />

        {/* Viñeta Periférica Cinematográfica */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 38%, rgba(2, 3, 6, 0.82) 100%)',
          }}
        />

        {/* Leyenda Central Limpia y Monumental */}
        <div
          className="relative z-10 text-center px-6 pointer-events-none flex flex-col items-center"
          style={{
            transform: `scale(${textScale})`,
            opacity: textOpacity,
            willChange: 'transform, opacity',
            transition: 'opacity 0.08s ease-out',
          }}
        >
          <h2
            className="text-white font-extrabold uppercase tracking-tight"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(34px, 6.2vw, 84px)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              textShadow:
                '0 0 60px rgba(0, 229, 255, 0.45), 0 4px 30px rgba(0, 0, 0, 0.95)',
            }}
          >
            STEP INTO ANALOG WORLDS<br />
            AND LET YOUR<br />
            EXPLORATION RUN WILD
          </h2>
          <span className="font-sans text-xs text-[#8E9299] mt-3 tracking-wide">
            Datos satelitales NASA LRO / MRO / USGS SRTM
          </span>
        </div>

        {/* Destello Óptico de Singularidad hacia MissionCards */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: '#FFFFFF',
            opacity: singularityFlashAlpha,
            zIndex: 40,
            transition: 'opacity 0.05s ease-out',
          }}
        />
      </div>
    </div>
  );
}
