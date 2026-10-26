/* moon.js: the true phase for any moment, from real new moon times. No network call at runtime. */
let SKY = null;
export async function loadSky(url = "/data/sky.json") { SKY = SKY || await (await fetch(url)).json(); return SKY; }
const T = (s) => Date.parse(s);
export function moon(now = new Date(), sky = SKY) {
  /* piecewise between the real quarter times, so first quarter is exactly half lit */
  const P = sky.phases, n = now.getTime();
  let i = P.findIndex((p) => T(p[0]) > n) - 1; if (i < 0) i = 0;
  const f = (n - T(P[i][0])) / (T(P[i + 1][0]) - T(P[i][0]));
  const age = (P[i][1] + f) / 4;
  return { age, lit: (1 - Math.cos(2 * Math.PI * age)) / 2, waxing: age < .5 };
}
export function eclipseTonight(now = new Date(), sky = SKY) {
  const n = now.getTime(); return sky.lunarEclipses.find(([t]) => Math.abs(T(t) - n) < 18 * 3600e3) || null;
}
export function moonSVG(m, size = 64) {
  const r = 30, cx = 32, cy = 32, k = Math.cos(2 * Math.PI * m.age) * r, w = m.waxing;
  const d = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${w ? 1 : 0} ${cx} ${cy + r} A ${Math.abs(k)} ${r} 0 0 ${(k > 0) === w ? 0 : 1} ${cx} ${cy - r} Z`;
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="The moon tonight"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/><path d="${d}" fill="currentColor"/></svg>`;
}
