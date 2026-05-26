---
tags: [workflow]
aliases: ["Sidechain Sprint", "Start-to-Finish Build Process"]
---
# Agency Build Playbook

The reusable start-to-finish process for shipping a high-end animated marketing site for any company, distilled from the [[Sidechain 2026]] flagship build. It runs at the beginning of every new client engagement and carries through to handoff.

## Steps / shape
1. **Business audit + qualifying questions** — get the company name and intake materials first, then run tailored qualifying questions (Phase 1 framework). Ground everything in the client's funnel and goals.
2. **Brand + token system** — color sampling, Tailwind v4 `@theme` CSS-first tokens, mono/editorial typography.
3. **Scaffold + `.claude` agents/skills** — set up the repo, agents, and skill orchestration layer.
4. **Data layer + sections/pages** — wire content and build out the site structure.
5. **Motion + Framer/Higgsfield** — apply the [[Landing-Page Motion Framework]] (scroll-scrub, pinned GSAP timelines) and generate art-directed assets via [[Higgsfield]] (network plate, studio HDRI, per-section visuals, dispersion video → frame sequence). Vendor Framer-exported components via the `framer`-shim pattern; respect licensing (LiquidMetal is proprietary, not used).
6. **Verify** — headless-Chrome verification patterns; confirm build, motion, and degradation.
7. **Deploy + git hygiene** — ship to production, keep the live link fresh.
8. **Handoff** — run the full [[Project Handoff Playbook]].

Canonical copy lives in the repo (`docs/AGENCY-PLAYBOOK.md`), the Obsidian vault, and the reusable skill library.

## Applied in
- [[Sidechain 2026]] — the flagship build this playbook was compiled from.
- Subsequent client builds — re-run start-to-finish, swapping audit inputs and brand tokens per company.

## Connections
- [[Workflows MOC]]
- [[Construction Trade Website Lifecycle]]
- [[Project Handoff Playbook]]
- [[Landing-Page Motion Framework]]
- [[Higgsfield]]
- [[Reusable Build System]]
- [[Growth Partner Model]]
