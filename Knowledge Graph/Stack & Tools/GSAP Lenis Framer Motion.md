---
tags: [stack]
aliases: [Motion Stack, GSAP, Lenis, Framer Motion, ScrollTrigger]
---
# GSAP Lenis Framer Motion

The studio's motion stack: GSAP + ScrollTrigger for scroll-driven timelines, Lenis for smooth scroll, and Framer Motion for tap/hover micro-interactions. Together they power the scrollytelling and pinned-section storytelling on the animated sites.

## Role in the stack
- **GSAP + ScrollTrigger** — pinned sections, scrub timelines, stacking, and frame-sequence scrubbing (keep frame-scrub + text-fade in ONE timeline; two triggers on a pinned element fight each other).
- **Lenis** — smooth scroll that ScrollTrigger reads from.
- **Framer Motion** — `whileTap`/hover micro-interactions and vendored Framer components.
- Reduced-motion aware throughout (static fallbacks, no pin); the reusable bundle is the [[Landing-Page Motion Framework]].
- Owned by the [[Scroll Storytelling UI Engineer]] discipline and applied via the [[Scroll Motion - Higgsfield Exploded]] workflow.

## Used in
- [[Sidechain 2026]] — single pinned GSAP timeline scrubbing a Higgsfield frame sequence over a network plate; Lenis + Framer Motion buttons/cursor.
- [[Chained Aminos]] — scroll-driven exploded product view (GSAP ScrollTrigger + motion layers).
- [[Coastal Lane 2026]] — Lenis smooth scroll + GSAP/ScrollTrigger, custom cursor, marquee, pinned horizontal process section (shared with the static build).
- [[Optimum Apartment Solutions]] — SIDECHAIN motion stack reused on the Denver landing page.

## Connections
- [[Stack & Tools MOC]]
- [[Landing-Page Motion Framework]]
- [[Scroll Storytelling UI Engineer]]
- [[Scroll Motion - Higgsfield Exploded]]
- [[Higgsfield]]
- [[Next.js 16]]
- [[Frontend Design & Taste Skills]]
