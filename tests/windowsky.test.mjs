/* windowsky.test.mjs: rebuild wave 5 verification. Run: node tests/windowsky.test.mjs
   Checks: (1) the window's direction, against the platform model's
   own worked examples (the W3C Device Orientation specification's
   three named poses) and the cardinal points of an upright device.
   (2) the tilts and the poles, and the roll that cannot move the
   window. (3) absent and broken samples refused. (4) the angle
   between directions, on its anchors. (5) the glide: it moves
   nothing in no time, approaches by shrinking steps, takes the
   short way around the compass, never overshoots, and arrives.
   (6) the settled frame is wave 4's frame to the pixel: the page's
   own projection, extracted and run against the wave-4 page's
   projection over a grid, bit for bit, the window shut; and with
   the window open, the centre of the frame is the hand's direction.
   (7) a recorded stream replays to the same sky (the composition
   the page performs: wake, snap, glide). (8) the page's surfaces
   and the restraint: the permission asked once and deniably, the
   relative bearing refused, stillness keeping the settled frame,
   no visible word changed, the seeded systems and every other
   reckoning byte-identical to wave 4.
   Amendment (rebuild wave 6, 2026-10-25): check (8)'s byte-identity
   releases assets/js/main.js, because wave 6 was ordered to move the
   sound module that lives in it (the placed chord, the durable
   ledger); the check keeps its force over deep.js and every other
   reckoning, and main.js's own restraint is proven by
   tests/skysound.test.mjs. */
import { viewDirection, angularBetween, smoothView, WINDOW_TAU, WINDOW_WAKE } from "../assets/js/windowview.js";
import fs from "fs";
import { execSync } from "child_process";

let fails = 0;
const check = (name, ok) => { console.log((ok ? "ok  " : "FAIL") + " " + name); if (!ok) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");
const dir = (a, b, g) => viewDirection(a, b, g);

/* 1. The direction, against the model's own worked examples. */
{
  const flat = dir(90, 0, 0);
  check("the specification's first pose (flat, top pointing west) looks straight down (alt " + flat.alt.toFixed(2) + ")",
    near(flat.alt, -90, 1e-9));
  check("the specification's second pose (screen upright, top up) stands at beta 90, altitude 0, at every heading",
    [0, 90, 180, 270].every((a) => near(dir(a, 90, 0).alt, 0, 1e-9)));
  check("the specification's third pose (top to the user's right) reads the user's own heading",
    [0, 90, 200, 359].every((h) => { const d = dir(270 - h, 0, 90); return near(d.az, h, 1e-9) && near(d.alt, 0, 1e-9); }));
  check("an upright device reads the cardinal points (north 0, east 90, south 180, west 270)",
    near(dir(0, 90, 0).az, 0, 1e-9) && near(dir(270, 90, 0).az, 90, 1e-9) &&
    near(dir(180, 90, 0).az, 180, 1e-9) && near(dir(90, 90, 0).az, 270, 1e-9));
}

/* 2. The tilts, the poles, and the roll that cannot move the window. */
check("tilted thirty degrees up, facing north, the window stands thirty degrees up",
  near(dir(0, 120, 0).alt, 30, 1e-9) && near(dir(0, 120, 0).az, 0, 1e-9));
check("tilted thirty degrees down, it stands thirty degrees down",
  near(dir(0, 60, 0).alt, -30, 1e-9) && near(dir(0, 60, 0).az, 0, 1e-9));
check("face down on the table, the window looks at the zenith",
  near(dir(0, 180, 0).alt, 90, 1e-9));
check("the roll cannot move the window (a landscape grip of the same pointing reads the same direction)",
  [0, 90, 200].every((h) => {
    const p = dir((360 - h) % 360, 90, 0), l = dir(270 - h, 0, 90);
    return near(p.az, l.az, 1e-9) && near(p.alt, l.alt, 1e-9);
  }));
check("the direction is a pure function (same sample, same direction, twice)",
  JSON.stringify(dir(123, 45, -30)) === JSON.stringify(dir(123, 45, -30)));

/* 3. Absent and broken samples are refused, and never read as south. */
check("null, undefined, NaN and worded samples are no direction at all",
  dir(null, 90, 0) === null && dir(undefined, 90, 0) === null && dir(NaN, 90, 0) === null &&
  dir(0, null, 0) === null && dir(0, 90, undefined) === null && dir("90", 90, 0) === null);

/* 4. The angle between directions. */
check("the angle between a direction and itself is zero (to the cosine law's own small-angle precision), and to its antipode 180",
  near(angularBetween({ az: 40, alt: 20 }, { az: 40, alt: 20 }), 0, 1e-5) &&
  near(angularBetween({ az: 0, alt: 0 }, { az: 180, alt: 0 }), 180, 1e-9));
check("the angle reads the sphere, not the axes (east is 90 from north; the zenith is 90 from each)",
  near(angularBetween({ az: 0, alt: 0 }, { az: 90, alt: 0 }), 90, 1e-9) &&
  near(angularBetween({ az: 200, alt: 0 }, { az: 40, alt: 90 }), 90, 1e-9));
check("the angle wraps the compass (350 to 10 is twenty degrees, not three hundred and forty)",
  near(angularBetween({ az: 350, alt: 0 }, { az: 10, alt: 0 }), 20, 1e-9));

/* 5. The glide. */
check("the glide's constants stand where the wave set them (tau " + WINDOW_TAU + " s, wake " + WINDOW_WAKE + " deg)",
  WINDOW_TAU === 0.12 && WINDOW_WAKE === 1.5);
check("in no time the view moves not at all, and stands returned whole",
  JSON.stringify(smoothView({ az: 5, alt: 5 }, { az: 90, alt: 0 }, 0)) === JSON.stringify({ az: 5, alt: 5 }) &&
  JSON.stringify(smoothView({ az: 5, alt: 5 }, { az: 90, alt: 0 }, -1)) === JSON.stringify({ az: 5, alt: 5 }));
{
  let cur = { az: 180, alt: 32 }; const tgt = { az: 90, alt: 0 };
  let prevStep = Infinity, monotone = true, shrinking = true, inside = true;
  for (let i = 0; i < 180; i++) {
    const nx = smoothView(cur, tgt, 1 / 60);
    const step = Math.abs(nx.az - cur.az);
    if (nx.az > cur.az + 1e-12) monotone = false;
    if (step > prevStep + 1e-12) shrinking = false;
    if (nx.az < 90 - 1e-9 || nx.az > 180 + 1e-9 || nx.alt < -1e-9 || nx.alt > 32 + 1e-9) inside = false;
    prevStep = step; cur = nx;
  }
  check("the glide approaches by shrinking steps, never overshoots, and arrives (az " + cur.az.toFixed(3) + ", alt " + cur.alt.toFixed(3) + " after 3 s)",
    monotone && shrinking && inside && near(cur.az, 90, 0.02) && near(cur.alt, 0, 0.02));
}
check("the glide takes the short way around the compass (350 toward 10 steps forward through north)",
  smoothView({ az: 350, alt: 0 }, { az: 10, alt: 0 }, 1 / 60).az > 350);
check("the glide is a pure function (same view, target and interval, same next view)",
  JSON.stringify(smoothView({ az: 12, alt: 3 }, { az: 300, alt: 40 }, 0.016)) ===
  JSON.stringify(smoothView({ az: 12, alt: 3 }, { az: 300, alt: 40 }, 0.016)));

/* 6. The settled frame is wave 4's frame; the open frame is the hand's. */
{
  const slice = (src) => {
    const a = src.indexOf("const SKY_R");
    const b = src.indexOf("async function ensureStars");
    return src.slice(a, b);
  };
  const before = execSync("git show f1ac69f:index.html", { cwd: root }).toString();
  const oldProject = new Function(slice(before) + "\nreturn project;")();
  const page = read("index.html");
  const newProject = new Function(slice(page) + "\nreturn project;")();
  let same = true, probes = 0;
  for (let alt = -10; alt <= 90; alt += 7.3) for (let az = 0; az < 360; az += 11.7) {
    for (const [w, h] of [[1440, 900], [390, 844], [800, 412]]) {
      probes++;
      if (JSON.stringify(oldProject(alt, az, w, h)) !== JSON.stringify(newProject(alt, az, w, h))) same = false;
    }
  }
  check("the settled projection is wave 4's projection, bit for bit, over " + probes + " probed points", same);
  check("the settled centre stands in the page as its own numbers (south, thirty-two degrees)",
    page.includes("let viewAz = 180, viewAlt = 32;") && page.includes("const SKY_R = Math.PI / 180, SKY_VA = 180 * SKY_R, SKY_VE = 32 * SKY_R;"));
  const eastProject = new Function(slice(page) + "\nviewAz = 90; viewAlt = 0;\nreturn project;")();
  const c = eastProject(0, 90, 390, 844);
  check("with the window open to the east, the eastern horizon's centre stands at the frame's centre",
    near(c[0], 195, 1e-9) && near(c[1], 422, 1e-9));
  const settledStar = eastProject(32, 180, 390, 844);
  check("and the settled frame's own centre star has left it (the eye moved, not the sky)",
    !(near(settledStar[0], 195, 1) && near(settledStar[1], 422, 1)));
}

/* 7. A recorded stream replays to the same sky. */
{
  const replay = () => {
    const stream = [
      [180, 90, 0], [181, 90, 0], [183, 91, 0], [190, 95, 0], [210, 100, 0],
      [250, 105, 0], [290, 110, 0], [300, 112, 0], [300, 112, 0],
    ];
    let ref = null, live = false, view = { az: 180, alt: 32 }, target = null;
    const trace = [];
    for (const [a, b, g] of stream) {
      const d = viewDirection(a, b, g);
      if (!live) {
        if (!ref) { ref = d; continue; }
        if (angularBetween(ref, d) < WINDOW_WAKE) continue;
        live = true; view = { az: d.az, alt: d.alt };
      }
      target = d;
      for (let k = 0; k < 3; k++) view = smoothView(view, target, 1 / 60);
      trace.push(view.az.toFixed(6) + "," + view.alt.toFixed(6));
    }
    return trace.join(" ");
  };
  check("the same stream, replayed, gives the same trace of views (and the trace truly travelled)",
    replay() === replay() && replay().split(" ").length === 7);
}

/* 8. The page's surfaces, and the restraint. */
const page = read("index.html");
check("the page reckons with the window module and keeps the settled centre as the view's first numbers",
  page.includes('from "./assets/js/windowview.js"') && page.includes("viewDirection(ev.alpha, ev.beta, ev.gamma)") &&
  page.includes("smoothView({ az: viewAz, alt: viewAlt }, winTarget, dt)"));
check("the window wakes only on true movement, from an absolute reading",
  page.includes("if (ev.absolute === false) return;") && page.includes("angularBetween(winRef, d) < WINDOW_WAKE"));
check("the listener stands ready at once, and the permission is asked once, on a touch, a refusal survived in silence",
  page.includes('window.addEventListener("deviceorientation", onOrientation);') &&
  page.includes('typeof DeviceOrientationEvent.requestPermission === "function"') &&
  page.includes('window.addEventListener("pointerdown"') && page.includes('{ once: true }') &&
  page.includes('DeviceOrientationEvent.requestPermission().catch(() => {})'));
check("stillness keeps the settled frame: the whole window stands behind the reduced-motion gate",
  page.includes('if (!REDUCED_SKY && typeof DeviceOrientationEvent !== "undefined")'));
check("the canvas carries the view while the window stands (the harness's mark)",
  page.includes('starCanvas.setAttribute("data-view", viewAz.toFixed(2) + "," + viewAlt.toFixed(2))'));
{
  const strip = (s) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const before = strip(execSync("git show f1ac69f:index.html", { cwd: root }).toString());
  check("no visible word of the page changed in this wave", strip(page) === before);
}
{
  const diffSeed = execSync("git diff c98e7b6 -- assets/js/deep.js", { cwd: root }).toString();
  check("deep.js is byte-identical to wave 1 (main.js released to wave 6's suite by its marked amendment: wave 6 was ordered to move the sound module that lives in it)", diffSeed === "");
  const diffRest = execSync("git diff f1ac69f -- assets/js/mirrorsky.js assets/js/starsky.js assets/js/sun.js assets/js/moon.js assets/js/planets.js assets/js/skyphysics.js assets/js/skyrender.js sw.js", { cwd: root }).toString();
  check("the Mirror, the reckonings, the engine and the worker are byte-identical to wave 4 (the Mirror deliberately unmoved)", diffRest === "");
}
check("the Mirror's own sky carries no window in it",
  !/orientation/i.test(read("assets/js/mirrorsky.js")));
const win = read("assets/js/windowview.js");
check("windowview.js names no external address, consults no chance, and touches no document",
  !/https?:\/\//.test(win) && !/Math\.random/.test(win) && !/document\.|localStorage|navigator\./.test(win));
check("no package.json, no node_modules: no build step, no dependencies",
  !fs.existsSync(new URL("package.json", root)) && !fs.existsSync(new URL("node_modules", root)));

console.log(fails ? fails + " FAILURES" : "all checks passed");
process.exit(fails ? 1 : 0);
