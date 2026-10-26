/* The Descent (rebuild wave 7, the record's ninth item) · the nine
   chambers read as one falling path. This file is the wave's whole
   reckoning and its wiring: a pure turning of the ring's order, and
   three small acts performed around the place's own machinery —
   the fall is named before a chamber switch so the View Transition
   can travel it, the chamber the visitor stands in is kept in the
   place's own keeping, and a returning visitor who arrives with no
   chamber named in the address is set down where they last stood.

   The reckoning never moves: the order is the ring's order (canon
   §III), the one main.js walks, the Deep dives through, and the
   page's sections stand in. A step forward along the order is a
   fall; a step back is a rise; the seam of the ring is the Door —
   from the Ninth Door the next step forward falls through to the
   Threshold, and from the Threshold one step back rises to the
   Door. Between two chambers the path taken is the shorter arc of
   the ring, so a journey and its return are the same road read in
   opposite directions.

   Everything here is enhancement, in the house's discipline
   (CANON §X): disable this file and the place stands exactly as
   wave 6 left it — the ring circuit switches chambers as it
   always has, behind the plain crossfade that stands beneath the
   directional one in the stylesheet. Nothing is fetched, nothing
   is sent anywhere, no word is added to the place. The Mirror is
   passed by as any chamber is passed by; its sky and its journey
   are not touched. */
(function(){
"use strict";

/* THE RECKONING (pure: no document, no storage, no clock. The
   tests lift this span whole and hold it to the ring.) */
var DESCENT = (function(){
  var RING = ["threshold","scale","garden","stars","letters","tide","cabinet","mirror","ninth"];
  function stepBetween(from, to){
    var a = RING.indexOf(from), b = RING.indexOf(to);
    if(a < 0 || b < 0) return null;
    var fwd = (b - a + 9) % 9;
    if(fwd === 0) return { dir: "still", steps: 0 };
    if(fwd <= 4) return { dir: "fall", steps: fwd };
    return { dir: "rise", steps: 9 - fwd };
  }
  function depthOf(c){
    var i = RING.indexOf(c);
    return i < 0 ? null : i / 8;
  }
  return { RING: RING, stepBetween: stepBetween, depthOf: depthOf };
})();
/* /THE RECKONING */

if(typeof window === "undefined" || typeof document === "undefined") return;
window.ninthDescent = DESCENT;

var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]still\b/.test(location.search);
var rootEl = document.documentElement;

function stored(k){
  try{ var v = localStorage.getItem("ninth."+k); return v === null ? null : JSON.parse(v); }
  catch(e){ return null; }
}
function keep(k, v){
  try{ localStorage.setItem("ninth."+k, JSON.stringify(v)); }catch(e){}
}
function activeChamber(){
  var s = document.querySelector(".chamber.active");
  return s ? s.getAttribute("data-chamber") : null;
}

/* ---------- the naming: the fall is named before the switch ----------
   The name is a pair of marks on the root — data-descent and the
   --descent-steps property — which the stylesheet's directional
   transition reads. It is set three ways, in the order they can
   arrive: a capture-phase ear on the doors themselves (ahead of
   the ring circuit's own handlers), an ear on the address (ahead
   of the circuit's, this file having been heard first), and the
   chambers' own announcement of themselves, the Deep's pattern,
   as the net beneath both. Under calm the name is always "still"
   and the plain crossfade stands, as it does wherever the marks
   are absent. */
function nameDescent(from, to){
  var st = (!REDUCED && from && to) ? DESCENT.stepBetween(from, to) : null;
  if(!st || st.dir === "still"){
    rootEl.setAttribute("data-descent", "still");
    rootEl.style.setProperty("--descent-steps", "0");
  } else {
    rootEl.setAttribute("data-descent", st.dir);
    rootEl.style.setProperty("--descent-steps", String(st.steps));
  }
}
rootEl.setAttribute("data-descent", "still");
rootEl.style.setProperty("--descent-steps", "0");
document.addEventListener("click", function(e){
  var t = e.target;
  var b = t && t.closest ? t.closest("[data-go]") : null;
  if(b) nameDescent(activeChamber(), b.getAttribute("data-go"));
}, true);
window.addEventListener("hashchange", function(){
  nameDescent(activeChamber(), (location.hash || "").slice(1));
});

/* ---------- the resume: a returning visitor is set down where
   they stood. The address is read here, before the place reads
   it: a chamber named there governs, as it always has; a sky-gift
   arrival governs next, the gift being the Threshold's; only a
   bare address falls through to the keeping — and then only for
   a visitor who has come before (the stored count standing, as
   the durable ledger's own gate reads it) whose standing the
   ring still knows. The standing is written into the address by
   replacement, so no phantom step is added to the history: the
   journey resumes; it does not restart, and it leaves no extra
   door behind it in the Back button's keeping. ---------- */
(function resume(){
  var named = (location.hash || "").slice(1);
  if(DESCENT.RING.indexOf(named) !== -1) return;
  if(/[?&]sky=/.test(location.search)) return;
  var visits = stored("visits");
  if(!(typeof visits === "number" && visits >= 1)) return;
  var standing = stored("standing");
  if(DESCENT.RING.indexOf(standing) === -1) return;
  try{ history.replaceState(null, "", "#" + standing); }catch(e){}
})();

/* ---------- the keeping: where the visitor stands is the
   descent's state, and it lives in the durable ledger with the
   rest of the place's keeping (ninth.*), derived from nothing
   but the walking itself. The chambers announce themselves by
   their class, as they always have; every announcement — the
   boot's landing among them — is the standing, kept. ---------- */
var mo = new MutationObserver(function(){
  var c = activeChamber();
  if(c) keep("standing", c);
});
document.querySelectorAll(".chamber").forEach(function(s){
  mo.observe(s, { attributes: true, attributeFilter: ["class"] });
});
})();
