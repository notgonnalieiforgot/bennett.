---
tags: [stack]
aliases: [Resend Email]
---
# Resend

Transactional email provider for lead notifications and customer auto-replies. It is the email leg of the construction-trade lead funnel, abstracted behind a `lib/notify` layer so SMS can swap in later.

## Role in the stack
- Sends lead-notification emails to the contractor and auto-reply confirmations to the prospect when a form is submitted.
- Wired through a `lib/notify` abstraction (email-only in v1; A2P/SMS deferred to v1.1 with the same interface).
- Carries approved content out of the [[n8n Content Approval Pipeline]] — email drafts only publish once marked approved in [[Supabase]].
- Standard email leg in the [[Construction Trade Website Lifecycle]] stack (Next.js · Supabase · Vercel · n8n · Resend).

## Used in
- [[Southern Drywall]] — Resend handles lead notify + auto-reply; integrated with the n8n approval queue.

## Connections
- [[Stack & Tools MOC]]
- [[n8n]]
- [[n8n Content Approval Pipeline]]
- [[Supabase]]
- [[Construction Trade Website Lifecycle]]
- [[Vercel]]
