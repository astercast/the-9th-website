# LIVE_CHECKLIST — The 9th Website

Status: **working repo only. Not deployed. No `-live` repo exists; none to be created without the owner's explicit "push" / "ship it" order.**

## Structure audit (wave 1, 2026-10-13)

- [x] Static-first: every chamber reads whole with JavaScript disabled (all wishes, letters, and scale facts are real HTML; canvases carry written fallbacks).
- [x] All static data under `data/v1/` — never under `api/`.
- [x] Only real function under `api/`: `api/health.js` (1 function of the 12/site fleet ceiling).
- [x] `vercel.json`: explicit function path, `{"maxDuration": 10}`, **no `runtime` key** (Node auto-detected).
- [x] No build step, no dependencies (`installCommand` is a no-op echo).
- [x] Zero external requests at runtime: no fonts, scripts, images, analytics, or trackers loaded from elsewhere. Data files are same-origin.
- [x] Calm mode: `prefers-reduced-motion` gets a complete still site; every chamber reachable, every fact readable.
- [x] Client memory only: localStorage keys `ninth.*` (visit count, visited chambers, path ghosts, coda found). Nothing leaves the browser.

## Free-tier budget (if ever deployed)

- Function invocations: health only; the site itself is static. Worst realistic case is health-check traffic — hundreds/month against the 100k Hobby allowance.
- Function duration: `health.js` reads three small JSON files from disk; well under 1s against the 10s ceiling.
- Bandwidth: total site weight ≈ 120 KB uncompressed (HTML ≈ 40 KB, CSS ≈ 14 KB, JS ≈ 26 KB, data ≈ 14 KB). Trivial against 100 GB.
- Build minutes: no build command; seconds per deploy on the Standard machine (never Turbo).
- First degradation point: none identified at any plausible traffic. The site has no per-request computation worth the name.

## Before any future live push

- [ ] Re-run no-JS read-through of all nine chambers.
- [ ] Re-run calm-mode pass (forced reduced motion, desktop + 390px).
- [ ] Confirm the health function answers with counts matching `data/v1/`.
- [ ] Screenshot set refreshed into `~/workspace/progress-archive/the-9th-website/`.
