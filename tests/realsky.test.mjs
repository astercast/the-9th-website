/* realsky.test.mjs: rebuild wave 1 verification, beyond Claude's own
   starsky.test.mjs (which stands untouched above). Run: node tests/realsky.test.mjs
   Checks: (1) determinism: the same moment and place inputs produce a
   byte-identical sky state, twice; a different moment does not.
   (2) the sun's reckoning is sane at known moments. (3) the seeded
   systems keep their Master Code derivations, untouched by the
   catalogue. (4) no build step, no dependencies, no external address
   anywhere in the real-sky code. */
import { altaz } from "../assets/js/starsky.js";
import { sunAltaz, sunPhase, starlight } from "../assets/js/sun.js";
import fs from "fs";

let fails = 0;
const check = (name, ok) => { console.log((ok ? "ok  " : "FAIL") + " " + name); if (!ok) fails++; };

const data = JSON.parse(fs.readFileSync(new URL("../data/stars.json", import.meta.url)));
check("catalogue holds 5,041 stars", data.stars.length === 5041 && data.format === "stars/1");

/* The sky state, as the page reckons it: sun, phase, starlight, and
   every catalogue star above the horizon's edge, at fixed precision. */
function skyState(iso, lat, lon) {
  const now = new Date(iso);
  const sun = sunAltaz(now, lat, lon);
  const stars = [];
  for (const s of data.stars) {
    const p = altaz(s, now, lat, lon);
    if (p.alt >= -1) stars.push([s[6], +p.alt.toFixed(6), +p.az.toFixed(6)]);
  }
  return JSON.stringify({
    sun: [+sun.alt.toFixed(6), +sun.az.toFixed(6)],
    phase: sunPhase(now, lat, lon),
    light: +starlight(sun.alt).toFixed(6),
    stars,
  });
}

const a = skyState("2026-10-24T06:00:00Z", 34.05, -118.24);
const b = skyState("2026-10-24T06:00:00Z", 34.05, -118.24);
check("determinism: same moment and place, byte-identical sky state", a === b);
check("determinism: the state is not empty", JSON.parse(a).stars.length > 500);
const c = skyState("2026-10-24T07:00:00Z", 34.05, -118.24);
check("the sky is a function of the moment: one hour later differs", a !== c);
const d = skyState("2026-10-24T06:00:00Z", 51.51, -0.13);
check("the sky is a function of the place: London differs from Los Angeles", a !== d);

/* The sun at known moments over Los Angeles. */
const noon = sunAltaz(new Date("2026-06-21T19:50:00Z"), 34.05, -118.24);
check("summer solstice, near solar noon: the sun stands high (" + noon.alt.toFixed(1) + " deg)", noon.alt > 70 && noon.alt < 82);
const night = sunAltaz(new Date("2026-10-24T06:00:00Z"), 34.05, -118.24);
check("23:00 the night before: the sun stands below the dark (" + night.alt.toFixed(1) + " deg)", night.alt < -6);
check("phase at that moment is night", sunPhase(new Date("2026-10-24T06:00:00Z"), 34.05, -118.24) === "night");
check("phase at summer noon is day", sunPhase(new Date("2026-06-21T19:50:00Z"), 34.05, -118.24) === "day");
check("starlight is whole in the dark and nothing in the day", starlight(night.alt) === 1 && starlight(noon.alt) === 0);

/* The seeded systems keep their derivations; the catalogue took nothing. */
const main = fs.readFileSync(new URL("../assets/js/main.js", import.meta.url), "utf8");
check("Wishfield seed stands: D x 7 + 3", main.includes("daySeed()*7+3"));
check("Nebula mote seed stands: D x 11 + 5", main.includes("daySeed()*11+5"));
check("the Wrong Star stands: its colour, its stillness", main.includes("#9fd8b4") && main.includes("s.wrong? .92"));

/* No build step, no dependencies, no external address. */
const root = new URL("../", import.meta.url);
check("no package.json at the root", !fs.existsSync(new URL("package.json", root)));
check("no node_modules at the root", !fs.existsSync(new URL("node_modules", root)));
for (const f of ["assets/js/starsky.js", "assets/js/sun.js"]) {
  const src = fs.readFileSync(new URL(f, root), "utf8");
  check(f + " names no external address", !/https?:\/\//.test(src));
}
const page = fs.readFileSync(new URL("index.html", root), "utf8");
check("the page loads the catalogue by a relative path only", page.includes('fetch("data/stars.json")') && !/https?:\/\/[^"'\s]*stars/.test(page));
check("the real-sky code consults no chance", !/Math\.random|mulberry32/.test(page.slice(page.indexOf("The real sky: the stars over the visitor"))));

console.log(fails ? fails + " FAILURES" : "all checks passed");
process.exit(fails ? 1 : 0);
