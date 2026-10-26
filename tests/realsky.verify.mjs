/* realsky.verify.mjs — the rebuild wave 1 checks, run by hand:
     node tests/realsky.verify.mjs
   1. Claude's starsky reference set, re-run as assertions (Skyfield truth).
   2. The sun against known geometry: solstice and equinox noon altitudes at Los Angeles.
   3. The phase sequence across one Los Angeles day, in order, with its transition times.
   4. The visible star counts at the tested moment (2026-10-25T04:00Z, Los Angeles).
   5. The module's four phase lines are byte-identical to main.js's lines.
   6. The visible text of index.html is unchanged from HEAD (the fleet discipline). */
import { altaz } from "../assets/js/starsky.js";
import { sunAltaz, sunPhase, starlight } from "../assets/js/sun.js";
import fs from "fs";
import { execSync } from "child_process";

let failures = 0;
const check = (name, ok, detail) => {
  console.log((ok ? "PASS" : "FAIL") + "  " + name + (detail ? "  — " + detail : ""));
  if (!ok) failures++;
};

/* 1. The reference stars (Los Angeles, 2026-10-24T06:00:00Z) */
const ref = JSON.parse(fs.readFileSync(new URL("./ref.json", import.meta.url)));
let worstAlt = 0, worstAz = 0;
for (const [ra, de, m, alt, az, pa, pd] of ref) {
  const r = altaz([ra, de, m, 0, pa, pd], new Date("2026-10-24T06:00:00Z"), 34.05, -118.24);
  worstAlt = Math.max(worstAlt, Math.abs(r.alt - alt));
  worstAz = Math.max(worstAz, Math.abs(((r.az - az + 540) % 360) - 180));
}
check("starsky vs Skyfield reference", worstAlt <= 0.0051 && worstAz <= 0.02,
  "worst alt " + worstAlt.toFixed(3) + " deg, worst az " + worstAz.toFixed(3) + " deg over " + ref.length + " stars");

/* 2. The sun at noon: geometry says altitude = 90 - |lat - declination| */
function noonAlt(isoDay, lat, lon) {
  let best = -90, bestT = null;
  const t0 = Date.parse(isoDay + "T00:00:00Z");
  for (let m = 0; m <= 1440; m += 2) {
    const t = new Date(t0 + m * 60000), a = sunAltaz(t, lat, lon);
    if (a.alt > best) { best = a.alt; bestT = { t, az: a.az }; }
  }
  return { alt: best, ...bestT };
}
for (const [day, want] of [["2026-06-21", 79.39], ["2026-12-21", 32.51], ["2026-03-20", 55.95]]) {
  const n = noonAlt(day, 34.05, -118.24);
  check("sun noon altitude " + day, Math.abs(n.alt - want) <= 0.35,
    "got " + n.alt.toFixed(2) + ", geometry " + want + ", az at noon " + n.az.toFixed(1));
}

/* 3. One Los Angeles day of phases, in order */
{
  const seq = [];
  const t0 = Date.parse("2026-10-24T07:00:00Z"), t1 = Date.parse("2026-10-25T07:00:00Z");
  let prev = null;
  for (let t = t0; t <= t1; t += 60000) {
    const p = sunPhase(new Date(t), 34.05, -118.24);
    if (p !== prev) { seq.push(p + " @" + new Date(t).toISOString().slice(11, 16) + "Z"); prev = p; }
  }
  const order = seq.map((s) => s.split(" ")[0]).join(">");
  check("phase order 2026-10-24 Los Angeles", order === "night>dawn>day>dusk>night", seq.join("  "));
}

/* 4. The tested moment: how much of the catalogue stands over Los Angeles */
{
  const stars = JSON.parse(fs.readFileSync(new URL("../data/stars.json", import.meta.url))).stars;
  const when = new Date("2026-10-25T04:00:00Z");
  let up = 0;
  for (const s of stars) if (altaz(s, when, 34.05, -118.24).alt > 0) up++;
  check("catalogue above horizon", up > 2200 && up < 2900, up + " of " + stars.length + " stars up");
  check("the tested moment is full night", sunPhase(when, 34.05, -118.24) === "night" &&
    starlight(sunAltaz(when, 34.05, -118.24).alt) === 1,
    "sun alt " + sunAltaz(when, 34.05, -118.24).alt.toFixed(1) + " deg");
}

/* 5. The phase lines: the module's copies against main.js's originals */
{
  const main = fs.readFileSync(new URL("../assets/js/main.js", import.meta.url), "utf8");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const grab = (src) => {
    const out = {};
    for (const k of ["dawn", "day", "dusk", "night"]) {
      const m = src.match(new RegExp(k + ':\\s*"([^"]+)"'));
      out[k] = m && m[1];
    }
    return out;
  };
  const a = grab(main), b = grab(html);
  check("phase lines byte-identical", ["dawn", "day", "dusk", "night"].every((k) => a[k] && a[k] === b[k]),
    JSON.stringify(b));
}

/* 6. Visible text of the page, unchanged */
{
  const strip = (s) => s
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const head = execSync("git show HEAD:index.html", { cwd: new URL("..", import.meta.url) }).toString();
  const now = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const { createHash } = await import("crypto");
  const h = (s) => createHash("sha256").update(strip(s)).digest("hex");
  check("visible text identical to HEAD", h(head) === h(now), "sha256 " + h(now).slice(0, 12));
}

/* 7. The zones table is whole and sane */
{
  const z = JSON.parse(fs.readFileSync(new URL("../data/zones.json", import.meta.url))).zones;
  const keys = Object.keys(z);
  const sane = keys.every((k) => Math.abs(z[k][0]) <= 90 && Math.abs(z[k][1]) <= 180);
  check("zones table", keys.length >= 400 && sane && z["America/Los_Angeles"][0] === 34.05,
    keys.length + " zones");
}

console.log(failures ? "\n" + failures + " FAILURE(S)" : "\nALL CHECKS PASS");
process.exit(failures ? 1 : 0);
