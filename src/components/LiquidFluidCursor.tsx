import { useEffect, useRef } from 'react';

interface Props {
  theme?: 'auto' | 'light' | 'dark';
  zIndex?: number;
}

const MAX_SEG = 8;
const SIM_STEP = 1 / 60;
const R_MIN = 4.5;   // px CSS (trazo lento)
const R_MAX = 36;    // px CSS (trazo rapido)
const IDLE_MS = 2400;

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const SIM_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2  uSimSize;
uniform float uEvolve;
uniform int   uSegCount;
uniform vec4  uSeg[8];
uniform vec2  uRad[8];
uniform float uH[8];
uniform float uEdge;
uniform float uDecay;
uniform float uDrain;
uniform float uErode;
uniform float uWaveDamp;
uniform float uWaveVisc;
uniform float uWaveSrc;
out vec4 outState;

void main() {
  vec2 px = 1.0 / uSimSize;
  vec2 uv = gl_FragCoord.xy * px;
  vec4 s = texture(uState, uv);
  float T = s.r, W = s.g, Wp = s.b;

  if (uEvolve > 0.5) {
    vec4 n  = texture(uState, uv + vec2(0.0,  px.y));
    vec4 so = texture(uState, uv - vec2(0.0,  px.y));
    vec4 e  = texture(uState, uv + vec2(px.x, 0.0));
    vec4 w  = texture(uState, uv - vec2(px.x, 0.0));

    float sumW = n.g + so.g + e.g + w.g;
    float Wn = sumW * 0.5 - Wp;
    Wn = mix(Wn, sumW * 0.25, uWaveVisc) * uWaveDamp;

    float mn = min(min(n.r, so.r), min(e.r, w.r));
    T = mix(T, min(T, mn), uErode);
    T = max(T * uDecay - uDrain, 0.0);

    Wp = W;
    W = Wn;

    if (T < 0.004) T = 0.0;
    if (abs(W) < 0.0015) W = 0.0;
    if (abs(Wp) < 0.0015) Wp = 0.0;
  }

  float T0 = T;
  vec2 fp = gl_FragCoord.xy;
  for (int i = 0; i < 8; i++) {
    if (i >= uSegCount) break;
    vec2 a = uSeg[i].xy;
    vec2 b = uSeg[i].zw;
    vec2 pa = fp - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
    float r = mix(uRad[i].x, uRad[i].y, h);
    float d = length(pa - ba * h);
    float prof = 1.0 - smoothstep(r - uEdge, r + uEdge, d);
    T = max(T, prof * uH[i]);
  }
  W += (T - T0) * uWaveSrc;

  outState = vec4(T, W, Wp, 1.0);
}`;

const RENDER_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2  uSimSize;
uniform vec2  uCanvasSize;
uniform float uDark;
uniform float uBump;
uniform float uFilm;
uniform float uDisp;
uniform float uEdgeA;
out vec4 fragColor;

vec3 film(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (vec3(t) + vec3(0.0, 0.33, 0.67)));
}
float heightAt(vec2 uv) {
  vec4 s = texture(uState, uv);
  return s.r + s.g * 0.8;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uCanvasSize;
  vec2 px = 1.0 / uSimSize;
  vec4 s = texture(uState, uv);
  float H = s.r + s.g * 0.8;

  float hx = heightAt(uv + vec2(px.x, 0.0)) - heightAt(uv - vec2(px.x, 0.0));
  float hy = heightAt(uv + vec2(0.0, px.y)) - heightAt(uv - vec2(0.0, px.y));
  vec2 g = 0.5 * vec2(hx, hy);
  float m = length(g);
  vec2 n2 = g / max(m, 1e-5);

  float life = smoothstep(0.01, 0.08, max(s.r, abs(s.g) * 3.0));
  float edge = smoothstep(0.03, 0.20, m);

  vec3 N = normalize(vec3(-g * uBump, 1.0));
  vec3 L1 = normalize(vec3(-0.45,  0.55, 0.70));
  vec3 L2 = normalize(vec3( 0.45, -0.55, 0.70));
  float sp1 = pow(max(dot(N, normalize(L1 + vec3(0.0, 0.0, 1.0))), 0.0), 160.0);
  float sp2 = pow(max(dot(N, normalize(L2 + vec3(0.0, 0.0, 1.0))), 0.0), 160.0);
  float spec = max(sp1, sp2 * 0.7);

  float side = dot(n2, normalize(vec2(-0.6, 0.8)));
  vec3 warm = vec3(1.00, 0.52, 0.24);
  vec3 cold = vec3(0.10, 0.62, 1.00);
  vec3 rim = mix(cold, warm, smoothstep(-0.45, 0.45, side));

  float t = H * uFilm + side * 0.12;
  vec3 irid = vec3(film(t - uDisp).r, film(t).g, film(t + uDisp).b);
  vec3 col = mix(rim, irid, 0.5);

  vec3 wash = mix(vec3(1.0), film(H * 0.9 + 0.15), 0.55);
  float washA = 0.12 * smoothstep(0.02, 0.35, s.r);

  float shadeA = edge * smoothstep(0.1, 0.8, -side) * 0.28 * (1.0 - uDark);
  vec3 shadeCol = vec3(0.30, 0.34, 0.62);

  float eA = edge * life * mix(uEdgeA, 1.0, uDark);
  float a = eA;
  vec3 pm = col * eA;

  float wA = washA * life * (1.0 - a);
  pm += wash * wA; a += wA;

  float sA = shadeA * life * (1.0 - a);
  pm += shadeCol * sA; a += sA;

  float spA = clamp(spec * edge * life * 1.4, 0.0, 1.0);
  pm = pm * (1.0 - spA) + vec3(spA);
  a = a + spA * (1.0 - a);

  fragColor = vec4(pm, a);
}`;

interface Seg { ax: number; ay: number; bx: number; by: number; rA: number; rB: number; h: number; }
interface Pt { x: number; y: number; t: number; }

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error('Shader compile error: ' + log);
  }
  return sh;
}

function link(gl: WebGL2RenderingContext, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error('Program link error: ' + gl.getProgramInfoLog(p));
  }
  return p;
}

function isDarkBackground(): boolean {
  for (const el of [document.body, document.documentElement]) {
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (!m || m.length < 3) continue;
    if (m.length >= 4 && parseFloat(m[3]) === 0) continue;
    const lum = (0.2126 * +m[0] + 0.7152 * +m[1] + 0.0722 * +m[2]) / 255;
    return lum < 0.45;
  }
  return false;
}

export default function LiquidFluidCursor({ theme = 'auto', zIndex = 9999 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true, premultipliedAlpha: true, antialias: false,
      depth: false, stencil: false, powerPreference: 'high-performance',
    });
    if (!gl) return;
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return;

    let simProg: WebGLProgram, renderProg: WebGLProgram;
    try {
      simProg = link(gl, SIM_FRAG);
      renderProg = link(gl, RENDER_FRAG);
    } catch (err) {
      console.error(err);
      return;
    }

    const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
    const us = {
      state: U(simProg, 'uState'), size: U(simProg, 'uSimSize'), evolve: U(simProg, 'uEvolve'),
      count: U(simProg, 'uSegCount'), seg: U(simProg, 'uSeg'), rad: U(simProg, 'uRad'), h: U(simProg, 'uH'),
      edge: U(simProg, 'uEdge'), decay: U(simProg, 'uDecay'), drain: U(simProg, 'uDrain'),
      erode: U(simProg, 'uErode'), wdamp: U(simProg, 'uWaveDamp'), wvisc: U(simProg, 'uWaveVisc'),
      wsrc: U(simProg, 'uWaveSrc'),
    };
    const ur = {
      state: U(renderProg, 'uState'), sim: U(renderProg, 'uSimSize'), canvas: U(renderProg, 'uCanvasSize'),
      dark: U(renderProg, 'uDark'), bump: U(renderProg, 'uBump'), film: U(renderProg, 'uFilm'),
      disp: U(renderProg, 'uDisp'), edgeA: U(renderProg, 'uEdgeA'),
    };

    const segData = new Float32Array(MAX_SEG * 4);
    const radData = new Float32Array(MAX_SEG * 2);
    const hData = new Float32Array(MAX_SEG);

    interface Target { tex: WebGLTexture; fbo: WebGLFramebuffer; }
    let cssW = 1, cssH = 1, sx = 1, sy = 1, simW = 2, simH = 2;
    let read: Target | null = null, write: Target | null = null;

    const freeTarget = (t: Target | null) => {
      if (!t) return;
      gl.deleteTexture(t.tex);
      gl.deleteFramebuffer(t.fbo);
    };
    const makeTarget = (): Target | null => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, simW, simH, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return null;
      gl.viewport(0, 0, simW, simH);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex, fbo };
    };
    const clearTargets = () => {
      for (const t of [read, write]) {
        if (!t) continue;
        gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
        gl.viewport(0, 0, simW, simH);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    let dead = false;
    let last: Pt | null = null;
    const resize = () => {
      cssW = Math.max(1, document.documentElement.clientWidth);
      cssH = Math.max(1, document.documentElement.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const scale = Math.min(1, 1600 / Math.max(cssW, cssH));
      simW = Math.max(2, Math.round(cssW * scale));
      simH = Math.max(2, Math.round(cssH * scale));
      sx = simW / cssW;
      sy = simH / cssH;
      freeTarget(read); freeTarget(write);
      read = makeTarget(); write = makeTarget();
      if (!read || !write) dead = true;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      last = null;
    };

    // Pointer input
    const pts: Pt[] = [];
    let rCur = R_MIN;
    let lastActive = 0;

    const takeSegments = (): Seg[] => {
      if (!pts.length) return [];
      let src = pts.slice();
      pts.length = 0;
      if (src.length > MAX_SEG) {
        const k = Math.ceil(src.length / MAX_SEG);
        const r: Pt[] = [];
        for (let i = k - 1; i < src.length; i += k) r.push(src[i]);
        if (r[r.length - 1] !== src[src.length - 1]) r.push(src[src.length - 1]);
        src = r.slice(-MAX_SEG);
      }
      const out: Seg[] = [];
      let prev = last;
      for (const p of src) {
        if (prev) {
          const dx = p.x - prev.x, dy = p.y - prev.y;
          const len = Math.hypot(dx, dy);
          if (p.t - prev.t > 120) rCur = R_MIN;
          if (len > 0.3 && len < 1500) {
            const speed = len / (Math.max(1, p.t - prev.t) / 1000);
            const sp = smooth(80, 2400, speed);
            const rT = R_MIN + (R_MAX - R_MIN) * sp;
            const rB = rCur + (rT - rCur) * 0.4;
            out.push({ ax: prev.x, ay: prev.y, bx: p.x, by: p.y, rA: rCur, rB, h: 0.6 + 0.4 * sp });
            rCur = rB;
          }
        }
        prev = p;
      }
      last = prev;
      return out;
    };

    // Simulation pass
    const simPass = (evolve: boolean, segs: Seg[]) => {
      if (!read || !write) return;
      const n = Math.min(segs.length, MAX_SEG);
      for (let i = 0; i < n; i++) {
        const s = segs[i];
        segData[i * 4 + 0] = s.ax * sx;
        segData[i * 4 + 1] = (cssH - s.ay) * sy;
        segData[i * 4 + 2] = s.bx * sx;
        segData[i * 4 + 3] = (cssH - s.by) * sy;
        radData[i * 2 + 0] = s.rA * sx;
        radData[i * 2 + 1] = s.rB * sx;
        hData[i] = s.h;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.fbo);
      gl.viewport(0, 0, simW, simH);
      gl.disable(gl.BLEND);
      gl.useProgram(simProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, read.tex);
      gl.uniform1i(us.state, 0);
      gl.uniform2f(us.size, simW, simH);
      gl.uniform1f(us.evolve, evolve ? 1 : 0);
      gl.uniform1i(us.count, n);
      gl.uniform4fv(us.seg, segData);
      gl.uniform2fv(us.rad, radData);
      gl.uniform1fv(us.h, hData);
      gl.uniform1f(us.edge, 1.7);
      gl.uniform1f(us.decay, 0.98);
      gl.uniform1f(us.drain, 0.008);
      gl.uniform1f(us.erode, 0.12);
      gl.uniform1f(us.wdamp, 0.96);
      gl.uniform1f(us.wvisc, 0.22);
      gl.uniform1f(us.wsrc, 0.9);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const tmp = read; read = write; write = tmp;
    };

    let dark = theme === 'dark' ? 1 : theme === 'light' ? 0 : (isDarkBackground() ? 1 : 0);
    const renderPass = () => {
      if (!read) return;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.disable(gl.BLEND);
      gl.useProgram(renderProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, read.tex);
      gl.uniform1i(ur.state, 0);
      gl.uniform2f(ur.sim, simW, simH);
      gl.uniform2f(ur.canvas, canvas.width, canvas.height);
      gl.uniform1f(ur.dark, dark);
      gl.uniform1f(ur.bump, 5.0);
      gl.uniform1f(ur.film, 2.2);
      gl.uniform1f(ur.disp, 0.07);
      gl.uniform1f(ur.edgeA, 0.88);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // Main loop
    let raf = 0, lastT = 0, acc = 0, frameN = 0;
    const frame = (now: number) => {
      if (dead) return;
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      acc += dt;
      const segs = takeSegments();
      let steps = 0;
      while (acc >= SIM_STEP && steps < 3) { acc -= SIM_STEP; steps++; }
      const passes = Math.max(steps, segs.length ? 1 : 0);
      for (let i = 0; i < passes; i++) simPass(i < steps, i === 0 ? segs : []);
      if (theme === 'auto' && ++frameN % 30 === 0) dark = isDarkBackground() ? 1 : 0;
      renderPass();
      if (now - lastActive > IDLE_MS && !segs.length) {
        raf = 0;
        clearTargets();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      lastActive = performance.now();
      if (!raf && !dead) {
        lastT = performance.now();
        acc = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const list = typeof (e as any).getCoalescedEvents === 'function'
        ? (e as any).getCoalescedEvents() as PointerEvent[]
        : [];
      const evs: PointerEvent[] = list.length ? list : [e];
      for (const ev of evs) pts.push({ x: ev.clientX, y: ev.clientY, t: ev.timeStamp });
      if (pts.length > 64) pts.splice(0, pts.length - 64);
      wake();
    };
    const onLeave = () => { last = null; pts.length = 0; rCur = R_MIN; };

    resize();
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', resize);
      freeTarget(read); freeTarget(write);
      gl.deleteProgram(simProg);
      gl.deleteProgram(renderProg);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex }}
    />
  );
}
