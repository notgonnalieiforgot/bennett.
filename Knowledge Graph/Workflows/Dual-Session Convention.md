---
tags: [workflow, session-management, dual-session, tier-1, tier-2, tier-3]
aliases: ["Two-Session Model", "Frontend Backend Split", "Two-Terminal Build"]
created: 2026-05-30
---
# Dual-Session Convention

Every Sidechain build runs as **two concurrent Claude Code sessions against the same repo** — one in the `frontend` agent context (UI / pages / motion / copy), one in `backend-ai` (API / Supabase / AI / env / automation). Same GitHub repo, same `~/Code/<company>` folder, same git history; separate cognitive lanes. Default from T1; rebalances naturally as the tier escalates.

Canonical source: `~/.claude/CLAUDE.md → Dual-session convention`. A `SessionStart` hook at `~/.claude/hooks/dual-session-reminder.sh` reminds Pat to spawn the backend session every time `claude` launches from a Claude-configured project.

## Why
- T1 single-session is fine when the backend is one stub API route, but UI iteration and server iteration share the same scrollback, the same memory, the same "what we just touched."
- At T2 (CRM + n8n + Twilio approval queue + Supabase RLS) the contexts start interrupting each other.
- At T3 (auth, payments, Meta ads, admin) they're entirely different mental models.
- Two tabs cost almost nothing; preserved focus is worth a lot.

## Shape
1. **Same repo.** One `~/Code/<company>` folder, one git history. No code split.
2. **Two iTerm tabs**, each running `claude`:
   - `FE • <company>` — frontend session (UI agent).
   - `BE • <company>` — backend session (`backend-ai` agent).
   Set the tab label via `./scripts/label-session.sh FE|BE` (shipped in every project).
3. **File-ownership matrix** lives in each project's `CLAUDE.md` under `## Session layout`:
   - **Frontend owns:** `src/app/(marketing)/**`, `src/components/**`, `src/app/globals.css`, `public/`, `src/lib/site.ts`, `src/lib/content.ts`.
   - **Backend owns:** `src/app/api/**`, `src/lib/server/**`, `supabase/`, `.env*`, `next.config.ts`, `vercel.json`, `src/middleware.ts`, any n8n / Twilio / Resend config.
   - **Shared (rebase to merge):** `package.json` / `package-lock.json`, `CLAUDE.md`, `PROJECT-CONTEXT.md`, `.agents/product-marketing.md`.
4. **Coordination protocol:**
   - Both push to `main`.
   - Always `git pull --rebase` before commit.
   - Stage by owned path (`git add src/app/api/...`), never `git add -A` if there's uncommitted out-of-lane work.
   - Out-of-lane edit needed → leave a `TODO(handoff)` comment and let the owning session apply.
   - Shared-file race (`package.json`): rebase resolves; loser re-runs install.

## How to launch both sessions (Cursor — primary)

```bash
cursor ~/<project>       # open the project folder in Cursor
```

In Cursor:
1. Open the integrated terminal: **Ctrl+`** (or View → Terminal).
2. Pane 1 (frontend): `./scripts/start.sh FE`
3. Split the pane: **Cmd+\\** (or click the split icon).
4. Pane 2 (backend): `./scripts/start.sh BE`

`scripts/start.sh` (shipped per project) labels the tab via `label-session.sh`, exports `SIDECHAIN_SESSION=FE|BE`, and execs `claude`. The `~/.zshrc` alias `alias claude='claude --permission-mode plan'` makes every launch open in plan mode — Shift+Tab still cycles modes inside the running session.

Then in the BE pane, paste as the first message:
> Use the `backend-ai` agent. Project: `<company>`. Tier: T1. Repo: `<path>`. See `CLAUDE.md → Session layout` for owned paths.

Pat starts the backend `claude` himself so the harness sees an explicit entry — the frontend doesn't auto-start it.

**iTerm fallback** — if Pat skips Cursor and runs `./scripts/start.sh FE|BE` from iTerm directly, everything works the same way (the helper is terminal-agnostic).

## Tier scaling
| Tier | Frontend load | Backend load |
|---|---|---|
| **T1 — Foundation** | heavy (marketing site, motion, copy, tokens) | light (one lead-engine stub route, env vars) |
| **T2 — Growth Engine** | medium (CRM dashboard UI, approval-queue screens) | medium-heavy (Supabase + n8n + Twilio + Resend) |
| **T3 — Revenue Engine** | medium (admin UI, content review screens) | heavy (auth, payments, Meta ads automation, content pipeline) |

The structure does not change across tiers; only the workload distribution shifts.

## Applied in
- [[Sidechain 2026]] — the first project to fully adopt this convention. Helper at `scripts/label-session.sh`, ownership matrix in the project `CLAUDE.md → Session layout`.
- All future Tier-1+ builds via [[Sidechain Sprint v2 — Velocity Mode]] (auto-spawns the backend tab in the bootstrap phase).

## Connections
- [[Workflows MOC]]
- [[Agency Build Playbook]] — Phase 3.5 references this convention.
- [[Sidechain Sprint v2 — Velocity Mode]] — bakes the backend-spawn step into the 40-minute clock.
- [[Project Handoff Playbook]]
