---
tags: [skill]
aliases: [ai-sdk, claude-api, sdk, mcp-builder]
---
# AI SDK & Agent Building

This cluster covers the full stack of building AI-powered features and autonomous agents: Vercel AI SDK for provider-agnostic streaming and tool use, the Anthropic SDK for Claude-specific work with prompt caching, the Cursor SDK for programmatic agent execution, and MCP server authoring for tool/resource exposure. Reach for it any time a project needs AI text generation, structured output, multi-step agents, or custom tooling surfaces.

## What it does
- **ai-sdk** — Vercel AI SDK: chat, streaming, structured output, tool calling, agents, MCP, embeddings, and image generation across multiple providers.
- **claude-api** — build, debug, and optimize Anthropic SDK apps with prompt caching; migrate between Claude model versions (Opus, Sonnet, Haiku).
- **sdk** — Cursor TypeScript SDK (@cursor/sdk) for running Cursor agents programmatically from scripts or CI pipelines.
- **mcp-builder** — build MCP servers that expose tools and resources to agents and to Claude Code.

## Used in / pairs with
- [[Vercel Platform Skills]] — ai-gateway routes model calls; Vercel functions host server-side AI endpoints that never expose API keys to clients.
- [[Bennett]] — all Claude API calls are server-side only via BennettPersonaService, which routes every user-facing AI message through the Anthropic SDK with prompt caching.
- [[Higgsfield]] — Higgsfield video generation is invoked server-side alongside Claude calls in Bennett's nightly priming pipeline.
- [[Automation & Orchestration]] — agent scheduling and loop skills compose with AI SDK agents for recurring autonomous workflows.

## Connections
- [[Skills MOC]]
- [[Vercel Platform Skills]]
- [[Bennett]]
- [[Higgsfield]]
- [[Automation & Orchestration]]
- [[Supabase & Postgres Skills]]
