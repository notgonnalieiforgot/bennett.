---
tags: [skill]
aliases: [loop, schedule, babysit, split-to-prs]
---
# Automation & Orchestration

This cluster handles in-Claude-Code automation: recurring prompt loops, scheduled remote agents, long-process supervision, and structured PR decomposition. It is distinct from n8n, which remains the standard for production website automations (email, SMS, marketing pipelines). Reach for this cluster when the automation lives inside the development workflow itself rather than on a client-facing backend.

## What it does
- **loop** — run a prompt or slash command on a recurring interval, or let the model self-pace between iterations.
- **schedule** — create and manage scheduled remote agents (cron routines), including one-time future runs.
- **babysit** — supervise long-running processes and PR pipelines; surface blockers without constant manual polling.
- **split-to-prs** — decompose a large body of work into multiple focused, reviewable pull requests.

## Used in / pairs with
- [[n8n]] — production automation counterpart; Claude Code automation handles dev-loop tasks while n8n owns all live website trigger/action pipelines.
- [[n8n Content Approval Pipeline]] — the specific n8n workflow that approval-gates AI-generated content before publish; pairs with schedule for timed content runs.
- [[Superpowers Plugin]] — the broader harness that loop, schedule, and babysit operate within; superpowers skills govern planning, branching, and execution context.

## Connections
- [[Skills MOC]]
- [[n8n]]
- [[n8n Content Approval Pipeline]]
- [[Superpowers Plugin]]
- [[AI SDK & Agent Building]]
- [[Agency Build Playbook]]
