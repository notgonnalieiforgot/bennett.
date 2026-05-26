---
tags: [project]
aliases: [Twist Kava, twist-kava-cafe]
status: live
---
# Twist Kava Cafe

Next.js rebuild of **Twist Kava Cafe** (twistkavacafe.com, currently Squarespace) — a public marketing site plus a full admin CRUD dashboard, backed by Neon Postgres. Deployed as a live preview-style demo for the client.

## Snapshot
- **What:** 8-page public marketing site + a 10-section admin dashboard for a kava cafe.
- **Stack:** [[Next.js 16]] (Turbopack, `proxy.ts`, async params), Prisma 6.19, Tailwind v4, Auth.js v5 beta (Credentials + bcrypt), [[Neon Postgres]], [[Vercel]].
- **Repo / path:** `~/Desktop/TWIST KAVA/twist-kava-cafe/` (not a git repo yet — deploys go directly via `vercel deploy` from local).
- **Live URL:** https://twist-kava-cafe.vercel.app (alias; project `bennett-872566f5/twist-kava-cafe`).
- **Status:** live (demo).

## Notes
- **DB push + seed run at build time:** the build script is `prisma db push --accept-data-loss --skip-generate && tsx prisma/seed.ts && next build`. This is because the sensitive [[Neon Postgres]] env vars on Vercel can't be pulled locally — so migration/seed happens during deploy.
- `prisma/seed.ts` has an **idempotency guard** — it bails early if `MenuCategory` already has rows; set `FORCE_SEED=1` to override (deploy once with it, then remove).
- Deliberately stuck on **Prisma 6** (Prisma 7 dropped `url` from datasource). Lucide v1 (brand icons removed → custom SVGs).
- Public site redesigned mid-build to a "void lounge" dark palette (cream-on-void with latte accents); admin shell rethemed to match.
- **Open items:** rotate the seeded admin password `admin@twistkavacafe.com / changeme123` before client traffic; custom-domain cutover from Squarespace (update `NEXT_PUBLIC_SITE_URL` + redeploy); `NEXTAUTH_SECRET` only on Prod & Dev (Preview needs explicit add); Higgsfield imagery deferred.

## Connections
- [[Projects MOC]] — category hub
- [[Next.js 16]] — framework
- [[Neon Postgres]] — database (provisioned via Vercel storage integration)
- [[Vercel]] — hosting + storage integration + deploy target
- [[Johnny's Smoke Shop]] — sibling hospitality/retail build with a similar demo-admin pattern
- [[Higgsfield]] — deferred AI imagery integration
