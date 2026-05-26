---
tags: [stack]
aliases: [n8n automation]
---
# n8n

Self-hostable workflow automation engine that drives the content and lead pipelines via webhooks. It drafts blog/social/email/campaign content for human review before anything goes live.

## Role in the stack
- Generates and queues drafted content (blog, social, email, campaign) into [[Supabase]] for approval — nothing auto-publishes without `content_drafts.status='approved'`.
- Talks to the app over inbound `/api/n8n/*` webhooks, each requiring an `x-n8n-secret` header plus rate-limit and `webhook_log` audit.
- Triggers [[Resend]] sends only after content clears the approval gate.
- The automation backbone of the [[n8n Content Approval Pipeline]] and the [[Construction Trade Website Lifecycle]] playbook.

## Used in
- [[Southern Drywall]] — n8n-drafted content flows into the admin approval queue; hard-enforced human-in-the-loop before publish.

## Connections
- [[Stack & Tools MOC]]
- [[n8n Content Approval Pipeline]]
- [[Supabase]]
- [[Resend]]
- [[Construction Trade Website Lifecycle]]
- [[Next.js 16]]
