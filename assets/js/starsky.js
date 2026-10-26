/* starsky.js: where a catalogue star is, for a place and a moment. Plain arithmetic, no libraries.
   Steps: proper motion to the date, precession from J2000, hour angle from sidereal time, then altitude and azimuth. */
const R = Math.PI / 180;
export function julian(date) { return date.getTime() / 864e5 + 2440587.5; }
export function gmstDeg(jd) {                                   // Greenwich mean sidereal time, degrees
  const T = (jd - 2451545) / 36525;
  return (280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - T * T * T / 38710000) % 360;
}
export function altaz(star, date, latDeg, lonDeg) {
  const [ra0, de0, , , pmra, pmde] = star, jd = julian(date), y = (jd - 2451545) / 365.25;
  let ra = ra0 + pmra / 3.6e6 * y / Math.max(Math.cos(de0 * R), .01), de = de0 + pmde / 3.6e6 * y;   // pmra is already times cos(dec)
  const T = (jd - 2451545) / 36525;                                                                  // precession (IAU 1976)
  const zeta = (2306.2181 * T + .30188 * T * T) / 3600, z = (2306.2181 * T + 1.09468 * T * T) / 3600, th = (2004.3109 * T - .42665 * T * T) / 3600;
  const A = Math.cos(de * R) * Math.sin((ra + zeta) * R), B = Math.cos(th * R) * Math.cos(de * R) * Math.cos((ra + zeta) * R) - Math.sin(th * R) * Math.sin(de * R), C = Math.sin(th * R) * Math.cos(de * R) * Math.cos((ra + zeta) * R) + Math.cos(th * R) * Math.sin(de * R);
  ra = (Math.atan2(A, B) / R + z + 360) % 360; de = Math.asin(C) / R;
  const H = (gmstDeg(jd) + lonDeg - ra) * R, la = latDeg * R, d = de * R;
  const sa = Math.sin(la) * Math.sin(d) + Math.cos(la) * Math.cos(d) * Math.cos(H);
  const alt = Math.asin(sa), az = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * Math.cos(la) - Math.cos(d) * Math.cos(H) * Math.sin(la));
  return { alt: alt / R, az: (az / R + 360) % 360 };
}
