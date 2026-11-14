import React, { useEffect, useRef } from 'react';

// ─── Lusion-Grade Liquid Glass / Iridescent Fluid Trail ───────────────────────
// Real-time 2D Navier-Stokes fluid simulation with double-buffered Ping-Pong FBOs,
// sub-frame mouse interpolation, 3D normal reconstruction from heightfield,
// thin-film iridescence (#ffb085, #6be8ff, #d4b2ff), chromatic dispersion,
// viscous momentum diffusion and studio specular highlights.

export default function FluidTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const domCanvas = canvasRef.current;
    if (!domCanvas) return;

    // Request WebGL2 with transparent composite
    const rawGl = domCanvas.getContext('webgl2', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });

    if (!rawGl) {
      console.warn('WebGL2 not supported for fluid trail.');
      return;
    }

    const gl: WebGL2RenderingContext = rawGl;
    const canvas: HTMLCanvasElement = domCanvas;

    // Required extensions for half-float linear filtering & render targets
    gl.getExtension('EXT_color_buffer_float');
    gl.getExtension('OES_texture_float_linear');

    // ── Shaders ─────────────────────────────────────────────────────────────
    const baseVertexShader = `#version 300 es
    precision highp float;
    in vec2 aPosition;
    out vec2 vUv;
    void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }`;

    // Splat (injects velocity or density/height)
    const splatShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uTarget;
    uniform float uAspect;
    uniform vec2 uPoint;
    uniform vec3 uColor;
    uniform float uRadius;

    void main() {
        vec2 p = vUv - uPoint;
        p.x *= uAspect;
        float d2 = dot(p, p);
        float r2 = uRadius * uRadius;
        float splat = exp(-d2 / (2.0 * r2));
        vec4 base = texture(uTarget, vUv);
        fragColor = base + vec4(uColor * splat, 0.0);
    }`;

    // Advection (semi-Lagrangian advection)
    const advectionShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 uTexelSize;
    uniform float uDt;
    uniform float uDissipation;

    void main() {
        vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexelSize;
        fragColor = uDissipation * texture(uSource, coord);
    }`;

    // Viscous Velocity Diffusion (Jacobi iteration)
    const diffuseShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uVelocity0;
    uniform vec2 uTexelSize;
    uniform float uAlpha;
    uniform float uReciprocalBeta;

    void main() {
        vec2 L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).xy;
        vec2 R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).xy;
        vec2 B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).xy;
        vec2 T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).xy;
        vec2 bC = texture(uVelocity0, vUv).xy;
        fragColor = vec4((L + R + B + T + uAlpha * bC) * uReciprocalBeta, 0.0, 1.0);
    }`;

    // Vorticity / Curl calculation
    const curlShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main() {
        float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
        float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
        float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
        float curl = 0.5 * ((R - L) - (T - B));
        fragColor = vec4(curl, 0.0, 0.0, 1.0);
    }`;

    // Vorticity confinement force
    const vorticityShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float uDt;
    uniform float uCurlScale;
    uniform vec2 uTexelSize;

    void main() {
        float L = abs(texture(uCurl, vUv - vec2(uTexelSize.x, 0.0)).x);
        float R = abs(texture(uCurl, vUv + vec2(uTexelSize.x, 0.0)).x);
        float B = abs(texture(uCurl, vUv - vec2(0.0, uTexelSize.y)).x);
        float T = abs(texture(uCurl, vUv + vec2(0.0, uTexelSize.y)).x);
        float C = texture(uCurl, vUv).x;

        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        float len = length(force) + 0.0001;
        force = (force / len) * vec2(1.0, -1.0) * C * uCurlScale;

        vec2 vel = texture(uVelocity, vUv).xy;
        fragColor = vec4(vel + force * uDt, 0.0, 1.0);
    }`;

    // Divergence
    const divergenceShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main() {
        float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
        float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
        float div = 0.5 * ((R - L) + (T - B));
        fragColor = vec4(div, 0.0, 0.0, 1.0);
    }`;

    // Pressure Poisson (Jacobi iteration)
    const pressureShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    uniform vec2 uTexelSize;

    void main() {
        float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
        float d = texture(uDivergence, vUv).x;
        float p = (L + R + B + T - d) * 0.25;
        fragColor = vec4(p, 0.0, 0.0, 1.0);
    }`;

    // Gradient Subtraction (incompressible projection)
    const projectShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main() {
        float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
        vec2 vel = texture(uVelocity, vUv).xy;
        vel.xy -= 0.5 * vec2(R - L, T - B);
        fragColor = vec4(vel, 0.0, 1.0);
    }`;

    // Viscous Surface Tension & Relaxation for Heightfield
    const surfaceTensionShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uDensity;
    uniform vec2 uTexelSize;
    uniform float uTension;
    uniform float uDecay;

    void main() {
        vec4 C = texture(uDensity, vUv);
        vec4 L = texture(uDensity, vUv - vec2(uTexelSize.x, 0.0));
        vec4 R = texture(uDensity, vUv + vec2(uTexelSize.x, 0.0));
        vec4 B = texture(uDensity, vUv - vec2(0.0, uTexelSize.y));
        vec4 T = texture(uDensity, vUv + vec2(0.0, uTexelSize.y));

        vec4 laplacian = (L + R + B + T) * 0.25 - C;
        vec4 result = C + laplacian * uTension;
        
        // Non-linear decay: cores hold mass smoothly while wisps dissolve
        float decayFactor = mix(uDecay * 0.965, uDecay, smoothstep(0.015, 0.30, C.r));
        result *= decayFactor;
        
        fragColor = max(vec4(0.0), result);
    }`;

    // ── Master Optical Display Shader (Liquid Glass / Iridescent Refraction) ─
    const opticalDisplayShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;

    uniform sampler2D uDensity;
    uniform sampler2D uVelocity;
    uniform vec2 uResolution;
    uniform float uNormalStrength;
    uniform float uVisibility;

    void main() {
        vec2 texel = 1.0 / uResolution;
        float hC = texture(uDensity, vUv).r;

        // Skip completely clear regions for maximum performance
        if (hC < 0.002 || uVisibility < 0.001) {
            fragColor = vec4(0.0);
            return;
        }

        // 8-neighbor Sobel stencil for anti-aliased, ultra-smooth 3D normal reconstruction
        float hR = texture(uDensity, vUv + vec2(texel.x, 0.0)).r;
        float hL = texture(uDensity, vUv - vec2(texel.x, 0.0)).r;
        float hT = texture(uDensity, vUv + vec2(0.0, texel.y)).r;
        float hB = texture(uDensity, vUv - vec2(0.0, texel.y)).r;

        float hTR = texture(uDensity, vUv + vec2(texel.x, texel.y)).r;
        float hTL = texture(uDensity, vUv + vec2(-texel.x, texel.y)).r;
        float hBR = texture(uDensity, vUv + vec2(texel.x, -texel.y)).r;
        float hBL = texture(uDensity, vUv + vec2(-texel.x, -texel.y)).r;

        float dhdx = ((hTR + 2.0 * hR + hBR) - (hTL + 2.0 * hL + hBL)) * 0.125;
        float dhdy = ((hTL + 2.0 * hT + hTR) - (hBL + 2.0 * hB + hBR)) * 0.125;

        // Reconstruct 3D surface normal
        vec3 normal = normalize(vec3(-dhdx * uNormalStrength, -dhdy * uNormalStrength, 1.0));
        float slope = length(vec2(dhdx, dhdy));

        // Eye view vector (looking directly down the Z-axis)
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        float NdotV = max(dot(normal, viewDir), 0.0);

        // Dielectric Fresnel reflectance (water/glass ~1.45 IOR)
        float F0 = 0.04;
        float fresnel = F0 + (1.0 - F0) * pow(1.0 - NdotV, 3.2);

        // Dual Studio Key & Fill Lights (softbox overhead configuration)
        vec3 lightDir1 = normalize(vec3(0.45, 0.75, 0.82));   // Primary overhead key light
        vec3 lightDir2 = normalize(vec3(-0.55, -0.40, 0.65)); // Soft fill/rim light

        vec3 half1 = normalize(lightDir1 + viewDir);
        vec3 half2 = normalize(lightDir2 + viewDir);

        float NdotH1 = max(dot(normal, half1), 0.0);
        float NdotH2 = max(dot(normal, half2), 0.0);

        float specSharp = pow(NdotH1, 64.0) * 2.2;
        float specSoft = pow(NdotH1, 16.0) * 0.5;
        float specRim = pow(NdotH2, 28.0) * 0.7;
        float specular = specSharp + specSoft + specRim;

        // ── Iridescent Thin-Film Spectral Palette ───────────────────────────
        // Peach/amber (#ffb085): vec3(1.0, 0.69, 0.52)
        // Crystalline cyan (#6be8ff): vec3(0.42, 0.91, 1.0)
        // Soft lavender (#d4b2ff): vec3(0.83, 0.70, 1.0)
        vec3 cPeach = vec3(1.0, 0.69, 0.52);
        vec3 cCyan = vec3(0.42, 0.91, 1.0);
        vec3 cLavender = vec3(0.83, 0.70, 1.0);

        // Interference phase along surface curvature and viewing angle
        float phase = fract(slope * 4.2 + (1.0 - NdotV) * 2.5 + hC * 0.4);
        vec3 iridColor;
        if (phase < 0.33) {
            iridColor = mix(cPeach, cCyan, phase / 0.33);
        } else if (phase < 0.66) {
            iridColor = mix(cCyan, cLavender, (phase - 0.33) / 0.33);
        } else {
            iridColor = mix(cLavender, cPeach, (phase - 0.66) / 0.34);
        }

        // ── Chromatic Dispersion (Prismatic RGB Split on Curvature) ────────
        vec3 chromaticRim = vec3(
            smoothstep(0.03, 0.26, slope * 1.15),
            smoothstep(0.03, 0.26, slope * 1.00),
            smoothstep(0.03, 0.26, slope * 0.85)
        );
        vec3 dispersion = chromaticRim.r * cPeach * 0.65 +
                          chromaticRim.g * cCyan * 0.85 +
                          chromaticRim.b * cLavender * 0.65;

        // ── Beveled Meniscus & Caustic Core ─────────────────────────────────
        // Meniscus ring defines the crisp droplet contact angle
        float bevel = smoothstep(0.015, 0.08, hC) * (1.0 - smoothstep(0.08, 0.45, hC));
        
        // Caustic internal illumination in thick fluid body
        float caustic = pow(hC, 0.80) * 0.35;

        // ── Ultra-Smooth Edge Falloff ───────────────────────────────────────
        float edgeAlpha = smoothstep(0.005, 0.040, hC);

        // Composite Optical Color
        vec3 fluidColor = vec3(0.0);

        // 1. Crystalline translucent core with faint cyan luminosity
        fluidColor += cCyan * caustic * 0.45;

        // 2. Pearlescent iridescent fringes on bevel contour
        fluidColor += iridColor * (fresnel * 1.45 + bevel * 0.95);
        fluidColor += dispersion * 0.45;

        // 3. Crisp specular reflections (pure white high-key gleams)
        fluidColor += vec3(1.0) * totalSpec;

        // Alpha calculation: clear interior, luminous high-contrast edges & gleams
        float alpha = edgeAlpha * (
            fresnel * 0.92 +
            bevel * 0.82 +
            specular * 0.95 +
            caustic * 0.38 +
            hC * 0.08
        );
        alpha = clamp(alpha * uVisibility, 0.0, 0.98);

        // Pre-multiplied alpha output
        fragColor = vec4(fluidColor * alpha, alpha);
    }`;

    // ── Helper: Shader Program Builder ──────────────────────────────────────
    function createProgram(vsSource: string, fsSource: string): WebGLProgram {
      const vs = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vs, vsSource);
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.error('VS Error:', gl.getShaderInfoLog(vs));
      }

      const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fs, fsSource);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error('FS Error:', gl.getShaderInfoLog(fs));
      }

      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('Program Link Error:', gl.getProgramInfoLog(prog));
      }
      return prog;
    }

    const prgSplat = createProgram(baseVertexShader, splatShader);
    const prgAdvection = createProgram(baseVertexShader, advectionShader);
    const prgDiffuse = createProgram(baseVertexShader, diffuseShader);
    const prgCurl = createProgram(baseVertexShader, curlShader);
    const prgVorticity = createProgram(baseVertexShader, vorticityShader);
    const prgDivergence = createProgram(baseVertexShader, divergenceShader);
    const prgPressure = createProgram(baseVertexShader, pressureShader);
    const prgProject = createProgram(baseVertexShader, projectShader);
    const prgSurfaceTension = createProgram(baseVertexShader, surfaceTensionShader);
    const prgOptical = createProgram(baseVertexShader, opticalDisplayShader);

    // ── Quad Geometry ───────────────────────────────────────────────────────
    const quadVao = gl.createVertexArray();
    gl.bindVertexArray(quadVao);
    const quadVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // ── FBO Double Buffering (Ping-Pong) ────────────────────────────────────
    interface DoubleFBO {
      width: number;
      height: number;
      tex0: WebGLTexture;
      tex1: WebGLTexture;
      fbo0: WebGLFramebuffer;
      fbo1: WebGLFramebuffer;
      read: { tex: WebGLTexture; fbo: WebGLFramebuffer };
      write: { tex: WebGLTexture; fbo: WebGLFramebuffer };
      swap: () => void;
    }

    function createFBO(w: number, h: number): { tex: WebGLTexture; fbo: WebGLFramebuffer } {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);

      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      return { tex, fbo };
    }

    function createDoubleFBO(w: number, h: number): DoubleFBO {
      const f0 = createFBO(w, h);
      const f1 = createFBO(w, h);
      const res: DoubleFBO = {
        width: w,
        height: h,
        tex0: f0.tex,
        tex1: f1.tex,
        fbo0: f0.fbo,
        fbo1: f1.fbo,
        read: f0,
        write: f1,
        swap: () => {
          const tmp = res.read;
          res.read = res.write;
          res.write = tmp;
        },
      };
      return res;
    }

    // Simulation resolution is 0.5x window size for optimal 60-120fps performance
    let simW = Math.max(128, Math.floor(window.innerWidth * 0.5));
    let simH = Math.max(128, Math.floor(window.innerHeight * 0.5));

    let density = createDoubleFBO(simW, simH);
    let velocity = createDoubleFBO(simW, simH);
    let pressure = createDoubleFBO(simW, simH);
    let curl = createFBO(simW, simH);
    let divergence = createFBO(simW, simH);

    // ── Viewport & Canvas Resize ────────────────────────────────────────────
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);

      const newSimW = Math.max(128, Math.floor(window.innerWidth * 0.5));
      const newSimH = Math.max(128, Math.floor(window.innerHeight * 0.5));

      if (newSimW !== simW || newSimH !== simH) {
        simW = newSimW;
        simH = newSimH;

        // Cleanup old FBOs
        [density, velocity, pressure].forEach(dfbo => {
          gl.deleteTexture(dfbo.tex0);
          gl.deleteTexture(dfbo.tex1);
          gl.deleteFramebuffer(dfbo.fbo0);
          gl.deleteFramebuffer(dfbo.fbo1);
        });
        [curl, divergence].forEach(fbo => {
          gl.deleteTexture(fbo.tex);
          gl.deleteFramebuffer(fbo.fbo);
        });

        density = createDoubleFBO(simW, simH);
        velocity = createDoubleFBO(simW, simH);
        pressure = createDoubleFBO(simW, simH);
        curl = createFBO(simW, simH);
        divergence = createFBO(simW, simH);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // ── Mouse & Sub-frame Interpolation State ───────────────────────────────
    const mouse = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
      prevX: window.innerWidth * 0.5,
      prevY: window.innerHeight * 0.5,
      vx: 0,
      vy: 0,
      moved: false,
      lastMoveTime: performance.now(),
    };

    const onPointerMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.moved = true;
      mouse.lastMoveTime = performance.now();
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });

    // ── Scroll Visibility Tracking ──────────────────────────────────────────
    let targetVis = 1.0;
    let currentVis = 1.0;
    const updateVisibility = () => {
      const hero = document.querySelector('.hero-interactive') as HTMLElement | null;
      if (!hero) {
        targetVis = 1.0;
        return;
      }
      const rect = hero.getBoundingClientRect();
      const fadeStart = window.innerHeight * 0.35;
      const fadeEnd = 0;

      if (rect.bottom >= fadeStart) {
        targetVis = 0.30; // subtle liquid refraction over Hero
      } else if (rect.bottom <= fadeEnd) {
        targetVis = 1.0;  // 100% active from Slide 2 onward
      } else {
        const ratio = (fadeStart - rect.bottom) / (fadeStart - fadeEnd);
        targetVis = 0.30 + ratio * 0.70;
      }
    };

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();

    // ── Render Pass Helpers ─────────────────────────────────────────────────
    function renderQuad(fbo: WebGLFramebuffer | null, w: number, h: number) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, w, h);
      gl.bindVertexArray(quadVao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function splat(
      target: DoubleFBO,
      x: number,
      y: number,
      color: [number, number, number],
      radius: number
    ) {
      gl.useProgram(prgSplat);
      gl.uniform1i(gl.getUniformLocation(prgSplat, 'uTarget'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, target.read.tex);

      const aspect = canvas.width / (canvas.height || 1);
      gl.uniform1f(gl.getUniformLocation(prgSplat, 'uAspect'), aspect);
      gl.uniform2f(gl.getUniformLocation(prgSplat, 'uPoint'), x, y);
      gl.uniform3f(gl.getUniformLocation(prgSplat, 'uColor'), color[0], color[1], color[2]);
      gl.uniform1f(gl.getUniformLocation(prgSplat, 'uRadius'), radius);

      renderQuad(target.write.fbo, simW, simH);
      target.swap();
    }

    // ── Main Animation & Simulation Loop ────────────────────────────────────
    let rafId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) * 0.001, 0.033);
      lastTime = now;

      currentVis += (targetVis - currentVis) * 0.1;

      // ── Step 1: Sub-frame Mouse Splats (Continuous Fluid Stroke) ──────────
      if (mouse.moved) {
        const dx = mouse.x - mouse.prevX;
        const dy = mouse.y - mouse.prevY;
        const dist = Math.hypot(dx, dy);

        // Calculate velocity & speed
        const speed = Math.min(dist / (dt * 1000 + 0.001), 60.0);
        mouse.vx = dx * 0.16;
        mouse.vy = -dy * 0.16; // Invert for WebGL texture coordinates

        // Interpolate across the segment to eliminate any discrete gaps
        const numSteps = Math.min(30, Math.max(1, Math.ceil(dist / 3.5)));

        // Dynamic radius scales with cursor velocity: rounded head + wide wake
        const baseRadius = 0.024; // ~2.4% of viewport width
        const radius = baseRadius + Math.min(speed * 0.0009, 0.038);

        for (let s = 0; s < numSteps; s++) {
          const t = (s + 0.5) / numSteps;
          const px = (mouse.prevX + dx * t) / window.innerWidth;
          const py = 1.0 - (mouse.prevY + dy * t) / window.innerHeight;

          // Inject fluid momentum
          const vScale = 2.6;
          splat(velocity, px, py, [mouse.vx * vScale, mouse.vy * vScale, 0], radius * 1.15);

          // Inject fluid heightfield density
          const hScale = Math.min(0.90, 0.38 + speed * 0.018);
          splat(density, px, py, [hScale, hScale * 0.8, speed * 0.1], radius);
        }

        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;
        mouse.moved = false;
      } else {
        // Smoothly decay mouse inertia
        mouse.prevX += (mouse.x - mouse.prevX) * 0.25;
        mouse.prevY += (mouse.y - mouse.prevY) * 0.25;
      }

      const texelSize: [number, number] = [1.0 / simW, 1.0 / simH];

      // ── Step 2: Viscous Momentum Diffusion (Gel/Liquid Glass Viscosity) ────
      const viscosity = 0.35;
      const alpha = (texelSize[0] * texelSize[0]) / (viscosity * dt + 0.00001);
      const rBeta = 1.0 / (4.0 + alpha);

      gl.useProgram(prgDiffuse);
      gl.uniform2f(gl.getUniformLocation(prgDiffuse, 'uTexelSize'), texelSize[0], texelSize[1]);
      gl.uniform1f(gl.getUniformLocation(prgDiffuse, 'uAlpha'), alpha);
      gl.uniform1f(gl.getUniformLocation(prgDiffuse, 'uReciprocalBeta'), rBeta);

      // 2 Jacobi iterations for viscous drag
      for (let i = 0; i < 2; i++) {
        gl.uniform1i(gl.getUniformLocation(prgDiffuse, 'uVelocity'), 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
        gl.uniform1i(gl.getUniformLocation(prgDiffuse, 'uVelocity0'), 1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
        renderQuad(velocity.write.fbo, simW, simH);
        velocity.swap();
      }

      // ── Step 3: Vorticity Confinement (Organic Micro-Swirls) ───────────────
      // 3a. Compute Curl
      gl.useProgram(prgCurl);
      gl.uniform1i(gl.getUniformLocation(prgCurl, 'uVelocity'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      gl.uniform2f(gl.getUniformLocation(prgCurl, 'uTexelSize'), texelSize[0], texelSize[1]);
      renderQuad(curl.fbo, simW, simH);

      // 3b. Apply Vorticity Force
      gl.useProgram(prgVorticity);
      gl.uniform1i(gl.getUniformLocation(prgVorticity, 'uVelocity'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      gl.uniform1i(gl.getUniformLocation(prgVorticity, 'uCurl'), 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, curl.tex);
      gl.uniform1f(gl.getUniformLocation(prgVorticity, 'uDt'), dt);
      gl.uniform1f(gl.getUniformLocation(prgVorticity, 'uCurlScale'), 16.0); // Organic swirl strength
      gl.uniform2f(gl.getUniformLocation(prgVorticity, 'uTexelSize'), texelSize[0], texelSize[1]);
      renderQuad(velocity.write.fbo, simW, simH);
      velocity.swap();

      // ── Step 4: Divergence & Incompressibility (Poisson Pressure) ──────────
      gl.useProgram(prgDivergence);
      gl.uniform1i(gl.getUniformLocation(prgDivergence, 'uVelocity'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      gl.uniform2f(gl.getUniformLocation(prgDivergence, 'uTexelSize'), texelSize[0], texelSize[1]);
      renderQuad(divergence.fbo, simW, simH);

      // Pressure Solve (16 Jacobi iterations)
      gl.useProgram(prgPressure);
      gl.uniform1i(gl.getUniformLocation(prgPressure, 'uDivergence'), 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, divergence.tex);
      gl.uniform2f(gl.getUniformLocation(prgPressure, 'uTexelSize'), texelSize[0], texelSize[1]);

      for (let i = 0; i < 16; i++) {
        gl.uniform1i(gl.getUniformLocation(prgPressure, 'uPressure'), 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, pressure.read.tex);
        renderQuad(pressure.write.fbo, simW, simH);
        pressure.swap();
      }

      // Gradient Subtraction (Divergence-free projection)
      gl.useProgram(prgProject);
      gl.uniform1i(gl.getUniformLocation(prgProject, 'uPressure'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pressure.read.tex);
      gl.uniform1i(gl.getUniformLocation(prgProject, 'uVelocity'), 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      gl.uniform2f(gl.getUniformLocation(prgProject, 'uTexelSize'), texelSize[0], texelSize[1]);
      renderQuad(velocity.write.fbo, simW, simH);
      velocity.swap();

      // ── Step 5: Advection (Semi-Lagrangian) ────────────────────────────────
      // 5a. Velocity self-advection
      gl.useProgram(prgAdvection);
      gl.uniform1i(gl.getUniformLocation(prgAdvection, 'uVelocity'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      gl.uniform1i(gl.getUniformLocation(prgAdvection, 'uSource'), 0);
      gl.uniform2f(gl.getUniformLocation(prgAdvection, 'uTexelSize'), texelSize[0], texelSize[1]);
      gl.uniform1f(gl.getUniformLocation(prgAdvection, 'uDt'), dt);
      gl.uniform1f(gl.getUniformLocation(prgAdvection, 'uDissipation'), 0.985); // Velocity momentum decay
      renderQuad(velocity.write.fbo, simW, simH);
      velocity.swap();

      // 5b. Density / Heightfield advection
      gl.useProgram(prgAdvection);
      gl.uniform1i(gl.getUniformLocation(prgAdvection, 'uVelocity'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      gl.uniform1i(gl.getUniformLocation(prgAdvection, 'uSource'), 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, density.read.tex);
      gl.uniform2f(gl.getUniformLocation(prgAdvection, 'uTexelSize'), texelSize[0], texelSize[1]);
      gl.uniform1f(gl.getUniformLocation(prgAdvection, 'uDt'), dt);
      gl.uniform1f(gl.getUniformLocation(prgAdvection, 'uDissipation'), 0.988); // Height dissipation
      renderQuad(density.write.fbo, simW, simH);
      density.swap();

      // ── Step 6: Surface Tension & Droplet Relaxation ───────────────────────
      gl.useProgram(prgSurfaceTension);
      gl.uniform1i(gl.getUniformLocation(prgSurfaceTension, 'uDensity'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, density.read.tex);
      gl.uniform2f(gl.getUniformLocation(prgSurfaceTension, 'uTexelSize'), texelSize[0], texelSize[1]);
      gl.uniform1f(gl.getUniformLocation(prgSurfaceTension, 'uTension'), 0.28); // Droplet cohesion
      gl.uniform1f(gl.getUniformLocation(prgSurfaceTension, 'uDecay'), 0.984);   // Dissipation
      renderQuad(density.write.fbo, simW, simH);
      density.swap();

      // ── Step 7: Master Optical Display Pass (Full Native Resolution) ──────
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.enable(gl.BLEND);
      // Pre-multiplied alpha blend for pure luminous highlights & clean transparency
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.useProgram(prgOptical);
      gl.uniform1i(gl.getUniformLocation(prgOptical, 'uDensity'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, density.read.tex);

      gl.uniform1i(gl.getUniformLocation(prgOptical, 'uVelocity'), 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);

      gl.uniform2f(gl.getUniformLocation(prgOptical, 'uResolution'), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(prgOptical, 'uNormalStrength'), 12.0);
      gl.uniform1f(gl.getUniformLocation(prgOptical, 'uVisibility'), currentVis);

      gl.bindVertexArray(quadVao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      gl.disable(gl.BLEND);

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    // ── Cleanup & Memory Management ─────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('scroll', updateVisibility);

      [density, velocity, pressure].forEach(dfbo => {
        gl.deleteTexture(dfbo.tex0);
        gl.deleteTexture(dfbo.tex1);
        gl.deleteFramebuffer(dfbo.fbo0);
        gl.deleteFramebuffer(dfbo.fbo1);
      });
      [curl, divergence].forEach(fbo => {
        gl.deleteTexture(fbo.tex);
        gl.deleteFramebuffer(fbo.fbo);
      });

      gl.deleteBuffer(quadVbo);
      gl.deleteVertexArray(quadVao);

      [
        prgSplat,
        prgAdvection,
        prgDiffuse,
        prgCurl,
        prgVorticity,
        prgDivergence,
        prgPressure,
        prgProject,
        prgSurfaceTension,
        prgOptical,
      ].forEach(p => gl.deleteProgram(p));
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
}
