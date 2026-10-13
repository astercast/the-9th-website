# GO_LIVE — The 9th Website

How this site would be deployed, written down before it is needed, in the
site's own durability idiom. Status: **working repo only. Not deployed.**
No `-live` repo exists; none is created, and nothing in this document is a
deploy order. Deploying happens only on the owner's explicit "push" /
"ship it" order.

## What deploys

Plain files. That is the whole technology:

- `index.html`, `404.html` — the place itself, complete without JavaScript.
- `assets/css/main.css`, `assets/js/main.js` — one stylesheet, one script,
  hand-written, commented, unminified.
- `assets/og-card.png` — the wordless glyph-ring share card.
- `data/v1/*.json` — the written collections (wishes, letters, scale,
  whispers), fetched same-origin.
- `codex.txt` — the complete written record, served at `/codex.txt`,
  linked from nowhere.
- `favicon.svg`, `favicon.ico`, `icon-192.png`, `icon-512.png`,
  `apple-touch-icon.png`, `robots.txt` — plain files at the root.
- `api/health.js` — the one server function.

## The durability rules, as deploy-time checks

Breaking any of these in a deploy breaks the canon, not just the site:

- [ ] **Zero dependencies.** No `package.json` deps, no CDN, no webfonts,
      no framework, no external request of any kind at runtime.
- [ ] **Zero build step.** `vercel.json` keeps
      `"installCommand": "echo 'no dependencies'"` and
      `"outputDirectory": "."`. What is in the repo is what is served.
- [ ] **Static data lives in `data/v1/`, never under `api/`.** Only real
      serverless functions live under `api/` (today: `api/health.js`
      alone, listed explicitly in `vercel.json` `functions` with
      `{"maxDuration": 10}`).
- [ ] **Never pin a `runtime`** for Node functions in `vercel.json` —
      omit the key; Vercel auto-detects Node.
- [ ] **Build machine: Standard, never Turbo.**
- [ ] **`codex.txt` is current** — every word the site carries is in it
      (the site rations its words; the Codex does not).
- [ ] **Line endings are LF** (`.gitattributes` pins `* text eol=lf`;
      binaries are marked binary). Plain text is a preservation format.

## The deploy, step by step

1. Confirm the working tree is clean and committed
   (`git add -A` + commit before any push; author `astercast`).
2. Confirm `origin` is `astercast/the-9th-website` — the working track.
   A `-live` track is created only on the owner's explicit order, never
   as a side effect of following this document.
3. Run the pre-deploy checks in `LIVE_CHECKLIST.md` (no-JS read-through,
   calm-mode pass, health counts, screenshots).
4. Connect the repo to Vercel (Hobby) with the settings already recorded
   in `vercel.json`; no dashboard-only configuration.
5. **Absolutize the social-card URLs (duty 9).** The head of `index.html`
   ships `og:image` / `twitter:image` in relative form
   (`assets/og-card.png`) because no domain exists yet. Once the real
   domain is known, change exactly those two values to the absolute form
   `https://<domain>/assets/og-card.png`, commit, and redeploy. Social
   crawlers do not resolve relative card URLs; until this step is done,
   shared links render without the card. Verify after deploy with a
   card-preview check against the live URL.
6. Smoke-test the live URL: `/` (all nine chambers reachable by the
   glyph ring), `/codex.txt` (200, plain text), `/assets/og-card.png`
   (200), `/api/health` (answers `status:"ok"` with counts matching
   `data/v1/`), a nonsense path (serves `404.html`).

## Rollback

There is no state to migrate and nothing server-side to unwind: redeploy
the previous commit. Visitor memory lives only in visitors' own browsers
(the `ninth.*` localStorage keys) and is untouched by any deploy.

## Budget

Static files plus one health function. Worst realistic case stays far
inside the Hobby allowance (see `LIVE_CHECKLIST.md` for the arithmetic).
First degradation point: none identified.
