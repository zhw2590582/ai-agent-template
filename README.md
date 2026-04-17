# AI Agent Template

A local-first, extensible AI agent web app template built with Next.js, AI SDK, and Supabase.

This repository is designed as a practical starting point for building an AI chat product with memory, tools, retrieval, sandbox execution, and multi-agent workflows. It is not a tutorial demo and not a one-off prototype.

## Feature Status

| Feature Area  | Available Now                                                                                        | Still Missing                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Chat Runtime  | Stable `useChat -> /api/chat -> agent-runtime` flow with streaming responses and tool support        | More runtime hardening, recovery, and broader end-to-end coverage                |
| Models        | Provider configuration, connection testing, model syncing, and runtime model selection               | Deeper provider abstraction, fallback strategy, and more regression tests        |
| Auth          | Supabase OAuth, persisted profile settings, and local-first guest fallback                           | Further cleanup of long-term settings boundaries                                 |
| Conversations | Signed-in conversations in Supabase and guest conversations in IndexedDB-backed local storage        | Further simplification of the guest conversation lifecycle                       |
| Memory        | Cross-conversation memory, local-first guest memory, and conversation summaries in one shared UI     | Memory import, stronger consolidation/retrieval, and tighter source alignment    |
| Search        | Provider-based search tools, extraction, crawl support, and connection testing                       | A second provider, richer result presentation, and more provider-neutral UX      |
| Sandbox       | Provider-based sandbox runtime with configurable access policy and initial tool support              | Broader capability coverage and deeper toolset tests                             |
| RAG           | Document ingestion, pgvector retrieval, provider-based embeddings, and grounded answers with sources | Multi-knowledge-base product UX, tighter triggering rules, and a second provider |
| Subagents     | Minimal serial subagent delegation with configurable agents and basic UI feedback                    | Delegation budget, stronger telemetry, and broader tests                         |
| MCP           | Remote MCP server settings, connection testing, and runtime tool merge                               | Resources/prompts support and a more complete runtime surface                    |
| Skills        | Settings UI and persistence surface                                                                  | Runtime contract and actual skill execution support                              |
| Testing       | Core unit tests and targeted integration coverage                                                    | Full end-to-end coverage and stronger production-readiness checks                |

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
