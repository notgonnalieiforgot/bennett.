---
tags: [stack]
aliases: [Drizzle]
---
# Drizzle ORM

Typed TypeScript ORM providing the query layer and schema typing over Postgres. On the construction-trade builds it sits in front of [[Supabase]], with raw SQL migrations remaining the source of truth.

## Role in the stack
- The typed query layer for app code — type-safe selects/inserts feeding Server Actions in [[Next.js 16]].
- Coexists with hand-written SQL migrations: on Southern Drywall, `supabase/migrations` is the migration source of truth while Drizzle handles queries.
- Standard data layer in the [[Construction Trade Website Lifecycle]] stack alongside [[Supabase]] and [[Resend]].

## Used in
- [[Southern Drywall]] — Drizzle is the query layer over cloud [[Supabase]]; schema seeded via `npm run db:seed` (tsx).

## Connections
- [[Stack & Tools MOC]]
- [[Supabase]]
- [[Neon Postgres]]
- [[Next.js 16]]
- [[Construction Trade Website Lifecycle]]
