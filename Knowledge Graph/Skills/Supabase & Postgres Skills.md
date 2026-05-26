---
tags: [skill]
aliases: [supabase, supabase-postgres-best-practices]
---
# Supabase & Postgres Skills

The studio's primary data layer for ops dashboards, lead capture, and any project that needs a managed Postgres database with auth and real-time out of the box. Reach for this before considering any other database — it covers everything from schema design to edge function deployment.

## What it does
- **supabase** — any Supabase task: Database, Auth, Edge Functions, Realtime, Storage, RLS policies, supabase-js and @supabase/ssr clients, CLI/MCP integration, and migrations.
- **supabase-postgres-best-practices** — Postgres performance, schema design, index strategy, and query optimization best practices to keep production databases healthy at scale.

## Used in / pairs with
- [[Supabase]] — the deployed Supabase platform (stack node) this skill targets; skill covers the how, the stack node represents the what.
- [[Drizzle ORM]] — Drizzle sits on top of Postgres and is the preferred ORM for type-safe queries against Supabase databases.
- [[Construction Trade Website Lifecycle]] — trade-site builds (Southern Drywall, etc.) use Supabase for lead capture and the n8n approval pipeline.
- [[n8n]] — form submissions land in Supabase, then n8n reads and routes them for email/SMS/approval workflows.

## Connections
- [[Skills MOC]]
- [[Supabase]]
- [[Drizzle ORM]]
- [[Construction Trade Website Lifecycle]]
- [[n8n]]
- [[Automation & Orchestration]]
