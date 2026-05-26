---
tags: [stack]
aliases: [Cloudflare Pages, Pages Functions]
---
# Cloudflare Pages

Static hosting plus Pages Functions, used for framework-free static sites. It is the canonical host for the static Coastal Lane build, where a Pages Function also runs the CMS OAuth proxy.

## Role in the stack
- Hosts static HTML/CSS/JS with no build step; every push to `main` auto-deploys in ~30–60s.
- **Pages Functions** run server-side glue — e.g. the Decap CMS GitHub OAuth proxy at `functions/oauth/[[path]].js` reading `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` (Production scope).
- Distinct from older Cloudflare Workers deploys, where Pages Functions in `/functions/` are NOT auto-executed.
- Env-var handling has sharp edges documented in [[Cloudflare Pages Env-Var Traps]] (whitespace smuggling, truncated OAuth secrets, stale retry snapshots).

## Used in
- [[Coastal Lane (Static Site)]] — canonical live site `clsc.pages.dev` (project `clsc`), auto-deploying from `notgonnalieiforgot/coastal-lane-static`; Decap CMS edits commit to `main` → Pages redeploys.

## Connections
- [[Stack & Tools MOC]]
- [[Coastal Lane (Static Site)]]
- [[Cloudflare Pages Env-Var Traps]]
- [[Vercel]]
- [[GSAP Lenis Framer Motion]]
