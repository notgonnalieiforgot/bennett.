---
tags: [project]
aliases: [BENNETTMAIN, Bennett App]
status: in-progress
---
# Bennett

Bennett is the multi-surface application whose repository **is this `BENNETTMAIN` vault** — the project this Knowledge Graph lives inside. It is structured across multiple surfaces (apple / backend / web / shared) and is built phase-by-phase, with a deliberate caveat-revisit pass planned at the end.

## Snapshot
- **What:** Multi-surface app (Apple/native, backend, web, shared) built in numbered phases (1–8).
- **Stack:** [[Next.js 16]] (web surface), [[Supabase]] / Firebase-style backend services; shared layer across surfaces.
- **Repo / path:** the `BENNETTMAIN` repo (this vault's home) — `/Users/temek/Documents/BENNETTMAIN`.
- **Live URL:** internal / not yet a public marketing URL.
- **Status:** in-progress (phased build).

## Notes
- **Caveat punch list is the plan:** at "Phase 8 complete," compile a single consolidated list of every caveat, placeholder, and known limitation flagged across Phase 1–8 — that becomes the beta / post-launch update plan. Each phase's confirmation message has a "Caveats / decisions" section as the source.
- Tracked caveats so far include: Firebase config requirement, web env vars, Stripe Phase 4 wiring, module content hardcoded in two places, Founder auth = uid-equality (Phase 7 upgrade), iOS-only OAuth in-app webview deferred to Phase 7, shield-ignore counter is trailing-7-days not strict consecutive, marble streak placeholder, paywall CTA no-op until Phase 4, founder console publishes immediately without a separate reviewer.
- Bennett is meant to keep updating during beta testing and after launch — the caveat list is the punch list, not a pile of scattered TODOs.
- Dev identity for all Bennett work: GitHub `notgonnalieiforgot`, Vercel team `bennett-872566f5`, email pat@sidechained.net.

## Connections
- [[Projects MOC]] — category hub
- [[Knowledge Graph Home]] — this vault documents the Bennett project
- [[Supabase]] — backend / data layer
- [[Next.js 16]] — web surface framework
- [[Vercel]] — deploy target for the web surface
