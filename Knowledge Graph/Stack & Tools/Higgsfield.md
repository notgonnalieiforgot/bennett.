---
tags: [stack]
aliases: [Higgsfield AI, Higgsfield MCP]
---
# Higgsfield

AI image and video generation accessed via MCP (through the claude.ai HIGGSFIELD connector). It produces bespoke site assets — environment plates, per-section visuals, and frame-sequence source video — curated to each project's product imagery.

## Role in the stack
- Generates network/environment plates, studio-lit HDRI-style backdrops, per-section visuals, and dispersion video later sliced into a frame sequence.
- Source for the scroll-scrubbed frame sequences in the [[Scroll Motion - Higgsfield Exploded]] workflow (e.g. a dispersing-logo `.mp4` → ffmpeg → WebP frames painted on canvas).
- Prompt formulas (network plate, studio HDRI, per-section visuals, dispersion video) are catalogued in the [[Agency Build Playbook]].
- Runs on the user's Higgsfield credits via Claude Code; Cursor agents without the MCP pull assets via manifest instead.

## Used in
- [[Sidechain 2026]] — dispersing-logo frame sequence + per-layer service-page backdrops (`public/env/layer-<slug>.jpg`).
- [[Optimum Apartment Solutions]] — site asset generation in the Industrial Premium motion build.
- [[Coastal Lane 2026]] — AI-generated imagery for the Coastal Noir editorial look.

## Connections
- [[Stack & Tools MOC]]
- [[Scroll Motion - Higgsfield Exploded]]
- [[GSAP Lenis Framer Motion]]
- [[Design Skill]]
- [[Agency Build Playbook]]
- [[Landing-Page Motion Framework]]
