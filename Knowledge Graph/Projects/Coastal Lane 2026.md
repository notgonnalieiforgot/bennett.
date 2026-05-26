---
tags: [project]
aliases: [Coastal Lane Platform, coastallane2026]
status: in-progress
---
# Coastal Lane 2026

Full-platform rebuild (marketing site + ops/admin layer) for **Coastal Lane**, a luxury home finishing & restoration contractor in St. Petersburg, FL — replicating the existing Manus reference site and curating a bespoke brand. This is the current active Coastal Lane engagement (distinct from the older static site).

## Snapshot
- **What:** Luxury construction full-platform rebuild — single long landing page (Hero → About "The Final 1%" → Services → Process → Testimonials → Contact → Footer) plus `/gallery` and `/admin` routes.
- **Stack:** [[Next.js 16]], the SIDECHAIN motion-scroll stack ([[GSAP Lenis Framer Motion]]), [[Higgsfield]] for imagery — following the [[Construction Trade Website Lifecycle]] and [[Agency Build Playbook]] processes.
- **Repo / path:** `notgonnalieiforgot/coastallane2026` (private) → cloned to `~/Code/coastallane2026` (kept off iCloud per [[Build Off iCloud]]).
- **Live URL:** None yet — Phase 0 discovery complete, build paused before scaffold.
- **Status:** in-progress (discovery done).

## Notes
- Scope confirmed 2026-05-24: full platform, **replicating** the Manus reference at `coastlane-coex6nyz.manus.space`. Full replication brief at `~/Code/coastallane2026/docs/replication-brief.md` (sections, verbatim copy, palette, type scale, JSON-LD).
- **Brand must be curated specifically for Coastal Lane — do NOT reuse Glass & Grit or any other company's brand kit.** Fonts Playfair Display + Inter; palette warm cream + brown `#34322d` + coastal navy/teal. Tagline "Bridging the gap between finished and perfect."
- Brand facts: St. Petersburg FL; phone (720) 577-9222; email coastallane727@gmail.com; serves St. Pete/Tampa/Clearwater; priceRange `$$$$`.
- Open items: reconcile 3 conflicting service-name sets (on-page vs JSON-LD vs contact `<select>`); convert local HEIC/PNG jobsite photos from `~/Desktop/COASTAL LANE SITE/`; wire contact form to a server action + Resend; no license/insurance/social present (don't invent).
- Distinct from [[Coastal Lane (Static Site)]] (the clsc.pages.dev static site) and the untouched legacy Manus `coastal-lane` repo.

## Connections
- [[Projects MOC]] — category hub
- [[Coastal Lane (Static Site)]] — the predecessor static site for the same client
- [[Construction Trade Website Lifecycle]] — the build workflow this follows
- [[Agency Build Playbook]] — start-to-finish audit→build→deploy process
- [[Landing-Page Motion Framework]] — reused motion stack from SIDECHAIN
- [[GSAP Lenis Framer Motion]] — the motion/scroll libraries in play
- [[Higgsfield]] — AI asset generation for site imagery
- [[Next.js 16]] — framework
- [[Build Off iCloud]] — why the repo lives under `~/Code` not `~/Desktop`
- [[Southern Drywall]] — sibling construction-trade build
