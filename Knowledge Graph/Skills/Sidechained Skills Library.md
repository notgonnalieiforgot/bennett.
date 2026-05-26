---
tags: [skill]
aliases: [sidechainedskills, Sidechained Skills Repo]
---
# Sidechained Skills Library

The user's personal skill-library repo (`notgonnalieiforgot/sidechainedskills` at `~/Code/sidechainedskills`) that aggregates Agent Skills for website builds and integrations, then gets copied into `~/.claude/skills/` for use in Claude Code. Reach for it as the canonical source when adding or refreshing the toolchain.

## What it does
- Aggregates skills under `user/` (custom), `anthropics/` (official), `cursor-builtin/`, and `cursor-plugins/{vercel,supabase,aws-serverless}/`.
- Install convention: **copy** each skill dir into `~/.claude/skills/<name>/` as a top-level folder. Claude Code only auto-discovers one level deep, so nested `cursor-plugins/<vendor>/<skill>` folders must be flattened.
- Skip names that collide with already-active skills (e.g. `claude-api`); newly copied skills are picked up on the next session, not the current one.
- As of 2026-05-20, ~41 skills were installed this way, bringing `~/.claude/skills/` to ~50 total.

## Used in / pairs with
- [[graphify]] — one of the globally installed tools alongside this library's skills.
- [[Agency Build Playbook]] — also lives in this repo (`AGENCY-PLAYBOOK.md`) as the reusable build reference.
- [[Reusable Build System]] — the library is the asset store that makes builds repeatable across companies.
- [[Superpowers Plugin]] — among the process skills installed from / alongside this library.

## Connections
- [[Skills MOC]]
- [[graphify]]
- [[Agency Build Playbook]]
- [[Reusable Build System]]
- [[Superpowers Plugin]]
- [[Knowledge Graph Home]]
