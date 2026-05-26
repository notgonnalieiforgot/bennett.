---
tags: [project]
aliases: [chained-aminos, Chained Aminos Revamp]
status: handoff-pending
---
# Chained Aminos

Headless-WooCommerce revamp of **chained-aminos.com** (Atlanta-based research-peptide e-commerce, currently WordPress + Elementor + WooCommerce). A modern Next.js frontend over the existing Woo backend, keeping the original brand kit. A demo is deployed; the project is in client handoff with a feature freeze.

## Snapshot
- **What:** Modern frontend rebuild (homepage + shop + product pages) over a headless WooCommerce backend for a research-peptide store.
- **Stack:** [[Next.js 16]] + React 19 + Tailwind v4 + shadcn (style `base-nova`, which is **Base UI** not Radix); R3F/three/drei/GSAP/Framer for the exploded-vial scroll work.
- **Repo / path:** `~/Code/chained-aminos` (canonical) with a Desktop mirror at `~/Desktop/CHAINED AMINOS`; clean Obsidian mirror vault at `~/Documents/chainedaminos`.
- **Live URL:** https://chained-aminos.vercel.app (demo only — does NOT touch the live .com).
- **Status:** handoff-pending (feature freeze until handoff + payment).

## Notes
- **Scope hold:** no new scope until the client finalizes handoff and the transaction closes. The admin dashboard + lead-qualification system is the planned *next, separate* engagement. Visible design polish is OK only when the user directs it (e.g. the authorized taste-skill polish pass).
- Brand kit locked: green `#5ba238`, charcoal `#353030`, light wash `#eff6eb`; Montserrat + Inter; molecular-hexagon mark. ≥99% purity, third-party COA/HPLC verified, **Research Use Only disclaimer must stay everywhere** (no human-medical claims). Live theme is now dark glassmorphism (brand-kit.md documents the original light theme).
- **base-nova/Base UI gotchas:** components use the `render` prop not Radix `asChild`; Accordion uses `multiple={false}`; added `@radix-ui/react-slot` so Button supports `asChild`.
- The exploded-vial scroll work follows [[Scroll Motion - Higgsfield Exploded]] / [[Scroll Storytelling UI Engineer]]. A 2026-05-21 recovery incident lost the exploded-view base system from both working trees (never committed) — recovered into `~/Code/chained-aminos` (commit 7f11555) + the vault; taste pass recoverable from tag `recovery/taste-pass-dd5a336`.

## Connections
- [[Projects MOC]] — category hub
- [[Scroll Motion - Higgsfield Exploded]] — the exploded-vial scrollytelling workflow
- [[Scroll Storytelling UI Engineer]] — GSAP ScrollTrigger / motion engineering used here
- [[Next.js 16]] — framework
- [[Build Off iCloud]] — root cause of the exploded-view recovery incident
- [[Higgsfield]] — asset generation for product/layer imagery
- [[GSAP Lenis Framer Motion]] — the motion libraries behind the scroll work
