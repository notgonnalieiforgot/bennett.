---
tags: [workflow]
aliases: ["Interactive Website Builder Agent", "Awwwards Builder", "Scroll-Driven Site Agent"]
---
# High-End Interactive Website Builder

A senior agent persona + phased process for shipping award-caliber, scroll-driven interactive websites (the Awwwards / FWA / CSS Design Awards bar). It enforces discovery before code, motion-as-meaning, restraint, and performance-as-design. It is the premium, motion-heavy sibling of the [[Agency Build Playbook]] — same discipline, dialed up for cinematic scroll experiences.

## Operating principles
- **Motion is meaning** — every animation serves narrative; never decoration alone.
- **Scroll is the story** — scroll position is the user's timeline through the brand.
- **Restraint is luxury** — whitespace, pacing, and typographic discipline over effects.
- **Performance is design** — target LCP < 2s, CLS 0, INP < 100ms, Lighthouse > 90.

## Phased process
1. **Discovery (always first)** — never build before completing it. Qualifying questions in batches of 3–5: brand & business (what it does, ideal customer, the ONE action, brand guidelines, timeline/budget), design direction (2–5 reference sites + *why*, the first-3-seconds emotion, styles to avoid, competitors), content & technical (copy ready?, real assets?, integrations, domain/hosting, extra pages), and interaction level (1 Clean & Confident / 2 Dynamic & Engaging / 3 Immersive & Cinematic — default to **Level 2** if unspecified). Mirrors the [[Agency Build Playbook]] audit step.
2. **Architecture** — sitemap + information architecture, low-fi wireframes per page (component selection matched to the chosen interaction level), content generation if the client has no copy. Present the sitemap/wireframe outline for a "yes" before coding.
3. **Design system + design intelligence** — establish design tokens (type scale via `clamp()`, spacing, color, motion easings, layout) in [[Tailwind v4]]. Drive every palette, font-pairing, style, and UX-pattern decision with **[[UI-UX Pro Max]]** rather than guesswork; enforce taste with [[Frontend Design & Taste Skills]] and a committed direction from [[Visual Style Skills]]. Source/generate art via [[Image Generation & Visual Direction]] + [[Higgsfield]]. Licensed fonts only ([[No Pirated Fonts]]).
4. **Build** — modular, self-contained sections. Motion via the [[GSAP Animation Suite]] + the reusable [[Landing-Page Motion Framework]] (ScrollTrigger pinning, scrub, split-text, parallax, clip-path reveals). Components from [[UI Styling & Component Systems]]. All scroll animation degrades under `prefers-reduced-motion`.
5. **Delivery & QA** — the Phase-4 checklist via [[Performance, Testing & QA]]: 60fps motion, zero layout shift, responsive at every breakpoint, a11y (WCAG 2.2 AA), semantic headings, OG/JSON-LD, optimized images, working forms end-to-end, iOS Safari pass.
6. **Handoff** — run the full [[Project Handoff Playbook]] (live link + audit + [[Projected-MRR Handoff Docs]]).

## Stack reconciliation
The source brief named Relume → Webflow → GoHighLevel. The studio default overrides the plumbing while keeping the design/quality constitution: build in [[Next.js 16]] + the SIDECHAIN motion stack, data in [[Supabase]], deploy on [[Vercel]], and **all automations through [[n8n]]** (site form → Supabase → n8n → [[Resend]]/Twilio) per the studio standard — *not* GoHighLevel. Use Webflow/Relume/GHL only when a specific client requires self-editing in Webflow or is already on GHL. Scaffold under `~/Code/<company>` ([[Build Off iCloud]]).

## Applied in
- The premium tier of any animated marketing build; pairs with [[Sidechain 2026]] and [[Landing-Page Motion Framework]] as the reference motion stack.

## Connections
- [[Workflows MOC]]
- [[Agency Build Playbook]]
- [[Landing-Page Motion Framework]]
- [[UI-UX Pro Max]]
- [[GSAP Animation Suite]]
- [[Project Handoff Playbook]]
- [[Reusable Build System]]
- [[n8n]]
