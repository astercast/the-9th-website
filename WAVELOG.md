# WAVELOG — The 9th Website

Museum records, one per wave: what was made, why, what it means in the canon, what was verified. Numbers, not adjectives. This log is also the site's entry in the fleet's wave-1000 progress archive (screenshots in `~/workspace/progress-archive/the-9th-website/`).

---

## Wave 1 — The Founding (2026-10-13)

**What was made.** The whole ring, standing: nine chambers in one self-contained document (no build step, no dependencies, no external requests), the glyph system and its grammar, the Cartographer and six planted fragments, the Seed Reckoning (the master code), the Rosetta in the Coda Below, the Codex (`codex.txt`, all of the site's writing in plain text), and `CANON.md` itself — the First Law, the thesis of compassion-as-defiance, the Nine Rules, the glyph grammar, the calendar of time-locks, the artifacts register, the rituals and depths of return, the frontier dialectic.

**Chamber by chamber, honestly, v1 depth vs. intent:**

- **I Threshold** — time-of-day sky in four phases (dawn/day/dusk/night palettes), the Kept Light following the visitor's hand (registered `@property` custom properties), the ring map with doors that light as visited and the Ajar Door drawn small at the bottom (artifact #3). Visit-count greetings at 1 / 2 / 9 / 27 visits. The Midnight Minute line.
- **II Scale Room** — 16 stops, grain of sand to the observable universe, each one true fact stated plainly. Scroll-driven reveals. **The Coda Below** hidden past the last stop (sub-chamber; undocumented in the UI), holding the seventh Cartographer fragment *and the Rosetta*.
- **III Garden** — the Dayseed garden on canvas: sway, seeded blooms, exactly one Black Bloom (never the largest), pointer-grown flowers (reckoned, per the master code), a white flower that exists only for visitors who reached the Constellation first. The Ninth Bloom on the 9th of the month. Garden whispers: the Scattered Leaves, 3 of 28 authored pieces per visit.
- **IV Constellation** — the Wishfield: 40 authored wishes as twinkling stars (positions and twinkle from the Reckoning), hover/tap reads the wish; the Wrong Star (artifact #2, pale green, no wish, "This one is not a wish."); the Moonkeeper's Star when illumination ≥ 92%. The full collection also written out in HTML beneath, honestly labelled.
- **V Letter Room** — 9 letters, fully typeset. The Sealed Draw: one letter drawn per visit by the Reckoning (seed includes visit count), the rest sealed by first lines. The teacher's letter carries the Cartographer's margin note. The Returning Postscript appears only from the second visit.
- **VI Tide Room** — the Synodic Reckoning computed live (tonight: phase name + illumination %), moon disc with correct shadow side for waxing/waning, the Long Breath canvas (~10 s cycle). The room's job is slowness; it does it.
- **VII Cabinet** — the Ulam Ghosts (prime spiral, computed), the Golden Study (SVG), the Deepening (fractal, click to deepen 6→9), the Agreement (Lissajous 3:2, animated), the Box (artifact #1; clicking it does nothing, which is the exhibit), the third-drawer scratch fragment, one oracle slip per opening (9 authored slips), the pressed flower for Constellation-first visitors.
- **VIII Mirror** — the Ghost Ledger: this visit's path drawn as a line constellation over the ring's geometry, ghost paths of up to 3 previous visits beneath it (localStorage), the visitor's own pointer trail drawn as faint stars while in the room, the path also written out as a sentence.
- **IX Ninth Door** — closed while the ring is incomplete, with a glyph ring lighting 0–8 as chambers are visited and an honest count. Open: the Sunrise Restraint (one slow sunrise, 14 s) and the passage, written for this door alone. **The Final Line** appears only when all nine glyphs have been encountered — the ninth is the Cartographer's Mark, found only in the Coda Below.

**Counts, wave 1:** 9 chambers · 10 glyphs drawn (nine + the Unnumbered Mark) · 40 wishes + 1 moon-kept wish · 9 letters · 16 scale facts · 6 Cartographer fragments + the Rosetta + the third-drawer scratch · 28 whisper pieces · 9 oracle slips · 3 artifacts · 4 time-locks live (Moonkeeper's Star, Ninth Bloom, Midnight Minute, Returning Postscript) · 2 visit rites live (the Return, the Ninth Visit) · 1 master code (the Seed Reckoning; unseeded randomness: none, content-bearing).

**Frontier set shipped (each with its fallback, per CANON §X):** same-document View Transitions → instant change · CSS scroll-driven animations (`animation-timeline: view()`) → IntersectionObserver reveals · `@property` registered properties → static gradient · Speculation Rules prefetch → fetch on entry · Canvas 2D scenes → written fallbacks already in the HTML · WebAudio generated pad (four sine partials, off by default, explicit toggle) → silence.

**Verification (wave 1):** `node --check` on the one script; all five JSON files parse; `api/health.js` executed under Node and answered `{status:"ok", chambers:9, wishes:40, letters:9, scaleStops:16}`; served locally (ThreadingHTTPServer) — index 200, data 200; screenshots desktop 1440px and mobile 390px of the Threshold plus Garden, Constellation, Letters, Ninth Door, reviewed by eye (see the archive). Known harness artifact: headless-shell captures were taken with the site's `?still` study mode, which freezes entry animations so captures show the settled state; scroll-driven pages plus `--virtual-time-budget` are known to hang in this harness, so it was not used. Copy passed an AI-ism grep (no banned phrases). Working track only; no `-live` repo exists; nothing deployed; no Vercel contact.

**What wave 1 deliberately is not:** no WebGPU yet, no second Rosetta, Depths 27/81 are canon-seeded but unbuilt, the September 9 event is calendared in the canon but unbuilt, the Winter Notes fragments are unwritten. See the roadmap.

---

## The Deepening Roadmap

In rough order; the canon outranks this list.

1. **WebGPU frontier trial** (wave 2 candidate): one scene — the Garden's light, or a Wishfield nebula — in WebGPU where supported, behind the degrade-to-meaning test (Canvas 2D beneath, written fallback beneath that). Name its fallback in the wave's record or it does not ship.
2. **Depth 27 — the Winter Notes:** a second Cartographer fragment set (six fragments, colder months of his charting), findable only from the 27th visit; the Garden keeps one plant-shape derived from the visitor's earliest recorded path.
3. **Depth 81 — the Second Coda:** a room below the Coda Below, reachable only from the Mirror, opening when the ghost paths complete a figure; contains the Cartographer's last fragment — the only question he ever asked outright.
4. **September 9 — the Ninth Day:** per canon §VI (nine golden flowers; the Moonkeeper's Star regardless of phase). Build before the date; verify against a mocked clock.
5. **Glyph grammar, second movement:** the *inverted* (remembered) and *joined* (in conversation) positions are reserved in the grammar and unused. Introduce one per wave at most, recorded in the canon first.
6. **The second Rosetta:** the Mirror is the reserved location (canon, Master Code). A plain-language restatement of the Reckoning, in the Cartographer's voice, findable in the ghost paths.
7. **Scattered Leaves, new locales:** Letter Room marginalia that rearranges between visits; fallen words beneath the Wishfield (words, not wishes, that drift). Each locale ships only with ≥27 authored pieces.
8. **Sound, deepened:** the ambient pad gains a tide mode (its chord follows the moon's illumination) — generated tones only, still off by default.
9. **The long letters:** two more letters per wave until the room holds 27; every new letter must pass the First Law test and carry no topical reference.
10. **Preservation beat:** annual re-verification that `codex.txt` matches the site word for word, the health function counts still match, and the Seed Reckoning's worked example in the canon still reproduces the site's output for a fixed test input (D = 20261013, V = 1).

## The Test Bed — first candidates (from wave 1's own set)

The 9th site is the fleet's technique test bed: research feeds new techniques here first; what proves worthwhile graduates to the other eight sites. Wave 1's techniques, assessed as candidates:

1. **Same-document View Transitions** — *first candidate for graduation.* Support: Chromium full; Safari 18+ partial; Firefox behind flag at writing. Why: zero-dependency, degrades to instant change with zero loss, and every fleet site is a multi-view static app that would feel materially better with it. Risk: low.
2. **CSS scroll-driven animations** — *candidate, watch.* Support: Chromium full; Safari 26 shipping; Firefox in development. Why: removes JS scroll handlers fleet-wide (Film's Watchtower and Trend's Live Wire are scroll-heavy). Fallback pattern proven here (IntersectionObserver) is already the fleet-safe half.
3. **`@property` registered custom properties** — *candidate.* Support: Chromium + Safari; Firefox recent. Why: animatable gradients/glows with no JS; pure enhancement, trivially safe fallback.
4. **Speculation Rules prefetch** — *candidate for data-heavy fleet sites.* Support: Chromium. Why: the fleet's sites all fetch same-origin JSON on view changes; prefetch is a one-tag win where supported, inert elsewhere.
5. **Seeded deterministic generation (the Seed Reckoning pattern)** — *candidate as a discipline, not an API:* any fleet feature that varies by day (Trend's dailies, the Vault's rotation) can be made reproducible and testable the same way.
6. **WebGPU** — *not yet a candidate.* Held at the test bed until a wave proves a scene that degrades gracefully; the fleet's other sites should not carry it first.
