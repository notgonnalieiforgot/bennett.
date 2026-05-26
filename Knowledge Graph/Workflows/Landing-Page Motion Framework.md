---
tags: [workflow]
aliases: ["Motion-Scroll Stack", "SIDECHAIN2026 Motion Stack"]
---
# Landing-Page Motion Framework

When building a new landing page that needs high-end animation and scroll-based interactions, reuse the [[Sidechain 2026]] motion-scroll stack as the starting framework instead of authoring GSAP/scroll logic from scratch. Reuse compounds margin and consistency across the agency's repeat builds.

## Steps / shape
1. **Identify needed effects** for the new page (hero disperse, pinned/sticky sections, scrub-driven reveals, micro-interactions).
2. **Pull the matching hooks** from the flagship `src/hooks`: `use-frame-sequence.ts` (scroll-driven image-sequence engine), `use-scroll-trigger-sync.ts`, `use-scroll-lock.ts`, `use-prefers-reduced-motion.ts`.
3. **Pull the matching components**: `sections/disperse-canvas.tsx` + `lib/disperse.ts` (canvas frame hero), `motion/smooth-scroll.tsx`, `motion/reveal.tsx`, `reveal-text.tsx`, `four-layers.tsx` (sticky pinned sections), `dot-orbit-background.tsx`.
4. **Vendor Framer exports** via `lib/framer-shim.ts`: `text-scroll.js`, `reveal-text-scroll.js`, `text-pressure.js`, `premium-glow-button.js`, `crux-cursor.js`, `dot-matrix-svg.js`.
5. **Adapt content** to the new brand; **always wire `use-prefers-reduced-motion`** so premium motion degrades gracefully.
6. Lean on the decision/skill layer ([[Scroll Storytelling UI Engineer]], [[Scroll Motion - Higgsfield Exploded]], taste/soft/impeccable skills) orchestrated by the `motion-3d` agent.

## Applied in
- [[Optimum Apartment Solutions]] — Denver turnover landing page reusing the SIDECHAIN motion stack + Higgsfield assets.
- [[Coastal Lane 2026]] — animated/scroll landing build drawing on the same framework.

## Connections
- [[Workflows MOC]]
- [[Sidechain 2026]]
- [[GSAP Lenis Framer Motion]]
- [[Scroll Storytelling UI Engineer]]
- [[Scroll Motion - Higgsfield Exploded]]
- [[Agency Build Playbook]]
