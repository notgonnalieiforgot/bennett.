---
tags: [skill]
aliases: [skill-creator, create-skill, create-rule, create-hook, update-config, keybindings-help, fewer-permission-prompts, init]
---
# Skill & Harness Authoring

The studio's self-extension layer — skills for creating, configuring, and maintaining the Claude Code harness itself rather than any client deliverable. Reach for it when the toolchain needs a new skill, hook, rule, or permission change, or when initializing a fresh project into the harness.

## What it does
- **skill-creator** — create, modify, and eval/benchmark skills; optimize descriptions for accurate triggering.
- **create-skill** — author Cursor Agent Skills following the SKILL.md structure.
- **create-rule** — create Cursor rules and AGENTS.md files for persistent AI guidance in a repo.
- **create-hook** — create Claude Code hooks that fire on harness lifecycle events.
- **update-config** — configure the harness via settings.json: hooks, permissions, and env vars.
- **keybindings-help** — customize keyboard shortcuts and keybindings.json.
- **fewer-permission-prompts** — scan transcripts and add an allowlist to settings to cut permission prompts.
- **init** — initialize a project for Claude Code with correct baseline configuration.

## Used in / pairs with
- [[Superpowers Plugin]] — process-discipline skills and harness configuration reinforce each other; TDD and parallel agents rely on hooks and permissions being correct.
- [[Sidechained Skills Library]] — the skills authored here feed the library; this cluster is the authoring side, the library is the distribution side.
- [[graphify]] — knowledge graph tooling was installed via this cluster; harness init and config are prerequisites for graphify to run.
- [[Reusable Build System]] — every new project benefits from correct harness initialization and studio-standard hooks; this cluster is what keeps the build system extensible.

## Connections
- [[Skills MOC]]
- [[Superpowers Plugin]]
- [[Sidechained Skills Library]]
- [[graphify]]
- [[Reusable Build System]]
- [[Agency Build Playbook]]
