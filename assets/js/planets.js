/* planets.js: where a wanderer is, for a place and a moment. Plain arithmetic, no libraries.
   The companion of starsky.js and sun.js, reckoned the same way: the orbital elements and
   their daily rates are Paul Schlyter's (How to compute planetary positions), the day count
   is his, and the great perturbations of Jupiter, Saturn and Uranus are his terms. The
   wanderers are not the wheel's and not the catalogue's: like the sun and the stars they are
   physics, a pure function of the moment and the place. Neptune is not reckoned: at eighth
   magnitude it stands below the catalogue's own limit, and this sky holds only what an eye
   under it could in principle see. */
import { julian, gmstDeg } from "./starsky.js";
const R = Math.PI / 180, D2 = 180 / Math.PI;
const rev = (x) => x - Math.floor(x / 360) * 360;
/* Schlyter's day number: days since 2000 Jan 0.0, the count his elements are tuned to. */
const dayNum = (date) => julian(date) - 2451543.5;

/* The elements at the day: node, inclination, perihelion, axis, eccentricity, mean anomaly. */
const ELEMENTS = {
  mercury: (d) => [48.3313 + 3.24587e-5 * d, 7.0047 + 5.00e-8 * d, 29.1241 + 1.01444e-5 * d, 0.387098, 0.205635 + 5.59e-10 * d, 168.6562 + 4.0923344368 * d],
  venus:   (d) => [76.6799 + 2.46590e-5 * d, 3.3946 + 2.75e-8 * d, 54.8910 + 1.38374e-5 * d, 0.723330, 0.006773 - 1.302e-9 * d, 48.0052 + 1.6021302244 * d],
  sun:     (d) => [0, 0, 282.9404 + 4.70935e-5 * d, 1.000000, 0.016709 - 1.151e-9 * d, 356.0470 + 0.9856002585 * d],
  mars:    (d) => [49.5574 + 2.11081e-5 * d, 1.8497 - 1.78e-8 * d, 286.5016 + 2.92961e-5 * d, 1.523688, 0.093405 + 2.516e-9 * d, 18.6021 + 0.5240207766 * d],
  jupiter: (d) => [100.4542 + 2.76854e-5 * d, 1.3030 - 1.557e-7 * d, 273.8777 + 1.64505e-5 * d, 5.20256, 0.048498 + 4.469e-9 * d, 19.8950 + 0.0830853001 * d],
  saturn:  (d) => [113.6634 + 2.38980e-5 * d, 2.4886 - 1.081e-7 * d, 339.3939 + 2.97661e-5 * d, 9.55475, 0.055546 - 9.499e-9 * d, 316.9670 + 0.0334442282 * d],
  uranus:  (d) => [74.0005 + 1.3978e-5 * d, 0.7733 + 1.9e-8 * d, 96.6612 + 3.0565e-5 * d, 19.18171 - 1.55e-8 * d, 0.047318 + 7.45e-9 * d, 142.5905 + 0.011725806 * d],
};
export const WANDERERS = ["mercury", "venus", "mars", "jupiter", "saturn", "uranus"];

/* One body's heliocentric place: ecliptic longitude, latitude, distance (AU). */
function helio(name, d) {
  const [N, i, w, a, e, M] = ELEMENTS[name](d).map((v, k) => (k === 3 || k === 4 ? v : rev(v)));
  const Mr = M * R;
  let E = M + D2 * e * Math.sin(Mr) * (1 + e * Math.cos(Mr));
  for (let k = 0; k < 8; k++) {
    const E1 = E - (E - D2 * e * Math.sin(E * R) - M) / (1 - e * Math.cos(E * R));
    if (Math.abs(E1 - E) < 0.005) { E = E1; break; }
    E = E1;
  }
  const xv = a * (Math.cos(E * R) - e), yv = a * (Math.sqrt(1 - e * e) * Math.sin(E * R));
  const v = Math.atan2(yv, xv) * D2, r = Math.hypot(xv, yv), u = (v + w) * R;
  const xh = r * (Math.cos(N * R) * Math.cos(u) - Math.sin(N * R) * Math.sin(u) * Math.cos(i * R));
  const yh = r * (Math.sin(N * R) * Math.cos(u) + Math.cos(N * R) * Math.sin(u) * Math.cos(i * R));
  const zh = r * (Math.sin(u) * Math.sin(i * R));
  return { lon: rev(Math.atan2(yh, xh) * D2), lat: Math.atan2(zh, Math.hypot(xh, yh)) * D2, r, M };
}

/* The great perturbations, Schlyter's terms: longitude degrees to add (and latitude, Saturn). */
function perturbations(name, Mj, Ms, Mu) {
  const s = Math.sin, c = Math.cos;
  if (name === "jupiter") return { lon:
    -0.332 * s((2 * Mj - 5 * Ms - 67.6) * R) - 0.056 * s((2 * Mj - 2 * Ms + 21) * R)
    + 0.042 * s((3 * Mj - 5 * Ms + 21) * R) - 0.036 * s((Mj - 2 * Ms) * R)
    + 0.022 * c((Mj - Ms) * R) + 0.023 * s((2 * Mj - 3 * Ms + 52) * R)
    - 0.016 * s((Mj - 5 * Ms - 69) * R), lat: 0 };
  if (name === "saturn") return { lon:
    +0.812 * s((2 * Mj - 5 * Ms - 67.6) * R) - 0.229 * c((2 * Mj - 4 * Ms - 2) * R)
    + 0.119 * s((Mj - 2 * Ms - 3) * R) + 0.046 * s((2 * Mj - 6 * Ms - 69) * R)
    + 0.014 * s((Mj - 3 * Ms + 32) * R), lat:
    -0.020 * c((2 * Mj - 4 * Ms - 2) * R) + 0.018 * s((2 * Mj - 6 * Ms - 49) * R) };
  if (name === "uranus") return { lon:
    +0.040 * s((Ms - 2 * Mu + 6) * R) + 0.035 * s((Ms - 3 * Mu + 33) * R)
    - 0.015 * s((Mj - Mu + 20) * R), lat: 0 };
  return { lon: 0, lat: 0 };
}

/* Brightness, Schlyter's phase reckonings: a magnitude for the drawing, nothing more. */
function magnitude(name, r, dist, fv) {
  const base = 5 * Math.log10(r * dist);
  switch (name) {
    case "mercury": return -0.60 + base + 0.0380 * fv - 0.000273 * fv * fv + 0.000002 * fv * fv * fv;
    case "venus":   return -4.47 + base + 0.0103 * fv + 0.000057 * fv * fv + 0.00000013 * fv * fv * fv;
    case "mars":    return -1.52 + base + 0.016 * fv;
    case "jupiter": return -9.40 + base + 0.005 * fv;
    case "saturn":  return -8.88 + base + 0.044 * fv;
    case "uranus":  return -7.19 + base + 0.0028 * fv;
  }
  return 0;
}

/* Every wanderer's equatorial place for the moment: right ascension and declination
   in degrees (of the date), with its distance and magnitude. Pure; no state is kept. */
export function planetRaDec(date) {
  const d = dayNum(date);
  /* The sun's elements through the same machinery give its geocentric longitude;
     the earth's heliocentric place is that line read backward, which is what the
     xs and ys below carry (Schlyter's own construction). */
  const sun = helio("sun", d);
  const rs = sun.r, xs = rs * Math.cos(sun.lon * R), ys = rs * Math.sin(sun.lon * R);
  const mj = helio("jupiter", d).M, ms = helio("saturn", d).M, mu = helio("uranus", d).M;
  const ecl = (23.4393 - 3.563e-7 * d) * R;
  return WANDERERS.map((name) => {
    const body = helio(name, d);
    const p = perturbations(name, mj, ms, mu);
    const lon = (body.lon + p.lon) * R, lat = (body.lat + p.lat) * R;
    const xh = body.r * Math.cos(lat) * Math.cos(lon);
    const yh = body.r * Math.cos(lat) * Math.sin(lon);
    const zh = body.r * Math.sin(lat);
    const xg = xh + xs, yg = yh + ys, zg = zh;
    const dist = Math.hypot(xg, yg, zg);
    const xe = xg, ye = yg * Math.cos(ecl) - zg * Math.sin(ecl), ze = yg * Math.sin(ecl) + zg * Math.cos(ecl);
    const ra = rev(Math.atan2(ye, xe) * D2), dec = Math.atan2(ze, Math.hypot(xe, ye)) * D2;
    const fv = Math.acos(Math.max(-1, Math.min(1, (body.r * body.r + dist * dist - rs * rs) / (2 * body.r * dist)))) * D2;
    return { name, ra, dec, dist, mag: +magnitude(name, body.r, dist, fv).toFixed(2) };
  });
}

/* The wanderers over a place: altitude and azimuth, by the same hour-angle tail
   the stars use (starsky.js), fed from the sidereal time both files share. */
export function planetAltaz(date, latDeg, lonDeg) {
  const jd = julian(date), H0 = gmstDeg(jd) + lonDeg, la = latDeg * R;
  return planetRaDec(date).map((p) => {
    const H = (H0 - p.ra) * R, dec = p.dec * R;
    const alt = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(H));
    const az = Math.atan2(-Math.cos(dec) * Math.sin(H), Math.sin(dec) * Math.cos(la) - Math.cos(dec) * Math.cos(H) * Math.sin(la));
    return { name: p.name, alt: alt / R, az: (az / R + 360) % 360, mag: p.mag, dist: p.dist };
  });
}
