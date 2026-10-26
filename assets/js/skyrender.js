/* skyrender.js: the GPU sky engine (rebuild wave 2). The Threshold's real
   sky, drawn on the GPU where the platform offers one, in the house's
   fallback order, each stage degrading to the chamber's full meaning
   (CANON §X):
     1. WebGPU: the catalogue stars as instanced soft discs, and a field of
        dust motes breathed through a compute shader beneath them. Since
        rebuild wave 3 this stage is HDR: the sky is accumulated in a
        half-float buffer (rgba16float) at twice the entries' brightness,
        so the brightest cores and every overlap hold light above the
        canvas's range instead of clipping, and one final pass tones the
        buffer down to the canvas (see HDR_GAIN and tonemapScalar below).
     2. WebGL2: the same instanced stars and the same motes, the drift
        reckoned in the vertex shader instead of a compute pass.
     3. Canvas 2D: the wave-1 drawing itself, in index.html, unchanged.
   A stage that cannot start, or whose device is lost beneath it, hands
   the sky to the next without a word. This module draws; it does not
   reckon. Every position, colour and brightness arrives already reckoned
   by starsky.js, sun.js, planets.js and (since rebuild wave 4)
   skyphysics.js, a pure function of moment and place, and the stars
   stand where they are put: only the motes drift, and the drift
   is decorative physics over fixed homes, carrying no content, as the
   canon permits. The lowest stars' brightness arrives already shimmered
   by the reckoning's air (wave 4); the engine neither adds to it nor
   stills it. In calm and still modes one settled frame is drawn. */

/* The motes' homes: fixed fractions of the sky's frame, from an integer
   hash of the mote's own number. Deterministic on every platform
   (Math.imul is exact), no seed of the Master Code is spent, and nothing
   here is chosen: a mote is physics, not content. */
export function moteHome(i) {
  let n = (i * 2654435761) >>> 0;
  n ^= n >>> 15; n = Math.imul(n, 2246822519) >>> 0; n ^= n >>> 13;
  const x = (n >>> 0) / 4294967296;
  n = ((i + 7919) * 2246822519) >>> 0;
  n ^= n >>> 15; n = Math.imul(n, 2654435761) >>> 0; n ^= n >>> 13;
  const y = (n >>> 0) / 4294967296;
  n = ((i + 31337) * 3266489917) >>> 0;
  n ^= n >>> 15; n = Math.imul(n, 668265263) >>> 0; n ^= n >>> 13;
  const tone = (n >>> 0) / 4294967296;
  return [x, y, tone];
}
export const MOTE_COUNT = 768;
export function moteField(count = MOTE_COUNT) {
  const out = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const [x, y, tone] = moteHome(i);
    out[i * 4] = x; out[i * 4 + 1] = y; out[i * 4 + 2] = 9 + tone * 26; out[i * 4 + 3] = tone;
  }
  return out;
}

/* ---------------- HDR (rebuild wave 3) ----------------
   The WebGPU stage's light, given depth. The entries arrive with their
   brightness already reckoned, the brightest star at 1; drawn straight
   to the canvas that is the whole of the range, and wherever lights
   meet (a bright core, two stars overlapping) the sum is clipped per
   channel, hue and gradient lost together. So this stage accumulates
   the sky in a half-float buffer at HDR_GAIN times the entries'
   brightness (one stop of headroom), and a final pass tones the buffer
   down to the canvas by one scalar curve, the same factor for every
   channel, so no hue ever shifts:
     at or below HDR_KNEE (in the entries' own units) the curve is the
     plain division by the gain: the toned value is the entry value,
     exact, and the faint field is the wave-2 sky pixel for pixel;
     above the knee an exponential shoulder, its slope matched to the
     division's at the knee, rises toward 1 and never reaches it:
     highlights are graded, never clipped flat.
   The curve is written twice, here in JS (the record, and the tests'
   instrument) and below in WGSL (the drawing), from these same
   constants, so the two cannot drift apart unnoticed. */
export const HDR_GAIN = 2;
export const HDR_KNEE = 0.8;
export function tonemapScalar(x) {
  const knee = HDR_GAIN * HDR_KNEE, span = HDR_GAIN * (1 - HDR_KNEE);
  if (x <= knee) return x / HDR_GAIN;
  return HDR_KNEE + (1 - HDR_KNEE) * (1 - Math.exp(-(x - knee) / span));
}
const f32 = (v) => v.toFixed(4);
const TONEMAP_WGSL = `
fn tonemap(x: f32) -> f32 {
  let knee = ${f32(HDR_GAIN * HDR_KNEE)};
  let span = ${f32(HDR_GAIN * (1 - HDR_KNEE))};
  if (x <= knee) { return x / ${f32(HDR_GAIN)}; }
  return ${f32(HDR_KNEE)} + ${f32(1 - HDR_KNEE)} * (1.0 - exp(-(x - knee) / span));
}`;
/* Half-float decoding, for the readback instrument on the engine
   (peak(), below): the buffer's own numbers, read back whole. */
export function float16ToNumber(h) {
  const sign = (h & 0x8000) ? -1 : 1;
  const exp = (h >> 10) & 0x1f, frac = h & 0x3ff;
  if (exp === 0) return sign * frac * Math.pow(2, -24);
  if (exp === 31) return frac ? NaN : sign * Infinity;
  return sign * (1 + frac / 1024) * Math.pow(2, exp - 15);
}

/* One flow, written twice (WGSL for the compute stage, GLSL for the
   vertex stage), so both GPU stages breathe the motes the same way the
   Wishfield Nebula's stages breathe theirs: the same dark, at two
   resolutions of machinery. */
const FLOW_WGSL = `
fn flow(p: vec2f, t: f32) -> vec2f {
  return vec2f(sin(p.y * 0.011 + t * 0.10) + cos(p.x * 0.007 - t * 0.06),
               cos(p.x * 0.009 - t * 0.08) + sin(p.y * 0.013 + t * 0.05));
}`;
const FLOW_GLSL = `
vec2 flow(vec2 p, float t) {
  return vec2(sin(p.y * 0.011 + t * 0.10) + cos(p.x * 0.007 - t * 0.06),
              cos(p.x * 0.009 - t * 0.08) + sin(p.y * 0.013 + t * 0.05));
}`;

function makeCanvas(host, className) {
  const cv = document.createElement("canvas");
  cv.className = className;
  cv.setAttribute("aria-hidden", "true");
  host.insertBefore(cv, host.firstChild);
  return cv;
}
function fitCanvas(cv, w, h, dpr) {
  const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  return [W, H];
}

/* ---------------- stage 1: WebGPU ---------------- */
async function webgpuEngine(host, opts) {
  if (!navigator.gpu || !navigator.gpu.requestAdapter) return null;
  const adapter = await Promise.race([
    navigator.gpu.requestAdapter(),
    new Promise((res) => setTimeout(() => res(null), 10000)),
  ]);
  if (!adapter) return null;
  const device = await adapter.requestDevice();
  const cv = makeCanvas(host, "sky-stars sky-engine");
  cv.dataset.stage = "webgpu";
  /* Pin the device to the canvas for the sky's life: an unreferenced
     device is collected by the browser and reports itself lost (the
     Nebula trial's lesson, wave 3). */
  cv._skyDevice = device;
  const ctx = cv.getContext("webgpu");
  if (!ctx) { cv.remove(); return null; }
  const format = navigator.gpu.getPreferredCanvasFormat();
  ctx.configure({ device, format, alphaMode: "premultiplied" });
  const MAX = 5041 + 16 + 1800; /* the catalogue, the wanderers, and the Milky Way's samples (wave 4) */
  const starBuf = device.createBuffer({ size: MAX * 32, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  const uniBuf = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const motes = moteField();
  const moteBuf = device.createBuffer({ size: motes.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  device.queue.writeBuffer(moteBuf, 0, motes);
  const motePos = device.createBuffer({ size: MOTE_COUNT * 8, usage: GPUBufferUsage.STORAGE });
  const WGSL_COMPUTE = `
    struct Mote { home: vec2f, size: f32, tone: f32 }
    @group(0) @binding(0) var<storage, read> motes: array<Mote>;
    @group(0) @binding(1) var<storage, read_write> pos: array<vec2f>;
    @group(0) @binding(2) var<uniform> u: array<vec4f, 2>; /* [t, W, H, dpr] [count,0,0,0] */
    ${FLOW_WGSL}
    @compute @workgroup_size(64)
    fn drift(@builtin(global_invocation_id) id: vec3u) {
      let i = id.x;
      if (i >= u32(u[1].x)) { return; }
      let home = motes[i].home * vec2f(u[0].y, u[0].z);
      pos[i] = home + flow(home, u[0].x) * 14.0 * u[0].w + flow(home * 2.17 + vec2f(131.0, 57.0), u[0].x * 0.6) * 5.0 * u[0].w;
    }`;
  /* Two render modules, not one, for the Nebula's recorded reason: a
     vertex stage may not hold read-write storage, so each stage declares
     the bindings with the access its place allows. The stars are read
     only; the mote positions are read here and written above. */
  const WGSL_STARS = `
    const GAIN: f32 = ${f32(HDR_GAIN)};
    struct Star { pos: vec2f, r: f32, halo: f32, col: vec3f, a: f32 }
    @group(0) @binding(0) var<storage, read> stars: array<Star>;
    @group(0) @binding(1) var<uniform> u: array<vec4f, 2>;
    struct VOut { @builtin(position) p: vec4f, @location(0) uv: vec2f, @location(1) col: vec3f, @location(2) a: f32, @location(3) halo: f32 }
    @vertex
    fn draw(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VOut {
      let corners = array<vec2f, 6>(vec2f(-1.0,-1.0), vec2f(1.0,-1.0), vec2f(-1.0,1.0),
                                    vec2f(-1.0,1.0), vec2f(1.0,-1.0), vec2f(1.0,1.0));
      let c = corners[vi];
      let s = stars[ii];
      let px = s.pos * u[0].w + c * s.r * u[0].w * 4.0;
      var o: VOut;
      o.p = vec4f(px.x / u[0].y * 2.0 - 1.0, 1.0 - px.y / u[0].z * 2.0, 0.0, 1.0);
      o.uv = c * 4.0; o.col = s.col; o.a = s.a; o.halo = s.halo;
      return o;
    }
    @fragment
    fn paint(o: VOut) -> @location(0) vec4f {
      let d = length(o.uv);
      let core = o.a * pow(clamp(1.0 - d, 0.0, 1.0), 2.0);
      let halo = o.halo * o.a * 0.10 * pow(clamp(1.0 - d / 4.0, 0.0, 1.0), 2.0);
      /* HDR (wave 3): the light is written at the gain into the
         half-float buffer, where cores and overlaps may stand above
         1 unclipped until the present pass tones the whole frame. */
      let total = (core + halo) * GAIN;
      return vec4f(o.col * total, total);
    }`;
  const WGSL_MOTES = `
    struct Mote { home: vec2f, size: f32, tone: f32 }
    @group(0) @binding(0) var<storage, read> motes: array<Mote>;
    @group(0) @binding(1) var<storage, read> pos: array<vec2f>;
    @group(0) @binding(2) var<uniform> u: array<vec4f, 2>;
    struct VOut { @builtin(position) p: vec4f, @location(0) uv: vec2f, @location(1) tone: f32 }
    @vertex
    fn draw(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VOut {
      let corners = array<vec2f, 6>(vec2f(-1.0,-1.0), vec2f(1.0,-1.0), vec2f(-1.0,1.0),
                                    vec2f(-1.0,1.0), vec2f(1.0,-1.0), vec2f(1.0,1.0));
      let c = corners[vi];
      let m = motes[ii];
      let px = pos[ii] + c * m.size * u[0].w;
      var o: VOut;
      o.p = vec4f(px.x / u[0].y * 2.0 - 1.0, 1.0 - px.y / u[0].z * 2.0, 0.0, 1.0);
      o.uv = c; o.tone = m.tone;
      return o;
    }
    @fragment
    fn paint(o: VOut) -> @location(0) vec4f {
      let fall = pow(max(0.0, 1.0 - length(o.uv)), 2.2);
      var col = mix(vec3f(0.13, 0.16, 0.38), vec3f(0.32, 0.20, 0.48), o.tone);
      col = mix(col, vec3f(0.79, 0.66, 0.42), smoothstep(0.93, 1.0, o.tone));
      /* HDR (wave 3): written at the gain like the stars' light, deep
         in the tonemap's exact region, so the motes reach the canvas
         at precisely their wave-2 brightness. */
      let a = fall * 0.05 * ${f32(HDR_GAIN)};
      return vec4f(col * a, a);
    }`;
  const computePipe = device.createComputePipeline({ layout: "auto", compute: { module: device.createShaderModule({ code: WGSL_COMPUTE }), entryPoint: "drift" } });
  const blend = { color: { srcFactor: "one", dstFactor: "one", operation: "add" }, alpha: { srcFactor: "one", dstFactor: "one", operation: "add" } };
  const starPipe = device.createRenderPipeline({ layout: "auto", vertex: { module: device.createShaderModule({ code: WGSL_STARS }), entryPoint: "draw" }, fragment: { module: device.createShaderModule({ code: WGSL_STARS }), entryPoint: "paint", targets: [{ format, blend }] }, primitive: { topology: "triangle-list" } });
  const motePipe = device.createRenderPipeline({ layout: "auto", vertex: { module: device.createShaderModule({ code: WGSL_MOTES }), entryPoint: "draw" }, fragment: { module: device.createShaderModule({ code: WGSL_MOTES }), entryPoint: "paint", targets: [{ format, blend }] }, primitive: { topology: "triangle-list" } });
  const computeBG = device.createBindGroup({ layout: computePipe.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: moteBuf } }, { binding: 1, resource: { buffer: motePos } }, { binding: 2, resource: { buffer: uniBuf } }] });
  const starBG = device.createBindGroup({ layout: starPipe.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: starBuf } }, { binding: 1, resource: { buffer: uniBuf } }] });
  const moteBG = device.createBindGroup({ layout: motePipe.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: moteBuf } }, { binding: 1, resource: { buffer: motePos } }, { binding: 2, resource: { buffer: uniBuf } }] });
  /* HDR (wave 3): the present pass. One fullscreen triangle reads the
     accumulation buffer texel for texel and writes the toned frame to
     the canvas, the scalar curve applied to the accumulated alpha and
     shared by every channel, so hue is preserved exactly. */
  const WGSL_PRESENT = `
    @group(0) @binding(0) var hdr: texture_2d<f32>;
    ${TONEMAP_WGSL}
    struct VOut { @builtin(position) p: vec4f }
    @vertex
    fn draw(@builtin(vertex_index) vi: u32) -> VOut {
      let xy = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
      var o: VOut;
      o.p = vec4f(xy[vi], 0.0, 1.0);
      return o;
    }
    @fragment
    fn paint(o: VOut) -> @location(0) vec4f {
      let v = textureLoad(hdr, vec2i(o.p.xy), 0);
      let t = tonemap(v.a);
      let s = select(1.0, t / v.a, v.a > 0.0);
      return vec4f(v.rgb * s, t);
    }`;
  const presentPipe = device.createRenderPipeline({ layout: "auto", vertex: { module: device.createShaderModule({ code: WGSL_PRESENT }), entryPoint: "draw" }, fragment: { module: device.createShaderModule({ code: WGSL_PRESENT }), entryPoint: "paint", targets: [{ format }] }, primitive: { topology: "triangle-list" } });
  let hdrTex = null, hdrView = null, presentBG = null, hdrW = 0, hdrH = 0;
  function ensureHDR(W, H) {
    if (hdrTex && hdrW === W && hdrH === H) return true;
    try {
      const tex = device.createTexture({ size: [W, H], format: "rgba16float", usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC });
      const view = tex.createView();
      const bg = device.createBindGroup({ layout: presentPipe.getBindGroupLayout(0), entries: [{ binding: 0, resource: view }] });
      if (hdrTex) hdrTex.destroy();
      hdrTex = tex; hdrView = view; presentBG = bg; hdrW = W; hdrH = H;
      return true;
    } catch (e) { return false; }
  }
  /* Probed before the stage owns the sky: a platform that cannot hold
     a half-float target never starts, and the chain asks the next
     stage exactly as if WebGPU itself were absent. */
  if (!ensureHDR(1, 1)) { cv.remove(); return null; }
  cv.dataset.hdr = "rgba16float";
  let lost = false;
  device.lost.then((info) => { cv._skyLost = String((info && info.message) || "device lost"); if (!lost) { lost = true; opts.onLost && opts.onLost("webgpu"); } });
  device.addEventListener("uncapturederror", (e) => { cv._skyError = String((e.error && e.error.message) || e.error); if (!lost) { lost = true; opts.onLost && opts.onLost("webgpu"); } });
  const packed = new Float32Array(MAX * 8);
  return {
    stage: "webgpu", canvas: cv,
    render(frame) {
      if (lost) return false;
      const [W, H] = fitCanvas(cv, frame.w, frame.h, frame.dpr);
      if (!ensureHDR(W, H)) { lost = true; opts.onLost && opts.onLost("webgpu"); return false; }
      const n = Math.min(frame.count, MAX);
      packed.set(frame.entries.subarray(0, n * 8));
      device.queue.writeBuffer(starBuf, 0, packed, 0, n * 8);
      device.queue.writeBuffer(uniBuf, 0, new Float32Array([frame.t, W, H, frame.dpr, MOTE_COUNT, n, 0, 0]));
      const enc = device.createCommandEncoder();
      const cp = enc.beginComputePass();
      cp.setPipeline(computePipe); cp.setBindGroup(0, computeBG);
      cp.dispatchWorkgroups(Math.ceil(MOTE_COUNT / 64)); cp.end();
      /* The sky accumulates in the half-float buffer... */
      const rp = enc.beginRenderPass({ colorAttachments: [{ view: hdrView, clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: "clear", storeOp: "store" }] });
      rp.setPipeline(motePipe); rp.setBindGroup(0, moteBG); rp.draw(6, MOTE_COUNT, 0, 0);
      rp.setPipeline(starPipe); rp.setBindGroup(0, starBG); rp.draw(6, n, 0, 0);
      rp.end();
      /* ...and is toned down to the canvas in one present pass. */
      const pp = enc.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: "clear", storeOp: "store" }] });
      pp.setPipeline(presentPipe); pp.setBindGroup(0, presentBG); pp.draw(3, 1, 0, 0);
      pp.end();
      device.queue.submit([enc.finish()]);
      return true;
    },
    /* The readback instrument (verification only; the page never calls
       it): the accumulation buffer's brightest held light, in the
       buffer's own numbers, unclipped, beside the brightest colour
       channel. Null before the first frame, or when the device is
       gone. */
    async peak() {
      if (!hdrTex || lost) return null;
      try {
        const bpr = Math.ceil(hdrW * 8 / 256) * 256;
        const buf = device.createBuffer({ size: bpr * hdrH, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
        const enc = device.createCommandEncoder();
        enc.copyTextureToBuffer({ texture: hdrTex }, { buffer: buf, bytesPerRow: bpr, rowsPerImage: hdrH }, [hdrW, hdrH, 1]);
        device.queue.submit([enc.finish()]);
        await buf.mapAsync(GPUMapMode.READ);
        const u16 = new Uint16Array(buf.getMappedRange().slice(0));
        let peak = 0, peakLight = 0;
        for (let y = 0; y < hdrH; y++) {
          const row = (y * bpr) / 2;
          for (let x = 0; x < hdrW; x++) {
            const o = row + x * 4;
            const a = float16ToNumber(u16[o + 3]);
            if (a > peak) peak = a;
            const m = Math.max(float16ToNumber(u16[o]), float16ToNumber(u16[o + 1]), float16ToNumber(u16[o + 2]));
            if (m > peakLight) peakLight = m;
          }
        }
        buf.unmap(); buf.destroy();
        return { peak, peakLight, width: hdrW, height: hdrH };
      } catch (e) { this.peakError = String((e && e.message) || e); return null; }
    },
    dispose() { try { cv.remove(); } catch (e) {} },
  };
}

/* ---------------- stage 2: WebGL2 ---------------- */
function webgl2Engine(host, opts) {
  const cv = makeCanvas(host, "sky-stars sky-engine");
  cv.dataset.stage = "webgl2";
  const gl = cv.getContext("webgl2", { alpha: true, antialias: false });
  if (!gl) { cv.remove(); return null; }
  let lost = false;
  cv.addEventListener("webglcontextlost", (e) => { e.preventDefault(); if (!lost) { lost = true; opts.onLost && opts.onLost("webgl2"); } });
  function program(vs, fs) {
    const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram();
    gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  const CORNERS = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
  function quadVAO(prog, attribs) {
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.bufferData(gl.ARRAY_BUFFER, CORNERS, gl.STATIC_DRAW);
    const cl = gl.getAttribLocation(prog, "corner"); gl.enableVertexAttribArray(cl); gl.vertexAttribPointer(cl, 2, gl.FLOAT, false, 0, 0);
    const buffers = {};
    for (const [name, size] of attribs) {
      const b = gl.createBuffer(); buffers[name] = b;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); gl.vertexAttribDivisor(loc, 1);
    }
    gl.bindVertexArray(null);
    return { vao, buffers };
  }
  let starProg, starSet, moteProg, moteSet;
  try {
    starProg = program(`#version 300 es
      in vec2 corner; in vec4 d1; in vec4 d2;
      uniform vec4 u; /* W, H, dpr, t */
      out vec2 vUv; out vec3 vCol; out float vA; out float vHalo;
      void main() {
        vec2 px = d1.xy * u.z + corner * d1.z * u.z * 4.0;
        gl_Position = vec4(px.x / u.x * 2.0 - 1.0, 1.0 - px.y / u.y * 2.0, 0.0, 1.0);
        vUv = corner * 4.0; vCol = d2.rgb; vA = d2.a; vHalo = d1.w;
      }`, `#version 300 es
      precision mediump float;
      in vec2 vUv; in vec3 vCol; in float vA; in float vHalo;
      out vec4 outColor;
      void main() {
        float d = length(vUv);
        float core = vA * pow(clamp(1.0 - d, 0.0, 1.0), 2.0);
        float halo = vHalo * vA * 0.10 * pow(clamp(1.0 - d / 4.0, 0.0, 1.0), 2.0);
        float total = core + halo;
        outColor = vec4(vCol * total, total);
      }`);
    starSet = quadVAO(starProg, [["d1", 4], ["d2", 4]]);
    moteProg = program(`#version 300 es
      in vec2 corner; in vec4 m; /* home fractions, size, tone */
      uniform vec4 u; /* W, H, dpr, t */
      ${FLOW_GLSL}
      out vec2 vUv; out float vTone;
      void main() {
        vec2 home = m.xy * vec2(u.x, u.y);
        vec2 pos = home + flow(home, u.w) * 14.0 * u.z + flow(home * 2.17 + vec2(131.0, 57.0), u.w * 0.6) * 5.0 * u.z;
        vec2 px = pos + corner * m.z * u.z;
        gl_Position = vec4(px.x / u.x * 2.0 - 1.0, 1.0 - px.y / u.y * 2.0, 0.0, 1.0);
        vUv = corner; vTone = m.w;
      }`, `#version 300 es
      precision mediump float;
      in vec2 vUv; in float vTone;
      out vec4 outColor;
      void main() {
        float fall = pow(max(0.0, 1.0 - length(vUv)), 2.2);
        vec3 col = mix(vec3(0.13, 0.16, 0.38), vec3(0.32, 0.20, 0.48), vTone);
        col = mix(col, vec3(0.79, 0.66, 0.42), smoothstep(0.93, 1.0, vTone));
        float a = fall * 0.05;
        outColor = vec4(col * a, a);
      }`);
    moteSet = quadVAO(moteProg, [["m", 4]]);
    gl.bindBuffer(gl.ARRAY_BUFFER, moteSet.buffers.m);
    gl.bufferData(gl.ARRAY_BUFFER, moteField(), gl.STATIC_DRAW);
  } catch (e) { cv.remove(); return null; }
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  const d1 = new Float32Array((5041 + 16 + 1800) * 4), d2 = new Float32Array((5041 + 16 + 1800) * 4);
  return {
    stage: "webgl2", canvas: cv,
    render(frame) {
      if (lost) return false;
      const [W, H] = fitCanvas(cv, frame.w, frame.h, frame.dpr);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      const uni = new Float32Array([W, H, frame.dpr, frame.t]);
      gl.useProgram(moteProg);
      gl.uniform4fv(gl.getUniformLocation(moteProg, "u"), uni);
      gl.bindVertexArray(moteSet.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, MOTE_COUNT);
      const n = frame.count;
      for (let i = 0; i < n; i++) {
        d1.set(frame.entries.subarray(i * 8, i * 8 + 4), i * 4);
        d2.set(frame.entries.subarray(i * 8 + 4, i * 8 + 8), i * 4);
      }
      gl.useProgram(starProg);
      gl.uniform4fv(gl.getUniformLocation(starProg, "u"), uni);
      gl.bindVertexArray(starSet.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, starSet.buffers.d1); gl.bufferData(gl.ARRAY_BUFFER, d1.subarray(0, n * 4), gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, starSet.buffers.d2); gl.bufferData(gl.ARRAY_BUFFER, d2.subarray(0, n * 4), gl.DYNAMIC_DRAW);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, n);
      gl.bindVertexArray(null);
      return true;
    },
    dispose() { try { cv.remove(); } catch (e) {} },
  };
}

/* The engine, in the house's order. Resolves to a stage, or to null,
   which is the caller's word to draw the wave-1 Canvas 2D sky. A stage
   that dies after starting reports through opts.onLost, and the caller
   asks again with that stage struck from the order. */
export async function createSkyEngine(host, opts = {}) {
  const order = opts.order || ["webgpu", "webgl2"];
  for (const stage of order) {
    try {
      const engine = stage === "webgpu" ? await webgpuEngine(host, opts) : webgl2Engine(host, opts);
      if (engine) return engine;
    } catch (e) { /* a stage that cannot start hands the sky onward */ }
  }
  return null;
}
