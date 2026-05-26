---
tags: [stack]
aliases: [Tailwind, Tailwind CSS 4]
---
# Tailwind v4

The styling layer for every project — Tailwind CSS v4 in CSS-first mode, with design tokens declared via `@theme` in `globals.css` (no `tailwind.config.ts`). It carries each project's brand palette and typography scale.

## Role in the stack
- CSS-first `@theme` tokens are the single source of truth for color, type, and spacing (e.g. Southern Drywall's "Glass & Grit" orange `#F26A1A`, Fraunces/Inter/JetBrains_Mono).
- Underpins the [[shadcn ui]] component layer (Radix primitives styled with Tailwind utilities).
- Drives the polish enforced by the [[Frontend Design & Taste Skills]] (spacing, type contrast, motion-ready markup).
- A `@theme` font-token change requires a clean `.next` rebuild — HMR serves stale CSS until restart.

## Used in
- [[Southern Drywall]] — Glass & Grit tokens, glass primitives, grain overlay sitewide.
- [[Twist Kava Cafe]] — CSS-first `@theme` tokens, "void lounge" dark palette.
- [[Sidechain 2026]] — `@theme` tokens; Apple SF Pro system stack mapped to `font-sans`.
- [[Chained Aminos]] — paired with base-nova (Base UI) component layer.
- [[Optimum Apartment Solutions]] — Industrial Premium token system.
- [[LH Training]] — landing-page styling.

## Connections
- [[Stack & Tools MOC]]
- [[Next.js 16]]
- [[shadcn ui]]
- [[Frontend Design & Taste Skills]]
- [[Landing-Page Motion Framework]]
