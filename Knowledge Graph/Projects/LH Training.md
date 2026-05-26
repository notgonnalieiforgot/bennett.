---
tags: [project]
aliases: [lh-training, Coach Lou]
status: live
---
# LH Training

High-impact marketing landing page for **LH Training**, the online coaching brand of **Coach Lou** (physique contest prep + lifestyle/transformation + nutrition coaching). Built with the SIDECHAIN motion stack; a full platform is deferred.

## Snapshot
- **What:** v1 marketing landing page + `/apply` program-details & application page for a fitness/physique coach.
- **Stack:** [[Next.js 16]] + React 19 + Tailwind v4; GSAP ScrollTrigger + Framer Motion ([[Landing-Page Motion Framework]]); WebGL liquid-"lava" shader backdrop; Resend lead capture; [[Vercel]] hosting.
- **Repo / path:** `notgonnalieiforgot/lh-training` (private) → `~/Code/lh-training` (moved off `~/Desktop/LHTRAINING` to dodge the iCloud hang).
- **Live URL:** https://lh-training.vercel.app (live, auto-deploys on push to `main`).
- **Status:** live (placeholders + handoff pending).

## Notes
- "Modern athletic" vibe: Anton (display) + Inter (body); ink `#111110` / bone `#f4f1ea` / volt-orange `#ff4a1c`. **All editable copy + links live in `app/lib/site.ts`** (and `pricing.ts` / `apply-content.ts`).
- Scroll storytelling: Hero parallax, marquee scroll-velocity, pinned word-by-word Manifesto scrub, Process pinned horizontal scroll (desktop via gsap.matchMedia), Results count-ups. All use useGSAP cleanup, no per-frame React state, reduced-motion gated.
- Notable pieces: B&W video hero (Lou's IG reel via `yt-dlp`), an Orbit 3D drag-to-spin carousel for the results gallery, animated service detail modals. A site intro loader was built then **removed at user request** ("come back to it later") — kept dormant in the repo.
- **Lead form needs Resend env vars to deliver** (`RESEND_API_KEY`, `LEAD_TO_EMAIL`); route returns a graceful 503 + IG fallback until set. Interim `LEAD_TO_EMAIL=pat@sidechained.net`; switch to `louishall33@yahoo.com` once a custom domain is verified.
- **Deferred (remind user):** expand beyond the landing page to a full platform (accounts, booking/scheduling, dashboards, course delivery, payments). Still pending: swap real applyUrl + email + photos; handoff audit + projected-MRR doc.

## Connections
- [[Projects MOC]] — category hub
- [[Next.js 16]] — framework
- [[Vercel]] — hosting and deploy target
- [[Landing-Page Motion Framework]] — the reused SIDECHAIN motion-scroll stack
- [[Higgsfield]] — generated the loader shaker/barbell imagery
- [[Sidechain 2026]] — origin of the motion stack reused here
- [[Build Off iCloud]] — why the repo moved to `~/Code`
