---
tags: [project]
aliases: [Southern Drywall LLC, southern-drywall]
status: live
---
# Southern Drywall

Marketing site + admin operations dashboard for **Southern Drywall LLC** (Chattanooga TN drywall + insulation, owner Dusty Nelson, in business since 2010). Includes an n8n-driven content pipeline with a human approval queue before anything publishes.

## Snapshot
- **What:** Demand-gen marketing site + admin ops dashboard with an approval-gated autonomous content pipeline.
- **Stack:** [[Next.js 16]] (App Router) · React 19 · Tailwind v4 · hand-rolled shadcn/ui · [[Supabase]] + Drizzle · Resend · Leaflet · [[Vercel]] · [[n8n Content Approval Pipeline]].
- **Repo / path:** `southern-drywall` → `~/Code/southern-drywall` (relocated off iCloud).
- **Live URL:** https://southern-drywall.vercel.app (static marketing site fully live).
- **Status:** live (forms/admin DB pending pooler fix).

## Notes
- Built via the [[Construction Trade Website Lifecycle]] skill: 12-step build order, user reviews between steps. Design system "Glass & Grit" — orange `#F26A1A`, Fraunces/Inter/JetBrains Mono, glass primitives + sitewide grain.
- **Prod caveat:** forms + admin DB calls fail until `DATABASE_URL` switches from the IPv6 direct Supabase host to the IPv4 **pooler** string (Vercel serverless has no IPv6 egress) — needs the exact pooler host from the dashboard.
- DB is cloud [[Supabase]] (local Docker abandoned — disk full): 7 tables + 11 enums, RLS on all, `is_admin()` helper, updated_at triggers. Drizzle is the query layer; Supabase SQL migrations are the source of truth.
- Content pipeline is hard-gated: **no auto-publish without `content_drafts.status='approved'`**. All `/api/n8n/*` webhooks require `x-n8n-secret` + rate-limit + `webhook_log` audit. SMS deferred to v1.1 (email-only, `lib/notify` abstracted).
- Voice: warm, direct, slightly Southern, never corporate — references Chattanooga + Hixson/East Ridge/Red Bank/Ringgold/Fort Oglethorpe.

## Connections
- [[Projects MOC]] — category hub
- [[Construction Trade Website Lifecycle]] — the end-to-end build workflow this exemplifies
- [[n8n Content Approval Pipeline]] — the approval-gated autonomous content system
- [[Supabase]] — database + RLS + auth layer
- [[Next.js 16]] — framework
- [[Vercel]] — hosting and deploy target
- [[Coastal Lane 2026]] — sibling construction-trade build
- [[Build Off iCloud]] — why the repo moved from Desktop to `~/Code`
