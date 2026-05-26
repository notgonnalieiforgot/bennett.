---
tags: [project]
aliases: [coastal-lane-static, clsc, Coastal Noir]
status: live
---
# Coastal Lane (Static Site)

The older, framework-free static site for **Coastal Lane** (luxury construction contractor, St. Petersburg FL) — "Coastal Noir" editorial theme with a Decap CMS for non-technical edits, deployed via Cloudflare Pages. Predecessor to the full-platform [[Coastal Lane 2026]] rebuild.

## Snapshot
- **What:** Static HTML/CSS/JS site (no framework, no build step) with a Decap CMS at `/admin/`.
- **Stack:** Vanilla HTML/CSS/JS, Lenis + GSAP + ScrollTrigger, Decap CMS, [[Cloudflare Pages]] (GitHub OAuth proxy via a Pages Function).
- **Repo / path:** `notgonnalieiforgot/coastal-lane-static` (private) → `~/Desktop/coastal-lane/`.
- **Live URL:** https://clsc.pages.dev (canonical; Cloudflare Pages project `clsc`). Fallbacks: a Cloudflare Worker and `coastal-lane.vercel.app`.
- **Status:** live.

## Notes
- Pushed to a `-static` repo deliberately to leave the legacy Manus `coastal-lane` repo (Vite + TS + Drizzle) untouched. Do not modify that legacy repo without confirmation.
- "Coastal Noir" theme: Fraunces (display) + Inter (body), custom cursor + magnetic buttons, marquee, pinned horizontal process section. Sticky header intentionally removed; nav via section-indicator dots + back-link chips.
- Decap CMS edits `data/content.json` → push to `main` → Cloudflare auto-deploys in ~30-60s. GitHub OAuth via a Pages Function reading `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` — see [[Cloudflare Pages Env-Var Traps]] for the whitespace/truncation gotchas that bit this project.
- **iCloud offload caveat:** files on Bennett's Mac went `dataless` (iCloud offloaded byte contents) — shell reads timed out with `ETIMEDOUT`. Workaround that worked: commit via `gh api -X PUT repos/.../contents/...`. Reinforces [[Build Off iCloud]].
- Known TODOs: Formspree form still has `YOUR_FORM_ID` placeholder; service detail pages use Unsplash placeholders; design-review punch list (no skip-to-content link, render-blocking CDN scripts, hero `<img>` lacks srcset/dimensions).

## Connections
- [[Projects MOC]] — category hub
- [[Coastal Lane 2026]] — the full-platform successor for the same client
- [[Cloudflare Pages]] — hosting/deploy platform
- [[Cloudflare Pages Env-Var Traps]] — env-var gotchas that affected the CMS OAuth setup
- [[Build Off iCloud]] — the iCloud dataless-file incident on this project
- [[GSAP Lenis Framer Motion]] — the scroll/motion libraries used
