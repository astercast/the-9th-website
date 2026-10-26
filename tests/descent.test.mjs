/* descent.test.mjs: rebuild wave 7 verification. Run: node tests/descent.test.mjs
   Checks: (1) the reckoning (descent.js, lifted whole between its
   markers): the ring's order agreed four ways (the module, the
   place's circuit, the Deep, the page's own sections and doors);
   the step between any two chambers — the seam read through the
   Door, a journey and its return the same road reversed, no step
   longer than four, the same chamber still, strangers refused.
   (2) the depth: the Threshold at nothing, the Door at the whole,
   rising chamber by chamber. (3) the wiring, run under stubs:
   the resume and its three gates (a named chamber governs, a
   sky-gift governs, a first visit is never resumed); the fall
   named ahead of the switch on a door's click, on the address's
   change, and stilled under calm; the standing kept in the
   ledger at every announcement of a chamber. (4) the stylesheet:
   the three registered properties; the directional transition
   derived from the one progress; the plain crossfade standing
   beneath it; the word's sink inside its gates. (5) the page:
   the wave's script heard first of the three, and no visible
   word changed. (6) the restraint: the reckoning's house —
   main.js, the Deep, the Mirror, every sky module and the
   worker — byte-identical to the wave-6 canon commit, and the
   seeded derivations standing. */
import fs from "fs";
import { execSync } from "child_process";

let fails = 0;
const check = (name, ok) => { console.log((ok ? "ok  " : "FAIL") + " " + name); if (!ok) fails++; };
const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");

const dsrc = read("assets/js/descent.js");
const main = read("assets/js/main.js");
const deep = read("assets/js/deep.js");
const css = read("assets/css/main.css");
const page = read("index.html");

/* 1. The reckoning. */
const DESCENT = (() => {
  const span = dsrc.slice(dsrc.indexOf("var DESCENT ="), dsrc.indexOf("/* /THE RECKONING */"));
  return new Function(span + "\nreturn DESCENT;")();
})();
{
  const fromMain = main.match(/var CHAMBERS = \[([^\]]+)\]/)[1].match(/"(\w+)"/g).map(s => s.slice(1, -1));
  const fromDeep = deep.match(/var CHAMBERS=\[([^\]]+)\]/)[1].match(/"(\w+)"/g).map(s => s.slice(1, -1));
  const sections = [...page.matchAll(/<section class="chamber" id="chamber-(\w+)"/g)].map(m => m[1]);
  const doors = [...page.matchAll(/data-go="(\w+)"/g)].map(m => m[1]);
  check("the ring's order is one order in four keepings (the reckoning, the circuit, the Deep, the page's sections and doors)",
    JSON.stringify(DESCENT.RING) === JSON.stringify(fromMain) &&
    JSON.stringify(DESCENT.RING) === JSON.stringify(fromDeep) &&
    JSON.stringify(DESCENT.RING) === JSON.stringify(sections) &&
    JSON.stringify(DESCENT.RING) === JSON.stringify(doors));
  const S = DESCENT.stepBetween;
  check("one step forward along the order is a fall of one, and back a rise of one",
    S("threshold", "scale").dir === "fall" && S("threshold", "scale").steps === 1 &&
    S("scale", "threshold").dir === "rise" && S("scale", "threshold").steps === 1 &&
    S("tide", "cabinet").dir === "fall" && S("cabinet", "tide").dir === "rise");
  check("the seam is the Door: the Ninth falls through to the Threshold, and the Threshold rises back to the Door",
    S("ninth", "threshold").dir === "fall" && S("ninth", "threshold").steps === 1 &&
    S("threshold", "ninth").dir === "rise" && S("threshold", "ninth").steps === 1);
  check("the same chamber is still, and no step on the ring is longer than four",
    DESCENT.RING.every(c => S(c, c).dir === "still" && S(c, c).steps === 0) &&
    DESCENT.RING.every(a => DESCENT.RING.every(b => S(a, b).steps <= 4)));
  let anti = true;
  for (const a of DESCENT.RING) for (const b of DESCENT.RING) {
    const x = S(a, b), y = S(b, a);
    if (x.steps !== y.steps) anti = false;
    if (x.dir === "fall" && y.dir !== "rise") anti = false;
    if (x.dir === "rise" && y.dir !== "fall") anti = false;
    if (x.dir === "still" && y.dir !== "still") anti = false;
  }
  check("a journey and its return are the same road read in opposite directions (all 81 pairs)",
    anti);
  check("the longest falls stand at the ring's far side (Threshold to Tide a rise of four, Letters to the Door a fall of four)",
    S("threshold", "tide").dir === "rise" && S("threshold", "tide").steps === 4 &&
    S("letters", "ninth").dir === "fall" && S("letters", "ninth").steps === 4);
  check("strangers are refused: an unknown chamber reckons nothing",
    S("threshold", "nowhere") === null && S("nowhere", "tide") === null && DESCENT.depthOf("nowhere") === null);
}

/* 2. The depth. */
{
  check("the depth: the Threshold at nothing, the Door at the whole, one eighth per chamber between",
    DESCENT.depthOf("threshold") === 0 && DESCENT.depthOf("ninth") === 1 &&
    DESCENT.RING.every((c, i) => DESCENT.depthOf(c) === i / 8));
}

/* 3. The wiring, under stubs. */
function loadPage(opts) {
  const store = new Map(Object.entries(opts.store || {}));
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
  };
  const state = { active: opts.active || null };
  const sections = DESCENT.RING.map((name) => ({ getAttribute: (k) => (k === "data-chamber" ? name : null), _name: name }));
  const rootEl = {
    attrs: {}, props: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    style: { setProperty(k, v) { rootEl.props[k] = v; } },
  };
  const listeners = { document: {}, window: {} };
  let observerCb = null;
  class MO { constructor(cb) { observerCb = cb; } observe() {} }
  const documentStub = {
    documentElement: rootEl,
    addEventListener(t, fn, cap) { listeners.document[t] = { fn, cap }; },
    querySelector(sel) { return sel === ".chamber.active" ? (sections.find(s => s._name === state.active) || null) : null; },
    querySelectorAll(sel) { return sel === ".chamber" ? sections : []; },
  };
  const replaced = [];
  const historyStub = { replaceState(a, b, url) { replaced.push(url); } };
  const locationStub = { hash: opts.hash || "", search: opts.search || "" };
  const windowStub = {
    matchMedia: () => ({ matches: !!opts.reduced }),
    addEventListener(t, fn) { listeners.window[t] = { fn }; },
  };
  new Function("window", "document", "localStorage", "location", "history", "MutationObserver", dsrc)(
    windowStub, documentStub, localStorage, locationStub, historyStub, MO);
  return {
    rootEl, replaced, store, windowStub,
    setActive(c) { state.active = c; if (observerCb) observerCb(); },
    click(go) {
      const btn = { getAttribute: (k) => (k === "data-go" ? go : null) };
      listeners.document.click.fn({ target: { closest: () => btn } });
    },
    hashchangeTo(h) { locationStub.hash = h; listeners.window.hashchange.fn(); },
  };
}
{
  const fresh = loadPage({ store: {}, active: "threshold" });
  check("a first visit is never resumed, however the keeping stands",
    fresh.replaced.length === 0 &&
    loadPage({ store: { "ninth.standing": JSON.stringify("tide") } }).replaced.length === 0);
  const back = loadPage({ store: { "ninth.visits": "1", "ninth.standing": JSON.stringify("tide") } });
  check("a returning visitor on a bare address is set down where they stood, by replacement, once",
    back.replaced.length === 1 && back.replaced[0] === "#tide");
  check("a chamber named in the address governs over the keeping",
    loadPage({ store: { "ninth.visits": "3", "ninth.standing": JSON.stringify("tide") }, hash: "#garden" }).replaced.length === 0);
  check("a sky-gift arrival governs over the keeping (the gift is the Threshold's)",
    loadPage({ store: { "ninth.visits": "3", "ninth.standing": JSON.stringify("tide") }, search: "?sky=34,-118,3" }).replaced.length === 0);
  check("a standing the ring no longer knows resumes nothing",
    loadPage({ store: { "ninth.visits": "3", "ninth.standing": JSON.stringify("nowhere") } }).replaced.length === 0);

  const p = loadPage({ store: { "ninth.visits": "1" }, active: "threshold" });
  p.click("garden");
  check("a door's click names the fall ahead of the switch, at its true length (Threshold to Garden, a fall of two)",
    p.rootEl.attrs["data-descent"] === "fall" && p.rootEl.props["--descent-steps"] === "2");
  p.setActive("garden"); p.click("threshold");
  check("the return names the rise at the same length (Garden to Threshold, a rise of two)",
    p.rootEl.attrs["data-descent"] === "rise" && p.rootEl.props["--descent-steps"] === "2");
  p.setActive("threshold"); p.click("ninth");
  check("the seam names a rise from the Threshold to the Door",
    p.rootEl.attrs["data-descent"] === "rise" && p.rootEl.props["--descent-steps"] === "1");
  p.setActive("ninth"); p.click("threshold");
  check("and a fall through the Door back to the Threshold",
    p.rootEl.attrs["data-descent"] === "fall" && p.rootEl.props["--descent-steps"] === "1");
  p.setActive("threshold"); p.click("threshold");
  check("the chamber already stood in names still, with no steps",
    p.rootEl.attrs["data-descent"] === "still" && p.rootEl.props["--descent-steps"] === "0");
  p.setActive("garden"); p.hashchangeTo("#scale");
  check("the address's change names the step too (Garden to Scale, a rise)",
    p.rootEl.attrs["data-descent"] === "rise" && p.rootEl.props["--descent-steps"] === "1");
  check("the standing is kept in the ledger at every announcement of a chamber",
    p.store.get("ninth.standing") === JSON.stringify("scale") || p.store.get("ninth.standing") === JSON.stringify("garden"));
  const calm = loadPage({ store: { "ninth.visits": "1" }, active: "threshold", reduced: true });
  calm.click("garden");
  check("under calm the name is always still, whatever door is chosen",
    calm.rootEl.attrs["data-descent"] === "still" && calm.rootEl.props["--descent-steps"] === "0");
  check("the reckoning stands published for the place (window.ninthDescent)",
    !!p.windowStub.ninthDescent && p.windowStub.ninthDescent.RING.length === 9);
  check("the wave's code sends nothing anywhere and consults no chance",
    !/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|https?:\/\//.test(dsrc) && !/Math\.random/.test(dsrc));
  check("the naming is wired ahead of the circuit: a capture ear on the doors, an ear on the address, the chambers' own announcement as the net",
    dsrc.includes('addEventListener("click"') && dsrc.includes("}, true);") &&
    dsrc.includes('addEventListener("hashchange"') && dsrc.includes("new MutationObserver") &&
    dsrc.includes('history.replaceState(null, "", "#" + standing)'));
}

/* 4. The stylesheet. */
{
  check("the three properties stand registered in their kinds (a number for the progress, a number for the steps, a length for the sink)",
    css.includes("@property --fall-p { syntax: '<number>'; inherits: false; initial-value: 0; }") &&
    css.includes("@property --descent-steps { syntax: '<number>'; inherits: true; initial-value: 1; }") &&
    css.includes("@property --word-sink { syntax: '<length>'; inherits: false; initial-value: 0px; }"));
  check("one keyframe pair drives both directions: --fall-p runs from nothing to the whole",
    css.includes("@keyframes vtFallP{from{--fall-p:0}to{--fall-p:1}}") &&
    css.includes('html[data-descent="fall"]::view-transition-old(root)') &&
    css.includes('html[data-descent="rise"]::view-transition-new(root)'));
  check("the travel is derived from the progress and the step's length, signed by the direction",
    css.includes("html[data-descent=\"fall\"]::view-transition-old(root){transform:translateY(calc(var(--fall-p) * var(--descent-steps) * -1.5%))") &&
    css.includes("html[data-descent=\"fall\"]::view-transition-new(root){transform:translateY(calc((1 - var(--fall-p)) * var(--descent-steps) * 1.5%))") &&
    css.includes("html[data-descent=\"rise\"]::view-transition-old(root){transform:translateY(calc(var(--fall-p) * var(--descent-steps) * 1.5%))") &&
    css.includes("html[data-descent=\"rise\"]::view-transition-new(root){transform:translateY(calc((1 - var(--fall-p)) * var(--descent-steps) * -1.5%))"));
  check("the plain crossfade stands beneath the direction, untouched (the fallback, whole)",
    css.includes("::view-transition-old(root){animation:vtOut .45s ease both}") &&
    css.includes("::view-transition-new(root){animation:vtIn .55s ease both}"));
  check("the word's sink rides inside its gates (scroll-driven support, no-preference, the still study held)",
    css.includes("@supports (animation-timeline: scroll())") &&
    css.includes(".chamber.active .chamber-word{animation:wordSink linear both;animation-timeline:scroll(root block);animation-range:0px 70vh}") &&
    css.includes("@keyframes wordSink{from{--word-sink:0px}to{--word-sink:-3.4vh}}") &&
    css.includes("html.still .chamber.active .chamber-word{animation:none}") &&
    css.includes(".chamber-word{transform:translateY(var(--word-sink))}"));
  check("the Ninth's word keeps its centring with the sink laid over it, after its own rule",
    css.indexOf("#chamber-ninth .chamber-word{transform:translateX(-50%) translateY(var(--word-sink))}") >
    css.indexOf("#chamber-ninth .chamber-word{top:4vh;left:50%;transform:translateX(-50%)"));
}

/* 5. The page. */
{
  const strip = (s) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const before = strip(execSync("git show d2c5a16:index.html", { cwd: root }).toString());
  check("no visible word of the page changed in this wave", strip(page) === before);
  check("the wave's script is heard first of the three, each deferred (the resume read before the address)",
    page.indexOf('<script src="assets/js/descent.js" defer></script>') !== -1 &&
    page.indexOf('<script src="assets/js/descent.js" defer></script>') < page.indexOf('<script src="assets/js/main.js" defer></script>') &&
    page.indexOf('<script src="assets/js/main.js" defer></script>') < page.indexOf('<script src="assets/js/deep.js" defer></script>'));
}

/* 6. The restraint. */
{
  const diffRest = execSync("git diff d2c5a16 -- assets/js/main.js assets/js/deep.js assets/js/mirrorsky.js assets/js/starsky.js assets/js/sun.js assets/js/moon.js assets/js/planets.js assets/js/skyphysics.js assets/js/skyrender.js assets/js/windowview.js assets/js/skysound.js assets/js/pad-worklet.js sw.js", { cwd: root }).toString();
  check("the reckoning's whole house is byte-identical to the wave-6 canon commit (the wave moved nothing it did not have to)",
    diffRest === "");
  check("the seeded derivations stand in main.js, the Wrong Star's colour among them",
    main.includes("daySeed()*7+3") && main.includes("daySeed()*11+5") && main.includes("#9fd8b4"));
  check("no package.json, no node_modules: no build step, no dependencies",
    !fs.existsSync(new URL("package.json", root)) && !fs.existsSync(new URL("node_modules", root)));
}

console.log(fails ? fails + " FAILURES" : "all checks passed");
process.exit(fails ? 1 : 0);
