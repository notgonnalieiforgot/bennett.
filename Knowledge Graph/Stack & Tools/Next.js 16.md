---
tags: [stack]
aliases: [Next 16, Next.js, App Router]
---
# Next.js 16

The primary application framework across the studio — Next.js 16 (App Router, React 19, Turbopack default). It is the default scaffold for every marketing site, ops dashboard, and animated landing page Bennett ships.

## Role in the stack
- App Router with React 19 Server Components and Server Actions as the data-mutation layer (CRUD via Server Actions + `revalidatePath` keeps public pages in sync).
- Next 16 specifics in play: Turbopack is the default bundler, `proxy.ts` replaces `middleware.ts`, and route `params` are async.
- Built-in SEO infra used heavily: JSON-LD per page type, `sitemap`, `robots`, and dynamic OG images via `next/og`.
- Pairs with [[Tailwind v4]] for styling and almost always deploys to [[Vercel]].

## Used in
- [[Coastal Lane 2026]] — Next.js variant of the Coastal Lane build (the canonical live version is the [[Coastal Lane (Static Site)]] on [[Cloudflare Pages]]).
- [[Optimum Apartment Solutions]] — animated Denver turnover/maintenance landing page.
- [[Southern Drywall]] — Next 16.2.6 marketing site + admin ops dashboard.
- [[Chained Aminos]] — headless-Woo revamp on Next 16.
- [[LH Training]] — Coach Lou fitness landing page (Next 16).
- [[Sidechain 2026]] — flagship agency site (Next 16 + R3F + motion stack).
- [[Twist Kava Cafe]] — Next 16.2 cafe site + admin (Turbopack, `proxy.ts`, async `params`).
- [[Johnny's Smoke Shop]] — Next 15 build (predates the Next 16 default; PostCSS must stay CJS).

## Connections
- [[Stack & Tools MOC]]
- [[Vercel]]
- [[Tailwind v4]]
- [[shadcn ui]]
- [[Drizzle ORM]]
- [[Construction Trade Website Lifecycle]]
- [[Landing-Page Motion Framework]]
