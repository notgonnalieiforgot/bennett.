---
tags: [project]
aliases: [Johnnys Smoke Shop, johnnys-smokeshop, Johnny's Smoke Shop & Kava Bar]
status: live
---
# Johnny's Smoke Shop

Demo build for **Johnny's Smoke Shop & Kava Bar**, a Tampa Bay smoke shop / kava bar client. A Next.js site with a public storefront-style homepage plus a loyalty + admin layer; the client gets the admin URL + demo creds to preview.

## Snapshot
- **What:** Marketing/homepage (Phase 1) + loyalty + admin dashboard (Phase 2) for a multi-location smoke shop / kava bar.
- **Stack:** [[Next.js 16]] (here Next 15, App Router), React 19, Tailwind 3.4 + claymorphism utilities, Framer Motion, Recharts; cookie-session auth.
- **Repo / path:** `~/Desktop/JOHNNYS SMOKESHOP` (uppercase + space).
- **Live URL:** https://johnnys-smokeshop.vercel.app ([[Vercel]] team `bennett-872566f5`); admin login at `/login` (subtle footer lock icon).
- **Status:** live (demo).

## Notes
- **Demo admin creds** (only scrypt hashes committed; rotate via Vercel env `ADMIN_USERNAME`/`ADMIN_PASSWORD`): `manager / johnnys2026` and `owner / johnnyspete2026`.
- **PostCSS config MUST be `postcss.config.js` (CommonJS)** — `.mjs` was silently skipped by Next 15's loader and produced zero Tailwind output. Key gotcha for this stack.
- Repo dir has a space + uppercase, so Vercel auto-name fails — first deploy needed `--name johnnys-smokeshop` (now linked).
- Security primitives in `lib/security.ts`: `readSecret()` fails closed in prod if `LOYALTY_PEPPER`/`SESSION_SECRET` are missing (both set in Vercel); sessions are HMAC-SHA256 signed; old-format cookies rejected. Audit doc `SECURITY.md` at repo root — read before wiring Lifelong POS.
- 8 active locations in `lib/locations.ts` (Wesley Chapel excluded); 21+ age gate on every route; Higgsfield product imagery in `public/products/*.png` (claymorphism prompts, no plant/leaf/smoke).

## Connections
- [[Projects MOC]] — category hub
- [[Next.js 16]] — framework family (this build is on Next 15)
- [[Vercel]] — hosting and deploy target
- [[Twist Kava Cafe]] — sibling hospitality/retail build with a similar demo-admin pattern
- [[Higgsfield]] — generated the claymorphism product imagery
