# CANON of The 9th Website

The internal bible of the site. Every builder of every future wave works from this document.

**The law of this document:** extend, never contradict. A fact planted here is fixed. If reality forces a change, the old text stays, struck through, with a dated note beneath it — the way museums correct a label without pretending the first label never hung. Scholars study systems that hold together. This one holds together.

---

## The First Law

**The site exists to bring love into the world — permanently, for whoever finds it, whenever they find it.**

1. **Meaning is the function.** Every chamber, fragment, glyph, and system is tested against one question: does this carry real meaning to a human soul, possibly one living centuries from now? Decoration that means nothing is cut, however beautiful.
2. **Timeless subjects only.** The writing speaks to what does not expire: wonder, grief, gratitude, courage, hope, the size of the universe, the fact that strangers wish each other well. No topical references, no era slang, nothing that needs its century explained to it. A reader in any century should feel addressed directly.
3. **Love is the resolution.** Even the dark elements exist inside a work whose every path resolves toward love. The darkness is acknowledged honestly and never given the last word. The Ninth Door passage is the purest statement of this law.
4. **When craft choices conflict** — clever vs. meaningful, mysterious vs. hollow — **meaning wins.** Mystery in this work is a door into meaning, never a substitute for it.

This law stands above the glyph grammar, the master code, and every other rule in this document. Where anything below conflicts with it, this law governs.

---

## The Master Code — The Seed Reckoning

Nothing on this site is random. Everything that *looks* like chance is produced by one deterministic algorithm, so that any arrangement the site has ever shown can be reproduced — by a visitor, by a builder, by a scholar three thousand years from now — from the algorithm and its recorded inputs alone.

**The inputs** (all recorded in the visitor's own browser, in the `ninth.*` localStorage keys, and defined here so they can be reconstructed): the **Dayseed** `D = year×10000 + month×100 + day` (local date), the **visit count** `V`, and the chamber. Each system derives its seed by a fixed formula, recorded with it:

- The Dayseed (Garden): seed = D
- The Wishfield (star positions & twinkle): seed = D×7 + 3
- The Sealed Draw (which letter is drawn): seed = D + V×31
- The Scattered Leaves, Garden (whisper pieces): seed = D×13 + V×7
- The Scattered Leaves, Cabinet (oracle slip): seed = D×17 + V×3
- Pointer-grown flowers in the Garden: seed = D×3 + (number already grown)×101

**The turning** (mulberry32, specified exactly; all arithmetic is unsigned 32-bit, multiplications wrap modulo 2³², `>>` is a logical shift, the result is a fraction in [0, 1)):

```
state = seed                       (a 32-bit unsigned integer)
to draw the next number:
    state = state + 1831565813                 (0x6D2B79F5)
    t = state
    t = (t XOR (t >> 15)) * (t OR 1)
    t = t XOR ( t + ( (t XOR (t >> 7)) * (t OR 61) ) )
    return (t XOR (t >> 14)) / 4294967296
```

A scholar with this page and the inputs above can regenerate any garden, any draw, any whisper, exactly. That is the point.

**The ban:** unseeded randomness (`Math.random` or any equivalent) is forbidden for anything content-bearing — selections, arrangements, positions of meaningful things, texts shown. It is permitted only as decorative physics jitter (a twinkle's shimmer, a wave's foam) that carries no content and would mean nothing if it differed.

**The Rosetta.** The key travels with the work. The code's rules are stated in plain language in-world, in the Cartographer's own voice, at the end of the Coda Below (The Scale Room's hidden room) — a place only a devoted visitor reaches by scrolling past the smallest thing. A scholar who finds this site in three thousand years finds the key inside the lock. The hiding place is decided here, permanently: **the Coda Below**. Future waves may add a second Rosetta (the Mirror is the reserved location); this one is never moved.

**Durability — the millennia rules** (how it is possible at all):

- Zero dependencies, zero build step, zero external assets. No CDNs, no webfonts, no frameworks. Plain HTML, CSS, and JavaScript files that any era's browser can render and any scholar can *read as source*.
- The source is written like literature: clean, commented, no minification, no cleverness that needs a manual.
- **All of the site's writing also lives in one plain-text file, `codex.txt`,** in the repo root and served by the site at `/codex.txt` — linked from nowhere, there to be found. If rendering dies, the words survive as words.
- Data is plain JSON and text only. No format that requires a vendor to decode.



## I. The Thesis (never stated on the pages)

Darkness is real on this site — the ajar door, the one black flower, the wrong-coloured star — and it never wins. Every system bends toward compassion.

The thesis, which no page may ever say outright: **compassion is not softness; it is the refusal to give in.** The site is built for philosophers and for anyone with compassion in their soul who will not give in to the dark. Rigor for the first — systems that reward study. Warmth for the second — nothing on this site is cold. If a choice ever trades warmth for cleverness, **warmth wins.**

The site never explains itself. No about page, no FAQ, no chamber that announces what it is. Questions permanently outnumber answers. A visitor who leaves with one clear answer and three new questions has been served correctly.

## II. The Nine Rules of Nine

1. There are nine chambers, in a ring, in the order given in §III. The ring has no beginning except the Threshold and no end except the Door.
2. Nine is the site's measure: nine glyphs, nine letters, nine seedlings in the still garden, nine ticks on the Door.
3. The Ninth Door opens only to a complete ring — all eight other chambers visited. This is never announced as a rule anywhere on the pages; the door simply counts.
4. Depths of return are powers of three squared: visit **1**, visit **9**, visit **27**, visit **81**. (See §VIII.)
5. Every time-lock is astronomical or calendrical — the moon, the date, the minute. The site keeps real time or none.
6. Nothing is collected from the visitor. Memory lives only in the visitor's own browser (localStorage). The site remembers *that* you came, never *who* you are.
7. The three Artifacts (§VII) are never resolved, explained, opened, or completed. Not in any wave. Not ever.
8. The Cartographer's story is never completed and never summarised. Fragments may accumulate forever; they may not conclude.
9. Where a system could be cold or could be kind, it is kind — and where it could explain or could wonder, it wonders.

## III. The Ring and Its Chambers

In ring order, clockwise from the Threshold. Each chamber carries one real question, posed, never preached:

| # | Chamber | Its question |
|---|---------|--------------|
| I | The Threshold | What do you owe a place you have only just arrived at? |
| II | The Scale Room | What does one human life weigh at cosmic scale? (Answer the room refuses to give: exactly as much as it loves.) |
| III | The Garden | What grows from attention, and what does attention cost the thing attended? |
| IV | The Constellation of Wishes | What do strangers owe each other's hopes? |
| V | The Letter Room | Is gratitude a feeling, or a practice? (The room treats it as a practice.) |
| VI | The Tide Room | How do you sit with impermanence without flinching? |
| VII | The Cabinet | Can wonder be inventoried? (The third drawer answers: no, begin again, slower.) |
| VIII | The Mirror | Who are you, drawn only by the way you came? |
| IX | The Ninth Door | What stands in the dark and does not give in? |

Named mechanics of the chambers (cite these names in WAVELOG and study):

- **The Ring Circuit** — navigation by glyph, a journey rather than a menu.
- **The Kept Light** — the Threshold's light that follows the visitor's hand.
- **The Powers Stair** — the Scale Room's ascent, grain of sand to observable universe.
- **The Coda Below** — the unmarked room below the smallest thing, past the end of the Stair.
- **The Dayseed** — the Garden's daily seed; no two days grow the same garden.
- **The Ninth Bloom** — one golden flower in the Garden, only on the 9th day of a month.
- **The Black Bloom** — exactly one black flower in every Garden, never the largest. Darkness, present and outnumbered.
- **The Wishfield** — the Constellation's twinkling star-per-wish field.
- **The Moonkeeper's Star** — a star in the Wishfield visible only near the full moon.
- **The Wrong Star** — see §VII.
- **The Sealed Draw** — one letter drawn per visit; the rest stay sealed by first line.
- **The Returning Postscript** — a postscript that exists only on a returning visit.
- **The Long Breath** — the Tide Room's slow breathing canvas.
- **The Synodic Reckoning** — the client-side moon-phase computation (synodic month 29.530588853 days, from the new moon of 6 January 2000, 18:14 UTC).
- **The Ulam Ghosts** — the prime spiral's diagonal ghosts in the Cabinet.
- **The Deepening** — the Cabinet fractal that gains depth when asked, without bottom.
- **The Agreement** — the Cabinet's two tones drawing their Lissajous relationship; beauty as numbers agreeing.
- **The Scattered Leaves** — chance text: authored fragments, arrangement by seeded chance. Governed by §XI.
- **The Box** — see §VII.
- **The Ghost Ledger** — the Mirror's faint keeping of previous visits' paths beneath the new one.
- **The Complete Ring** — the Door's opening condition.
- **The Final Line** — the passage's last line, present only when all nine glyphs have been encountered (§IV).
- **The Ajar Door** — see §VII.
- **The Sunrise Restraint** — the Door's single slow sunrise. No fanfare, ever. Restraint is the power.

## IV. The Glyph Grammar

Nine glyphs, one per chamber, drawn in one hand: hairline strokes, no fills except the seed-dot. A consistent visual language — geometry, not pictures.

**The Nine:** Threshold (the arch), Scale (the rising arcs), Garden (the sprout), Stars (the four-point star), Letter (the sealed diamond), Tide (the moon over water), Cabinet (the keyhole), Mirror (the facing arcs), Ninth (the ring and seed).

**The Unnumbered Mark:** a tenth sign — the Cartographer's Mark, a crossed circle with a tail, walking off the page. It belongs to no chamber. It signs fragments. It is the ninth glyph required for the Final Line (the Door counts eight chambers; the passage counts nine glyphs, and the ninth is found only in the Coda Below).

**Positions mean:**
- A glyph **in the ring** (the header) is *the way* — it points.
- A glyph **in a corner** is *kept* — the chamber holds it.
- A glyph **in a margin** is *witnessed* — someone was here before you.
- A glyph **inverted** is *remembered* — reserved; not yet used anywhere. Future builders: introduce sparingly, record here first.
- Two glyphs **joined by a hairline** are *in conversation* — reserved for future waves.
- The Ninth glyph appears only as *the way* (ring), *the seat* (the Door), and *the seal* (the site's icon). Nowhere else.

**Reading:** glyphs are read clockwise from the Threshold. On the Door they light in ring order as chambers are visited.

## V. The Cartographer — Established Facts

The site's one recurring presence: an unnamed maker who charted the chambers before the site existed. Written as fiction-poetry; never presented as a real person; signed **“C.”** or with the Unnumbered Mark. Facts once planted here never contradict later fragments. Planted, wave 1:

1. C. did not build the place. C. found the doors already standing and learned their order by walking it.
2. C. measured the Eiffel Tower in summer and in winter, and concluded it is not taller — it is *reaching*.
3. C. went below the grain of sand with a candle and a notebook, and returned with the notebook empty and the candle unlit.
4. C. counts moons, not days; the numbers got smaller and truer.
5. C. kept the book a teacher pressed on a quiet student. “They always keep the book.”
6. C. never opened the Box, and held that not opening it was the whole of the keeping.
7. C. left the Door's final line unwritten on purpose: it belongs to whoever completes the ring.
8. C. noted that on the ninth day of any month, one should watch the Garden's east bed, and never wrote down why.

Future fragments must be small, true-in-the-fiction, and imply more than they say. The philosophy they accumulate is compassion-as-defiance — coherent, never completed, never summarised (§I).

## VI. The Calendar of Time-Locks

All client-side. All real time.

- **The Moonkeeper's Star** — appears in the Wishfield when the moon's illumination is at least 92% (the full-moon watch). *Live, wave 1.*
- **The Ninth Bloom** — one golden flower grows in the Garden on the 9th day of any month, local time. *Live, wave 1.*
- **The Midnight Minute** — during 00:00 local, the Threshold carries one extra line, and the Ajar Door's darkness deepens. *Live, wave 1.*
- **The Returning Postscript** — in the Letter Room, on any visit after the first. *Live, wave 1.*
- **The Ninth Day (September 9)** — seeded, not yet built: on Sept 9 the Garden grows nine golden flowers and the Moonkeeper's Star shows regardless of phase. Recorded here so no future wave contradicts it.
- **The Full-Moon Watch** is a standing ritual (§VIII), not an event the site announces.

## VII. The Unanswered Artifacts

Three things on this site are never resolved. This section exists so no future builder "fixes" them.

1. **The Box** (Cabinet). It has never opened. It does not open. Nothing suggests it should, or wants to, or that what is inside is a thing at all.
2. **The Wrong Star** (Constellation). One star, slightly the wrong colour — a pale green among the warm whites — with no wish attached. Resting on it shows only: *This one is not a wish.* It is never explained.
3. **The Ajar Door** (Threshold ring map). A tenth door, drawn small and ajar, darkness behind it. It leads nowhere the site will show. It is not a link. It is not horror; it is the dark, present, and — per the Thesis — not winning.

## VIII. Rituals and the Depths of Return

Things visitors do, repeatedly and on purpose. The site rarely names them; the canon does.

- **The First Arrival** (visit 1): the Threshold's plain welcome. The ring is dark; every door is a question.
- **The Return** (visit 2): the Threshold greets you as a returning traveller. The Letter Room keeps its postscript for you. The Mirror keeps your first path, faintly.
- **The Ninth Visit** (visit 9): the Threshold's greeting changes a third time — it acknowledges the habit of you. *Live, wave 1.*
- **The Full-Moon Watch**: on full-moon nights the Wishfield gains the Moonkeeper's Star. Nothing announces it. You either looked up, or you didn't. *Live, wave 1.*
- **The Ninth-Day Bloom**: on the 9th of any month, the Garden grows one golden flower. *Live, wave 1.*
- **The Complete Ring**: finishing all eight chambers and standing at the open Door. The only achievement this site keeps, and it keeps it only in your browser.
- **Depth 27** *(roadmap)*: the Cartographer's second fragment set (the Winter Notes) becomes findable; the Garden begins keeping one plant-shape shaped by your earliest path.
- **Depth 81** *(roadmap)*: the Second Coda — a room below the Coda Below, reachable only from the Mirror at the completion of the ghost figure; the Cartographer's last fragment — which is a question, and the only one he ever asked outright.
- **September 9 — The Ninth Day** *(seeded)*: see §VI.

## IX. Museum Permanence

- Materials: typography, geometry, light, number. Nothing on this site chases a trend, a framework, or a fashion. Every choice must still make sense in twenty years.
- No external requests: no fonts, scripts, images, or trackers loaded from elsewhere. The site is one place, self-contained, the way a chapel is.
- No build step. Hand-written HTML, CSS, JS that a scholar in 2046 can read the way we read a colophon.
- Provenance: WAVELOG entries are museum records — what was made, why, what it means in the canon, what was verified. Numbers, not adjectives.
- Performance is a form of respect: heavy scenes wake only when their chamber is entered; the calm mode (prefers-reduced-motion) is complete, not a fallback apology.

## X. The Test Bed and the Frontier

This site is the fleet's technique test bed. The research engine hunts the newest techniques in web craft; they are tried here first, in real chambers, under the canon's discipline. A technique that proves worthwhile graduates to the other eight sites. A technique enters the canon (§III's registry) only after it survives a full wave in production here.

**The dialectic, recorded once so no builder has to re-derive it:** *the surface pushes the limits of its age; the core outlives the age.* These are not in conflict. They are the same rule read from two ends:

- **The surface pushes limits.** The newest platform capabilities are used at their real frontier — view transitions, scroll-driven animation, registered CSS properties, speculation rules, and whatever research surfaces next (WebGPU scenes are the standing candidate) — implemented in dependency-free vanilla code against the platform APIs themselves, never through a framework that will rot faster than the platform.
- **The core stays eternal.** Every frontier feature is an enhancement layer over the plain, timeless core. The test is absolute: *disable the newest layer and the chamber still delivers its full meaning.* Progressive enhancement to the extreme. A technique that cannot degrade to meaning does not ship on this site, however new it is.
- Each wave, the WAVELOG names the newest technique in use **and its fallback**. If a builder cannot name both, the technique is not understood well enough to stay.

Wave 1's frontier set, for the record: same-document View Transitions (fallback: instant chamber change, full meaning intact) · CSS scroll-driven animations on the Powers Stair (fallback: IntersectionObserver reveals) · registered `@property` custom properties for the Kept Light (fallback: static gradient) · Speculation Rules prefetch of the data collections (fallback: ordinary fetch on chamber entry) · Canvas 2D generative scenes (fallback: written descriptions, already in the HTML). WebGPU is named as the wave-2 candidate: a Garden or Wishfield scene, gated on the same degrade-to-meaning test.

*Canon established at wave 1, 2026-10-13. Extend; never contradict.*

## XI. Addendum — The Scattered Leaves (chance text)

Some text on this site reads as random, scattered, dreamlike. That is art, and it is governed:

- **The pieces are authored; the arrangement is chance.** Every fragment is hand-written by a builder into `data/v1/` as a small curated set. Client-side seeded chance (the Dayseed and the visit count) decides selection, order, and placement. Nothing else does.
- **Banned:** generated gibberish, lorem of any flavour, Markov sludge, word-salad assembled from the site's own prose. Seemingly random, never actually empty. A visitor should feel the strangeness of the arrangement *and* the humanness of every piece.
- **Minimum authorship:** a chance-text locale ships only with a set of at least **27 pieces**. Small sets read as repetition; repetition reads as machinery.
- **Where it may live:** the Garden's whispers (three pieces per visit, drawn without replacement — *live, wave 1*, set of 28); the Cabinet's oracle slips (one per opening — *live, wave 1*, set of 9). Roadmapped locales: marginalia in the Letter Room that rearranges between visits; fallen words under the Wishfield — words, not wishes, that drift.
- Named in the registry as **The Scattered Leaves**: leaves are pages, and leaves are what gardens drop. Both readings are intended.

---

## XII. Amendment — The Text Ration (wave 2, 2026-10-13)

Recorded per the discipline of this document: nothing above is struck. This section narrows how much of the canon the pages may *show*.

**The Ration. The site shows a fraction of its words. The Codex keeps them all.**

1. **No explanation survives.** No instructions, no introductions, no labels that explain a mechanic — no "hover to", no "begin anywhere", no sentence that tells the visitor how the place works. Chambers are entered, not introduced. How the place works is found by walking it, or not found.
2. **Navigation is glyph and symbol only.** The ring, the marks, numerals, a single note for the sound. Words never point; there are no buttons that say where they go.
3. **Presence replaces text.** Symbol, light, number, scale, silence. Where an earlier wave described, the rationed site shows; where it showed, it implies. Compositions approach one element in a vast space, and the descents and full-bleed scenes carry what prose carried.
4. **Artifacts are exempt, and whole.** The wishes, the letters, the Door's passage, the Cartographer's fragments, the Coda and its Rosetta are not chrome and are never rationed, abridged, or summarised on the pages. Everything explanatory *around* an artifact is stripped; the artifact stands alone.
5. **The measure.** Counted at arrival (script on, first visit, sealed things sealed, the ring incomplete): a chamber shows only the words its artifacts require; the site's own voice — everything that is not artifact, number, or symbol — tends to zero. Wave 2's per-chamber counts are recorded in the WAVELOG. A future wave that raises a chamber's count must say why in its record, or be cut back.
6. **The gap is the mystery.** The site rations; the Codex remembers (see the Master Code, Durability). A scholar who finds the Codex finds words the pages never showed. That difference is deliberate, and permanent.

The First Law governs the ration as it governs everything: less text, and every surviving word carries more meaning. Timeless subjects only; darkness present, never victorious; questions posed, never preached; warmth beats cleverness.

