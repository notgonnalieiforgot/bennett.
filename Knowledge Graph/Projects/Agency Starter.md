---
tags: [project, workflow]
aliases: [Reusable Build System, agency-starter, New Project Scaffold, Starter Template]
status: live
---
# Agency Starter

A reusable, lean, motion-rich **Next.js 16 starter template** that spins up every new client site into its own company-named folder. It is the concrete implementation of the "reusable build system" — the proven, brand-agnostic pieces of [[Sidechain 2026]] extracted and de-branded so new builds start hours ahead instead of re-deriving the scaffold each time. This is the engine behind the [[Agency Build Playbook]] and [[High-End Interactive Website Builder]].

## Snapshot
- **What:** Internal boilerplate + `new-project.sh` generator for high-end animated marketing sites.
- **Stack:** [[Next.js 16]] + React 19 + [[Tailwind v4]] + the [[GSAP Lenis Framer Motion]] motion stack; vendored Framer components via the `framer` tsconfig-alias shim. 3D ([[Higgsfield]]-fed three/R3F) is an OPTIONAL add-on, not in the baseline.
- **Path:** `~/Code/agency-starter` (its own git repo; [[Build Off iCloud]]). 13 commits merged into `main` via rebase; scaffold branch deleted.
- **GitHub:** private `notgonnalieiforgot/agency-starter` — PR #1 **MERGED** (https://github.com/notgonnalieiforgot/agency-starter/pull/1). HEAD = `66bb73a`.
- **Backend:** lead-capture only — `/api/lead` → n8n-first webhook + [[Supabase]] persist + [[Resend]] fallback, REST, no SDK.
- **Status:** live — 10/10 plan tasks complete, PR #1 merged 2026-05-26, final build GREEN (10 routes, 0 type errors), `new-project.sh` end-to-end smoke test produced a buildable spawned project, final reviewer APPROVED.

## The core idea — prevent bloat, maximize performance
Two motion systems, split by job (codified in the starter's `CLAUDE.md` so every project agent obeys it):
- **Framer components (vendored)** = self-contained MICRO-INTERACTIONS: buttons, custom cursor, loaders, text effects. Drop-in, never re-authored.
- **[[GSAP Animation Suite|GSAP]]** = SCROLL ORCHESTRATION: ScrollTrigger pin/scrub, entrance timelines. One timeline per pinned element.
- `usePrefersReducedMotion` wired everywhere; animate transform/opacity only; guard INP/CLS.

## How it works
- **`./scripts/new-project.sh "Company Name"`** copies the starter into `~/Code/<slug>`, stamps brand placeholders (`__COMPANY_NAME__`, domain, email, region), and inits a fresh git repo — auto-enforcing the **one fresh folder per company** rule (never reuse/nest folders).
- **`./scripts/add-3d.sh`** installs three/R3F/drei and un-parks `_3d-module/` only when a build needs real 3D — keeping the default bundle lean.
- **`.claude/` agents + curated skills are baked into the template**, so the [[Sidechained Skills Library]] works per-project automatically — no manual `/skills` invocation needed.
- **License-clean by default:** only free/licensed Framer components, system/SF font stack ([[No Pirated Fonts]]).

## Why it matters
The user runs an agency that builds and hands off many client sites; a versioned starter compounds margin, consistency, and turnaround. It is the fastest path through the [[Agency Build Playbook]] and feeds straight into the [[Project Handoff Playbook]].

## Connections
- [[Projects MOC]] — category hub
- [[Sidechain 2026]] — the flagship this starter is extracted from
- [[Agency Build Playbook]] — the process this template accelerates
- [[High-End Interactive Website Builder]] — premium motion sibling workflow
- [[Landing-Page Motion Framework]] — the reusable hooks/components inside it
- [[GSAP Lenis Framer Motion]] — core motion libraries
- [[Sidechained Skills Library]] — the `.claude` agents + skills baked in
- [[n8n]] — the standard automation layer the lead route targets
- [[Supabase]] · [[Resend]] — lead persistence + email fallback
- [[Higgsfield]] — feeds the optional 3D / per-section visuals
- [[Next.js 16]] · [[Tailwind v4]] — framework + styling
- [[No Pirated Fonts]] · [[Build Off iCloud]] — guardrails it enforces
- [[Project Handoff Playbook]] — where every spun project ends up
