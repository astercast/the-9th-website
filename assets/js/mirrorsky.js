/* mirrorsky.js: the Mirror pinned to the real stars (rebuild wave 2).
   The Mirror's canvas keeps the visitor's journey exactly as it was
   drawn: the ghost paths, this visit's path, the hand's trail, in their
   ring geometry, untouched. What changes is the dark behind them. Where
   the chamber's frame once painted a generic sky, the Mirror now stands
   in front of the sky the visitor is actually under: the catalogue stars
   above their horizon at this moment, and the wanderers among them,
   placed by the same arithmetic as the Threshold's sky (starsky.js and
   planets.js, a pure function of moment and place). The journey is
   pinned to real stars the way a chart is pinned to a board: the board
   is true, and the hand's line is drawn over truth.
   The catalogue is lazy: nothing is fetched until the Mirror is first
   entered, and the place is the place of record (ninth.place), resolved
   by the Threshold's own reckoning. If the data cannot be read, the
   frame's painted sky stands exactly as before: the fallback is the
   chamber itself. No words are added anywhere. */
import { altaz } from "./starsky.js";
import { planetAltaz } from "./planets.js";

const R = Math.PI / 180, VA = 180 * R, VE = 32 * R;
/* The stereographic view, the same one the Threshold's sky is tested in:
   facing south, the eye raised thirty-two degrees. */
function project(alt, az, w, h) {
  const a = alt * R, z = az * R - VA;
  const x = Math.cos(a) * Math.sin(z),
        y = Math.sin(a) * Math.cos(VE) - Math.cos(a) * Math.cos(z) * Math.sin(VE),
        zz = Math.sin(a) * Math.sin(VE) + Math.cos(a) * Math.cos(z) * Math.cos(VE);
  if (zz < -0.9) return null;
  const k = 2 / (1 + zz) * h * 0.515;
  return [w / 2 + x * k, h / 2 - y * k];
}
function starColour(bv) {
  const T = 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62)), t = T / 100;
  let r, g, b;
  r = t <= 66 ? 255 : 329.7 * Math.pow(t - 60, -0.1332);
  g = t <= 66 ? 99.47 * Math.log(t) - 161.1 : 288.1 * Math.pow(t - 60, -0.0755);
  b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5 * Math.log(t - 10) - 305;
  const m = (v) => Math.round(Math.max(0, Math.min(255, v)) * 0.55 + 255 * 0.45);
  return m(r) + "," + m(g) + "," + m(b);
}

/* opts: { section, frame, loadCatalogue, getPlace }
   loadCatalogue resolves to the catalogue's star rows (the Threshold's
   own lazy load, shared, so the file is fetched at most once);
   getPlace returns the place of record, or null until it is resolved. */
export function watchMirrorSky(opts) {
  const { section, frame, loadCatalogue, getPlace } = opts;
  if (!section || !frame) return;
  let canvas = null, stars = null, drawing = false, drawn = false;
  async function ensure() {
    if (stars || drawing) return;
    drawing = true;
    try { stars = await loadCatalogue(); } catch (e) { stars = null; }
    drawing = false;
    if (stars && section.classList.contains("active")) draw();
  }
  function draw() {
    const place = getPlace();
    if (!place || !stars) return;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "mirror-sky-canvas";
      canvas.setAttribute("aria-hidden", "true");
      frame.insertBefore(canvas, frame.firstChild);
      frame.classList.add("has-sky");
    }
    const w = frame.clientWidth, h = frame.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const now = new Date();
    /* The Mirror's sky is a backdrop, and it is dimmer than the
       Threshold's on purpose: the journey stands in front of it. */
    for (const s of stars) {
      const p = altaz(s, now, place.lat, place.lon);
      if (p.alt < -1) continue;
      const xy = project(p.alt, p.az, w, h);
      if (!xy || xy[0] < -10 || xy[0] > w + 10 || xy[1] < -10 || xy[1] > h + 10) continue;
      const a = Math.max(0.15, Math.min(0.6, Math.pow(10, -0.11 * (s[2] - 1.0)))) * 0.55,
            r = Math.max(0.6, 3.0 - 0.42 * s[2]);
      ctx.fillStyle = "rgba(" + starColour(s[3]) + "," + a.toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(xy[0], xy[1], r, 0, 7); ctx.fill();
    }
    for (const p of planetAltaz(now, place.lat, place.lon)) {
      if (p.alt < 0) continue;
      const xy = project(p.alt, p.az, w, h);
      if (!xy) continue;
      const r = Math.max(1.8, 3.4 - 0.45 * p.mag), a = Math.max(0.35, Math.min(0.95, Math.pow(10, -0.11 * (p.mag - 1.0))));
      ctx.fillStyle = "rgba(255,233,168," + (a * 0.16).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(xy[0], xy[1], r * 3.6, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,240,200," + a.toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(xy[0], xy[1], r, 0, 7); ctx.fill();
    }
    drawn = true;
  }
  const mo = new MutationObserver(() => {
    if (section.classList.contains("active")) { ensure(); if (stars) draw(); }
  });
  mo.observe(section, { attributes: true, attributeFilter: ["class"] });
  if (section.classList.contains("active")) ensure();
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (!section.classList.contains("active") || resizeTimer) return;
    resizeTimer = setTimeout(() => { resizeTimer = null; draw(); }, 200);
  });
  setInterval(() => { if (drawn && section.classList.contains("active")) draw(); }, 10 * 60 * 1000);
  return { draw };
}
