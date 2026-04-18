# AI Agent Template

A local-first, extensible AI agent web app template built with Next.js, AI SDK, and Supabase.

This repository is designed as a practical starting point for building an AI chat product with memory, tools, retrieval, sandbox execution, and multi-agent workflows. It is not a tutorial demo and not a one-off prototype.

Core product V1 is largely complete. The remaining work is mostly hardening, payload and UX cleanup, production-readiness, and broader platform capabilities.

## Feature Status

| Feature Area  | Available Now                                                                                                      | Still Missing                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Chat Runtime  | Stable `useChat -> /api/chat -> agent-runtime` flow with streaming responses, tools, and local-first guest support | Attachments, richer recovery, durable runs, and broader end-to-end coverage  |
| Models        | Provider configuration, connection testing, model syncing, custom models, and runtime selection                    | Fallback strategy, deeper provider abstraction, and more regression coverage |
| Auth          | Optional Supabase OAuth, persisted profile settings, and local-first guest fallback                                | More cleanup around long-term settings boundaries and data migration UX      |
| Conversations | Signed-in conversations in Supabase and guest conversations in IndexedDB-backed local storage                      | More lifecycle hardening and edge-case recovery                              |
| Memory        | Cross-conversation memory, local-first guest memory, summaries, and consolidation                                  | Memory import, stronger merge/retrieval quality, and better observability    |
| Search        | Provider-based search tools, extraction, crawl support, and connection testing                                     | A second provider, richer result presentation, and caching/observability     |
| Sandbox       | Provider-based sandbox runtime with configurable access policy and core file/command tools                         | Session reuse, broader capability coverage, and deeper toolset tests         |
| RAG           | Document ingestion, pgvector retrieval, provider-based embeddings/rerank, and grounded answers with sources        | Multi-knowledge-base UX, tighter triggering rules, and a second provider     |
| Subagents     | Minimal serial subagent delegation with configurable agents and basic UI feedback                                  | Parallel teams, richer telemetry, and stronger orchestration boundaries      |
| MCP           | Remote MCP server settings, connection testing, and runtime tool merge                                             | Resources/prompts consumption, approval flows, and a first-party MCP server  |
| Skills        | Local search, install, enable, and runtime loading through `load_skill` / `read_skill_file`                        | Compatibility checks, payload compression, and activation/guardrail controls |
| Testing       | Core unit tests, targeted integration coverage, and local inspection scripts                                       | Full end-to-end coverage and stronger production-readiness checks            |

## Local-First Behavior

Guests can use most of the app without signing in.

- Conversations and memories are stored locally for guest users
- Profile and feature settings fall back to local storage when needed
- Signed-in users use Supabase-backed persistence and syncing

## Quick Start

```bash
bun install
cp .env.example .env
bun run dev
```

Open `http://localhost:3000`.

## Environment

At minimum, configure:

- model provider keys for chat
- `NEXT_PUBLIC_APP_URL` for canonical URLs and sitemap metadata

Optional:

- Supabase for auth and server persistence
- Tavily or other search providers
- Voyage or other embedding providers
- E2B for sandbox execution

See [`.env.example`](./.env.example) for the full list.

## Docs

- [Project Status](./docs/project-status.md)
- [Architecture](./docs/architecture.md)
- [Conventions](./docs/conventions.md)
- [Roadmap](./docs/roadmap.md)

## Stack

- Next.js
- AI SDK
- Supabase
- shadcn/ui
- Tailwind CSS
- Bun
