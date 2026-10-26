/* windowview.js: where the hand is pointing (rebuild wave 5). Plain
   arithmetic, no libraries, no chance: every function here is a pure
   function of its inputs, like the reckonings it stands beside
   (starsky.js, sun.js, planets.js, skyphysics.js). One honesty lives
   here: the direction a held device is looking, reckoned from its
   orientation, so the Threshold's sky can stand behind the device
   the way the sky stands behind a window.

   The reckoning follows the platform's own model (the W3C Device
   Orientation model's intrinsic Tait-Bryan rotations: alpha about
   the device's z, then beta about its new x, then gamma about its
   new y, right-handed). The device frame: x to the right of the
   screen, y to its top, z out of the screen toward the visitor.
   The earth frame: x east, y north, z up. Turned through those
   three rotations, the device's z axis stands in earth axes as
     ( cos a * sin g + sin a * sin b * cos g,
       sin a * sin g - cos a * sin b * cos g,
       cos b * cos g )
   and the window looks the other way: the way the back of the
   device faces, the screen's z read backwards. Its altitude is the
   rise of that direction; its azimuth is measured the way
   starsky.js measures azimuth, from north, eastward. The roll of
   the hand is not in the answer and cannot move it: a landscape
   grip and a portrait grip of the same pointing give the same
   direction, which the specification's own worked examples confirm
   (this module's tests hold it to them). */
const R = Math.PI / 180;

/* The glide's time constant, in seconds: the view closes on the
   hand's direction as 1 - exp(-dt / TAU). Long enough that the
   sensor's jitter is ironed flat, short enough that the sky keeps
   up with the hand; the wave's frame pairs stand behind the claim
   that this is the least smoothing that feels like glass. */
export const WINDOW_TAU = 0.12;
/* The wake, in degrees: the window opens only when the hand has
   truly moved this far from the first direction it reported. A
   device lying still on a table reports a direction forever and
   never wakes the window, so the settled Threshold of waves 1 to 4
   stands whole wherever the sky is not being held. */
export const WINDOW_WAKE = 1.5;

/* The direction through the device, from one orientation sample:
   { az, alt } in degrees, or null when the sample carries no
   numbers (a sensor that is absent reports nulls, and nulls are
   not a direction). */
export function viewDirection(alpha, beta, gamma) {
  if (!Number.isFinite(alpha) || !Number.isFinite(beta) || !Number.isFinite(gamma)) return null;
  const a = alpha * R, b = beta * R, g = gamma * R;
  const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b),
        cg = Math.cos(g), sg = Math.sin(g);
  const e = -ca * sg - sa * sb * cg,
        n = -sa * sg + ca * sb * cg,
        u = -cb * cg;
  const alt = Math.asin(Math.max(-1, Math.min(1, u))) / R;
  const az = (Math.atan2(e, n) / R + 360) % 360;
  return { az, alt };
}

/* The angle between two directions, in degrees: how far the hand
   has truly turned, measured on the sphere, so a wake or a glide
   is judged by the sky's own geometry and not by either axis. */
export function angularBetween(p, q) {
  const v = (d) => {
    const a = d.alt * R, z = d.az * R;
    return [Math.cos(a) * Math.sin(z), Math.cos(a) * Math.cos(z), Math.sin(a)];
  };
  const u = v(p), w = v(q);
  const dot = u[0] * w[0] + u[1] * w[1] + u[2] * w[2];
  return Math.acos(Math.max(-1, Math.min(1, dot))) / R;
}

/* One step of the glide: the view after dt seconds of easing from
   cur toward target, azimuth by the short way around the compass.
   Pure: the same view, target and interval give the same next
   view, so a recorded stream of samples replays to the same sky.
   A non-positive interval moves nothing. */
export function smoothView(cur, target, dt) {
  if (!(dt > 0)) return { az: cur.az, alt: cur.alt };
  const f = 1 - Math.exp(-dt / WINDOW_TAU);
  const dAz = ((target.az - cur.az + 540) % 360) - 180;
  return {
    az: (cur.az + dAz * f + 360) % 360,
    alt: cur.alt + (target.alt - cur.alt) * f,
  };
}
