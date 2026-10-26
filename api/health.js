const fs = require("fs");
const path = require("path");

function count(file, key) {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "v1", file), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed[key]) ? parsed[key].length : 0;
  } catch (e) {
    return 0;
  }
}

/* The computed sky (bundle 2026-10-24, item 9): health stands on
   data/sky.json itself — the file must exist and its coverage must
   reach at least the current year + 2. No fetched state, no other
   file is consulted for this. */
function skyInfo() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "sky.json"), "utf8");
    const sky = JSON.parse(raw);
    const year = new Date().getUTCFullYear();
    const to = typeof sky.to === "number" ? sky.to : 0;
    return {
      exists: true,
      from: typeof sky.from === "number" ? sky.from : null,
      to: to,
      phases: Array.isArray(sky.phases) ? sky.phases.length : 0,
      seasons: Array.isArray(sky.seasons) ? sky.seasons.length : 0,
      lunarEclipses: Array.isArray(sky.lunarEclipses) ? sky.lunarEclipses.length : 0,
      ok: to >= year + 2,
    };
  } catch (e) {
    return { exists: false, from: null, to: 0, phases: 0, seasons: 0, lunarEclipses: 0, ok: false };
  }
}

module.exports = (req, res) => {
  const sky = skyInfo();
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  res.end(
    JSON.stringify({
      status: sky.ok ? "ok" : "degraded",
      site: "the-9th-website",
      chambers: 9,
      wishes: count("wishes.json", "wishes"),
      letters: count("letters.json", "letters"),
      scaleStops: count("scale.json", "stops"),
      sky: sky,
    })
  );
};
