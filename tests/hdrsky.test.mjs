/* hdrsky.test.mjs: rebuild wave 3 verification. Run: node tests/hdrsky.test.mjs
   Checks: (1) the tonemap curve, the wave's one piece of mathematics:
   exact (the entries' own values) at and below the knee, continuous
   with matched slope at the knee, a shoulder above it that grades the
   brightest light and never reaches 1. (2) the half-float decoding the
   readback instrument stands on. (3) the WebGPU stage's construction:
   the half-float accumulation buffer, the present pass, the gain in
   both fragment shaders, the constants shared between the JS record
   and the WGSL drawing. (4) the restraint: the WebGL2 stage's drawing
   is wave 2's, and the page, the seeded systems and every other wave-2
   file are untouched since the wave-2 canon commit (324af98).
   Amendment (rebuild wave 4, 2026-10-25): check (4)'s baseline advances
   to the wave-3 canon commit (d929dc8) and its file list drops
   index.html, because wave 4 was ordered to move the reckoning that
   lives in the page (the extinction, the shimmer, the band); the check
   keeps its force over everything wave 4 does not govern, and the
   page's own restraint is proven by tests/physicsky.test.mjs.
   Amendment (rebuild wave 6, 2026-10-25): check (4)'s file list drops
   assets/js/main.js, because wave 6 was ordered to move the sound
   module that lives in it (the placed chord, the durable ledger);
   the check keeps its force over every other file on its list, and
   main.js's own restraint (nothing outside the sound and durability
   regions touched) is proven by tests/skysound.test.mjs. */
import { HDR_GAIN, HDR_KNEE, tonemapScalar, float16ToNumber } from "../assets/js/skyrender.js";
import fs from "fs";
import { execSync } from "child_process";

let fails = 0;
const check = (name, ok) => { console.log((ok ? "ok  " : "FAIL") + " " + name); if (!ok) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");

/* 1. The tonemap curve. */
check("the gain is one stop and the knee stands at 0.8", HDR_GAIN === 2 && HDR_KNEE === 0.8);
check("below the knee the curve returns the entry value exactly (motes, faint and mid stars unmoved)",
  [0, 0.05, 0.3, 0.5, 0.65, 0.8].every((v) => near(tonemapScalar(HDR_GAIN * v), v, 1e-12)));
check("the curve is continuous at the knee", near(tonemapScalar(HDR_GAIN * HDR_KNEE), HDR_KNEE, 1e-12) &&
  near(tonemapScalar(HDR_GAIN * HDR_KNEE - 1e-9), tonemapScalar(HDR_GAIN * HDR_KNEE + 1e-9), 1e-6));
{
  const x = HDR_GAIN * HDR_KNEE, h = 1e-5;
  const dl = (tonemapScalar(x) - tonemapScalar(x - h)) / h;
  const dr = (tonemapScalar(x + h) - tonemapScalar(x)) / h;
  check("the shoulder's slope matches the exact region's at the knee (no kink in the light)",
    near(dl, 1 / HDR_GAIN, 1e-3) && near(dr, 1 / HDR_GAIN, 1e-2));
}
check("the brightest star's held peak (total 1.1 at the gain) tones to a graded 0.9554, not a clip",
  near(tonemapScalar(2.2), 0.955374, 1e-6));
check("two overlapping peaks (total 2.2 at the gain) still grade below 1",
  tonemapScalar(4.4) > 0.99 && tonemapScalar(4.4) < 1);
check("the shoulder asymptotes: heavy light grades below 1, and no light ever passes it",
  tonemapScalar(10) < 1 && tonemapScalar(10) > 0.999 && tonemapScalar(100) <= 1 && tonemapScalar(1e6) <= 1);
{
  let mono = true, prev = -1;
  for (let x = 0; x <= 20; x += 0.01) { const y = tonemapScalar(x); if (y < prev || y < 0) mono = false; prev = y; }
  check("the curve is monotonic and never negative over the working range", mono);
}
check("the curve is a pure function (same input, same output, twice)",
  tonemapScalar(2.2) === tonemapScalar(2.2) && tonemapScalar(0.37) === tonemapScalar(0.37));

/* 2. The readback's decoding. */
check("half-float decoding reads the buffer's numbers whole",
  float16ToNumber(0x0000) === 0 && float16ToNumber(0x3c00) === 1 && float16ToNumber(0x4000) === 2 &&
  near(float16ToNumber(0x3555), 0.333252, 1e-6) && near(float16ToNumber(0x44d7), 4.839844, 1e-6) &&
  float16ToNumber(0x7c00) === Infinity && near(float16ToNumber(0x0001), Math.pow(2, -24), 1e-12));

/* 3. The stage's construction. */
const sky = read("assets/js/skyrender.js");
check("the WebGPU stage accumulates in a half-float buffer and says so on the canvas",
  sky.includes('format: "rgba16float"') && sky.includes('cv.dataset.hdr = "rgba16float"'));
check("the present pass reads the buffer texel for texel and tones by the accumulated alpha",
  sky.includes("textureLoad(hdr, vec2i(o.p.xy), 0)") && sky.includes("tonemap(v.a)") &&
  sky.includes("pp.setPipeline(presentPipe); pp.setBindGroup(0, presentBG); pp.draw(3, 1, 0, 0);"));
check("the WGSL curve is built from the same constants as the JS record (the two cannot drift)",
  sky.includes("HDR_GAIN * HDR_KNEE") && sky.includes("HDR_GAIN * (1 - HDR_KNEE)") &&
  sky.includes("const GAIN: f32 = ${f32(HDR_GAIN)}"));
check("both fragment shaders write their light at the gain (stars' cores and motes alike)",
  sky.includes("let total = (core + halo) * GAIN;") && sky.includes("let a = fall * 0.05 * ${f32(HDR_GAIN)};"));
check("a platform that cannot hold the buffer never starts the stage (probed before it owns the sky)",
  sky.includes("if (!ensureHDR(1, 1)) { cv.remove(); return null; }"));
check("the readback instrument stands on the engine (peak, with its error kept)",
  sky.includes("async peak()") && sky.includes("copyTextureToBuffer") && sky.includes("this.peakError"));

/* 4. The restraint: nothing else moved. */
check("the WebGL2 stage keeps wave 2's drawing, formula for formula",
  sky.includes("float core = vA * pow(clamp(1.0 - d, 0.0, 1.0), 2.0);") &&
  sky.includes("float a = fall * 0.05;") && sky.includes("outColor = vec4(vCol * total, total);"));
{
  const diff = execSync("git diff d929dc8 -- assets/js/deep.js assets/js/mirrorsky.js assets/js/planets.js assets/js/starsky.js assets/js/sun.js assets/js/moon.js sw.js",
    { cwd: root }).toString();
  check("the seeded systems, the Mirror, the wanderers and the worker are untouched since wave 3 (main.js released to wave 6's suite by the marked amendment)", diff === "");
}
check("skyrender.js names no external address and consults no chance",
  !/https?:\/\//.test(sky) && !/Math\.random/.test(sky));
check("no package.json, no node_modules: no build step, no dependencies",
  !fs.existsSync(new URL("package.json", root)) && !fs.existsSync(new URL("node_modules", root)));

console.log(fails ? fails + " FAILURES" : "all checks passed");
process.exit(fails ? 1 : 0);
