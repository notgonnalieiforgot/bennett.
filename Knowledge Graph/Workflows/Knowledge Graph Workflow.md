---
tags: [workflow]
aliases: ["Graphify Workflow", "Vault Population"]
---
# Knowledge Graph Workflow

Using [[graphify]] to turn files, codebases, and projects into a navigable knowledge graph, and populating this Obsidian vault with richly cross-linked notes so the visual graph view grows. It runs whenever new project knowledge needs to be captured or queried.

## Steps / shape
1. **Feed input to [[graphify]]** — any source (code, docs, project memory) is processed into a graph (`graphify-out/`). Questions about a codebase or project content are treated as graphify queries.
2. **Author vault notes** — write clean Markdown notes per category (Projects, Skills, Goals, Principles, Stack & Tools, Workflows) using exact canonical titles.
3. **Link liberally** — every note carries 6–15 `[[Wikilinks]]` to related notes so edges form in the graph.
4. **Connect to MOCs** — each note links its category hub (e.g. [[Workflows MOC]]) which rolls up to [[Knowledge Graph Home]].
5. **Open the graph view** — the [[Visual Knowledge Graph]] renders the nodes and edges for navigation and discovery.

## Applied in
- This vault — populating the Workflows category and cross-linking it into the wider graph.
- Project recall — querying graphify graphs (e.g. the Sidechain graph) before reusing patterns.

## Connections
- [[Workflows MOC]]
- [[graphify]]
- [[Visual Knowledge Graph]]
- [[Knowledge Graph Home]]
