import React, { useEffect, useRef } from 'react';

// ─── Lusion-Grade Liquid Glass Ribbon (Minimalist Iridescent Meniscus) ────────
// Real-time 2D Navier-Stokes fluid simulation in WebGL2 with double-buffered
// Ping-Pong FBOs, sub-frame mouse interpolation, sleek droplet tip, 100% clear
// interior, double-contour beveled meniscus, and directional dual-tone iridescence:
// warm peach/amber (#ff9e6d to #ffd1b3) vs cool cyan/lavender (#7ce8ff to #c5b3ff).

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

    // Viscous Velocity Diffusion (Jacobi iteration for thick gel/glass)
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

    // Vorticity confinement force (gentle organic tail curvature, no wave ripples)
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

    // ── Master Optical Display Shader: Pure Liquid Glass Ribbon (Meniscus Only) ─
    const opticalDisplayShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;

    uniform sampler2D uDensity;
    uniform sampler2D uVelocity;
    uniform vec2 uResolution;
    uniform float uVisibility;

    const float PI = 3.141592653589793;

    // Surface tension thresholding (metaball profile: sharp clean droplet perimeter)
    float getMetaballHeight(vec2 uv) {
        float raw = texture(uDensity, uv).r;
        // Flat plateau in the center (raw >= 0.16) and sharp dropoff at the perimeter
        return smoothstep(0.035, 0.16, raw);
    }

    void main() {
        vec2 texel = 1.0 / uResolution;

        // Sample thresholded heightfield
        float hC = getMetaballHeight(vUv);

        // Early discard for background
        if (hC < 0.001 || uVisibility < 0.001) {
            fragColor = vec4(0.0);
            return;
        }

        // 8-neighbor Sobel stencil on the surface-tension heightfield
        float hR  = getMetaballHeight(vUv + vec2(texel.x, 0.0));
        float hL  = getMetaballHeight(vUv - vec2(texel.x, 0.0));
        float hT  = getMetaballHeight(vUv + vec2(0.0, texel.y));
        float hB  = getMetaballHeight(vUv - vec2(0.0, texel.y));

        float hTR = getMetaballHeight(vUv + vec2(texel.x, texel.y));
        float hTL = getMetaballHeight(vUv + vec2(-texel.x, texel.y));
        float hBR = getMetaballHeight(vUv + vec2(texel.x, -texel.y));
        float hBL = getMetaballHeight(vUv + vec2(-texel.x, -texel.y));

        float dhdx = ((hTR + 2.0 * hR + hBR) - (hTL + 2.0 * hL + hBL)) * 0.125;
        float dhdy = ((hTL + 2.0 * hT + hTR) - (hBL + 2.0 * hB + hBR)) * 0.125;

        // Reconstruct 3D surface normal
        float strength = 18.0;
        vec3 normal = normalize(vec3(-dhdx * strength, -dhdy * strength, 1.0));

        // ── CRITICAL: Edge Gradient & 100% Clear Interior ───────────────────
        // In the flat interior, hC == 1.0 and dhdx == dhdy == 0.0, so edge == 0.0!
        // Outside the droplet, hC == 0.0 and edge == 0.0!
        // ONLY the thin transition bevel has edge > 0.0.
        float edge = length(normal.xy);

        // Narrow mask tightly bound to the meniscus bevel
        float edgeMask = pow(smoothstep(0.06, 0.48, edge), 1.5);

        // If outside or in the flat interior of the ribbon, it is 100% transparent!
        if (edgeMask <= 0.001) {
            fragColor = vec4(0.0);
            return;
        }

        // ── 1. Double Contour (Blown Glass Wall Thickness) ───────────────────
        // Creates the delicate inner and outer refraction lines of a glass bead
        float wallProfile = sin(clamp(edge * 1.7, 0.0, 1.0) * PI);
        float doubleContour = pow(wallProfile, 1.35) * (0.80 + 0.20 * sin(edge * PI * 2.5));

        // ── 2. Directional Dual-Tone Iridescent Sheen ───────────────────────
        // Warm peach/amber side (#ff9e6d to #ffd1b3) vs Cool cyan/lavender side (#7ce8ff to #c5b3ff)
        vec3 cPeach = vec3(1.0, 0.62, 0.43);       // #ff9e6d
        vec3 cAmberLight = vec3(1.0, 0.82, 0.70);   // #ffd1b3
        vec3 cCyan = vec3(0.48, 0.91, 1.0);         // #7ce8ff
        vec3 cLavender = vec3(0.77, 0.70, 1.0);     // #c5b3ff

        // Light direction (top-right overhead key light)
        vec2 lightDir2D = normalize(vec2(0.55, 0.75));
        float lightAlignment = dot(normalize(normal.xy), lightDir2D); // -1.0 to +1.0

        float normalAngle = atan(normal.y, normal.x);
        vec3 warmColor = mix(cPeach, cAmberLight, 0.5 + 0.5 * sin(normalAngle * 2.0));
        vec3 coolColor = mix(cCyan, cLavender, 0.5 + 0.5 * cos(normalAngle * 2.0));

        // Smooth transition across the bevel sides
        float sideFactor = smoothstep(-0.4, 0.4, lightAlignment);
        vec3 iridescentSheen = mix(coolColor, warmColor, sideFactor);

        // ── 3. Subtle Chromatic Dispersion ──────────────────────────────────
        float dispersionFactor = smoothstep(0.12, 0.40, edge);
        vec3 dispersion = mix(coolColor, warmColor, fract(normalAngle / PI * 0.5 + 0.5)) * dispersionFactor * 0.35;

        // ── 4. Razor-Sharp White Specular Glint ──────────────────────────────
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 lightDir3D = normalize(vec3(0.40, 0.70, 0.82));
        vec3 halfVec = normalize(lightDir3D + viewDir);
        float NdotH = max(dot(normal, halfVec), 0.0);
        float spec = pow(NdotH, 48.0) * smoothstep(0.12, 0.42, edge);

        // ── 5. Assemble Thin Glass Meniscus ─────────────────────────────────
        // Only the beveled meniscus contour receives color
        vec3 rimColor = iridescentSheen * (doubleContour * 0.60) + dispersion * 0.30;
        rimColor += vec3(1.0) * (spec * 0.75);

        // Ethereal, ultra-subtle alpha (clean transparent glass on white)
        float alpha = edgeMask * (doubleContour * 0.38 + spec * 0.65);
        alpha = clamp(alpha * uVisibility, 0.0, 0.72);

        // Output pre-multiplied alpha
        fragColor = vec4(rimColor * alpha, alpha);
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
        targetVis = 0.40; // elegant subtle refraction over Hero
      } else if (rect.bottom <= fadeEnd) {
        targetVis = 1.0;  // 100% active from Slide 2 onward
      } else {
        const ratio = (fadeStart - rect.bottom) / (fadeStart - fadeEnd);
        targetVis = 0.40 + ratio * 0.60;
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

      // ── Step 1: Sub-frame Mouse Splats (Sharp, Stylized Droplet Tip) ──────
      if (mouse.moved) {
        const dx = mouse.x - mouse.prevX;
        const dy = mouse.y - mouse.prevY;
        const dist = Math.hypot(dx, dy);

        // Velocity magnitude & speed
        const speed = Math.min(dist / (dt * 1000 + 0.001), 60.0);
        mouse.vx = dx * 0.14;
        mouse.vy = -dy * 0.14; // Invert for WebGL coordinates

        // Interpolate across the segment to eliminate any gaps
        const numSteps = Math.min(26, Math.max(1, Math.ceil(dist / 3.0)));

        // ── Requirement 2: Reduced size (~40% of previous size, sharp tip) ──
        // Starts small and sleek at the cursor tip (~16-20px), expands gracefully only on fast sweeps
        const baseRadius = 0.009; // ~0.9% of viewport width (~17px on 1920px screen)
        const radius = baseRadius + Math.min(speed * 0.00025, 0.008);

        for (let s = 0; s < numSteps; s++) {
          const t = (s + 0.5) / numSteps;
          const px = (mouse.prevX + dx * t) / window.innerWidth;
          const py = 1.0 - (mouse.prevY + dy * t) / window.innerHeight;

          // Inject fluid momentum
          const vScale = 2.2;
          splat(velocity, px, py, [mouse.vx * vScale, mouse.vy * vScale, 0], radius * 1.1);

          // Inject fluid heightfield density
          const hScale = Math.min(0.65, 0.28 + speed * 0.010);
          splat(density, px, py, [hScale, hScale * 0.8, speed * 0.1], radius);
        }

        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;
        mouse.moved = false;
      } else {
        mouse.prevX += (mouse.x - mouse.prevX) * 0.25;
        mouse.prevY += (mouse.y - mouse.prevY) * 0.25;
      }

      const texelSize: [number, number] = [1.0 / simW, 1.0 / simH];

      // ── Step 2: Viscous Momentum Diffusion (Gel/Glass Viscosity) ───────────
      const viscosity = 0.28;
      const alpha = (texelSize[0] * texelSize[0]) / (viscosity * dt + 0.00001);
      const rBeta = 1.0 / (4.0 + alpha);

      gl.useProgram(prgDiffuse);
      gl.uniform2f(gl.getUniformLocation(prgDiffuse, 'uTexelSize'), texelSize[0], texelSize[1]);
      gl.uniform1f(gl.getUniformLocation(prgDiffuse, 'uAlpha'), alpha);
      gl.uniform1f(gl.getUniformLocation(prgDiffuse, 'uReciprocalBeta'), rBeta);

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

      // ── Step 3: Gentle Vorticity (Curling Tail, Zero Wave Ripples) ─────────
      gl.useProgram(prgCurl);
      gl.uniform1i(gl.getUniformLocation(prgCurl, 'uVelocity'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      gl.uniform2f(gl.getUniformLocation(prgCurl, 'uTexelSize'), texelSize[0], texelSize[1]);
      renderQuad(curl.fbo, simW, simH);

      gl.useProgram(prgVorticity);
      gl.uniform1i(gl.getUniformLocation(prgVorticity, 'uVelocity'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      gl.uniform1i(gl.getUniformLocation(prgVorticity, 'uCurl'), 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, curl.tex);
      gl.uniform1f(gl.getUniformLocation(prgVorticity, 'uDt'), dt);
      gl.uniform1f(gl.getUniformLocation(prgVorticity, 'uCurlScale'), 4.0); // Gentle organic curl
      gl.uniform2f(gl.getUniformLocation(prgVorticity, 'uTexelSize'), texelSize[0], texelSize[1]);
      renderQuad(velocity.write.fbo, simW, simH);
      velocity.swap();

      // ── Step 4: Divergence & Pressure (Incompressibility) ──────────────────
      gl.useProgram(prgDivergence);
      gl.uniform1i(gl.getUniformLocation(prgDivergence, 'uVelocity'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      gl.uniform2f(gl.getUniformLocation(prgDivergence, 'uTexelSize'), texelSize[0], texelSize[1]);
      renderQuad(divergence.fbo, simW, simH);

      gl.useProgram(prgPressure);
      gl.uniform1i(gl.getUniformLocation(prgPressure, 'uDivergence'), 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, divergence.tex);
      gl.uniform2f(gl.getUniformLocation(prgPressure, 'uTexelSize'), texelSize[0], texelSize[1]);

      for (let i = 0; i < 14; i++) {
        gl.uniform1i(gl.getUniformLocation(prgPressure, 'uPressure'), 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, pressure.read.tex);
        renderQuad(pressure.write.fbo, simW, simH);
        pressure.swap();
      }

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

      // ── Step 5: Pure Advection (Requirement 1: Smooth dissipation ~0.94-0.96)
      // 5a. Velocity advection
      gl.useProgram(prgAdvection);
      gl.uniform1i(gl.getUniformLocation(prgAdvection, 'uVelocity'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      gl.uniform1i(gl.getUniformLocation(prgAdvection, 'uSource'), 0);
      gl.uniform2f(gl.getUniformLocation(prgAdvection, 'uTexelSize'), texelSize[0], texelSize[1]);
      gl.uniform1f(gl.getUniformLocation(prgAdvection, 'uDt'), dt);
      gl.uniform1f(gl.getUniformLocation(prgAdvection, 'uDissipation'), 0.948); // Smooth momentum dissipation
      renderQuad(velocity.write.fbo, simW, simH);
      velocity.swap();

      // 5b. Density advection (pure ink/gel advection, zero wave propagation)
      gl.useProgram(prgAdvection);
      gl.uniform1i(gl.getUniformLocation(prgAdvection, 'uVelocity'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
      gl.uniform1i(gl.getUniformLocation(prgAdvection, 'uSource'), 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, density.read.tex);
      gl.uniform2f(gl.getUniformLocation(prgAdvection, 'uTexelSize'), texelSize[0], texelSize[1]);
      gl.uniform1f(gl.getUniformLocation(prgAdvection, 'uDt'), dt);
      gl.uniform1f(gl.getUniformLocation(prgAdvection, 'uDissipation'), 0.952); // Dissipation ~0.95: cleanly dissolves in ~1s
      renderQuad(density.write.fbo, simW, simH);
      density.swap();

      // ── Step 6: Master Optical Display Pass (Native Resolution) ───────────
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
