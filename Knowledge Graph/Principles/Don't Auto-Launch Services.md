---
tags: [principle]
aliases: ["No Auto-Launch", "Don't Auto-Launch on Session Start"]
---
# Don't Auto-Launch Services

On a fresh session start, do NOT preemptively start servers, open browsers, deploy, or restore prior project state — output a short status, then stop and wait for explicit instruction.

## Why
- The user said so directly (2026-05-12): don't relaunch when he brings the terminal back up, "unless specified."
- This came after a session left a Python http server on port 8765 plus several deployed services running. He wanted *control* over when those came back, not for the assistant to recreate prior state on assumption.
- Loading memory and saying "ready when you are" is fine. Acting on memory without instruction is not.

## How to apply
- On any fresh session start, even when memory shows a clearly resumable workflow, output a short status (what the project is, what's deployed, what's pending) and stop.
- Do NOT automatically: start a local dev server, `open` a URL, restart dead background processes, or run `vercel` / `gh` / `git push` / any deploy command.
- Phrase as an offer — "Want me to start the local server?" — never "Starting the local server now."
- Applies to all of the user's projects, not just one.

## Bites in
- [[Vercel]] — never fire a deploy on session start; wait to be told
- [[Next.js 16]] — don't auto-run `next dev` or `next build` just because memory says the server was up

## Connections
- [[Principles MOC]]
- [[Vercel]]
- [[Next.js 16]]
