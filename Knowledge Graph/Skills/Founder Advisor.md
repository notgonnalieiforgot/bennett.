---
tags: [skill, agent]
aliases: [founder-advisor, Founder Decision Agent, Mission Filter Agent]
status: live
---
# Founder Advisor

A custom Claude Code subagent that filters every future-project decision through Pat Bennett's documented mission, non-negotiables, and decision filters. Returns a structured verdict (GO / WAIT / DECLINE) for any priority, tradeoff, scope, or strategy call — so Pat gets the highest-leverage truth without burning a deep-work block on deliberation.

## Where it lives
- **Agent definition:** `~/.claude/agents/founder-advisor.md` (global; available in every Claude Code session, any project directory).
- **Always-on memory:** `founder_pat_bennett_mission` at `~/.claude/projects/-Users-temek/memory/founder_pat_bennett_mission.md` — auto-loaded by Claude every session, gives the agent (and the base Claude) the operational essence of the mission.
- **Source doc:** [[Pat Bennett — Mission & Non-Negotiables]] (this vault) + `~/Downloads/MY GOALS AND DELUSIONAL BELIEFS OF SUCCESS.md` (original).

## When it triggers
Activates for any decision-shaped question — explicit or implicit:
- "Should I take this client?"
- "What should I work on next?"
- "Is this worth my time?"
- "How does this serve the mission?"
- Tier decisions (T1 / T2 / T3) on a new engagement.
- Sacrifice analysis (skip gym for demo, drop freelance for SideChain push, etc.).
- Weekly review or quarterly priority rebalancing.

Invoke explicitly via "founder-advisor: <question>" or let the base Claude apply the mission filters automatically using the loaded memory.

## The 9 filters (applied in order)
1. **Mission alignment** — moves toward $10M/yr + mom's retirement (52 → before 60)?
2. **Tier fit** — T1 (Velocity Mode), T2 (Supabase + n8n lead engine), T3 (full ops + admin)?
3. **Craft vs money** — does it force corner-cutting? (Craft wins.)
4. **Time cost** — protects highest-leverage hours?
5. **Sustainability** — respects 6:30 AM + gym + sleep floor?
6. **Faith filter** — integrity red flags?
7. **Output today** — what's the needle-mover in the next deep-work block? (No zero days.)
8. **Sacrifice ledger** — what's traded; worth the long-term freedom?
9. **Delegation** — can Dalton or a SIKWENS automation carry it instead of Pat?

## Output shape
- **Verdict:** GO / WAIT / DECLINE + one-sentence reason.
- **Tier fit:** T1 / T2 / T3 / N/A.
- **Top risk:** the single biggest failure mode.
- **Next move:** one concrete action in the next 24 hours.
- **Trade:** what gets sacrificed if Pat says yes.

## Why it matters
SideChain's edge is execution speed (45–60 min demos, 1–2 hr setups). Decision speed has to match — but every YES costs gym time, sleep, focus, or money on the table. The agent compresses Pat's filters into a 30-second structured answer so he never burns deep-work hours on deliberation, and every commitment is checked against the mission, the non-negotiables, and mom's retirement deadline before it lands.

## Connections
- [[Skills MOC]] — category hub
- [[Pat Bennett — Mission & Non-Negotiables]] — the source of truth this agent applies
- [[Goals MOC]] — what the filters point at
- [[Sidechain 2026]] — the vehicle the mission is built around
- [[Agency Starter]] — the reusable build system that makes T1 execution match decision speed
- [[Sidechained Skills Library]] — the broader Claude Code skill layer this agent extends
- [[Skill & Harness Authoring]] — how custom agents like this get authored
- [[Communication Tone]] — voice rule the agent follows
- [[Project Handoff Playbook]] — the closing discipline this agent steers toward
