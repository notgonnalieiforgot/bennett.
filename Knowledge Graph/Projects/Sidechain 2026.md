---
tags: [project]
aliases: [SIDECHAIN2026, Sidechain Flagship, sidechainwebsite]
status: live
---
# Sidechain 2026

The agency's own flagship high-end animated 3D marketing site — Sidechain's "#1 sales asset." Sidechain is an "Autonomous Growth as a Service" (AGaaS) revenue-gen agency founded by Pat Bennett. This project is the origin of the reusable motion stack and the skills/agents library used across the other builds.

## Snapshot
- **What:** Flagship agency marketing site with 3D hero + scroll-driven motion; the canonical reference build.
- **Stack:** [[Next.js 16]] + React 19 + Tailwind v4 + three/R3F + drei + [[GSAP Lenis Framer Motion]]; App Router, Turbopack, npm (NOT pnpm).
- **Repo / path:** `notgonnalieiforgot/SIDECHAINWEBSITE` (private) → `~/SIDECHAIN2026` (NOT Desktop). Clean Obsidian vault copy under `~/Desktop/SIDECHAIN`.
- **Live URL:** https://sidechainwebsite.vercel.app (Vercel project `sidechainwebsite`, team `bennett-872566f5`).
- **Status:** live (full marketing site complete + deployed).

## Notes
- Canonical brief: `~/Downloads/sidechain_operations_v3.pdf` — four layers; tiers Foundation $750 / Growth Engine $1,250 / Market Dominator $2,000+ / Retainer $1,400/mo. ICP: Construction/HVAC/Landscaping → funded startups + mid-market. Copy/tiers/nav single-sourced in `src/lib/site.ts` + `src/lib/content.ts`.
- `.claude/` carries 6 subagents (motion-3d, frontend, design-system, backend-ai, content-assets, deploy-qa) + 36 curated skills from [[Sidechained Skills Library]] + scroll/taste playbooks — the seed of the [[Agency Build Playbook]].
- Hero: scroll-scrubbed dispersing-logo frame sequence (Higgsfield 1280×720 → WebP frames painted on canvas with `mix-blend-mode:screen` over a blue network constellation); ONE pinned GSAP timeline for frame-scrub + text-fade. Reduced-motion → static frame 0.
- Typography is **Apple SF Pro via the system font stack** (NOT embedded — Apple's EULA forbids web embedding, consistent with [[No Pirated Fonts]]). Earlier mono stand-ins (JetBrains/Space Mono) replaced commercial Proto/Nudica that were refused as unlicensed copies.
- Free Framer components vendored via a `framer` tsconfig-alias shim (DotMatrix loader, PremiumGlowButton, TextPressure hero title, sticky scroll-reveal text, custom cursor). The proprietary LiquidMetal Framer component was NOT used (license forbids use outside Framer) — kept the R3F chrome.
- ⚠️ `~/` itself is an accidental git repo — never `git add -A` from `~`; each project needs its own `.git`.

## Connections
- [[Projects MOC]] — category hub
- [[Landing-Page Motion Framework]] — this project IS the source of that reusable stack
- [[Agency Build Playbook]] — the start-to-finish process distilled from this build
- [[Higgsfield]] — generated the disperse frames + per-layer backdrops
- [[GSAP Lenis Framer Motion]] — the core motion/scroll libraries
- [[Sidechained Skills Library]] — the 36 skills + agents wired into `.claude/`
- [[Next.js 16]] — framework
- [[No Pirated Fonts]] — the SF Pro / Proto / Nudica licensing decisions
- [[Optimum Apartment Solutions]] — reuses this motion stack
- [[LH Training]] — reuses this motion stack
