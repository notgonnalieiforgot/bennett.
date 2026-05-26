---
tags: [principle]
aliases: ["Licensed Fonts Only", "No Aggregator Fonts"]
---
# No Pirated Fonts

Never download or embed commercial fonts from free-font aggregator sites (FontsHub.pro, dafont-style "@font-face download" sites) into the user's deployed/commercial websites — require a properly licensed web-font file.

## Why
- Aggregator sites redistribute commercial foundry fonts without license. Embedding the woff2 on a public site (served openly in CSS) is copyright infringement.
- Foundries actively pursue this — a real legal risk for the user's businesses.
- Same principle as flagging proprietary components (e.g., the LiquidMetal Framer component); the user respects IP flags.

## How to apply
- When the user wants a licensed/commercial font (e.g., Proto Mono, Nudica Mono), require a properly licensed web-font file from a foundry purchase or a Framer/host export, dropped into the repo's fonts dir.
- OR offer a free-for-commercial-use look-alike to ship now and swap later.
- Verify the download source before integrating. If it's an aggregator with no commercial license stated, flag it and don't embed.

## Bites in
- [[Frontend Design & Taste Skills]] — taste passes pick distinctive type; route every pick through a license check
- [[Landing-Page Motion Framework]] — reused motion landing pages must ship only licensed display/mono fonts

## Connections
- [[Principles MOC]]
- [[Frontend Design & Taste Skills]]
- [[Landing-Page Motion Framework]]
