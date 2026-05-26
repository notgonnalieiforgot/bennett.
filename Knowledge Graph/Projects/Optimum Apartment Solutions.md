---
tags: [project]
aliases: [Optimum, optimum-cp, Optimum CP]
status: live
---
# Optimum Apartment Solutions

High-end animated landing page for **Optimum Apartment Solutions** (optimumcp.net) — Denver apartment turnover & maintenance for multifamily property managers (B2B, since 2008). Built audit → build → Higgsfield → deploy on 2026-05-24.

## Snapshot
- **What:** Animated marketing landing page rebuild for a Denver turnover/maintenance contractor.
- **Stack:** [[Next.js 16]] + Turbopack, React 19, Tailwind v4, the SIDECHAIN motion stack ([[Landing-Page Motion Framework]]), [[Higgsfield]] imagery, Resend for lead capture, [[Vercel]] hosting.
- **Repo / path:** `notgonnalieiforgot/optimum-cp` (private) → `~/Code/optimum-cp` (off iCloud). Note: it's its own nested git repo (git init was run manually).
- **Live URL:** https://optimum-cp.vercel.app (production, public, HTTP 200).
- **Status:** live (handoff items pending).

## Notes
- Art direction "Industrial Premium": dark slate `#0E1116`, safety amber `#FFB020`, Anton (display) + Manrope (body). Hero entrance hardened to **pure-CSS** so above-the-fold never sticks hidden if JS is slow.
- Motion reuses the SIDECHAIN stack per [[Landing-Page Motion Framework]] — Lenis SmoothScroll, GSAP Reveal, Framer KineticHeading/MagneticButton/StatCounter, marquee, grain overlay.
- Visuals generated via [[Higgsfield]] MCP (`nano_banana`) → `public/hero.jpg`, `crew.jpg`, `amenity.jpg`, `detail.jpg`. Testimonials are REAL (verbatim from optimumcp.net). All copy in `src/lib/site.ts`.
- Lead capture wired via `src/app/api/quote/route.ts` (Resend with mailto fallback, honeypot + validation; returns `not_configured` 503 until key added).
- **Still open:** Vercel team is still `bennett-872566f5` — TRANSFER to a dedicated Optimum account; activate Resend (add `RESEND_API_KEY`, verify sending domain, redeploy); point custom domain optimumcp.net → Vercel. Handoff audit + projected-MRR Google Docs already created (editor: pat@sidechained.net).

## Connections
- [[Projects MOC]] — category hub
- [[Landing-Page Motion Framework]] — the reused SIDECHAIN motion-scroll stack
- [[Higgsfield]] — generated the hero/crew/amenity/detail imagery
- [[Vercel]] — hosting and deploy target
- [[Next.js 16]] — framework
- [[Sidechain 2026]] — origin of the motion stack reused here
- [[Agency Build Playbook]] — the audit→build→deploy process followed
