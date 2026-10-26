/* planetsky.test.mjs: rebuild wave 2 verification. Run: node tests/planetsky.test.mjs
   Checks: (1) the wanderers against NASA JPL DE421 via Skyfield, the same
   independent ephemeris the stars were verified against in wave 1, over
   the committed reference (tests/planets-ref.json, made by
   scripts/make_planet_ref.py; the ephemeris itself stays outside the
   repo, so this test needs neither Skyfield nor the file). (2) the
   reckoning is a pure function of moment and place. (3) the GPU engine's
   deterministic parts. (4) the wave's surfaces stand in the page: the
   wordless sky-gift link, the Mirror's real sky, the Rosetta line, one
   line, verbatim in the page and in the Codex, and no other visible
   word changed. (5) the seeded systems are byte-identical to wave 1. */
import { planetAltaz, planetRaDec, WANDERERS } from "../assets/js/planets.js";
import { moteHome, moteField, MOTE_COUNT } from "../assets/js/skyrender.js";
import fs from "fs";
import { execSync } from "child_process";

let fails = 0;
const check = (name, ok) => { console.log((ok ? "ok  " : "FAIL") + " " + name); if (!ok) fails++; };
const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");

/* 1. The wanderers against DE421 (Skyfield), 24 cases, 6 wanderers each. */
const ref = JSON.parse(read("tests/planets-ref.json"));
check("planet reference holds 24 cases", ref.cases.length === 24 && ref.format === "planets-ref/1");
let worstSep = 0, worstAlt = 0, worstAz = 0, worstName = "";
for (const c of ref.cases) {
  const got = planetAltaz(new Date(c.iso), c.lat, c.lon);
  const radecs = planetRaDec(new Date(c.iso));
  for (const g of got) {
    const r = c.planets[g.name], rd = radecs.find((x) => x.name === g.name);
    const sep = Math.hypot(Math.cos(r.dec * Math.PI / 180) * (((rd.ra - r.ra + 540) % 360) - 180), rd.dec - r.dec);
    if (sep > worstSep) { worstSep = sep; worstName = g.name + " at " + c.iso + " " + c.place; }
    worstAlt = Math.max(worstAlt, Math.abs(g.alt - r.alt));
    worstAz = Math.max(worstAz, Math.abs(((g.az - r.az + 540) % 360) - 180));
  }
}
check("every wanderer within 0.05 deg of DE421 (worst " + worstSep.toFixed(4) + " deg, " + worstName + ")", worstSep <= 0.05);
check("worst altitude error within 0.05 deg (" + worstAlt.toFixed(4) + " deg)", worstAlt <= 0.05);
check("worst azimuth error within 0.05 deg (" + worstAz.toFixed(4) + " deg)", worstAz <= 0.05);
check("six wanderers are reckoned, Neptune not among them", WANDERERS.length === 6 && !WANDERERS.includes("neptune"));

/* 2. A pure function of moment and place. */
const LA = [34.05, -118.24];
const state = (iso, lat, lon) => JSON.stringify(planetAltaz(new Date(iso), lat, lon).map((p) => [p.name, +p.alt.toFixed(6), +p.az.toFixed(6), p.mag]));
const s1 = state("2026-10-24T06:00:00Z", ...LA), s2 = state("2026-10-24T06:00:00Z", ...LA);
check("determinism: same moment and place, byte-identical wanderers", s1 === s2);
check("the wanderers are a function of the moment: one hour later differs", s1 !== state("2026-10-24T07:00:00Z", ...LA));
check("the wanderers are a function of the place: London differs", s1 !== state("2026-10-24T06:00:00Z", 51.51, -0.13));
const tonight = planetAltaz(new Date("2026-10-25T03:00:00Z"), ...LA);
check("at the tested night moment a wanderer stands over Los Angeles", tonight.some((p) => p.alt > 10));
check("magnitudes are sane for the drawing (Venus outshines Mercury tonight)",
  tonight.every((p) => p.mag > -5 && p.mag < 7) && tonight.find((p) => p.name === "venus").mag < tonight.find((p) => p.name === "mercury").mag);

/* 3. The GPU engine's deterministic parts. */
check("mote homes are deterministic", JSON.stringify(moteHome(41)) === JSON.stringify(moteHome(41)));
check("mote homes are fractions of the frame, tones in range",
  Array.from({ length: 200 }, (_, i) => moteHome(i)).every(([x, y, t]) => x >= 0 && x < 1 && y >= 0 && y < 1 && t >= 0 && t < 1));
check("mote homes are distinct", new Set(Array.from({ length: 200 }, (_, i) => moteHome(i).join(","))).size === 200);
check("the mote field packs four numbers per mote", moteField().length === MOTE_COUNT * 4 && MOTE_COUNT === 768);

/* 4. The wave's surfaces in the page. */
const page = read("index.html");
check("the page reckons the wanderers and asks for the GPU engine",
  page.includes('from "./assets/js/planets.js"') && page.includes('from "./assets/js/skyrender.js"') && page.includes("createSkyEngine"));
check("the Mirror's real sky is wired, lazy on the chamber's own entry",
  page.includes('from "./assets/js/mirrorsky.js"') && page.includes("watchMirrorSky"));
check("the sky-gift link stands wordless: a glyph, a label for the ear, no text",
  /<a class="sky-gift" id="sky-gift" href="\.\/" aria-label="A sky to give"><svg aria-hidden="true"><use href="#g-stars"\/><\/svg><\/a>/.test(page));
check("the gift is read from the address and carried in the address",
  page.includes('searchParams') === false && page.includes('get("sky")') && page.includes('"?sky="'));
const ROSETTA = "The sky over the threshold I did not reckon: it stands where your place and your hour put it, by numbers older than the wheel.";
check("the Rosetta line stands in the Coda Below, exactly once",
  page.split(ROSETTA).length - 1 === 1 && page.includes('class="rosetta sky-rosetta"'));
const codex = read("codex.txt").replace(/\s+/g, " ");
check("the Codex keeps the Rosetta line whole", codex.includes(ROSETTA));
/* Held ration: the visible words of the page are wave 1's words plus this
   one line, and nothing else. Compared against the wave-1 commit itself. */
{
  const strip = (s) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const before = strip(execSync("git show c98e7b6:index.html", { cwd: root }).toString());
  const after = strip(page);
  check("visible text is wave 1's text plus the Rosetta line alone",
    after.replace("“" + ROSETTA + "” ", "") === before);
}

/* 5. The seeded systems, byte-identical, and the house's bans.
   Amendment (rebuild wave 6, 2026-10-25): the byte-identity below
   releases assets/js/main.js, because wave 6 was ordered to move the
   sound module that lives in it (the placed chord, the durable
   ledger); the check keeps its force over deep.js, the seeded
   derivations' presence in main.js is still proven by the check
   after it, and main.js's own restraint (nothing outside the sound
   and durability regions touched) is proven by
   tests/skysound.test.mjs. */
{
  const diff = execSync("git diff c98e7b6 -- assets/js/deep.js", { cwd: root }).toString();
  check("deep.js is byte-identical to wave 1 (main.js released to wave 6's suite by the marked amendment)", diff === "");
}
const main = read("assets/js/main.js");
check("the seeded derivations still stand in main.js",
  main.includes("daySeed()*7+3") && main.includes("daySeed()*11+5") && main.includes("#9fd8b4"));
for (const f of ["assets/js/planets.js", "assets/js/skyrender.js", "assets/js/mirrorsky.js"]) {
  check(f + " names no external address and consults no chance",
    !/https?:\/\//.test(read(f)) && !/Math\.random/.test(read(f)));
}
check("no package.json, no node_modules: no build step, no dependencies",
  !fs.existsSync(new URL("package.json", root)) && !fs.existsSync(new URL("node_modules", root)));

console.log(fails ? fails + " FAILURES" : "all checks passed");
process.exit(fails ? 1 : 0);
