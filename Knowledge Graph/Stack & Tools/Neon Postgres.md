---
tags: [stack]
aliases: [Neon, Neon DB]
---
# Neon Postgres

Serverless Postgres provisioned through the [[Vercel]] storage integration. It is the database behind the Twist Kava build, where connection strings are kept sensitive and never pulled to a local file.

## Role in the stack
- Serverless, branchable Postgres that scales to zero — a fit for low-traffic client demos hosted on [[Vercel]].
- Connection-string env vars are marked **sensitive** on Vercel, so they can't be pulled locally; run prod-DB commands via `vercel env run --environment production -- <cmd>`.
- Because local migrations are blocked, schema `push` + seed run at build time inside the Vercel build chain (an idempotency guard in the seed prevents duplicate data).

## Used in
- [[Twist Kava Cafe]] — Neon provisioned via Vercel storage; Prisma 6 `db push --accept-data-loss` + `tsx prisma/seed.ts` run during `next build`; force a reseed with `FORCE_SEED=1`.

## Connections
- [[Stack & Tools MOC]]
- [[Vercel]]
- [[Next.js 16]]
- [[Supabase]]
- [[Drizzle ORM]]
