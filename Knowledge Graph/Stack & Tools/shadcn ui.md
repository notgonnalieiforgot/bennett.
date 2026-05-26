---
tags: [stack]
aliases: [shadcn/ui, shadcn]
---
# shadcn ui

A component layer of Radix UI primitives styled with [[Tailwind v4]]. Components are copied into the project (not a dependency), and on Tailwind v4 builds they are often hand-rolled because the CLI is flaky.

## Role in the stack
- Accessible Radix primitives (dialogs, dropdowns, tables, forms) styled with Tailwind utilities and the project's `@theme` tokens.
- On Tailwind v4 the CLI is unreliable, so primitives are frequently hand-rolled; add via `npx shadcn@latest add <name>` when it cooperates.
- Provides the admin-dashboard UI surface and forms; quality bar enforced by the [[Frontend Design & Taste Skills]].

## Used in
- [[Southern Drywall]] — shadcn/ui hand-rolled for the admin ops dashboard on Tailwind v4.
- [[Twist Kava Cafe]] — admin shell + 10 CRUD sections (`components/admin/ui.tsx`, `AdminShell.tsx`).

## Connections
- [[Stack & Tools MOC]]
- [[Tailwind v4]]
- [[Next.js 16]]
- [[Frontend Design & Taste Skills]]
