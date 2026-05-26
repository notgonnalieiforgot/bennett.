---
tags: [skill]
aliases: [nextjs, next-forge, next-upgrade, next-cache-components, turbopack, routing-middleware, runtime-cache, web-artifacts-builder]
---
# Next.js Framework Skills

The full Next.js skill cluster covers App Router architecture, caching primitives, bundler config, and deployment-layer middleware. Reach for it whenever you are standing up a new Next.js project, upgrading an existing one, or squeezing performance out of rendering and caching strategies — it is the backbone of every agency client site in the stack.

## What it does
- **nextjs** — App Router expert: Server Components, Server Actions, layouts, data fetching, rendering strategies, deploy on Vercel.
- **next-forge** — production Next.js starter and monorepo conventions for consistent project scaffolding.
- **next-upgrade** — upgrade Next.js versions following official migration guides and codemods.
- **next-cache-components** — Next.js 16 Cache Components: PPR, use cache, cacheLife, cacheTag, updateTag.
- **turbopack** — Next.js bundler config, HMR optimization, build debugging.
- **routing-middleware** — Vercel routing middleware: request interception, rewrites, redirects, personalization.
- **runtime-cache** — Vercel Runtime Cache API: ephemeral per-region KV cache with tag invalidation.
- **web-artifacts-builder** — builds standalone web artifacts that run outside the standard Next.js request cycle.

## Used in / pairs with
- [[Next.js 16]] — the runtime version this cluster targets; PPR, use cache, and Turbopack are all Next 16 features.
- [[Tailwind v4]] — default styling layer wired in at project scaffold time.
- [[Vercel]] — canonical deploy target; routing middleware and runtime cache are Vercel-specific primitives.
- [[Vercel Platform Skills]] — CLI, CI/CD, env-var management, and storage integrations that wrap the deploy side of every Next.js project.

## Connections
- [[Skills MOC]]
- [[Next.js 16]]
- [[Tailwind v4]]
- [[Vercel]]
- [[Vercel Platform Skills]]
- [[Performance, Testing & QA]]
- [[Agency Build Playbook]]
