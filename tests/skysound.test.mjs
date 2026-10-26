/* skysound.test.mjs: rebuild wave 6 verification. Run: node tests/skysound.test.mjs
   Checks: (1) the placement reckoning (skysound.js): a source where
   the visitor looks stands dead ahead; the compass points of the
   stereo field (centre, hard right, hard left, behind, above);
   the earth's muffling at its named altitudes; the placement a
   unit vector everywhere, the poles of the view included; purity.
   (2) the choir's stations: the wanderers filtered and ordered as
   the drawing filters and orders them; voices beyond the
   wanderers gather to the view's centre; the overtone stands with
   the root; and the sound's right is the drawing's right (the
   page's own projection agrees). (3) the worklet's laws
   (pad-worklet.js, run here under the platform's stubs): silence
   before a voice is started and from a voice never started; the
   attack's rise; the retune's glide arriving at the Tide Chord's
   own number; the overtone's gate shut, then open. (4) the
   gesture gate and the kept silence: the context is built only
   inside the sound mark's own handler; the visitor's word is
   kept and nothing starts unasked. (5) the durable ledger: the
   keeping's write and read across a simulated return visit, the
   Reckoning's draws reproduced on return, the persistence ask
   and the wake lock standing in their guarded forms, and nothing
   in the wave's code sending anything anywhere. (6) the
   restraint: no visible word changed; main.js identical outside
   the sound and durability regions since the wave-5 canon commit;
   every other reckoning, the engine, the Mirror and the worker
   byte-identical to wave 5; the seeded derivations standing. */
import { placement, stationsFor, placementsFor, MUFFLE_FLOOR, MUFFLE_SPAN } from "../assets/js/skysound.js";
import { planetAltaz } from "../assets/js/planets.js";
import fs from "fs";
import { execSync } from "child_process";

let fails = 0;
const check = (name, ok) => { console.log((ok ? "ok  " : "FAIL") + " " + name); if (!ok) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");

/* 1. The placement reckoning. */
{
  const c = placement(32, 180, 180, 32);
  check("a source where the visitor looks stands dead ahead (0, 0, -1), whole and centred",
    near(c.x, 0, 1e-12) && near(c.y, 0, 1e-12) && near(c.z, -1, 1e-12) && c.gain === 1 && near(c.pan, 0, 1e-12));
  const ahead = placement(0, 180, 180, 0);
  check("a source on the horizon ahead is ahead, at the muffling's midpoint (0.59)",
    near(ahead.z, -1, 1e-12) && near(ahead.gain, 0.59, 1e-12));
  const right = placement(0, 270, 180, 0), left = placement(0, 90, 180, 0);
  check("ninety degrees to the right is hard right, and to the left hard left",
    near(right.x, 1, 1e-12) && near(right.z, 0, 1e-12) && near(right.pan, 1, 1e-12) &&
    near(left.x, -1, 1e-12) && near(left.pan, -1, 1e-12));
  const behind = placement(0, 0, 180, 0);
  check("a source behind the visitor stands behind (z +1), its pan centred",
    near(behind.z, 1, 1e-12) && near(behind.x, 0, 1e-12) && near(behind.pan, 0, 1e-9));
  const zen = placement(90, 40, 180, 0);
  check("the zenith stands overhead (y +1) whatever the facing",
    near(zen.y, 1, 1e-12) && near(zen.x, 0, 1e-9) && near(zen.z, 0, 1e-9));
  check("the muffling stands at its named anchors (whole at +6 and above, the floor at -6 and below)",
    placement(6, 180, 180, 0).gain === 1 && placement(40, 180, 180, 0).gain === 1 &&
    near(placement(-6, 180, 180, 0).gain, MUFFLE_FLOOR, 1e-12) && near(placement(-30, 180, 180, 0).gain, MUFFLE_FLOOR, 1e-12) &&
    MUFFLE_FLOOR === 0.18 && MUFFLE_SPAN === 6);
  let mono = true, prev = -1;
  for (let alt = -20; alt <= 40; alt += 2) { const g = placement(alt, 200, 180, 10).gain; if (g < prev - 1e-12) mono = false; prev = g; }
  check("the muffling never deepens as a source climbs", mono);
  let unit = true;
  for (const va of [0, 32, 89.9, 90, -90]) for (const vz of [0, 137, 359])
    for (const sa of [-80, -5, 0, 25, 90]) for (const sz of [0, 90, 200, 359]) {
      const p = placement(sa, sz, vz, va);
      if (![p.x, p.y, p.z].every(Number.isFinite) || !near(Math.hypot(p.x, p.y, p.z), 1, 1e-9)) unit = false;
    }
  check("every placement is a finite unit vector, the view's own poles included", unit);
  check("the placement is a pure function (same sky, same facing, same place, twice)",
    JSON.stringify(placement(21, 243, 199, 12)) === JSON.stringify(placement(21, 243, 199, 12)));
}

/* 2. The choir's stations. */
{
  const sky = [
    { name: "saturn", alt: 12, az: 200, mag: 0.5 },
    { name: "venus", alt: 25, az: 250, mag: -4.4 },
    { name: "mars", alt: -3, az: 100, mag: 0.1 },
    { name: "jupiter", alt: 40, az: 150, mag: -2.2 },
    { name: "broken", alt: NaN, az: 10, mag: 0 },
  ];
  const st = stationsFor(sky);
  check("the stations are the drawn wanderers only (below the horizon and broken entries hold none), brightest first",
    st.length === 3 && st[0].name === "venus" && st[1].name === "jupiter" && st[2].name === "saturn" &&
    sky[0].name === "saturn");
  const pl = placementsFor(sky, 180, 32, 5);
  check("the voices stand at the stations in order, and the fifth voice past the wanderers gathers to the centre",
    JSON.stringify(pl[0]) === JSON.stringify(placement(25, 250, 180, 32)) &&
    JSON.stringify(pl[1]) === JSON.stringify(placement(40, 150, 180, 32)) &&
    JSON.stringify(pl[2]) === JSON.stringify(placement(12, 200, 180, 32)) &&
    JSON.stringify(pl[3]) === JSON.stringify(placement(32, 180, 180, 32)));
  check("the overtone stands with the root, at the first station, as an overtone sounds from its fundamental's place",
    JSON.stringify(pl[4]) === JSON.stringify(pl[0]));
  const none = placementsFor([], 180, 32, 5);
  check("with no wanderer standing, the whole choir gathers to the faced point (the pad as it stood before this wave)",
    none.every((p) => JSON.stringify(p) === JSON.stringify(placement(32, 180, 180, 32))));
  const real = placementsFor(planetAltaz(new Date(Date.UTC(2026, 0, 15, 4, 0)), 34.05, -118.24), 180, 32, 5);
  check("the reckoning runs on the true wanderers (five placements, each a unit vector with a lawful gain)",
    real.length === 5 && real.every((p) => near(Math.hypot(p.x, p.y, p.z), 1, 1e-9) && p.gain >= MUFFLE_FLOOR && p.gain <= 1));
  /* Sound and sight agree: the page's own projection, extracted. */
  const page = read("index.html");
  const slice = page.slice(page.indexOf("const SKY_R"), page.indexOf("async function ensureStars"));
  const proj = new Function(slice + "\nreturn { project, setView:(a,b)=>{ viewAz=a; viewAlt=b; } };")();
  proj.setView(180, 0);
  const centrePx = proj.project(0, 180, 800, 600), rightPx = proj.project(0, 225, 800, 600);
  const centreSd = placement(0, 180, 180, 0), rightSd = placement(0, 225, 180, 0);
  check("the drawing's centre is the sound's centre, and the drawing's right is the sound's right",
    near(centrePx[0], 400, 1e-9) && near(centreSd.x, 0, 1e-12) && rightPx[0] > 400 && rightSd.x > 0 && near(rightSd.pan, Math.sin(Math.PI / 4), 1e-9));
}

/* 3. The worklet's laws, under the platform's stubs. */
{
  let Proc = null;
  class FakeProcessor { constructor() { this.port = { onmessage: null }; } }
  new Function("sampleRate", "AudioWorkletProcessor", "registerProcessor",
    read("assets/js/pad-worklet.js"))(48000, FakeProcessor, (name, cls) => { Proc = cls; });
  check("the processor registers itself as ninth-pad", !!Proc);
  const proc = new Proc();
  const BLOCK = 128, SR = 48000;
  const run = (seconds, sink) => {
    const blocks = Math.round(seconds * SR / BLOCK);
    for (let b = 0; b < blocks; b++) {
      const outs = Array.from({ length: 5 }, () => [new Float32Array(BLOCK)]);
      proc.process([], outs);
      if (sink) sink(outs);
    }
  };
  const collect = (voice, seconds) => { const a = []; run(seconds, (o) => a.push(...o[voice][0])); return a; };
  const rms = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / Math.max(1, a.length));
  const freqOf = (a) => { let c = 0; for (let i = 1; i < a.length; i++) if ((a[i - 1] < 0) !== (a[i] < 0)) c++; return c / 2 / (a.length / SR); };
  const silent = collect(0, 0.5);
  check("before any voice is started, the worklet is silent", silent.every((v) => v === 0));
  proc.port.onmessage({ data: { type: "start", voice: 0, cfg: { freq: 196.00, base: .25 / 1.4, attack: 2.5, depth: .05, rate: .05 } } });
  const early = collect(0, 0.25);
  run(2.75);
  const risen = collect(0, 1.0);
  check("the tone rises by its attack (the first quarter second is quieter than the risen second)",
    rms(early) > 0 && rms(early) < rms(risen) * 0.6);
  check("the risen tone stands at its sent frequency (measured " + freqOf(risen).toFixed(1) + " Hz of 196)",
    near(freqOf(risen), 196, 3));
  proc.port.onmessage({ data: { type: "freq", voice: 0, value: 149.77 } });
  const mid = collect(0, 0.35);
  run(4.0);
  const arrived = collect(0, 1.0);
  check("a retune glides: midway it stands between the chords, and it arrives at the Tide Chord's own number (" + freqOf(arrived).toFixed(2) + " Hz)",
    freqOf(mid) < 194 && freqOf(mid) > 152 && near(freqOf(arrived), 149.77, 1.5));
  proc.port.onmessage({ data: { type: "start", voice: 4, cfg: { freq: 392.00, base: .55, attack: 0, depth: .45, rate: .05 } } });
  const gated = collect(4, 1.0);
  check("the overtone starts gated shut (the room alone opens it)", rms(gated) < 1e-6);
  proc.port.onmessage({ data: { type: "gate", voice: 4, value: .12, tau: .8 } });
  run(3.0);
  const open = collect(4, 1.0);
  check("the gate opens on the room's word, at its sent time constant", rms(open) > 0.01 && near(freqOf(open), 392, 6));
  const never = collect(2, 0.5);
  check("a voice never started stays exactly silent throughout", never.every((v) => v === 0));
}

/* 4. The gesture gate and the kept silence. */
const main = read("assets/js/main.js");
const page = read("index.html");
check("the context is built once, inside the sound mark's own click handler, and nowhere else",
  main.split("actx=new AC();").length - 1 === 1 &&
  main.indexOf('btn.addEventListener("click"') < main.indexOf("actx=new AC();") &&
  main.split("window.AudioContext||window.webkitAudioContext").length - 1 === 1 &&
  !page.includes("AudioContext"));
check("the visitor's word on the sound is kept both ways, and no kept word starts it",
  main.includes('STORE.set("sound","on")') && main.includes('STORE.set("sound","off")') &&
  !main.includes("btn.click()") && !main.includes("dispatchEvent"));
check("the sky's placements reach the sound on the house's hook, and the current frame is offered to a chord started between drawings",
  main.includes("window.onSkySound=function(pl)") && page.includes("window.ninthSkySoundNow = soundPlacements;") &&
  page.includes("if (spl && window.onSkySound) window.onSkySound(spl);") &&
  page.includes('import { placementsFor } from "./assets/js/skysound.js";'));
check("under the visitor's stillness the places are set once and never chased",
  main.includes("if(REDUCED && placedOnce) return;"));
check("the placing stage degrades in its order (HRTF, then a flat bearing, then the plain pad), probed before it is built upon",
  main.includes('p.panningModel="HRTF"') && main.includes("createStereoPanner") &&
  main.indexOf('spatialKind="hrtf"') < main.indexOf('spatialKind="stereo"') &&
  main.includes('btn.setAttribute("data-spatial", spatialKind)'));
check("the generation degrades in its order (the audio thread's voices, then wave 8's oscillators), and both sing the Reckoning's same two draws",
  main.includes('actx.audioWorklet.addModule("assets/js/pad-worklet.js")') &&
  main.includes('buildOsc(swellRate); finish("oscillator");') &&
  main.split("mulberry32(daySeed()*31 + visits*19)").length - 1 === 1);

/* 5. The durable ledger. */
{
  const shim = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }; };
  const storeSlice = main.slice(main.indexOf("var STORE = {"), main.indexOf("};", main.indexOf("var STORE = {")) + 2);
  const rngLine = main.slice(main.indexOf("function mulberry32"), main.indexOf("\n", main.indexOf("function mulberry32")));
  const visit = (ls) => new Function("localStorage", storeSlice + "\n" + rngLine + "\nreturn { STORE, mulberry32 };")(ls);
  const ls = shim();
  const v1 = visit(ls);
  v1.STORE.set("visits", 7);
  v1.STORE.set("ghosts", [["threshold", "tide", "mirror"], ["stars"]]);
  v1.STORE.set("sound", "off");
  const v2 = visit(ls);
  check("the keeping reads back whole on a return visit (visits, ghost paths, the sound's word)",
    v2.STORE.get("visits", 0) === 7 &&
    JSON.stringify(v2.STORE.get("ghosts", [])) === JSON.stringify([["threshold", "tide", "mirror"], ["stars"]]) &&
    v2.STORE.get("sound", "") === "off");
  const draw = (F, D, V) => { const r = F.mulberry32(D * 31 + V * 19); return [2, 3, 4][Math.floor(r() * 3)] + "@" + (.03 + r() * .04).toFixed(6); };
  check("the Reckoning's draws reproduce exactly on return (the same day and visit, the same overtone)",
    draw(v1, 20261025, 1) === draw(v2, 20261025, 1) && [2, 3, 4].includes(parseInt(draw(v1, 20261025, 1))));
  check("the persistence is asked once, silently, of a returning visitor only, and a refusal is survived",
    main.includes("navigator.storage.persisted()") && main.includes("navigator.storage.persist()") &&
    main.includes("if(!(visits>1 || ghosts.length)) return;") &&
    main.includes('if(!("storage" in navigator) || !navigator.storage || !navigator.storage.persist) return;'));
  check("the wake lock is held for the window's life: asked on its waking, re-asked on return, guarded and refused in silence",
    page.includes('navigator.wakeLock.request("screen")') && page.includes('"wakeLock" in navigator') &&
    page.includes("winLive = true;") && page.includes("holdWakeLock();") &&
    page.includes('document.addEventListener("visibilitychange"'));
  const wave6code = read("assets/js/skysound.js") + read("assets/js/pad-worklet.js") +
    main.slice(main.indexOf("/* ---------- ambient sound"), main.indexOf("/* The Kept Threshold"));
  check("nothing in the wave's code sends anything anywhere (no fetch, no beacon, no socket, no external address)",
    !/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|https?:\/\//.test(wave6code));
}

/* 6. The restraint. */
{
  const strip = (s) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const before = strip(execSync("git show f1ac69f:index.html", { cwd: root }).toString());
  check("no visible word of the page changed in this wave", strip(page) === before);
  const cut = (src) => src.slice(0, src.indexOf("/* ---------- ambient sound")) + src.slice(src.indexOf("/* The Kept Threshold"));
  const mainBefore = execSync("git show 0138f42:assets/js/main.js", { cwd: root }).toString();
  check("main.js is byte-identical outside the sound and durability regions since the wave-5 canon commit",
    cut(main) === cut(mainBefore));
  const diffRest = execSync("git diff 0138f42 -- assets/js/deep.js assets/js/mirrorsky.js assets/js/starsky.js assets/js/sun.js assets/js/moon.js assets/js/planets.js assets/js/skyphysics.js assets/js/skyrender.js assets/js/windowview.js sw.js", { cwd: root }).toString();
  check("every other reckoning, the Deep, the Mirror, the engine and the worker are byte-identical to wave 5", diffRest === "");
  check("the seeded derivations stand in main.js, the Wrong Star's colour among them",
    main.includes("daySeed()*7+3") && main.includes("daySeed()*11+5") && main.includes("#9fd8b4"));
  const snd = read("assets/js/skysound.js"), wrk = read("assets/js/pad-worklet.js");
  check("skysound.js consults no chance, touches no document, and names no external address",
    !/Math\.random/.test(snd) && !/document\.|localStorage|navigator\./.test(snd) && !/https?:\/\//.test(snd));
  check("pad-worklet.js consults no chance and loads nothing",
    !/Math\.random/.test(wrk) && !/fetch\(|import\(/.test(wrk) && !/https?:\/\//.test(wrk));
  check("no package.json, no node_modules: no build step, no dependencies",
    !fs.existsSync(new URL("package.json", root)) && !fs.existsSync(new URL("node_modules", root)));
}

console.log(fails ? fails + " FAILURES" : "all checks passed");
process.exit(fails ? 1 : 0);
