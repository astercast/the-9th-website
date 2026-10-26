/* skyphysics.js: the air over the real sky (rebuild wave 4). Plain
   arithmetic, no libraries, no chance: every function here is a pure
   function of its inputs, like the reckonings it stands beside
   (starsky.js, sun.js, planets.js). Three honesties live here:
     the extinction: starlight is dimmed and reddened by the air it
       crosses, by airmass, with coefficients built from the published
       components of the extinction itself;
     the scintillation: the lowest stars shimmer, because the air
       moves; the shimmer is reckoned, not rolled, and it is not the
       Wishfield's twinkle (see the note at scintillation, below);
     the galactic turning: the catalogue's places read in the galaxy's
       own coordinates, so the Milky Way can be drawn from the
       catalogue's own density (data/milkyway.json). */
const R = Math.PI / 180;

/* ---------- the airmass ----------
   How much air a ray crosses, against the zenith's one: Kasten and
   Young (1989), the interpolative formula fitted to their rigorous
   spherical-atmosphere reckoning, good to the horizon itself, where
   it stands at about 38. The plain secant of the zenith distance is
   the flat-earth guess and runs to infinity at the horizon; this one
   does not. Below the horizon the air is the horizon's air. */
export function airmass(altDeg) {
  const z = 90 - Math.max(altDeg, 0);
  return 1 / (Math.cos(z * R) + 0.50572 * Math.pow(96.07995 - z, -1.6364));
}

/* ---------- the extinction ----------
   The observed magnitude is the true magnitude plus k times the
   airmass (Bouguer's law), and k depends on the light's colour:
   blue is scattered away the most, red the least, which is why low
   stars redden as they dim. The coefficients here are not adopted
   from any single table; they are built from the extinction's
   published components at the Johnson bands' effective wavelengths
   (Bessell 1990: B 0.445, V 0.551, R 0.658 micrometres):
     Rayleigh scattering by the air itself: Bucholtz (1995),
       tau = 0.008569 * lam^-4 * (1 + 0.0113 * lam^-2 + 0.00013 * lam^-4)
       at standard pressure, the lam^-4 of Lord Rayleigh;
     aerosol: an Angstrom term, tau = beta * lam^-alpha with
       beta = 0.03 and alpha = 1.3, a nominal clear night (the
       aerosol is the variable part of the air; a nominal value is
       named here rather than hidden);
   turned to magnitudes by 2.5 * log10(e) = 1.0857 per optical depth.
   The totals (kB 0.345, kV 0.175, kR 0.107 magnitudes per airmass)
   stand inside the published typical ranges for the bands (B 0.25
   to 0.40, V about 0.20, R about 0.10 in the standard tables). */
const MAG_PER_TAU = 1.0857;
export function rayleighTau(lamUm) {
  const l2 = lamUm * lamUm, l4 = l2 * l2;
  return 0.008569 / l4 * (1 + 0.0113 / l2 + 0.00013 / l4);
}
export function aerosolTau(lamUm) { return 0.03 * Math.pow(lamUm, -1.3); }
export function extinctionCoeff(lamUm) { return MAG_PER_TAU * (rayleighTau(lamUm) + aerosolTau(lamUm)); }
export const K_B = extinctionCoeff(0.445);
export const K_V = extinctionCoeff(0.551);
export const K_R = extinctionCoeff(0.658);
/* A star seen through the air: its magnitude deepened by the V
   extinction along its path, its B-V reddened by the difference of
   the B and V extinctions (the colour excess E(B-V), (kB - kV) * X).
   Returns the observed magnitude, the observed B-V, and the airmass
   it was reckoned at. */
export function extincted(mag, bv, altDeg) {
  const X = airmass(altDeg);
  return { mag: mag + K_V * X, bv: bv + (K_B - K_V) * X, airmass: X };
}
/* The dimming alone, in magnitudes, at an altitude: the wanderers
   stand in the same air and are dimmed by it, though their tints
   are the drawing's own and no reddening is reckoned for them. */
export function dimming(altDeg) { return K_V * airmass(altDeg); }
/* The fraction of a light that survives the air at an altitude, in
   the V band: the band's glow is an extended light and is dimmed as
   light, not as a magnitude in the drawing's law. */
export function extinctionFlux(altDeg) {
  return Math.pow(10, -0.4 * K_V * airmass(altDeg));
}

/* ---------- the scintillation ----------
   The stars do not twinkle here; the Wishfield's twinkle is a
   rhythm, authored and seeded, and it belongs to the Wishfield
   alone. What the catalogue's lowest stars do is shimmer: the air
   between the visitor and the star is moving, its cells bending the
   light a little more and a little less from moment to moment, the
   more air the stronger (the variance grows as the airmass to the
   three-halves, Young 1967), and bending the colours apart as it
   goes, so a star near the horizon plays red against blue. It reads
   as weather because it is weather. Only point sources shimmer: an
   extended glow averages the cells away, and the Milky Way does not
   scintillate. Above twenty-five degrees the reckoning returns the
   still sky exactly: the catalogue stands still, as it always has.
   The shimmer is reckoned from an integer hash of the star's own
   catalogue place and the moment's cell (the house's pattern, as
   the motes' homes are reckoned), so the same star at the same
   instant shimmers the same on every machine: a pure function of
   the star, its altitude, and the instant. */
export const SCINT_CELL = 0.12; /* seconds: the shimmer's own grain */
function cellHash(i, cell, salt) {
  let n = (Math.imul(i + 1, 2654435761) + Math.imul(cell, 2246822519) + Math.imul(salt, 3266489917)) >>> 0;
  n ^= n >>> 15; n = Math.imul(n, 2246822519) >>> 0; n ^= n >>> 13;
  n = Math.imul(n, 3266489917) >>> 0; n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
function cellNoise(i, t, salt) {
  const c = Math.floor(t / SCINT_CELL), f = t / SCINT_CELL - c, u = f * f * (3 - 2 * f);
  return cellHash(i, c, salt) + (cellHash(i, c + 1, salt) - cellHash(i, c, salt)) * u;
}
/* The shimmer's strength at an altitude: a relative intensity
   sigma, nothing at twenty-five degrees and above, 0.015 at
   fifteen degrees, 0.04 at ten, 0.14 at five, 0.35 at two, and
   capped at 0.55 at the horizon itself. */
export function scintSigma(altDeg) {
  if (altDeg >= 25) return 0;
  const w = Math.min(1, Math.max(0, (25 - altDeg) / 20));
  return Math.min(0.55, 0.0041 * Math.pow(airmass(altDeg), 1.5)) * w;
}
/* One star's shimmer at one instant: a brightness gain about 1 and
   a colour play about 0 (the red and blue channels lean apart by
   it, the green holding). tSec under 0 is the still air of reduced
   motion: gain 1, play 0, exactly. */
export function scintillation(i, altDeg, tSec) {
  const sig = tSec < 0 ? 0 : scintSigma(altDeg);
  if (!sig) return { gain: 1, chroma: 0 };
  return {
    gain: 1 + sig * (cellNoise(i, tSec, 11) * 2 - 1),
    chroma: sig * (cellNoise(i, tSec, 47) * 2 - 1),
  };
}

/* ---------- the galactic turning ----------
   Equatorial to galactic coordinates, and back, by the standard
   J2000 rotation (ESA SP-1200, the Hipparcos catalogue's own
   transformation; Murray 1989): the north galactic pole stands at
   RA 192.859508 degrees, Dec +27.128336 degrees, and the galactic
   centre at RA 266.405, Dec -28.936 falls at l 0, b 0 under it.
   The matrix is orthogonal; its transpose is its inverse. */
export const GAL_MATRIX = [
  [-0.0548755604162154, -0.8734370902348850, -0.4838350155487132],
  [ 0.4941094278755837, -0.4448296299600112,  0.7469822444972189],
  [-0.8676661490190047, -0.1980763734312015,  0.4559837761750669],
];
function toVec(ra, dec) {
  const a = ra * R, d = dec * R;
  return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
}
function fromVec(x, y, z) {
  let ra = Math.atan2(y, x) / R; if (ra < 0) ra += 360;
  return [ra, Math.asin(Math.max(-1, Math.min(1, z))) / R];
}
export function eqToGal(ra, dec) {
  const [x, y, z] = toVec(ra, dec), M = GAL_MATRIX;
  const gx = M[0][0] * x + M[0][1] * y + M[0][2] * z;
  const gy = M[1][0] * x + M[1][1] * y + M[1][2] * z;
  const gz = M[2][0] * x + M[2][1] * y + M[2][2] * z;
  let l = Math.atan2(gy, gx) / R; if (l < 0) l += 360;
  return [l, Math.asin(Math.max(-1, Math.min(1, gz))) / R];
}
export function galToEq(l, b) {
  const [x, y, z] = toVec(l, b), M = GAL_MATRIX;
  return fromVec(
    M[0][0] * x + M[1][0] * y + M[2][0] * z,
    M[0][1] * x + M[1][1] * y + M[2][1] * z,
    M[0][2] * x + M[1][2] * y + M[2][2] * z);
}
/* The built density (data/milkyway.json) read at a galactic place:
   bilinear over the grid's centres, wrapping in longitude, clamped
   in latitude, returned on the file's own 0 to 255 scale. */
export function sampleDensity(mw, l, b) {
  const { lBins, bMin, bStep, rows, data } = mw;
  const fl = (((l % 360) + 360) % 360) / (360 / lBins) - 0.5;
  const fb = (b - bMin) / bStep;
  const l0 = Math.floor(fl), b0 = Math.floor(fb), tl = fl - l0, tb = fb - b0;
  const at = (li, ri) => data[Math.max(0, Math.min(rows - 1, ri)) * lBins + (((li % lBins) + lBins) % lBins)];
  const top = at(l0, b0) + (at(l0 + 1, b0) - at(l0, b0)) * tl;
  const bot = at(l0, b0 + 1) + (at(l0 + 1, b0 + 1) - at(l0, b0 + 1)) * tl;
  return top + (bot - top) * tb;
}
