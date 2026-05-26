---
tags: [skill]
aliases: [construction-trade-website-lifecycle, Contractor Site Lifecycle]
---
# Construction Trade Website Lifecycle

End-to-end workflow for shipping demand-gen marketing sites plus admin ops dashboards for small US construction-trade contractors (drywall, insulation, roofing, HVAC, electrical, plumbing, painting, flooring, masonry, GC subs). Reach for it when scaffolding or delivering a contractor build like a special-trade lead funnel or n8n-automated local SEO site.

## What it does
- Runs the full lifecycle: business-analyst audit → "Glass & Grit" UI build → deploy → ops handoff, with the agent running terminal/CLI steps autonomously (no asking the user to paste secrets or run manual steps).
- Standard stack: Next.js + Supabase + Vercel + n8n + Resend, with Supabase Storage for jobsite photo/reference-image uploads.
- Bakes in lead-gen fundamentals: SEO, local schema, reference images, contact forms wired to server actions + Resend, and tests before deploy.
- Includes a human-in-the-loop content-approval step so contractors review/approve generated content before it publishes.

## Used in / pairs with
- [[Coastal Lane 2026]] — luxury-contractor full-platform build that follows this lifecycle.
- [[Southern Drywall]] — the reference contractor build that the Glass & Grit system was forged on.
- [[n8n Content Approval Pipeline]] — the approval-gated automation layer this workflow plugs in.
- [[Supabase]] — data + Storage backend for leads, content, and uploads.
- [[Agency Build Playbook]] — the broader audit→build→deploy process this specializes for trades.

## Connections
- [[Skills MOC]]
- [[Coastal Lane 2026]]
- [[Southern Drywall]]
- [[n8n Content Approval Pipeline]]
- [[Supabase]]
- [[Agency Build Playbook]]
- [[Next.js 16]]
- [[Projects MOC]]
