---
tags: [workflow, velocity, tier-1]
aliases: ["Velocity Mode", "Sidechain Sprint v2", "40-Minute Sprint"]
created: 2026-05-25
---
# Sidechain Sprint v2 — Velocity Mode

Compressed 40-minute Tier-1 build workflow that ships a deployed, animated marketing site for a new company in 30–60 minutes (4-hour playbook compressed ~6x). Layered on top of the [[Agency Build Playbook]] — uses the same quality bar (SIDECHAIN motion stack, Higgsfield assets, premium tokens) but pre-bakes the repeatable 70% into a starter template and parallelizes the slow per-project work.

> **Scope:** Tier 1 only — deployed animated marketing site with working contact form. Backend, n8n automation, Supabase, and admin dashboard are **gated behind the trigger phrase**: `T3 TRANSACTION COMPLETE FOR <name>`. Until that's said, no backend work runs.

## Why this exists

Past sprints (LH Training, Casa Azul, Optimum CP, Coastal Lane, etc.) reused ~70% of the same scaffolding work every time: Next 16 setup, Tailwind v4 tokens, GSAP/Lenis wiring, Framer module vendoring, `<Reveal>` pattern, mobile/dark-first defaults, `app/api/lead`, `vercel.json`, `.claude/agents`. That's 60–90 min of identical work per project. Velocity Mode moves it to a template and parallelizes the slow remainder (Higgsfield assets) so the main thread never waits.

---

## Architecture — three pieces

1. **`sidechain-starter`** — new private template repo under `notgonnalieiforgot/sidechain-starter`. Next 16 + Tailwind v4 + GSAP/Lenis + Framer shim + 5 vendored Framer modules (Crux-Cursor, DotMatrixSVG, PremiumGlowButton, TextPressure, Text-Scroll) + `<Reveal>` pattern + `useScrollTriggerSync` hook + `lib/site.ts` + `lib/content.ts` schemas + `app/api/lead` route + `.claude/agents/*` + curated `.claude/skills/`.
2. **`sidechain-velocity`** — new orchestrator skill at `~/.claude/skills/sidechain-velocity/SKILL.md`. Reads intake, runs the 40-min phase sequence, dispatches parallel sub-agents.
3. **`scripts/curate.py`** — Python PIL logo color sampling → brand tokens written → filename rename + Higgsfield prompt dispatch. One-shot per project.

---

## The 40-minute clock

| Min | Phase | What happens | Skills used |
|---|---|---|---|
| 0:00–0:05 | **Intake + scaffold** | 4-question intake max (company, vibe, palette source, primary CTA). `gh repo create <company>-site --template sidechain-starter --private --clone`. Logo sampled → tokens written. **Higgsfield batch dispatched as background agents (5–8 prompts).** | [[product-marketing]], [[brand]] |
| 0:05–0:15 | **Copy fill** | `lib/site.ts` + `lib/content.ts` populated: hero headline, section heads, CTA, partner names, ICP, sprint copy. | [[copywriting]], [[cro]], [[marketing-psychology]] |
| 0:15–0:25 | **Assets land + visual curation** | Higgsfield jobs → download → `cwebp -q 80` → `public/`. Hero + section images placed; palette finalized. | [[Higgsfield]] MCP, [[imagegen-frontend-web]] |
| 0:25–0:30 | **Polish + mobile** | Spot check mobile viewport (starter is already mobile-optimized). Max two manual tweaks. | [[mobile-audit-fix]] (only if broken) |
| 0:30–0:35 | **Verify** | `npx tsc --noEmit` ✓, `npm run build` ✓, local `npm run dev` smoke ping. | [[verification]] |
| 0:35–0:40 | **Deploy + live check** | `vercel link --project <company>-site --scope <team>`, `vercel --prod`, curl live URL 200. Emit `MINUTE-41-PLUS.md` polish list. | [[vercel-cli]], [[deployments-cicd]] |

---

## Parallelization plan

These run in **background agents** from minute 0 while the main thread builds:

- **Higgsfield image batch** — slowest dependency; must start at minute 0; lands by ~15–20.
- **`product-marketing` context doc** — lands by minute 3.
- **Copy generation** (single batched call: hero + sections + CTA) — minute 5–10.
- **Color sampling** (Python PIL) — lands by minute 1.

Main thread = orchestration + content placement + verify + deploy. **No serial waits on generations.**

---

## What lives in the starter vs. per-project

| In the starter (zero per-project work) | Per-project (curated each time) |
|---|---|
| Hero + 5 section layouts wired | Brand tokens (PIL-sampled from logo) |
| `<Reveal data-reveal>` GSAP+Lenis pattern | Copy in `lib/site.ts` + `lib/content.ts` |
| Sticky header, mobile menu, footer, `Loader`, `CustomCursor` | Hero + section images (Higgsfield) |
| `app/api/lead` w/ validation + honeypot | Logo file in `public/` |
| Framer shim + 5 vendored modules | Domain + Vercel project name |
| `tsconfig` paths, `vercel.json`, `next.config.ts` | `README.md` company facts |
| Mobile-first, dark-first, reduced-motion | |
| `.gitignore`, placeholder license | |
| `MINUTE-41-PLUS.md` template | |

---

## Fail-safes (clock keeps moving)

| Failure | Fallback |
|---|---|
| Higgsfield stalls past min 20 | Ship with placeholder slots; image manifest goes to `MINUTE-41-PLUS.md` |
| Logo color sample returns muddy hex | Use starter's default blue; flag in minute-41+ list |
| `tsc` or `build` fails at min 30 | Revert last commit; ship starter defaults for offending section |
| Vercel deploy fails | One retry; on second fail, surface error + skip live verify (still hand off repo) |
| Higgsfield out of credits | Fall back to [[image]] skill (Gemini) |

---

## "No distractions" rules (encoded in the skill)

- **4 questions max** at intake — no qualifying loop.
- **Zero mention of n8n / Supabase / admin** until `T3 TRANSACTION COMPLETE FOR <name>` is said.
- **Orchestrator picks skills**, doesn't ask the user mid-build.
- **One working doc**: `.claude/CURRENT-BUILD.md` (timer, phase, dispatched-agent IDs, asset-job statuses).
- **No audit doc / MRR doc during the 40 min** — those land in the post-deploy handoff package.

---

## Handoff (after the 40 min, not in the budget)

Same as established — see [[Project Handoff Playbook]]. Live URL + full audit + projected-MRR Google Doc with editor access to `pat@sidechained.net`. The 40-min window ends at "live URL verified 200."

---

## T3 unlock (post-Tier-1)

When the user sends `T3 TRANSACTION COMPLETE FOR <name>`:
1. Run qualifying questions for the backend/automation/content layer.
2. Walk the user through the integration plan and intent.
3. Then execute the backend build (Supabase + [[n8n Content Approval Pipeline]] + Resend/Twilio + admin dashboard) per the company's needs.
4. This is a separate billable engagement — NOT part of the 40-min Tier 1 sprint.

---

## Validation against past projects

| Past project | Tier | Velocity Mode fit? |
|---|---|---|
| [[LH Training]] | 1 | ✅ Single-product fitness landing — near-zero deviation from starter |
| [[Casa Azul]] | 1 | ✅ Coffee/churro landing, well within budget |
| [[Optimum Apartment Solutions]] | 1 + Higgsfield | ✅ Higgsfield is the only timing risk — parallelization fixes it |
| [[Coastal Lane]] (static) | 1 | ✅ Trivial |
| [[Twist Kava Cafe]] | 1 → +backend | ⚠️ Marketing site in 40 min ✅; Postgres seed = T3-gated |
| [[Southern Drywall]] / [[Clockwork Skateshop]] / [[Chained Aminos]] | full platform | ❌ Outside Tier 1 — T3-gated by design |

Every Tier-1-only project from the project graph fits this workflow. Tier-1+ projects ship the marketing site in 40 min, then unlock backend with `T3 TRANSACTION COMPLETE`.

---

## Connections

- [[Workflows MOC]]
- [[Agency Build Playbook]] — parent process; Velocity Mode is its compressed Tier-1 variant.
- [[Landing-Page Motion Framework]] — what's pre-baked in the starter.
- [[Project Handoff Playbook]] — what runs after the 40 min ends.
- [[n8n Content Approval Pipeline]] — the T3-gated automation layer.
- [[Higgsfield]] — primary asset generator, parallelized in min 0.
- [[Knowledge Graph Workflow]] — where this lives long-term.
