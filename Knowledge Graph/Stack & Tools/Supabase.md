---
tags: [stack]
aliases: [Supabase Postgres]
---
# Supabase

Cloud Postgres plus Auth, Storage, and Row Level Security — the backing data platform for ops dashboards. It is the system of record for admin-side content and lead data on construction-trade builds.

## Role in the stack
- Managed Postgres with RLS on every table, an `is_admin()` helper, and `updated_at` triggers; SQL migrations in `supabase/migrations` are the migration source of truth.
- Storage handles reference-image and asset uploads for content workflows.
- Queried at runtime through [[Drizzle ORM]] (Drizzle is the typed query layer; Supabase SQL owns migrations).
- Receives drafted content from the [[n8n Content Approval Pipeline]] and gates publishing on `content_drafts.status='approved'`.
- Vercel serverless has no IPv6 egress, so prod `DATABASE_URL` must use the IPv4 **transaction pooler** string, not the direct host.

## Used in
- [[Southern Drywall]] — cloud Supabase (project ref `fomyarizywyvionoupvb`), 7 tables + 11 enums, RLS everywhere, seeded via `npm run db:seed`.

## Connections
- [[Stack & Tools MOC]]
- [[Drizzle ORM]]
- [[n8n]]
- [[n8n Content Approval Pipeline]]
- [[Resend]]
- [[Construction Trade Website Lifecycle]]
- [[Next.js 16]]
