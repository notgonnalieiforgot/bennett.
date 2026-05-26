---
tags: [stack]
aliases: [Vercel Hosting]
---
# Vercel

The default hosting and deploy platform for the studio's Next.js apps. Almost every project lives under the `bennett-872566f5` Vercel team with prod aliases on `*.vercel.app`.

## Role in the stack
- Git-driven and CLI deploys (`vercel deploy --prod --yes`, often with `--scope bennett-872566f5`); preview-style `*.vercel.app` aliases serve as client demo links.
- First-class host for [[Next.js 16]] (App Router, Server Actions, dynamic OG, Turbopack builds).
- Provisions managed data via storage integrations (e.g. [[Neon Postgres]] for Twist Kava).
- Build chains run at deploy time when sensitive env vars block local migrations (Twist Kava pushes schema + seed during `next build`).
- Gotcha: serverless functions have no IPv6 egress — Postgres connections must use IPv4 pooler strings.

## Used in
- [[Twist Kava Cafe]] — project `twist-kava-cafe`; Neon provisioned via Vercel storage; build-time `prisma db push` + seed.
- [[Southern Drywall]] — project `southern-drywall`; static marketing site live; forms need the IPv4 pooler `DATABASE_URL`.
- [[Sidechain 2026]] — project `sidechainwebsite`; deploys require `--scope bennett-872566f5`.
- [[Optimum Apartment Solutions]] — live, deployed under the bennett team (flagged for transfer).
- [[LH Training]] — `lh-training.vercel.app` (live).
- [[Coastal Lane 2026]] — Vercel mirror kept as a fallback alongside the canonical [[Cloudflare Pages]] deploy.

## Connections
- [[Stack & Tools MOC]]
- [[Next.js 16]]
- [[Neon Postgres]]
- [[Supabase]]
- [[Cloudflare Pages]]
- [[Don't Auto-Launch Services]]
