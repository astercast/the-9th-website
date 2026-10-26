/* skysound.js: where a voice stands in the air (rebuild wave 6).
   Plain arithmetic, no libraries, no chance: every function here
   is a pure function of its inputs, like the reckonings it stands
   beside (starsky.js, planets.js, skyphysics.js, windowview.js).
   One honesty lives here: the place of a sound, reckoned from the
   same positions the renderer draws, so the ear and the eye are
   never told two different skies.

   The frame is the listener's own. The visitor faces the view's
   centre (the settled south and thirty-two degrees of waves 1 to
   4, or the hand's direction while the window stands, wave 5).
   A source's direction (its altitude and azimuth, from the same
   reckonings that place it on the page) is turned into that frame:
   x to the listener's right, y above their head, z toward them,
   so a source standing where the visitor looks stands at
   (0, 0, -1), the platform listener's own forward. The earth
   muffles what sinks: a source's gain follows its altitude,
   whole above six degrees, eased to a floor of 0.18 at six below
   the horizon, the way wave 4's air dims a sinking star without
   ever quite taking it. The stereo pan is the same bearing read
   flat, for platforms that hold no fuller space. */
const R = Math.PI / 180;

/* The muffling's floor and span, named: a source six degrees
   below the horizon sounds at MUFFLE_FLOOR of itself, through
   the earth; at six degrees above it sounds whole. */
export const MUFFLE_FLOOR = 0.18;
export const MUFFLE_SPAN = 6;

/* A direction as a unit vector in earth axes (east, north, up),
   the same axes windowview.js reckons in: azimuth from north,
   eastward; altitude above the horizon. */
function vec(alt, az) {
  const a = alt * R, z = az * R;
  return [Math.cos(a) * Math.sin(z), Math.cos(a) * Math.cos(z), Math.sin(a)];
}
function dot(u, v) { return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]; }
function cross(u, v) {
  return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
}
function norm(u) {
  const l = Math.hypot(u[0], u[1], u[2]);
  return l > 0 ? [u[0] / l, u[1] / l, u[2] / l] : [0, 0, 0];
}
function smoothstep(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/* One source's placement: its altitude and azimuth, and the
   view's centre, become { x, y, z, gain, pan } — the position
   on the listener's unit sphere, the earth's muffling at that
   altitude, and the flat bearing for a stereo stage. Pure: the
   same sky and the same facing give the same place, twice. */
export function placement(alt, az, viewAz, viewAlt) {
  const s = vec(alt, az), f = vec(viewAlt, viewAz);
  /* The listener's right: forward crossed with the world's up.
     Facing north it reads east, as a right hand should. At the
     poles of the view (the zenith, the nadir) that cross fades,
     and the frame is carried instead by the view's own azimuth:
     its east stands as the right, so the placement stays finite
     and whole where a held device looks straight up. */
  let r = cross(f, [0, 0, 1]);
  if (Math.hypot(r[0], r[1], r[2]) < 1e-6) {
    const z = viewAz * R;
    r = [Math.cos(z), -Math.sin(z), 0];
  }
  r = norm(r);
  const up = cross(r, f);
  const x = dot(s, r), y = dot(s, up), z = -dot(s, f);
  const gain = MUFFLE_FLOOR + (1 - MUFFLE_FLOOR) * smoothstep((alt + MUFFLE_SPAN) / (2 * MUFFLE_SPAN));
  const flat = Math.hypot(x, z);
  const pan = flat > 1e-9 ? Math.max(-1, Math.min(1, x / flat)) : 0;
  return { x, y, z, gain, pan };
}

/* The choir's stations: the wanderers standing in the sky,
   brightest first, exactly the reckoning the page draws
   (planetAltaz's own list, the drawing's own horizon rule: a
   wanderer below the horizon holds no station, as it is not
   drawn). Broken entries are no station at all. */
export function stationsFor(wanderers) {
  if (!Array.isArray(wanderers)) return [];
  return wanderers
    .filter((p) => p && Number.isFinite(p.alt) && Number.isFinite(p.az) && Number.isFinite(p.mag) && p.alt >= 0)
    .slice()
    .sort((a, b) => a.mag - b.mag);
}

/* The placements of the whole choir: `count` voices, the last
   of them the overtone. Voice i stands at the i-th brightest
   wanderer's station; a voice with no wanderer left to stand
   on gathers to the view's centre itself, dead ahead, so the
   chord stands where the visitor faces, as it stood before
   this wave, whenever the sky holds fewer wanderers than the
   choir has voices — and the overtone stands with the root,
   at the first station, as an overtone sounds from its own
   fundamental's place. Pure, like the rest. */
export function placementsFor(wanderers, viewAz, viewAlt, count) {
  const stations = stationsFor(wanderers);
  const out = [];
  for (let i = 0; i < count; i++) {
    const overtone = i === count - 1 && count > 1;
    const st = stations[overtone ? 0 : i];
    out.push(st ? placement(st.alt, st.az, viewAz, viewAlt)
                : placement(viewAlt, viewAz, viewAz, viewAlt));
  }
  return out;
}
