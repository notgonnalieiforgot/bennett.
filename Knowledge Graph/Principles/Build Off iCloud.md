---
tags: [principle]
aliases: ["No iCloud-Synced Project Paths", "Scaffold Under ~/Code"]
---
# Build Off iCloud

Scaffold Node/Next.js projects under `~/Code` (or `~/Projects`), never under `~/Desktop` or `~/Documents`, because iCloud Drive's "Desktop & Documents" sync makes `next`/`node` commands hang silently.

## Why
- The Mac has iCloud Drive "Desktop & Documents" sync enabled, so the fileprovider daemon intercepts `read()` syscalls on dataless files and the kernel call never returns.
- Every Next.js command (`next --version`, `next dev`, `next build`) hangs at 0% CPU after a few lines of init output — with *no* error surfaced, even when no `.icloud` placeholder is visible.
- Confirmed empirically: a project that hangs at `~/Desktop/southern-drywall` runs in seconds when copied to `/tmp/` (the hung process was stuck in `node::fs::ReadFileUtf8 → uv_fs_read → read()`).
- This is dangerously easy to misdiagnose as a code bug; it's an environment trap.

## How to apply
- Default new scaffolds to a non-iCloud path: `~/Code/<project>` or `~/Projects/<project>`.
- If the user insists on a Desktop/Documents path, surface the iCloud risk *before* scaffolding.
- If a Node CLI silently hangs >30s with no output, suspect iCloud first. Diagnose with `sample <pid> 2` — a stack showing `read()` blocked under `uv_fs_read` confirms it.
- For existing Desktop projects: move the working dir to `/tmp/<project>` for builds, or exclude the folder from iCloud sync.

## Bites in
- [[Coastal Lane 2026]] — Desktop-pathed; vulnerable to the silent-hang trap on any Node build
- [[Coastal Lane (Static Site)]] — static output sidesteps it, but the source tree still lives in a synced path
- [[Next.js 16]] — `next dev` / `next build` are exactly the commands that hang under iCloud

## Connections
- [[Principles MOC]]
- [[Next.js 16]]
- [[Coastal Lane 2026]]
- [[Coastal Lane (Static Site)]]
