# Feature Boundary Review

Updated: 2026-04-17

Purpose:

- give AI a fast structural read of the repo
- record only boundary decisions that affect extensibility
- avoid repeating full feature walkthroughs

## Status

Current judgment:

- feature split is good enough for continued product work
- no urgent architecture blocker remains
- the 3 highest-risk boundary issues have already been addressed
- remaining work is mostly `watch / stabilize / avoid regressions`

## Resolved

### 1. Shared app settings layer

Now in place:

- [src/features/settings/types.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/settings/types.ts)
- [src/features/settings/schema.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/settings/schema.ts)
- [src/features/settings/app-settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/settings/app-settings.ts)

Result:

- app settings types and normalization are no longer owned only by `auth/profile`
- route validation and normalization now share one settings layer
- feature code can depend on shared settings utilities instead of routing back through `auth/profile`

Rule:

- new app-wide settings should continue flowing through `src/features/settings/*`

### 2. Conversation source layer in chat

Now in place:

- [src/features/chat/sources/conversation-record-source.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/sources/conversation-record-source.ts)
- [src/features/chat/hooks/use-conversation-list-source.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/hooks/use-conversation-list-source.ts)

Result:

- guest/local and authenticated/remote conversation list behavior is source-based
- conversation record actions no longer branch directly in every caller
- record sync now consumes source-owned sync plans instead of carrying most local readiness logic

Rule:

- future hydration/persist semantics should keep moving through source contracts, not back into
  hook-local branching

### 3. Smaller `/api/chat` runtime contract

Now in place:

- [src/features/chat/agent-runtime/runtime-overrides.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/runtime-overrides.ts)
- [src/features/chat/server/schemas.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/server/schemas.ts)
- [src/features/chat/agent-runtime/resolve-agent-run-context.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/resolve-agent-run-context.ts)

Result:

- chat requests now pass `runtimeOverrides` instead of a long list of top-level feature settings
- chat schema no longer hand-maintains multiple copies of per-feature runtime shapes
- guest preprocessing still happens on the client, server consumes narrower runtime input

Rule:

- do not add new top-level feature-specific request fields to `/api/chat`

## Watch

These are real boundary concerns, but not urgent blockers.

### `src/features/auth`

- `auth/profile` should stay a persistence/source host, not regrow into the global settings
  composition layer
- [useProfileSource](/Users/harvey/Desktop/github/ai-agent-template/src/features/auth/profile/use-profile-source.ts)
  now preserves cached/current state on remote load failure; keep that behavior source-local
- `auth/profile` still depends on a `chat`-owned theme provider; acceptable for now, not ideal

### `src/features/chat`

- [useChatWorkbench](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/hooks/use-chat-workbench.ts)
  is still the main client integration hub; avoid letting it absorb more feature-specific logic
- [ChatWorkbench](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/components/workbench/chat-workbench.tsx)
  is still the shell for many non-chat feature panels; acceptable while the app remains chat-first
- keep `conversation source` and `runtimeOverrides` as the stable boundary, not just temporary
  cleanup

### `src/features/mcp`

- boundary is still closer to `settings dialog + runtime glue` than to a true MCP source model
- if MCP grows, separate:
  - persisted settings
  - editable draft state
  - runtime-resolved server/tool view

### `src/features/memory`

- direction is good: source-based split is already visible
- still worth converging local and remote operations behind a stronger shared interface
- guest summaries still depend on `chat` conversation storage; acceptable for now

### `src/features/models`

- `models` still uses `profile.settings.models` as its real persisted source
- `useModelsPage` still bundles draft editing, save orchestration, and provider refresh decisions
- if it grows, separate:
  - models source
  - draft editing
  - provider inspection/catalog refresh

### `src/features/rag`

- feature still bundles 3 concerns under one shell:
  - settings/provider
  - document admin
  - retrieval runtime
- schema already models knowledge bases, but product/runtime is still effectively single-default-KB

### `src/features/sandbox`

- settings, derived runtime policy, and live session are still related but not fully separated
- access schema is richer than current runtime contract; keep that mismatch explicit
- provider abstraction exists, but is still mostly E2B-shaped

### `src/features/search`

- runtime abstraction exists, but the feature model is still Tavily-shaped
- one settings shape still drives:
  - UI editing
  - connection testing
  - runtime tool behavior

### `src/features/subagents`

- feature still owns config/UI more than runtime
- built-in and user-defined subagents still share one flat model
- delegation contract still mixes runtime output and chat-render shape

## Later

These are worth doing only when product scope justifies them:

- `mcp`: clearer runtime/source contract if resources/prompts grow
- `memory`: stronger unified mutation/extract/build-context contract
- `models`: models-specific source hook instead of leaning on full profile
- `rag`: explicit multi-knowledge-base contract if KB selection becomes real
- `sandbox`: fuller provider-agnostic session contract if another provider is added
- `search`: decide whether product-level search is truly provider-neutral
- `subagents`: stronger runtime contract if execution moves beyond chat-native delegation

## Keep In Mind

If a new change pushes code toward any of these patterns, stop and reconsider:

- new feature settings added directly to `auth/profile` instead of `src/features/settings/*`
- new guest/auth branches added directly in chat hooks instead of a source layer
- new top-level `/api/chat` request fields for feature settings
- feature UI hooks becoming the permanent home of runtime policy or source logic
