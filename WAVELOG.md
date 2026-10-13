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

## Wave 2 — The Text Ration (2026-10-13)

**The order.** After seeing wave 1, the owner: *"Much less text. It needs to be very mysterious and push boundaries."* This wave is a ration and radicalization pass, not a content wave. No chamber gained a word of content; several gained whole screens of silence.

**The Text Ration, recorded as law.** CANON gains **§XII, Amendment — The Text Ration**: no explanation survives (no instructions, introductions, or labels explaining a mechanic); navigation is glyph and symbol only; presence replaces text (symbol, light, number, scale, silence); artifacts are exempt and whole; the Codex keeps the complete written record, and the gap between what the site shows and what the Codex remembers is part of the mystery, permanently. `codex.txt` is unchanged in substance and gains only a dated addendum saying so — the site rations, the Codex remembers.

**The counts.** Visible words counted at arrival — script on, first visit, sealed things sealed, closed collections closed, the ring incomplete — by one counter run identically on both waves' HTML (whitespace tokens in each chamber section, hidden subtrees excluded; the Letter Room counted with one drawn letter, the stranger's, as the deterministic stand-in):

| Chamber | Wave 1 | Wave 2 | What remains |
|---|---|---|---|
| I Threshold | 50 | 38 | the name, one greeting line, one fragment |
| II Scale Room | 695 | 370 | sizes and names only — plus, far below, the Coda and the Rosetta, whole |
| III Garden | 116 | 59 | one whisper (3 leaves), one fragment |
| IV Constellation | 42 | 1 | one symbol (✦); wishes speak only when rested on |
| V Letter Room | 215 | 176 | the artifacts: nine first lines, one letter drawn whole |
| VI Tide Room | 59 | 54 | the moon as a datum (`name · %`), one sentence, one fragment |
| VII Cabinet | 236 | 51 | five bare names, the drawer fragment, one oracle slip |
| VIII Mirror | 39 | 0 | nothing; the path readout is numerals (`1 → 4 → 8`) |
| IX Ninth Door | 19 | 3 | numerals only (`0 / 8`); the passage waits whole behind the ring |
| **Total** | **1,471** | **752** | **−49%** |

DOM totals (all text in the document, sealed or not): 3,033 → 2,244. Head chrome: the sound control's two words became one symbol (♪). The surviving 752 are overwhelmingly artifact — letters, wishes' housing, the Coda, the Rosetta, fragments. The site's own explanatory voice is now zero in every chamber: every lede, caption, instruction, "onward" and "enter" button, heading, and the Letter Room's drawn-for-you note were cut. Prose the site still needs lives in `codex.txt` (3,695 words, complete).

**Radicalization, chamber by chamber.** Threshold: a single screen — glyph, name, one line, the ring, one fragment — nothing below the fold, the fragment no longer clipped by the glyph bar. Scale Room: the Powers Stair is now a *descent* — stops carry size and name only, set in growing type (22px → 60px) across growing silence (30px → 110px of padding) so scale is felt in the body, not described; the facts live in the Codex. Garden, Constellation, Tide, Mirror: canvases broke out of the 760px column to full-bleed (100vw); the Garden's first screen is flowers and dark, no words at all; the Tide and Mirror canvases are height-capped (62vh) so their readout lines stay on the same screen. Cabinet: exhibits stand with bare names, the Deepening's state is a numeral, its button a symbol (＋). Ninth Door: the ring grew (430px) and stands alone in a full screen over a bare count. Navigation is the glyph ring and nothing else — all "onward"/"enter" chrome is gone.

**VP-0005 — the first paint.** The black-veil risk is answered in the head itself: an inline `<style>` and an inline SVG — a gold ring of eight seats and a centre point, the ninth seat empty — breathe at the centre of the abyss field from the first frame, before any stylesheet or script can arrive. The script lifts the veil once the place is standing; if every script stalls, the veil lifts *itself* (pure CSS, gone by ~3s; under reduced motion, by 0.4s) and the complete HTML waits beneath. Chambers no longer fade in from black (`chamberIn` now settles from full opacity). The Cartographer's sentence (the ticket's second snag) is answered by the ration itself plus a brighter fragment colour (`#cdc4ae`): on desktop and mobile captures the fragment now sits fully above the glyph bar. Study mode `?veil` holds the first paint on screen. Verified by capture: `screenshots/veil-desktop.png`.

**Placement (head-meta only, invisible).** The wordless glyph-ring OG card (Foundry round 3, gate PASS) placed at `assets/og-card.png` (md5 `6f80b12e…`, byte-identical to the packet source) and wired with the packet's exact relative `og:`/`twitter:` block — description unchanged ("Nine chambers in a ring."). Icon per the icon-theme proposal, with its canon guard: the mark is the **ring and the point only** — the existing inline geometry extended to `favicon.svg`, `favicon.ico` (16/32/48), `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (abyss field) — it deliberately does **not** use the ninth glyph; what is hidden in-world stays hidden. `theme-color` = `#07080f` (`--abyss` verbatim). `robots.txt`: minimal allow-all, functional only. `404.html` gets no card or icon, per the packet's exclusion; its return link is now a bare arrow.

**QA-005 — `GO_LIVE.md` authored.** The deploy document now exists: what deploys (plain files, listed), the canon's durability constraints restated as deploy-time checks (zero dependencies, zero build step, static data in `data/v1/` never `api/`, no pinned `runtime`, Standard build machine, Codex currency, LF endings), the step-by-step deploy, rollback (redeploy the previous commit; nothing server-side exists to unwind), and the **deploy-time absolutizing step**: `og:image`/`twitter:image` ship relative because no domain exists; at go-live they become `https://<domain>/assets/og-card.png` in exactly one commit, verified by card preview. `LIVE_CHECKLIST.md` and `README.md` point at it.

**Frontier set, wave 2 (each with its fallback, per CANON §X).** First-paint breathing-ring veil — inline critical CSS/SVG → the veil's own CSS self-lift, then the complete static HTML beneath · full-bleed breakout scenes (`100vw` frames) → the same canvases at column width; canvas fallbacks beneath · the Descent (CSS type-and-silence ramp on the Powers Stair) → uniform stops with the wave-1 IntersectionObserver reveals · symbol-only chrome (♪ / ✦ / ＋, numerals) → every control keeps its full name in `aria-label`; no-JS visitors lose nothing but the symbols' styling. Wave 1's set is retained unchanged (View Transitions → instant change · scroll-driven reveals → IntersectionObserver · `@property` Kept Light → static gradient · Speculation Rules → fetch on entry · Canvas 2D → written fallbacks · WebAudio pad → silence).

**WebGPU — deferred to wave 3, deliberately.** The named trial stands: a **Wishfield Nebula** (WebGPU compute particle field beneath the Wishfield's stars), fallback Canvas 2D Wishfield, written fallback beneath that. It was not trialled this wave: the ration is this wave's whole argument, every chamber already reaches full meaning on Canvas 2D, and a GPU scene added now would decorate rather than mean (First Law, test 1). Subordinate means subordinate: it ships in wave 3 only if it passes the degrade-to-meaning test there, or it does not ship.

**Seed Reckoning discipline.** Untouched and re-verified: no new chance was introduced (the veil is drawn geometry; the icons are drawn geometry); all content-bearing variation still derives from the one master code and its recorded inputs; `Math.random` appears nowhere. The artifacts register is unchanged — exactly three unresolved (the Box, the Wrong Star, the Ajar Door), all present in captures, none explained.

**Line endings (Rule 1762).** Audit: no CRLF anywhere in the repo's text files before this wave. `.gitattributes` added — `* text eol=lf`, with `*.png`/`*.ico`/`*.jpg` marked binary — plain-text preservation technology, canon-compatible: a scholar's checkout in any era gets the same bytes.

**Verification (wave 2).** Identical word counter run on wave-1 and wave-2 HTML (table above). `node --check` passes; all four JSON files parse; `api/health.js` answers `{status:"ok", chambers:9, wishes:40, letters:9, scaleStops:16}` (counts unchanged — the collections are whole). Served locally (ThreadingHTTPServer): index, codex, OG card, robots, favicon all 200. DOM dump confirms the Sealed Draw (exactly 1 drawn, 8 sealed) and the Door's numeral count. **Screenshots** (headless shell, `?still` study mode; desktop 1440×900 + mobile 390×844) reviewed by eye against wave 1's set: Threshold (wave 1: title, paragraph, caption, button, clipped fragment → wave 2: one line, ring, fragment whole on one screen); Garden (framed canvas + 3 text blocks → full-bleed field, Black Bloom standing, zero words on the first screen); Constellation (lede + framed field → full-bleed field, the Wrong Star's pale green visible, zero words); Letters (lede + explanatory note + drawn letter → sealed first lines only, no chrome); Scale (16 captioned paragraphs → the descent); Ninth Door (ring + explanatory sentence → ring + `0 / 8`). **Degradation test:** with scripts stripped entirely, the veil lifts itself by CSS and the whole place stands in HTML — static greeting, unlit ring, all letters and wishes readable (capture: `screenshots/nojs-true.png`); with reduced motion forced, the Threshold renders identical to the still study capture; with every wave-2 technique removed the chambers keep wave 1's fallbacks, which keep the written fallbacks beneath them. Working track only; no `-live` repo exists; nothing deployed; no Vercel contact.

**Harness note (for the next builder).** On this VM the full Chrome binary (`/opt/meta-chromium/chrome`) currently times out on `--screenshot` even for `robots.txt` (zygote errors, load average >11); the working renderer is the Playwright headless shell at `~/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`, and the server must be threaded — a single-threaded `http.server` deadlocks against Chrome's prefetch connections.

---

## The Deepening Roadmap

In rough order; the canon outranks this list.

1. **WebGPU frontier trial** (deferred at wave 2 — the ration outranked it; the named trial, the Wishfield Nebula, and its fallbacks are recorded in the wave-2 entry; wave 3 candidate): one scene — the Garden's light, or a Wishfield nebula — in WebGPU where supported, behind the degrade-to-meaning test (Canvas 2D beneath, written fallback beneath that). Name its fallback in the wave's record or it does not ship.
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
