---
tags: [workflow]
aliases: ["Content Approval Queue", "Human-in-the-Loop Content Pipeline"]
---
# n8n Content Approval Pipeline

A human-in-the-loop content pipeline: [[n8n]] drafts blog, social, email, and campaign content, which lands in an admin approval queue in the dashboard, and nothing publishes until it is explicitly approved. Hard-enforced — no auto-publish without `content_drafts.status='approved'`.

## Steps / shape
1. **n8n drafts** content (blog / social / email / campaign) autonomously.
2. **Inbound webhook** hits `/api/n8n/*` — every webhook requires an `x-n8n-secret` header, rate limiting, and a `webhook_log` audit row.
3. Draft is stored with `status='pending'` in `content_drafts`.
4. **Admin reviews** the draft in the dashboard approval queue.
5. **Approval** flips status to `approved`; only then can it publish. Lead status changes also fire webhooks for downstream automation.
6. **Publish + notify** via [[Resend]] (email-only in v1; `lib/notify` abstracted so SMS/A2P can swap in for v1.1).

## Applied in
- [[Southern Drywall]] — 12-step build with this approval queue gating every n8n-drafted piece; [[Supabase]] holds `content_drafts` (7 tables, RLS, `is_admin()` helper).

## Connections
- [[Workflows MOC]]
- [[Southern Drywall]]
- [[Construction Trade Website Lifecycle]]
- [[n8n]]
- [[Resend]]
- [[Supabase]]
