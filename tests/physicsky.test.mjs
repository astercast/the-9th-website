/* physicsky.test.mjs: rebuild wave 4 verification. Run: node tests/physicsky.test.mjs
   Checks: (1) the airmass against the published values of Kasten and
   Young (1989). (2) the extinction: coefficients inside the published
   typical ranges, the Rayleigh component following its lambda^-4 law,
   the dimming and reddening at named altitudes against the published
   behaviour. (3) the scintillation: reckoned, bounded, ordered by
   altitude, still above twenty-five degrees and in the still air,
   and moving in time. (4) the galactic turning: the standard J2000
   rotation against its anchors. (5) the built Milky Way density: the
   file is the catalogue's own density, recomputed here from
   data/stars.json; its latitude crest falls at the plane; its
   longitude crest falls where the bright catalogue actually crests.
   (6) the page's surfaces and the restraint: the physics wired in,
   wave 1's penalty gone, no visible word changed, the seeded systems
   byte-identical to wave 1.
   Amendment (rebuild wave 6, 2026-10-25): check (6)'s byte-identity
   releases assets/js/main.js, because wave 6 was ordered to move the
   sound module that lives in it (the placed chord, the durable
   ledger); the check keeps its force over deep.js, and main.js's own
   restraint (nothing outside the sound and durability regions
   touched) is proven by tests/skysound.test.mjs. */
import { airmass, rayleighTau, aerosolTau, extinctionCoeff, K_B, K_V, K_R, extincted, dimming, extinctionFlux, scintSigma, scintillation, SCINT_CELL, GAL_MATRIX, eqToGal, galToEq, sampleDensity } from "../assets/js/skyphysics.js";
import { altaz } from "../assets/js/starsky.js";
import fs from "fs";
import { execSync } from "child_process";

let fails = 0;
const check = (name, ok) => { console.log((ok ? "ok  " : "FAIL") + " " + name); if (!ok) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");

/* 1. The airmass, against the published reckoning (Kasten & Young 1989). */
check("the zenith is one airmass (" + airmass(90).toFixed(4) + ")", near(airmass(90), 1, 0.001));
check("at thirty degrees the airmass is the published 1.994 (" + airmass(30).toFixed(3) + ")", near(airmass(30), 1.994, 0.01));
check("at ten degrees the airmass is 5.59 (" + airmass(10).toFixed(2) + ")", near(airmass(10), 5.59, 0.1));
check("at five degrees the airmass is the published 10.3 (" + airmass(5).toFixed(2) + ")", near(airmass(5), 10.3, 0.15));
check("at the horizon the airmass stands at about 38, and does not run away (" + airmass(0).toFixed(1) + ")",
  airmass(0) > 36 && airmass(0) < 40);
check("the airmass deepens monotonically as a star sinks",
  [90, 45, 30, 20, 10, 5, 2, 0].every((a, i, arr) => i === 0 || airmass(a) > airmass(arr[i - 1])));

/* 2. The extinction, against the published behaviour. */
check("the coefficients stand inside the published typical ranges (kB " + K_B.toFixed(3) + ", kV " + K_V.toFixed(3) + ", kR " + K_R.toFixed(3) + ")",
  K_B > 0.25 && K_B < 0.42 && K_V > 0.14 && K_V < 0.22 && K_R > 0.08 && K_R < 0.14 && K_B > K_V && K_V > K_R);
check("the Rayleigh component follows its lambda^-4 law (ratio " + (rayleighTau(0.445) / rayleighTau(0.658)).toFixed(2) + ")",
  near(rayleighTau(0.445) / rayleighTau(0.658), 4.93, 0.35));
check("the colour excess per airmass stands in its published span (" + (K_B - K_V).toFixed(3) + ")",
  K_B - K_V > 0.10 && K_B - K_V < 0.22);
check("the V dimming at ten degrees matches the published behaviour, about a magnitude (" + (K_V * airmass(10)).toFixed(2) + ")",
  K_V * airmass(10) > 0.85 && K_V * airmass(10) < 1.15);
check("the V dimming at the horizon is five and a half to eight magnitudes (" + (K_V * airmass(0)).toFixed(2) + ")",
  K_V * airmass(0) > 5.5 && K_V * airmass(0) < 8.0);
{
  const zen = extincted(2.0, 0.6, 90);
  check("overhead, a star is dimmed by the zenith's airmass of V and reddened by its excess",
    near(zen.mag, 2.0 + K_V * airmass(90), 1e-9) && near(zen.bv, 0.6 + (K_B - K_V) * airmass(90), 1e-9) && near(zen.airmass, airmass(90), 1e-9));
  const low = extincted(2.0, 0.0, 2);
  check("at two degrees a white star stands deeply reddened (B-V " + low.bv.toFixed(2) + ") and dimmed (" + (low.mag - 2).toFixed(2) + " mag)",
    low.bv > 3.0 && low.bv < 3.6 && low.mag - 2 > 3.2 && low.mag - 2 < 3.6);
  check("the lower the star, the deeper and the redder, in order",
    [30, 15, 8, 4, 1].every((a, i, arr) => i === 0 || (extincted(2, 0.5, a).mag > extincted(2, 0.5, arr[i - 1]).mag && extincted(2, 0.5, a).bv > extincted(2, 0.5, arr[i - 1]).bv)));
  check("the surviving fraction is the magnitude law read as light",
    near(extinctionFlux(10), Math.pow(10, -0.4 * K_V * airmass(10)), 1e-12) && near(dimming(10), K_V * airmass(10), 1e-12));
}

/* 3. The scintillation: reckoned weather, not chance. */
check("the shimmer is a pure function (same star, altitude and instant, same shimmer)",
  JSON.stringify(scintillation(41, 3, 100.0)) === JSON.stringify(scintillation(41, 3, 100.0)));
check("the still air of reduced motion shimmers not at all, at any altitude",
  [0, 2, 10, 24].every((a) => { const s = scintillation(7, a, -1); return s.gain === 1 && s.chroma === 0; }));
check("above twenty-five degrees the catalogue stands exactly still, as it always has",
  [25, 40, 90].every((a) => scintSigma(a) === 0 && scintillation(3, a, 55.5).gain === 1));
check("the shimmer's strength is ordered by the air (sigma " + [20, 10, 5, 2].map((a) => scintSigma(a).toFixed(3)).join(" > ") + ")",
  scintSigma(2) > scintSigma(5) && scintSigma(5) > scintSigma(10) && scintSigma(10) > scintSigma(20) && scintSigma(20) > 0);
check("the shimmer never exceeds its sigma, in gain or in colour play",
  [0.5, 2, 5, 10, 18].every((a) => {
    const sig = scintSigma(a);
    for (let i = 0; i < 60; i++) for (let t = 0; t < 4; t += 0.37) {
      const s = scintillation(i, a, t);
      if (Math.abs(s.gain - 1) > sig + 1e-9 || Math.abs(s.chroma) > sig + 1e-9) return false;
    }
    return true;
  }));
{
  const series = Array.from({ length: 40 }, (_, k) => scintillation(41, 3, 100 + k * 0.09).gain);
  const spread = Math.max(...series) - Math.min(...series);
  check("the shimmer moves in time (a low star's gain ranges " + spread.toFixed(3) + " over 3.6 s)", spread > 0.05);
  check("the shimmer's grain is the named cell (" + SCINT_CELL + " s)", SCINT_CELL === 0.12);
}

/* 4. The galactic turning, against its anchors. */
{
  const M = GAL_MATRIX;
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  check("the rotation is orthogonal (unit rows, clean cross terms)",
    M.every((row) => near(dot(row, row), 1, 1e-7)) && near(dot(M[0], M[1]), 0, 1e-7) && near(dot(M[0], M[2]), 0, 1e-7) && near(dot(M[1], M[2]), 0, 1e-7));
  const c = eqToGal(266.405, -28.936);
  check("the galactic centre falls at l 0, b 0 (" + c[0].toFixed(4) + ", " + c[1].toFixed(4) + ")", near(c[0], 0, 0.01) && near(c[1], 0, 0.01));
  check("the north galactic pole stands at b +90 (" + eqToGal(192.859508, 27.128336)[1].toFixed(4) + ")",
    near(eqToGal(192.859508, 27.128336)[1], 90, 0.01));
  check("the turning goes there and back again",
    [[123.4, -45.6], [0, 0], [359.9, 80]].every(([ra, de]) => {
      const back = galToEq(...eqToGal(ra, de));
      return near(((back[0] - ra + 540) % 360) - 180, 0, 1e-6) && near(back[1], de, 1e-6);
    }));
}

/* 5. The built density: the catalogue's own crowd. */
const mw = JSON.parse(read("data/milkyway.json"));
check("the density file stands in its format, a full grid with its peak at 255",
  mw.format === "milkyway/1" && mw.data.length === mw.lBins * mw.rows && Math.max(...mw.data) === 255);
{
  /* Recompute the grid from the catalogue, the builder's own
     arithmetic (scripts/make_milkyway.py) restated here, and hold
     the committed file against it. */
  const stars = JSON.parse(read("data/stars.json")).stars;
  const LB = mw.lBins, ROWS = mw.rows, BMIN = mw.bMin;
  const grid = Array.from({ length: ROWS }, () => new Array(LB).fill(0));
  for (const s of stars) {
    const [l, b] = eqToGal(s[0], s[1]);
    const r = Math.round(b) - BMIN;
    if (r >= 0 && r < ROWS) grid[r][Math.floor(l) % LB]++;
  }
  const gauss = (sig, rad) => Array.from({ length: 2 * rad + 1 }, (_, k) => Math.exp(-((k - rad) ** 2) / (2 * sig * sig)));
  const kl = gauss(3.0, 9), kb = gauss(1.8, 6);
  const tmp = grid.map((row) => row.map((_, i) => {
    let a = 0, w = 0;
    for (let j = 0; j < kl.length; j++) { a += row[(i + j - 9 + LB * 2) % LB] * kl[j]; w += kl[j]; }
    return a / w;
  }));
  const sm = tmp.map((row, r) => row.map((_, i) => {
    let a = 0, w = 0;
    for (let j = 0; j < kb.length; j++) { const rr = r + j - 6; if (rr >= 0 && rr < ROWS) { a += tmp[rr][i] * kb[j]; w += kb[j]; } }
    return a / w;
  }));
  let peak = 0, peakAt = -1;
  sm.forEach((row, r) => row.forEach((v, i) => { if (v > peak) { peak = v; peakAt = r * LB + i; } }));
  let within1 = 0, within2 = 0, cells = 0;
  sm.forEach((row, r) => row.forEach((v, i) => {
    const mine = Math.round(255 * v / peak), theirs = mw.data[r * LB + i];
    if (Math.abs(mine - theirs) <= 1) within1++;
    if (Math.abs(mine - theirs) <= 2) within2++;
    cells++;
  }));
  check("the committed density is the catalogue recomputed (peak cell the same; " + (100 * within1 / cells).toFixed(1) + "% of cells within 1, " + (100 * within2 / cells).toFixed(1) + "% within 2)",
    mw.data[peakAt] === 255 && within1 / cells >= 0.99 && within2 / cells >= 0.999);
  const prof = [];
  for (let r = 0; r < ROWS; r++) { let t = 0; for (let l = 0; l < LB; l++) t += mw.data[r * LB + l]; prof.push(t); }
  const crest = BMIN + prof.indexOf(Math.max(...prof));
  check("the density's latitude crest falls at the plane (b " + crest + ", within three degrees: the bright catalogue's Gould Belt tilt, named)",
    Math.abs(crest) <= 3);
  let inBand = 0;
  for (const s of stars) { const [, b] = eqToGal(s[0], s[1]); if (Math.abs(b) < 5) inBand++; }
  check("the plane truly concentrates the catalogue (" + (100 * inBand / stars.length).toFixed(1) + "% within five degrees of it, against a uniform sphere's 8.7%)",
    inBand / stars.length > 0.12);
  let best = [0, -1];
  for (let c = 0; c < 360; c += 5) {
    let t = 0;
    for (let k = -15; k < 15; k++) for (let r = 12; r <= 16; r++) t += mw.data[r * LB + (((c + k) % 360) + 360) % 360];
    if (t > best[0]) best = [t, c];
  }
  check("the band's longitude crest falls on the Carina stretch, where the bright catalogue crests (l " + best[1] + ")",
    best[1] >= 275 && best[1] <= 310);
  check("the density reads exactly at a grid centre, and fades off the plane",
    sampleDensity(mw, 293.5, 0) === mw.data[14 * LB + 293] && sampleDensity(mw, 293, 0) > sampleDensity(mw, 293, 14));
}

/* 6. The composed reckoning is a pure function of moment, place and instant. */
{
  const stars = JSON.parse(read("data/stars.json")).stars;
  const state = (iso, lat, lon, t) => JSON.stringify(stars.slice(0, 400).map((s, i) => {
    const p = altaz(s, new Date(iso), lat, lon);
    const ex = extincted(s[2], s[3], p.alt), sc = scintillation(i, p.alt, t);
    return [s[6], +ex.mag.toFixed(6), +ex.bv.toFixed(6), +sc.gain.toFixed(6), +sc.chroma.toFixed(6)];
  }));
  const a = state("2026-10-25T03:00:00Z", 34.05, -118.24, 100.0);
  check("determinism: same moment, place and instant, byte-identical observed sky", a === state("2026-10-25T03:00:00Z", 34.05, -118.24, 100.0));
  check("the observed sky is a function of the place: London differs", a !== state("2026-10-25T03:00:00Z", 51.51, -0.13, 100.0));
  check("the observed sky is a function of the instant: the shimmer alone moves it", a !== state("2026-10-25T03:00:00Z", 34.05, -118.24, 100.61));
}

/* 7. The page's surfaces, and the restraint. */
const page = read("index.html");
check("the page reckons with the physics module",
  page.includes('from "./assets/js/skyphysics.js"') && page.includes("extincted(s[2], s[3], p.alt)") &&
  page.includes("scintillation(si, p.alt, tSec)") && page.includes("sampleDensity(mwData, l, bOff)"));
check("the band's data is fetched as lazily as the catalogue's, and only ever by its relative path",
  page.includes('fetch("data/milkyway.json")') && !/https?:\/\/[^"'\s]*milkyway/.test(page));
check("wave 1's penalty is gone from the page (the demo formula it replaced)",
  !page.includes("Math.log10(ext)") && !page.includes("-.4 * .25"));
check("the air's tick is gated on view, on visibility, and on the visitor's stillness",
  page.includes("IntersectionObserver") && page.includes("!document.hidden") && page.includes("REDUCED_SKY ? -1 : t"));
{
  const strip = (s) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const before = strip(execSync("git show d929dc8:index.html", { cwd: root }).toString());
  check("no visible word of the page changed in this wave", strip(page) === before);
}
{
  const diff = execSync("git diff c98e7b6 -- assets/js/deep.js", { cwd: root }).toString();
  check("deep.js is byte-identical to wave 1 (main.js released to wave 6's suite by the marked amendment)", diff === "");
}
const phys = read("assets/js/skyphysics.js");
check("skyphysics.js names no external address and consults no chance",
  !/https?:\/\//.test(phys) && !/Math\.random/.test(phys));
check("the engine's buffers hold the band's samples beside the catalogue",
  read("assets/js/skyrender.js").includes("5041 + 16 + 1800"));
check("no package.json, no node_modules: no build step, no dependencies",
  !fs.existsSync(new URL("package.json", root)) && !fs.existsSync(new URL("node_modules", root)));

console.log(fails ? fails + " FAILURES" : "all checks passed");
process.exit(fails ? 1 : 0);
