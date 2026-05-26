---
tags: [skill]
aliases: [graphifyy]
---
# graphify

Turns any input — code, docs, papers, images, video — into a navigable knowledge graph. Reach for it whenever you need to understand a codebase or project at a glance, or to query a body of work conversationally. It is the engine behind this very vault.

## What it does
- Ingests any source (a repo, a folder of docs, mixed media) and emits a `graphify-out/` graph of nodes + relationships.
- `graphify .` builds the graph; `graphify update .` refreshes it after edits using AST-only diffing (no API cost on updates).
- Once `graphify-out/` exists, plain questions about the project are treated as graph queries — fast retrieval over a structured map instead of re-reading raw files.
- Installed globally into Claude Code (skill at `~/.claude/skills/graphify/SKILL.md`, trigger `/graphify` in `~/.claude/CLAUDE.md`), so it is available in every session.
- Distributed as PyPI package `graphifyy`, installed via `uv tool install graphifyy` (repo `safishamsi/graphify`).

## Used in / pairs with
- [[Knowledge Graph Workflow]] — graphify is the build step that produces the graph this vault is modeled on.
- [[Visual Knowledge Graph]] — the rendered, link-driven view that graphify output feeds.
- [[Sidechained Skills Library]] — graphify is one of the globally installed tools in the user's skill toolchain.
- [[Landing-Page Motion Framework]] — query the project graph first to confirm which motion pieces apply before reusing them.
- [[Agency Build Playbook]] — used during audits to map an existing site/repo before deciding what to rebuild.

## Connections
- [[Skills MOC]]
- [[Knowledge Graph Workflow]]
- [[Visual Knowledge Graph]]
- [[Sidechained Skills Library]]
- [[Knowledge Graph Home]]
