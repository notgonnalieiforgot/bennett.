---
tags: [skill]
aliases: [vercel-cli, deployments-cicd, vercel-functions, vercel-storage, marketplace, ai-gateway, env-vars, bootstrap, workflow, auth]
---
# Vercel Platform Skills

The full Vercel platform skill cluster covers the entire deployment surface: CLI operations, CI/CD pipelines, serverless and edge functions, storage integrations, Marketplace provisioning, AI model routing, durable workflows, and auth. Reach for it whenever you are wiring up or operating a project on Vercel beyond a simple `git push` deploy.

## What it does
- **vercel-cli** — deploy, manage env vars, link projects, view logs, manage domains from the CLI.
- **deployments-cicd** — deploy/promote/rollback, --prebuilt builds, CI workflow files.
- **vercel-functions** — Vercel serverless and edge functions: routing, runtime selection, region config.
- **vercel-storage** — Blob, Edge Config, and Marketplace storage (Neon Postgres, Upstash Redis).
- **marketplace** — discover, install, and build Vercel Marketplace integrations with auto-provisioned env vars.
- **ai-gateway** — model routing, provider failover, and cost tracking through one unified API endpoint.
- **env-vars** — environment-variable management, naming conventions, and secret scoping across environments.
- **bootstrap** — safe ordering for repos that depend on Vercel-linked resources: link, provision, env pull, first run.
- **workflow** — Vercel Workflow DevKit: durable, crash-safe pause/resume orchestration for long-running jobs.
- **auth** — Clerk/Descope/Auth0 auth integration for Next.js via Marketplace one-click provisioning.

## Used in / pairs with
- [[Vercel]] — the platform these skills operate; all primitives here are Vercel-specific.
- [[Neon Postgres]] — primary Marketplace storage integration provisioned through vercel-storage.
- [[Next.js Framework Skills]] — the application layer that these platform skills deploy and back-end.
- [[AI SDK & Agent Building]] — ai-gateway pairs with the AI SDK to route model calls across providers with cost controls.

## Connections
- [[Skills MOC]]
- [[Vercel]]
- [[Neon Postgres]]
- [[Next.js Framework Skills]]
- [[AI SDK & Agent Building]]
- [[Agency Build Playbook]]
- [[Cloudflare Pages Env-Var Traps]]
