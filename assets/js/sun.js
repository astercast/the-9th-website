/* sun.js: where the sun is, for a place and a moment. Plain arithmetic, no libraries.
   The companion of starsky.js: it borrows that file's julian day and sidereal time, so
   the sun and the stars are reckoned by one clock. The sun's place comes from its mean
   anomaly and the equation of centre; the phase of the day is read off its altitude. */
import { julian, gmstDeg } from "./starsky.js";
const R = Math.PI / 180;
export function sunAltaz(date, latDeg, lonDeg) {
  const jd = julian(date), d = jd - 2451545;
  const M = (357.5291 + 0.98560028 * d) * R;                                   // mean anomaly
  const C = (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) * R;
  const L = M + C + 102.9372 * R + Math.PI;                                    // ecliptic longitude
  const eps = 23.4397 * R;                                                     // obliquity of the ecliptic
  const dec = Math.asin(Math.sin(L) * Math.sin(eps));
  const ra = Math.atan2(Math.sin(L) * Math.cos(eps), Math.cos(L)) / R;
  const H = (gmstDeg(jd) + lonDeg - ra) * R, la = latDeg * R;
  const alt = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(H));
  const az = Math.atan2(-Math.cos(dec) * Math.sin(H), Math.sin(dec) * Math.cos(la) - Math.cos(dec) * Math.cos(H) * Math.sin(la));
  return { alt: alt / R, az: (az / R + 360) % 360 };
}
/* The phase of the day, from the sun's altitude alone: night below the end of
   civil twilight, day once the sun stands six degrees up, and the twilight
   hours named by the sun's direction of travel. */
export function sunPhase(date, latDeg, lonDeg) {
  const alt = sunAltaz(date, latDeg, lonDeg).alt;
  if (alt < -6) return "night";
  if (alt >= 6) return "day";
  const later = sunAltaz(new Date(date.getTime() + 15 * 60000), latDeg, lonDeg).alt;
  return later > alt ? "dawn" : "dusk";
}
/* How far the dark has come: nothing while the sun is up, whole once it stands
   six degrees below the horizon, and in proportion between. The stars are
   drawn by this measure. */
export function starlight(alt) {
  return Math.max(0, Math.min(1, -alt / 6));
}
