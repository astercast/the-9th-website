# DESIGN.md — The 9th, Phase 1: art direction, exploration, design system

*Written 2026-10-15, before code, under the adopted upgrade plan
(`~/workspace/research_notes/design-analysis/NINTH-UPGRADE-PLAN-2026-10-15.md`)
and the creative doctrine
(`~/workspace/research_notes/design-analysis/CREATIVE-DOCTRINE-2026-10-15.md`).
The CANON governs wherever this document and the plan differ. This document
records the study, the exploration the doctrine requires, the choice, and the
token system the build stands on. Phase 1 builds two representative rooms —
the Threshold and the Garden — and stops at the verdict gate.*

---

## 0. The central experience

The 9th is a fictional universe, and its one experience is **entering a
place**: a found place, standing in the dark, quietly alive, that is glad
you came and keeps what you do there. Every choice below is tested against
that sentence, and against the First Law above it: meaning is the function;
warmth beats cleverness; darkness is present and never victorious.

## 1. Study of the current implementation (firsthand, at 90fa5f1)

**Structure.** One page, nine chamber sections, one stylesheet
(`assets/css/main.css`, 480 lines), one script (`assets/js/main.js`,
1,077 lines), four JSON collections. The Ring Circuit (header glyph-doors)
switches chambers; state lives in `ninth.*` localStorage keys. The Master
Code is `mulberry32` (the wheel of CANON, adder 0x6D2B79F5) fed by recorded
seed formulas per system. The Garden is a Canvas 2D flower field grown
from the Dayseed (seed = D), with the Ninth Bloom, the Black Bloom, the
white flower after the Constellation, the Kept Shape at Depth 27, and
pointer-grown flowers on their own recorded seeds. The Threshold is a
phase sky (dawn/day/dusk/night), a welcome line that knows the visit
count, the ring map with its ajar tenth door, and the authored gold field.

**What the current look does well (kept, by name).**

- The first paint: the breathing ring in the veil, pure CSS, before any
  script — the darkness announces itself as intentional.
- The ring as doors (rotation 23/30): glyph slabs with nameplates on
  hover/focus, the lit current door, the kept dot for visited doors.
- The authored field: hand-placed gold motes in the page itself, so the
  settled still carries light with no script at all.
- The Powers Stair's escalation of size and silence; numerals standing
  where sentences stood (door count, mirror path, moon fact).
- The ration discipline: almost no chrome text anywhere; artifacts whole.

**The five most generic decisions in the current look.**

1. **The centered landing stack.** Threshold composition is glyph, title,
   line, diagram, quote, all centered in one 760px column — the standard
   hero stack. Nothing is asymmetric, nothing is architecture; the
   "arrival" reads as a page header, not a place.
2. **The blue gradient night.** The phase sky runs blue-black to blue
   (`#04050c → #131a33`, indigo nebula, `#cfd6ff` star dust). This is the
   generic dark-mode web palette; unmarked, the place could be any
   nocturne app. The site has no green in it, though half its rooms are
   a garden and a shore.
3. **One sans for every label.** Measurements, counts, and specimen data
   are set in the system UI sans, letterspaced uppercase — the tech-label
   register. The site keeps an archive and owns no archival hand: there
   is no monospaced register anywhere, so numbers read as interface,
   not as record.
4. **The Garden is a component, not a room.** A rounded-corner canvas
   rectangle dropped in the centered column, an italic line under it.
   No ground, no frame, no environment; the most living chamber has the
   least composition.
5. **Every chamber the same shape.** Identical column, identical corner
   glyph, identical fragment furniture; rooms differ only in content.
   Pill geometry (`border-radius: 999px` on the sound pill and buttons)
   completes the template feel the doctrine names as a defect.

## 2. Exploration — three concepts for the Threshold and the Garden

Each concept is a complete philosophy for both rooms. No mixing: the
choice below takes one concept whole; the adopted plan's blend is
Concept A, as briefed.

### Concept A — The Midnight Conservatory (the adopted blend, 70/20/10)

*Outside references: the Palm House at Kew (iron ribs over living green);
natural-history specimen drawers and seed packets; Köhler's botanical
plates; observatory domes; herbarium sheets.*

- **Central idea.** The place is a conservatory built over an observatory:
  living things kept under glass and brass, in the dark, by someone
  methodical. Darkness is a medium things grow in, not a backdrop.
- **Palette / type / imagery.** Near-black ink green `#10130F`, deep
  forest `#19251C`, moss `#66745A`, warm parchment `#E8E0CE`, faded paper
  `#C9BFA9`, the site's own gold kept as its brass `#C9A86A`, moonlight
  `#A9B4B1`. Three registers from local stacks (CANON §IX forbids loaded
  fonts): a literary display serif (Didot/Bodoni line), the reading serif
  (Iowan/Palatino), and a new archival mono for measurements and
  specimen labels. Imagery is drawn, never stocked: custom SVG in one
  hand, hairline strokes, the glyph grammar's own line.
- **Threshold.** Arrival through architecture: a tall doorframe drawn in
  double hairline rules stands in monumental negative space; the authored
  gold field drifts inside it; a single point of light rests at its
  horizon. The title is set as a literary object, off-axis against the
  frame's edge; the ring map stands low and to the side, a surveyor's
  diagram rather than a centerpiece. The phase sky retones from blue to
  forest and moonlight; the Kept Light still follows the hand.
- **Garden.** The canvas field stays (it is the Dayseed, behavior
  untouched) and gains a room: layered grounds, glass-rib lines, a brass
  hairline frame, and below it **the Specimen Bed** — nine seedlings in
  custom SVG, nine distinct silhouettes in the glyph hand, standing in a
  soil line, each with an archival tag (mono: its number and its reckoned
  measure). Their order, heights, and leans are reckoned from the
  Dayseed wheel itself, so the bed is the day's garden, catalogued.
- **Signature interaction.** Attention as cultivation: what the hand
  nears, warms (the Kept Light, extended); the bed sways almost
  imperceptibly, staggered, like plants in still air through glass.
- **Techniques.** Design tokens; layered CSS grounds; inline SVG;
  a fresh read of the existing `mulberry32(daySeed())` stream for the
  bed (no existing stream consumed or reordered); CSS sway keyframes;
  scroll-driven and IO machinery already in the house.
- **Trade-offs.** Performance: negligible (SVG + CSS, zero requests).
  Accessibility: strong (real text, focus order untouched, sway killed
  by the calm mode). Maintenance: the token layer pays for itself; the
  risk is taste — green-on-black can go swampy if the moss is allowed
  to saturate; the palette is kept desaturated on purpose.

### Concept B — The Cartographer's Plate

*Outside references: copperplate atlases and frontispieces; bookbinding;
letterpress title pages; engraved botanical plates with leader lines.*

- **Central idea.** The site as a bound atlas of plates: each chamber a
  plate in a book the Cartographer left open. You do not enter a place;
  you read its record, and the record is beautiful enough to haunt.
- **Palette / type / imagery.** Slate-black plates, chalk and copperplate
  line, bone and faded ink; display small-caps title pages, mono
  everywhere as the engraver's hand, cross-hatch textures as SVG
  patterns, plate numbers in the corners ("Plate I", "Plate III").
- **Threshold.** A frontispiece: centered title page composition, rule
  lines, an engraved door vignette, the ring map redrawn as an atlas
  diagram with coordinate ticks. **Garden.** A botanical plate: nine
  seedlings in engraved style within a double-rule plate frame, leader
  lines running to mono measurements in the margin.
- **Signature interaction.** The loupe: what the pointer rests on
  brightens along its hairlines, as if under a reading glass. Stillness
  is the interaction philosophy; almost nothing moves.
- **Techniques.** SVG pattern hatching; strict grid of margins and
  rules; typography doing all the work.
- **Trade-offs.** Performance and accessibility excellent; maintenance
  simple. The costs are conceptual, and they are decisive: the place
  becomes a *representation of itself* — a book about the chambers
  rather than the chambers — which weakens the central experience
  (entering a world) at the exact rooms that must establish it; the
  star field and the tide are environments, not plates, so the concept
  strands the later rollout; and print formality trends cold, against
  the First Law's warmth.

### Concept C — The Instrument

*Outside references: orreries and scientific instruments; vernier scales;
stage lighting design; architectural minimalism; Dieter Rams' quieter
objects.*

- **Central idea.** The site as a precision instrument the visitor
  operates: rooms are apertures, journeys are readings, and the Method
  — measurement itself — becomes the visible aesthetic.
- **Palette / type / imagery.** Near-total black, one brass, one
  moonlight; monumental numerals; vernier tick scales along the frame
  edges; mono as the primary reading face, serif rationed to artifacts.
- **Threshold.** An aperture: a full-height vertical slit of light (the
  Ajar Door made architectural), the title small and low like an
  instrument maker's plate, the ring map redrawn as a dial. **Garden.**
  A growth instrument: the seedlings along a ruled baseline with
  vernier ticks, heights annotated as reckoned numbers, the pointer a
  raking light the plants answer.
- **Signature interaction.** Operation: the visitor tunes and reads;
  feedback is numeric and immediate; the interface feels machined.
- **Techniques.** Edge scales in SVG; numeric live regions; pointer
  lighting via registered `@property` gradients.
- **Trade-offs.** Distinctiveness is real, and measurement-as-texture is
  genuinely the site's own subject. But the philosophy is operation,
  and this site's thesis is compassion, not precision: the Instrument
  optimizes for the cleverness the First Law subordinates ("when craft
  choices conflict — clever vs. meaningful — meaning wins"), it trends
  toward the dashboard the plan forbids, and its cold would have to be
  fought in every subsequent room.

### Technique accounting (per the Creative Technology Directive)

The directive's selection law was applied per concept: start from the
experience, take the simplest approach that reaches the quality, price
every technique in performance and maintenance. Libraries and WebGL are
outside this site's menu by CANON §IX/§X (the Nebula's WebGPU chain is
already resident and untouched by all three concepts).

| Concept | Advanced techniques it would use | Performance cost | Maintenance cost |
|---|---|---|---|
| **A. Conservatory** | Design tokens; layered CSS compositing (gradients, blend-free); custom inline SVG (frame, seedlings) with stroke geometry; existing View Transitions + scroll-driven animations (already resident); container queries on the Threshold composition (new, see §3); CSS keyframe sway on transform only; one fresh `mulberry32` read for the bed | Negligible: zero new requests, zero new rAF loops, animations on `transform`/`opacity` only, SVG ≈ 4 KB inline | Low: tokens centralize change; the bed is one function + one SVG block; container queries degrade to the complete narrow composition |
| **B. Cartographer's Plate** | SVG pattern hatching; strict margin grid; `font-variant` small-caps compositions; the loupe via `@property` gradient stops (resident technique); stroke-draw animation on the engraved door vignette (`stroke-dasharray` draw-in on arrival); scroll-driven page-turn parallax between plates | Negligible | Medium: every future room must be *drawn as a plate* — an ongoing illustration burden per chamber, and the concept fights the resident canvas scenes (Wishfield, Tide) rather than housing them |
| **C. The Instrument** | `@property`-registered pointer lighting; live numeric regions; SVG vernier scales; kinetic numerals (tabular mono, transitioned values); a Canvas orrery driving the Threshold dial from the Master Code itself (procedural, reckoned); View Transitions between apertures | Low-moderate: pointer-tracked gradient repaints on the Threshold; numeric transitions on the main thread; one more canvas loop to gate by chamber | High: an instrument must stay *calibrated* — every mechanic in every room would need a measured readout register, and the register trends dashboard; highest concept-drift risk of the three |

**Governing reads, reconciled before lock (2026-10-15).** Per the
user's order the aesthetics lane is the fleet's design authority, and
this document was checked against its books before the build locked:
FINDINGS (2026-10-14), the 9th's scorecard, FINDINGS §5.10 ("Provoke
the axis"), Blacklist v4 (index at `research_notes/aesthetics/
BLACKLIST.md`, entries in ROUND-001/002/003/005/033), and the parent
steer for the lane. Where the books and this document differ, the
differences are named, not smoothed over:

- The scorecard's first tell — *centered symmetry as default* — and
  §5.10's remedy — *exactly one asymmetry on screen one* — are the
  same diagnosis this phase answers. §5.10 was the smallest charge,
  written before the user adopted the upgrade plan (2026-10-15, the
  later and larger order); the plan's Threshold direction governs, and
  it answers the tell in full: the axis is broken as one composed act
  (title left, frame right, map at the foot, fragment low), not as a
  scatter of provocations.
- §5.10's second remedy — the glyph bar at door-weight contrast —
  already stands in the tree (rotation 23's door-weight work: full-ink
  glyphs on their own slabs, verified in this phase's captures). This
  phase's only dock change is colour consistency: the bar's blue-black
  rgba(7,8,15) values follow the ground token to ink-green.
- §5.10's "tokens unchanged" held for its own charge's scope; the
  adopted plan explicitly directs the Conservatory palette, and the
  plan governs. What §5.10 protected — Didot-class display, Iowan
  serif text, gold — all stand unchanged.
- The scorecard's third tell — the drifting dot field reading as
  wallpaper — is answered structurally: the field now drifts *through*
  the doorframe, against a horizon and a standing light. Law made
  visible by architecture, not by more dots (§5.10's refused B).
- Blacklist v4, checked by entry at landing (record carries the list):
  the build's closest call is C5 (texture as garnish) — the ink grain
  is scoped to the two rebuilt rooms as their material, argued in the
  landing record by name.

**The technology menu, as applied here (the user's menu,
2026-10-15, both parts).** The six families, reached by hand under
the dependency-free canon: generative graphics — the Master Code
itself, extended by the bed's reckoning; SVG and kinetic typography —
the doorframe, the nine seedlings, the title's settle; advanced
motion — native CSS scroll-driven animation (the menu's part 2 names
it the default first reach); data made visible — the bed's reckoned
measures. Part 2's native set is this site's standing power set and
this phase leans on it by name: View Transitions (resident, waves
1–10), CSS scroll-driven animations, container queries, WebGPU
(resident in the Wishfield Nebula, untouched), IntersectionObserver
(the resident fallback half of the scroll techniques). Refused for
this site, with reasons in §2's table: real 3D and GLSL-via-library —
the rooms' depth is layered planes, and a shader stage would stand a
second rendering system beside the durability core (the same ground
on which wave 10 refused the raymarched volume, recorded in the
WAVELOG). **One question is carried to the user's verdict, not
decided here:** Concept C's strongest form (below) wants a
shader-driven instrument dial — GLSL, most readily via a library the
canon forbids. Phase 1 does not build C and does not break canon; if
the user ever wants the Instrument explored, that is the decision
only he can make.

**Ambition pass (user's correction, 2026-10-15: fancy techniques are
wanted, not tolerated).** Concept A's technique set is pushed to the
top of the dependency-free menu, and the choice below is made on
compellingness, not safety: **scroll-driven scenes** (the doorframe
sinks and dims a breath as the visitor scrolls past it; the Specimen
Bed grows in, staggered, as it enters — both on `animation-timeline`,
both degrading to the standing composition); **SVG filter work** (an
ink-grain `feTurbulence` laid over both rooms at whisper opacity so the
dark has a material; a `feGaussianBlur` halo for the frame's distant
light); **kinetic type** (the title settles on arrival — a slow rise
with its letterspacing closing from wide to set, one deep moment, real
HTML text throughout); **procedural visuals** (the bed's arrangement is
the Master Code's own output, not decoration near it); **layered
depth** (sky, authored field, frame, content — four planes at four
scroll rates). Costs, priced honestly: the grain filter is a static
paint (filtered once, no per-frame work); scroll-driven animations run
on the compositor; the title's letterspacing settle is a one-time
1.6s arrival cost, measured in the prototype pass; the bed is ≈4 KB of
inline SVG and 35 draws of an existing wheel. The performance and
fallback bars stand — they are craftsmanship, not caution.

**The riskiest visual idea (prototype first, per the directive):**
Concept A's Threshold — a title breaking axis against a tall doorframe
while the ring map overlaps the frame's foot. At 320px that composition
can jumble: three elements competing for one narrow column. It is
prototyped in the real environment (headless Chromium, the fleet's own
build) at 320/390/1440 before the Garden is touched, with a DOM overflow
audit and CDP performance metrics (task duration, layout count, style
recalculation, heap) recorded against the pre-build baseline. Performance
is reported from those measurements in the landing record, not claimed.

### The choice: Concept A, the Midnight Conservatory

A is the only concept whose philosophy *is* the site's purpose — and,
with the ambition pass above, it is also the most compelling of the
three, not the safest. The central experience is entering a place that
is dark and alive and glad you came; a conservatory is precisely a
dark-adjacent place built to keep living things through the night,
tended, methodical, warm at the edges. B demotes the place to its own
record; C demotes it to its own measurement. A also *contains* the other two concepts' honest assets
without their philosophies: the archival mono and specimen tags are the
Cartographer's hand at 20%, and measurement appears as texture in the
bed's tags — both subordinated to the living room. A keeps every
existing mechanic legible (phase sky, Kept Light, Dayseed, ring map),
extends the site's own glyph hand instead of importing a foreign one,
and gives the remaining seven rooms a world to be staged in when the
verdict allows: the Scale Room as the observatory's measuring hall, the
Constellation as the dome opened, the Letter Room as the keeper's desk.

## 3. The design system (tokens)

Implemented as the `:root` token layer in `assets/css/main.css`. Values
reconcile the plan's palette with the site's existing identity: the gold
is not replaced (it is already the site's brass, within a breath of the
plan's antique brass), the ink is already a warm parchment; what changes
is the ground — blue-black becomes ink-green — and a mono register is
admitted.

| Token | Value | Role |
|---|---|---|
| `--abyss` | `#0B0F0C` | page ground, near-black ink green |
| `--forest` | `#19251C` | deep ground layers, the Garden's room |
| `--panel` | `#101711` | kept surfaces (was blue-black `#0d0f1a`) |
| `--ink` | `#E8E0CE` | warm parchment, primary text |
| `--ink-dim` | `#A79C85` | faded paper register, secondary text |
| `--gold` | `#C9A86A` | the site's brass (unchanged) |
| `--gold-soft` | `rgba(201,168,106,.55)` | hairlines of brass (unchanged) |
| `--moss` | `#66745A` | living green, seedlings, kept strokes |
| `--moss-hi` | `#93A37E` | the seedlings' lit edge |
| `--moonlight` | `#A9B4B1` | desaturated cool accent, the distant light |
| `--line` | `rgba(232,224,206,.14)` | hairlines on the new ink |
| `--serif` | Iowan Old Style, Palatino, Georgia | reading face |
| `--display` | Didot, Bodoni MT, Iowan, Palatino | literary face |
| `--mono` | ui-monospace, SF Mono, Menlo, Consolas | archival face (new) |
| `--step-*` | clamp() scale | fluid type steps |
| `--space-*` | rem scale | spacing |
| `--dur-*`, `--ease` | .35s/.8s, ease | motion tokens |
| `--z-*` | 40/90 | layering (head, veil) |

Type scale (fluid, clamp): `--step-0` body 1rem; `--step-1` 1.25rem;
`--step-2` 1.6rem; `--step-3` 2.2rem; `--step-4` 3.2rem; `--step-5`
4.4rem (the title's ceiling, reached only on the Threshold).

**Frontier techniques taken up this phase, with their fallbacks (CANON
§X discipline).** (1) *Container queries* on the Threshold composition —
the frame-and-title arrangement answers the chamber's own width, not the
viewport's; fallback: the base (narrow) composition, which is complete.
(2) *Scroll-driven animation* for the Garden bed's entrance (a slow rise
as the bed enters, `animation-timeline: view()` in the house's existing
pattern); fallback: the IntersectionObserver-free static bed — the bed
simply stands, as it does without script. Everything else this phase is
deliberately older than the house: tokens, SVG, gradients, keyframes.

## 4. Phase 1 room specifications

**The Threshold.** The phase sky retones to forest/moonlight at night
(dawn and dusk keep their hours, deepened toward green). The chamber
becomes a composition: the doorframe (an inline SVG of double hairline
arches in brass, with the distant light — one moonlight point on a low
horizon line inside the frame) stands center; the title block breaks
axis, set left against the frame's left upright, the welcome beneath it;
the ring map stands smaller, low right, overlapping the frame's foot;
the fragment closes at lower left. Tick marks (pure geometry, no words)
run down the frame's left upright — the Cartographer's Archive at its
20%. The Kept Light, the midnight minute, the greeting's memory, and
the ajar door are untouched in behavior.

**The Garden.** The canvas and every behavior of the Dayseed stand
exactly as they were (not one line of its reckoning reordered). The room
around it changes: layered grounds (a moonlight fall from the top, the
forest gradient, glass-rib hairlines), the frame squared to a brass
hairline, and beneath it the Specimen Bed (§2, Concept A): nine SVG
seedlings, each a distinct silhouette in one stroke hand — the Unfolding,
the Fern, the Bulb, the Twin, the Reed, the Fan, the Spiral, the
Lantern, the First Leaf — standing in a soil band, each tagged in the
archival mono with its number and its reckoned measure. The bed stands
whole in the static page (canonical order, nominal measures); script
re-reckons it from the Dayseed wheel: order along the bed, height, lean,
and measure, all from one fresh `mulberry32(daySeed())` read. Sway is
CSS, staggered, and dies under the calm mode and the still study mode.

**What Phase 1 does not touch.** The other seven chambers' compositions
(they inherit the token layer only); any data file; any seed formula;
the glyph paths; the artifacts' words. Em-dash law: no presented copy is
added this phase at all — the bed's tags are numbers and the № sign —
so the sweep is trivially clean.

## 5. Determinism note

The bed's read is a *new consumer* of the wheel, not a change to any
existing one: it opens its own `mulberry32(daySeed())` — the Dayseed
formula, seed = D — and draws only for itself. Every pre-existing stream
(the Garden's flowers, the Sealed Draw, the Leaves, the Wishfield, the
Nebula, pointer growth, the Kept Shape) consumes exactly as before. The
proof harness compares the full reckoned surface at fixed inputs
(D = 20261013, V = 1, the canon's own worked example, plus a second date)
before and after this build: identical output, or the build does not
ship. The harness and its output are cited in the landing record.

## 6. Phase 2 addendum: the Massive Rework, the Deep (2026-10-15)

The user's verdict on Phase 1 ("it looks really similar to how it did before") rejected the staged, two-room approach and ordered a massive rework of the whole site with the full Creative Technology Menu on the table. That order lifts the dependency-free technique constraint the upgrade plan carried; it is recorded here so the supersession is explicit. The deeper canon was not lifted and is not touched: zero external requests (every technique below is hand-written platform code, no library, no font, no CDN), the Text Ration, the Master Code, and CANON §X's degrade-to-meaning test for every layer.

**The chosen concept: the Deep.** Of the three concepts explored (the Deep; the Great Plate, a single pannable SVG map; the Instrument, an orrery-machine, refused on CANON §V fact 1: C. found the doors already standing), the Deep rebuilds the place as one submerged world. A single hand-written WebGL field (`assets/js/deep.js`, raw WebGL1, one fragment shader, ~17 KB) stands fixed behind all nine chambers; each chamber is a stratum of it with its own physics: fog and a door of light (Threshold), a descended depth of stars down a log-ring well (Scale), dark soil and rising spores (Garden), GLSL nebula over the frame's own sky (Constellation), lamplight and ember dust (Letters), caustic water whose moon-glitter path is scaled by the Synodic Reckoning's true illumination (Tide), velvet with a breathing 9x9 grid (Cabinet), the field folded on its own axis (Mirror), and a darkness whose horizon rises with the count of doors opened and warms when the Door opens (the Ninth). Chamber changes are dives: the driver watches the chambers' own active class and cross-dissolves the strata through an fbm mask over 1.15 s. The shader's noise is physics, not content; every input that carries meaning is the Reckoning's (Dayseed tint, moon illumination, day phase, doors opened, the visitor's scroll in the Scale).

**Composition.** The centred column and the bottom bar are abolished as the desktop grammar. The ring becomes a vertical spine of door-buttons at the left edge (the phone keeps the bottom bar and its 44 px targets; the sound toggle moves to the top right). Each chamber's name stands inside it once, monumental in the display serif (clamp(84px, 15vw, 210px)), cropped by the viewport edge, its letters settling one by one on entry; where a chamber's own scene fills a frame, the word stands over the scene. Staging is per chamber and off-axis throughout: the Scale staggers down a stair of ghost numerals; the Letters' drawn letter stands as a lamplit sheet with the sealed nine as its index rail; the Cabinet's case leans in offset pairs; the Garden's Specimen Bed steps over the field's hem; the Ninth's ring grows to min(56vmin, 540px) and the sunrise widens. `assets/js/main.js` is byte-untouched: the Deep observes the DOM the canon code already maintains, so every reckoned behaviour is identical by construction.

**Fallback chain (each stage whole, per §X).** (1) WebGL, as above. (2) The strata as designed CSS grounds: every chamber section carries a layered-gradient ground in its stratum's world; where the Deep cannot initialise (verified with WebGL disabled: the canvas removes itself, `deep-on` is never added) the chambers stand on those grounds. (3) No script: the place as Phase 1 left it. Calm mode (prefers-reduced-motion or `?still`) renders exactly one settled frame per chamber entry and holds it. An adaptive governor lowers the field's resolution in steps when frames run slow, and restores it when they recover; the fields are throttled to a ~30 fps breathing rate and capped at ~1.05 M backing pixels.

**Measured (this machine, software renderer, fleet at full load: indicative, not lab figures).** Total first-load weight 159,975 B (HTML 40,790 + CSS 44,992 + JS 74,193), zero external requests. Document overflow 0 px at 1440, 390 and 320 in all nine chambers, before and after; console errors 0 across all capture runs. Determinism smoke (two independent fixed-clock loads): drawn letter identical (`future-self`), door count identical (`1 / 8` after the letters visit). Live click-through (ring buttons, animated mode): all chambers reached, zero page errors; flip latencies under this box's load matched the unmodified fa51c95 base run with the same harness (the first, garden, transition is the slowest on both), so no interaction regression is attributable to the Deep. First paint on the contended box measured 3.5 s (desktop) / 6.5 s (phone) to first contentful paint with the veil lifting by its own CSS regardless; these numbers are the box's, recorded because they were measured, and are expected to be far lower on any unloaded machine. Prototype strata under SwiftShader reached 31-36 fps at phone scale in the lightest fields; the heavy fields' hardware-GPU rate could not be measured here and is not claimed (residue, in the landing record).

## 7. Next-pass addendum: the Threshold, recomposed (2026-10-15)

**The charge.** The completeness audit's one unarranged room: Phase 2 rehoused every chamber except the Threshold, whose furniture still descended from §4's Phase 1 grid (title column left, frame right, fragment closing the column, the map at the frame's foot), and whose narrow tier collapsed back to the site's first arrangement, the centred stack. This pass rearranges the furniture and nothing else.

**The composition (the narrow tier specified first, and judged first).** The doorframe takes the centre as the room's architecture. The title stands inside its arch, in the door of light; the glyph leaves the title stack (the ring itself carries it, first door). The welcome stands inside the frame, in the doorway above the horizon line. The ring map becomes the frame's sill, centred on the step, straddling it. The Cartographer's fragment takes the right margin: at the wide tiers it stands in the margin itself, at the frame's lower third; on the narrow tier it closes the room at the right margin in flow, read last. The wide tiers only enlarge the frame (height-led: min(62vh, 640px), then min(76vh, 800px)) and lift the fragment into the margin. DOM order and every word are unchanged; the composition is one appended CSS section over §4/§6's history, and stripping it returns the room to its Phase 2 arrangement, whole.

**The forced change, named.** The Deep's door of light stood at a fixed point of the screen (uv 0.685 across, 0.155 up), true only while the frame stood at the grid's right. With the frame centred, the driver now measures the doorframe's own rectangle and stands the light on its horizon (canon §X, next-pass addendum). The same pass's visit-deepening uniform (the strata deepen with the recorded visit count) is registered in the same addendum. Phase 2's `.threshold-stage.doorframe` rule, which set the frame's height in §6's account, named no element that exists (the class was never in the page); the frame's height came from §4's container tier. This addendum's tiers are the height's source now, and the dead rule is named here so the record agrees with the tree.

**Errata pointer.** §6's measured-weight line carries the Phase 2 record's figures (159,975 B; CSS 44,992 B; JS 74,193 B). The true figures stand in the errata appended to the Phase 2 landing record (159,963 B; CSS 44,986 B; JS 74,187 B) and in WAVELOG's audit entry; §6 stands as written, corrected by reference.

**Measured (this machine, as ever).** Overflow 0 px in all nine chambers at 1440/390/320 after the recomposition; console errors 0. Captures: `~/workspace/progress-archive/the-9th-website/2026-10-15-next-pass/` (`before/`, `after/`, side-by-side composites, the Letters frames with the shelf's new letters standing, and the Garden frames behind the visit-deepening proof).
