---
tags: [principle]
aliases: ["Cloudflare Pages Env Gotchas"]
---
# Cloudflare Pages Env-Var Traps

When env vars "don't work" for a Cloudflare Pages Function, the cause is almost always one of three traps — and the user-visible symptom ("Missing X env var") is identical for all of them, so diagnose, don't guess.

## Why
- The three failure modes produce the *same* error message, so trial-and-error never converges.
- Each one burned ~15 minutes during the Coastal Lane GitHub-OAuth-for-Decap setup.

## The three traps
1. **"Retry deployment" reuses the OLD env-var snapshot.** Adding/editing a var in the dashboard does NOT propagate to running deployments; "Retry deployment" rebuilds with the *original* binding. Bind a new value with a fresh build: `git commit --allow-empty -m "..." && git push`.
2. **Pasted variable names smuggle invisible whitespace.** The dashboard treats ` GITHUB_CLIENT_ID ` (with spaces) as a different key than `GITHUB_CLIENT_ID`, so `env.GITHUB_CLIENT_ID` sees nothing. Type variable *names* manually; only paste *values*.
3. **GitHub OAuth client secrets get pasted truncated.** GitHub shows the secret as `xxx…yyy`; users copy what's visible. Real OAuth App secrets are exactly 40 chars — verify length before saving.

## How to apply
- Write a temporary diagnostic endpoint returning `Object.keys(env)` and `String#length` of the suspected var (never its value). That instantly separates "not bound at all" from "bound under a wrong name" from "bound but truncated."
- After the fix, force a fresh deploy with an empty commit; never trust "Retry deployment" alone.

## Bites in
- [[Cloudflare Pages]] — these are platform-level binding behaviors, not app bugs
- [[Coastal Lane (Static Site)]] — discovered here wiring GitHub OAuth for Decap CMS

## Connections
- [[Principles MOC]]
- [[Cloudflare Pages]]
- [[Coastal Lane (Static Site)]]
