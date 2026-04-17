# Feature Boundary Review

Updated: 2026-04-17

This document records feature-by-feature review findings with a narrow goal:

- keep feature boundaries clear
- keep guest/auth and local/remote logic understandable
- record only issues that materially affect maintainability or future extensibility

It is not a bug dump. Small polish issues should stay elsewhere.

## Overall Summary

Current judgment:

- the feature split is broadly good
- the app is not suffering from a broken feature architecture
- the three highest-risk boundary issues from the previous review have now been addressed in code
- the remaining work is mostly about keeping those new boundaries from collapsing back into
  feature-local branching

### Resolved In This Round

#### 1. Shared app settings schema/source layer

This is now in place through a dedicated settings layer:

- [src/features/settings/types.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/settings/types.ts)
- [src/features/settings/schema.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/settings/schema.ts)
- [src/features/settings/app-settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/settings/app-settings.ts)

What changed:

- app settings types and normalization no longer live only inside `auth/profile`
- route validation and normalization now share the same settings schema layer
- feature code like `models` can depend on shared settings utilities instead of routing back through
  `auth/profile`

What still matters:

- `profiles.settings` is still the persistence container, which is fine for now
- the next step is to keep new feature settings flowing through `src/features/settings/*` instead of
  drifting back into `auth/profile`

#### 2. Conversation source layer in `chat`

This is now in place as a first explicit source boundary:

- [src/features/chat/sources/conversation-record-source.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/sources/conversation-record-source.ts)
- [src/features/chat/hooks/use-conversation-list-source.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/hooks/use-conversation-list-source.ts)

What changed:

- guest/local and authenticated/remote conversation list behavior now goes through a source hook
- conversation record actions now go through a source factory instead of branching directly in every
  caller
- `chat` no longer needs to keep spreading local/remote branching across more hooks just to extend
  sidebar and record operations

What still matters:

- `use-conversation-record-sync` still coordinates hydration/persist timing and can grow back into a
  mixed source layer if not kept in check
- follow-up refactors should continue moving record sync semantics behind source contracts instead of
  adding new branching there

#### 3. Smaller `/api/chat` runtime contract

This is now materially better:

- [src/features/chat/agent-runtime/runtime-overrides.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/runtime-overrides.ts)
- [src/features/chat/server/schemas.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/server/schemas.ts)
- [src/features/chat/agent-runtime/resolve-agent-run-context.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/resolve-agent-run-context.ts)

What changed:

- chat requests now pass `runtimeOverrides` instead of a long list of top-level feature settings
- the chat schema no longer hand-maintains multiple copies of per-feature runtime shapes
- guest-only preprocessing still happens client-side, and the server consumes a narrower runtime
  input

What still matters:

- do not keep adding new top-level feature-specific request fields to `/api/chat`
- keep future runtime expansions flowing through smaller per-feature contracts that compose into the
  unified runtime override shape

### Important But Can Defer

These matter, but they do not need to be solved before the next round of product work:

- `auth`: make remote profile source failure preserve current cached state
- `mcp`: separate settings/draft/runtime-resolved server state more clearly
- `memory`: continue converging local and remote operations behind a stronger source contract
- `models`: separate models source, draft editing, and provider catalog refresh
- `rag`: clarify whether the feature is truly single-knowledge-base or preparing for multiple
  knowledge bases
- `sandbox`: separate settings, derived runtime policy, and live session contracts more clearly
- `search`: decide whether the feature is truly provider-neutral or intentionally Tavily-first
- `subagents`: clarify whether the feature remains config-first or should expose stronger runtime
  contracts of its own

## `src/features/auth`

### Medium: `auth/profile` is still the persistence host, but not the right place to regrow global settings composition

This boundary is better than before because settings composition now has its own layer:

- [src/features/settings/types.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/settings/types.ts)
- [src/features/settings/schema.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/settings/schema.ts)
- [src/features/settings/app-settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/settings/app-settings.ts)

Relevant files:

- [src/features/auth/profile/types.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/auth/profile/types.ts)
- [src/features/auth/profile/profile-settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/auth/profile/profile-settings.ts)
- [src/features/auth/server/profile-route.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/auth/server/profile-route.ts)

What remains true is that `auth/profile` still owns persistence and profile source behavior. That is
fine. The part that must stay fixed is: new app-wide settings composition should continue flowing
through `src/features/settings/*`, not drift back into `auth/profile`.

Recommended direction:

- keep `profiles.settings` as the persistence container
- keep `auth/profile` focused on profile source and persistence behavior
- keep settings schema composition and normalization in the shared settings layer

### Medium: remote profile load failure falls back to a fresh draft instead of preserving current state

When authenticated profile loading fails, `useProfileSource` rebuilds a new draft profile instead of
preserving the most recent known profile state.

Relevant file:

- [src/features/auth/profile/use-profile-source.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/auth/profile/use-profile-source.ts)

This is risky because a transient remote failure can replace the current in-memory profile with a
freshly generated draft, which blurs the boundary between:

- “failed to refresh remote profile”
- “user now has a new local draft profile”

That is both a functional risk and a source-layer clarity problem.

Recommended direction:

- on remote load failure, keep the cached/current profile when available
- only fall back to a fresh draft when there is truly no prior profile state to preserve

### Low: `auth/profile` still depends on `chat` UI theme context

`useAppProfile` reads theme from:

- [src/features/chat/components/preferences/theme-provider.tsx](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/components/preferences/theme-provider.tsx)

Relevant file:

- [src/features/auth/profile/use-app-profile.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/auth/profile/use-app-profile.ts)

This is not a blocker, but it means `auth/profile` depends on a UI concern hosted under `chat`.
That makes the dependency direction less clean than it could be.

Recommended direction:

- if theme continues to matter outside chat, move the theme provider to a more neutral shared app UI
  or config layer

## `src/features/chat`

### Medium: `useChatWorkbench` is becoming the client-side integration hub for too many domains

`useChatWorkbench` currently orchestrates:

- chat session state
- thread creation and URL sync
- sidebar data and optimistic patches
- model availability and selection
- memory / search / sandbox / rag / mcp / skills / subagent settings updates
- auth-aware behavior

Relevant file:

- [src/features/chat/hooks/use-chat-workbench.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/hooks/use-chat-workbench.ts)

This works, but it means `chat` is carrying both the product shell and a growing amount of
cross-feature settings orchestration. That makes the feature boundary less about “chat” and more
about “the whole app workbench”.

Recommended direction:

- keep `useChatWorkbench` as the V1 integration point for now
- but avoid adding more feature-specific logic directly into it
- if the workbench keeps growing, start extracting a more neutral shell/integration layer rather
  than letting `chat` remain the permanent host for every settings flow

### Medium: `ChatWorkbench` is the UI shell for many non-chat features

The `chat` feature currently owns the dialog host for:

- models
- memory
- mcp
- search
- rag
- sandbox
- skills
- subagents

Relevant file:

- [src/features/chat/components/workbench/chat-workbench.tsx](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/components/workbench/chat-workbench.tsx)

This is reasonable for a chat-first product, but it means many non-chat features are still mounted
inside a `chat`-owned UI shell. If that continues indefinitely, those features stay visually
independent but structurally dependent on `chat`.

Recommended direction:

- keep this as the current V1 shell
- but treat it as a transitional workbench host rather than the permanent home of every non-chat
  feature panel

### Medium: `chat` now has a conversation source layer, but record sync semantics can still re-expand into hook-local branching

The largest guest/auth and local/remote branching problem has been reduced through:

- [src/features/chat/sources/conversation-record-source.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/sources/conversation-record-source.ts)
- [src/features/chat/hooks/use-conversation-list-source.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/hooks/use-conversation-list-source.ts)

Relevant files:

- [src/features/chat/data/conversation-operations.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/data/conversation-operations.ts)
- [src/features/chat/hooks/use-conversation-record-sync.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/hooks/use-conversation-record-sync.ts)
- [src/features/chat/agent-runtime/runtime-overrides.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/runtime-overrides.ts)
- [src/features/chat/server/schemas.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/server/schemas.ts)

This means the most obvious branching no longer lives everywhere, and `/api/chat` no longer needs a
long list of top-level feature settings. The remaining risk is that record hydration/persist timing
and future runtime additions could slowly pull those concerns back into large chat hooks or inflate
the request contract again.

Recommended direction:

- keep record sync semantics moving toward source-owned behavior
- keep `/api/chat` consuming the unified runtime override shape instead of growing new top-level
  per-feature fields

## `src/features/mcp`

### Medium: MCP settings orchestration is split across multiple layers without a clear source boundary

The current MCP flow is spread across:

- settings normalization
- local dialog state
- per-server save/delete/test actions
- chat runtime tool injection

Relevant files:

- [src/features/mcp/settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/mcp/settings.ts)
- [src/features/mcp/hooks/use-mcp-settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/mcp/hooks/use-mcp-settings.ts)
- [src/features/mcp/hooks/use-mcp-server-actions.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/mcp/hooks/use-mcp-server-actions.ts)
- [src/features/chat/agent-runtime/build-agent-toolset.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/build-agent-toolset.ts)

This works for V1, but the feature boundary is still more “settings dialog + runtime glue” than a
clear MCP source model. If MCP grows to include resources, prompts, or richer per-server metadata,
the current split will make it easier for state handling and runtime handling to diverge.

Recommended direction:

- keep the current UI/hooks structure for now
- but move toward a clearer MCP source contract that separates:
  - persisted settings
  - editable draft state
  - runtime-resolved server/tool view

### Medium: server connection testing and runtime tool injection share infrastructure, but not an explicit shared contract

`mcp-client.ts` currently serves both:

- test/inspection flows for the settings UI
- runtime client/tool creation for chat

Relevant file:

- [src/features/mcp/server/mcp-client.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/mcp/server/mcp-client.ts)

That reuse is good, but the contract is still implicit. The test dialog cares about capabilities,
resources, prompts, and tool names. The chat runtime cares about injected tools and lifecycle
cleanup. Those are related but distinct concerns, and the current file mixes both.

Recommended direction:

- keep the shared connection layer
- but gradually separate “inspect a server” from “create runtime tool bundles” into clearer server
  modules if MCP grows beyond basic remote tool injection

### Low: MCP UI state still owns transient behavior that does not clearly belong to the feature model

For example, `testResults` currently lives inside server action hooks and is only used for immediate
dialog display, not as a reusable source of truth.

Relevant files:

- [src/features/mcp/hooks/use-mcp-server-actions.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/mcp/hooks/use-mcp-server-actions.ts)
- [src/features/mcp/components/mcp-content.tsx](/Users/harvey/Desktop/github/ai-agent-template/src/features/mcp/components/mcp-content.tsx)

This is not a blocker, but it shows the feature still leans UI-first rather than source-first.

Recommended direction:

- if MCP grows, decide whether test/inspection results are:
  - purely ephemeral UI state
  - or a reusable resolved server state
- then place them accordingly instead of letting them continue to float between hooks and dialogs

## `src/features/memory`

### Medium: `Memory` has started the right source split, but export and page composition still leak source-specific shape

`Memory` now has clearer source hooks:

- [src/features/memory/hooks/use-memory-items-source.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/memory/hooks/use-memory-items-source.ts)
- [src/features/memory/hooks/use-conversation-summary-source.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/memory/hooks/use-conversation-summary-source.ts)

That is a good direction. But `useMemoryPage` still assembles exported payloads and page-level state by
pulling directly from these source-specific outputs:

- [src/features/memory/hooks/use-memory-page.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/memory/hooks/use-memory-page.ts)

This is not a blocker, but it means the page composition layer still knows a lot about how memory
items and summaries are sourced and shaped. If memory import/export or source migration grows, this
layer can become another integration knot.

Recommended direction:

- keep the current hooks
- but if memory keeps growing, introduce a slightly higher-level memory source contract so export,
  refresh, and combined page data stop depending on source-specific pieces

### Medium: guest and authenticated memory still share UI, but not a fully unified source contract yet

Compared with `profile`, `memory` is closer to a source-based design, but the guest and authenticated
paths still diverge at the operation layer:

- local memory mutations in [src/features/memory/storage/local-memories.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/memory/storage/local-memories.ts)
- remote memory mutations in [src/features/memory/storage/memories.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/memory/storage/memories.ts)
- guest extraction route in [src/features/memory/server/extract-route.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/memory/server/extract-route.ts)

This is acceptable for V1, but the feature has not yet converged on a true unified memory source
interface. The UI is unified; the mutation and extraction contracts are still mostly dual-track.

Recommended direction:

- keep the current local/supabase split
- but if guest memory continues to grow, move toward a clearer shared interface for:
  - list
  - update
  - delete
  - extract/merge
  - build context

### Low: local summary source currently depends on chat-owned conversation storage

The summary source hook is clean, but guest conversation summaries still come from `chat` storage:

- [src/features/memory/hooks/use-conversation-summary-source.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/memory/hooks/use-conversation-summary-source.ts)
- [src/features/chat/storage/local-conversations.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/storage/local-conversations.ts)

That dependency is reasonable today, because summaries are conversation-derived. But it means
`memory` is not fully self-contained; part of its guest summary source still lives in `chat`.

Recommended direction:

- keep this dependency for now
- but if summaries gain more independent behavior, treat them as an explicit conversation-summary
  source rather than letting them stay an implicit projection of chat storage forever

## `src/features/models`

### Medium: `models` still uses `auth/profile` as its real source boundary

The models feature already has a draft-editing layer, but its real persisted source is still the
profile settings tree:

- [src/features/models/components/models-content.tsx](/Users/harvey/Desktop/github/ai-agent-template/src/features/models/components/models-content.tsx)
- [src/features/models/hooks/use-models-page.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/models/hooks/use-models-page.ts)
- [src/features/auth/profile/use-app-profile.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/auth/profile/use-app-profile.ts)

That means `models` is not yet consuming a models-specific source contract. Instead, it still
reaches into the broader app profile and treats `profile.settings.models` as the feature source of
truth. This works, but it keeps `models` coupled to the global settings hub.

Recommended direction:

- keep `profiles.settings` as the persistence container if needed
- but move toward a models-specific source hook or contract so the feature depends on “models
  settings” rather than on the full profile object

### Medium: draft editing and provider catalog refresh are still coupled in one orchestration hook

`useModelsPage` currently owns both:

- local draft editing flow
- save orchestration
- provider catalog refresh decisions
- provider probe result application

Relevant files:

- [src/features/models/hooks/use-models-page.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/models/hooks/use-models-page.ts)
- [src/features/models/hooks/use-provider-probe.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/models/hooks/use-provider-probe.ts)
- [src/features/models/utils/provider-sync.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/models/utils/provider-sync.ts)

This is acceptable for V1, but the boundary between:

- editable draft state
- provider inspection/probing
- runtime-usable provider catalog state

is still fairly soft. As more providers or richer provider metadata are added, this hook can easily
turn into another integration knot.

Recommended direction:

- keep the current flow for now
- but gradually separate:
  - draft editing state
  - provider probe/inspection actions
  - save-time catalog reconciliation

### Low: some feature-local model behavior still depends on `auth/profile` utilities and full app settings

Two examples show that the models feature has not fully internalized its own contracts yet:

- `useModelsDraft` imports provider ordering from
  [src/features/auth/profile/profile-settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/auth/profile/profile-settings.ts)
- runtime model resolution still takes the full
  [AppProfileSettings](/Users/harvey/Desktop/github/ai-agent-template/src/features/auth/profile/types.ts)
  shape in [src/features/models/utils/runtime-model.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/models/utils/runtime-model.ts)

Neither is a blocker, but together they show that `models` still relies on app-level settings
composition details for behavior that increasingly belongs inside the feature itself.

Recommended direction:

- move provider ordering/defaulting helpers into `src/features/models`
- keep runtime model resolution focused on a smaller models/runtime input shape instead of the full
  app settings object

## `src/features/rag`

### Medium: `rag` still bundles three different subdomains under one feature surface

The current RAG feature includes:

- settings and connection testing
- document import/list/delete/reindex
- runtime retrieval and context building

Relevant files:

- [src/features/rag/hooks/use-rag-settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/rag/hooks/use-rag-settings.ts)
- [src/features/rag/hooks/use-rag-documents.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/rag/hooks/use-rag-documents.ts)
- [src/features/rag/components/rag-content.tsx](/Users/harvey/Desktop/github/ai-agent-template/src/features/rag/components/rag-content.tsx)
- [src/features/rag/server/retrieval.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/rag/server/retrieval.ts)

This is acceptable for V1, but it means “RAG” is currently one feature shell for three different
concerns:

- provider/settings management
- knowledge-base document administration
- retrieval runtime behavior

If RAG grows, those concerns are likely to evolve at different speeds. Keeping them all under one
thin feature label is fine, but their contracts should become clearer than they are now.

Recommended direction:

- keep the current feature directory
- but gradually make the internal boundary clearer between:
  - rag settings source
  - rag document source
  - retrieval/runtime services

### Medium: the schema already models knowledge bases, but the implementation is still single-default-knowledge-base

The data model already includes `rag_knowledge_bases`, and retrieval rows include
`knowledge_base_id`, but the actual feature flow still assumes a single default knowledge base per
user:

- [src/features/rag/storage/rag-documents.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/rag/storage/rag-documents.ts)
- [src/features/rag/server/ingestion.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/rag/server/ingestion.ts)
- [src/features/rag/storage/rag-repository.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/rag/storage/rag-repository.ts)

In practice:

- document ingestion always calls `ensureDefaultKnowledgeBase(...)`
- document listing is user-scoped, not knowledge-base-scoped
- retrieval currently filters by `userId`, while `filter_knowledge_base_id` exists but is not the
  active feature boundary

So the feature has a stronger schema abstraction than its actual product/runtime abstraction.

Recommended direction:

- either explicitly treat RAG as a single-knowledge-base feature for now
- or, when multi-knowledge-base support becomes real, promote knowledge base selection into a
  first-class source and runtime contract instead of leaving it implicit in the schema

### Low: document management is still route-driven rather than source-driven

`useRagDocuments` is a clean hook, but it still talks directly to one authenticated remote route
surface:

- [src/features/rag/hooks/use-rag-documents.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/rag/hooks/use-rag-documents.ts)
- [src/features/rag/server/documents-route.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/rag/server/documents-route.ts)

That is fine for the current product, but it means the feature does not yet have a more explicit
document source abstraction comparable to what `memory` has started building. If guest/local RAG,
alternate backends, or richer knowledge-base workflows are ever added, this layer will need to be
refactored before the feature can scale cleanly.

Recommended direction:

- keep the current authenticated remote document flow
- but if RAG document management grows, move toward an explicit rag document source contract instead
  of letting the hook stay permanently route-shaped

## `src/features/sandbox`

### Medium: sandbox settings, workspace policy, and runtime session are related but not fully separated

The current sandbox feature spans:

- settings editing and local draft state
- policy derivation from settings
- workspace manifest construction
- provider-backed runtime session creation

Relevant files:

- [src/features/sandbox/hooks/use-sandbox-settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/sandbox/hooks/use-sandbox-settings.ts)
- [src/features/sandbox/settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/sandbox/settings.ts)
- [src/features/chat/agent-runtime/workspace-manifest.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/workspace-manifest.ts)
- [src/features/chat/agent-runtime/workspace-session.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/workspace-session.ts)

This is workable for V1, but the current boundary is still soft between:

- persisted sandbox settings
- effective runtime/tool policy
- live sandbox session state

As the feature grows, those layers are likely to change at different speeds. Keeping them too close
will make future provider expansion or more detailed workspace controls harder to evolve cleanly.

Recommended direction:

- keep the current flow for now
- but continue moving toward clearer contracts between:
  - settings source
  - derived workspace/runtime policy
  - live runtime session

### Medium: the access schema is broader than the current runtime/tool contract

The sandbox settings and manifest already carry a fairly rich access model:

- `allowCommands`
- `allowFilesystem`
- `allowFileUpload`
- `allowFileDownload`
- `allowInternetAccess`
- `allowPty`

Relevant files:

- [src/features/sandbox/types.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/sandbox/types.ts)
- [src/features/sandbox/settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/sandbox/settings.ts)
- [src/features/chat/agent-runtime/workspace-manifest.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/workspace-manifest.ts)
- [src/features/sandbox/server/providers/sandbox-provider.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/sandbox/server/providers/sandbox-provider.ts)

But the current runtime contract only exposes:

- command execution
- file read/write
- session lifecycle

So the schema already promises a more detailed capability model than the runtime/provider contract
actually enforces or exposes. That is not a bug by itself, but it means the configuration boundary
is currently stronger than the execution boundary.

Recommended direction:

- either keep the unused access flags clearly documented as future-facing
- or only promote access controls into top-level settings once they have a corresponding runtime
  contract

### Low: provider abstraction exists, but is still very thin and E2B-shaped

The feature already has a provider registry:

- [src/features/sandbox/server/providers/index.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/sandbox/server/providers/index.ts)

But in practice almost all connection, error mapping, workspace preparation, and recovery behavior
still lives in the E2B-specific implementation:

- [src/features/sandbox/server/e2b-client.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/sandbox/server/e2b-client.ts)

That is reasonable with only one provider, but it means the current abstraction is more “provider
switch point” than a mature multi-provider contract.

Recommended direction:

- keep the current provider wrapper
- but if another sandbox provider is added, first separate:
  - provider-agnostic session contract
  - provider-specific connection/bootstrap behavior
  - provider-specific error translation

## `src/features/search`

### Medium: `search` has a provider registry, but the feature model is still strongly Tavily-shaped

The feature already exposes a provider abstraction:

- [src/features/search/server/providers/index.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/search/server/providers/index.ts)
- [src/features/search/server/providers/search-provider.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/search/server/providers/search-provider.ts)

But the settings and type model are still mostly named and shaped around Tavily concepts:

- [src/features/search/types.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/search/types.ts)
- [src/features/search/server/tavily.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/search/server/tavily.ts)
- [src/features/search/server/tavily-client.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/search/server/tavily-client.ts)

That means the feature is structurally somewhere in between:

- “a generic search capability”
- and “a Tavily integration with a future provider switch point”

Recommended direction:

- keep the current provider abstraction
- but decide more explicitly whether `search` is meant to be:
  - provider-neutral at the feature level
  - or Tavily-first with a thin escape hatch for future providers

### Medium: search settings, connection testing, and runtime tool behavior still share one feature contract

The current search feature uses one settings shape to drive:

- UI editing
- connection testing
- chat runtime web tools

Relevant files:

- [src/features/search/hooks/use-search-settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/search/hooks/use-search-settings.ts)
- [src/features/search/components/search-content.tsx](/Users/harvey/Desktop/github/ai-agent-template/src/features/search/components/search-content.tsx)
- [src/features/chat/agent-runtime/build-agent-toolset.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/build-agent-toolset.ts)

This is workable, but it means the same feature contract is currently doing three jobs:

- persisted settings
- provider test input
- runtime tool configuration

Those are closely related, but they are not exactly the same boundary. If search grows richer
runtime behavior or alternate providers, it will become harder to keep one shared shape clean.

Recommended direction:

- keep the current V1 shape
- but over time separate:
  - persisted search settings
  - provider connection test input
  - runtime-resolved search tool config

### Low: chat runtime already consumes `search` as a unified capability, but the feature is not yet source-oriented

The runtime integration point is actually fairly clean:

- [src/features/chat/agent-runtime/build-agent-toolset.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/build-agent-toolset.ts)

It simply receives `SearchSettings` and decides whether to expose `web_search`, `web_extract`, and
`web_crawl`. But on the feature side, the search flow is still mostly hook-plus-route driven rather
than source-driven:

- [src/features/search/hooks/use-search-settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/search/hooks/use-search-settings.ts)
- [src/features/search/settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/search/settings.ts)

That is fine with one remote backend and no guest/local variant, but it does mean `search` has not
yet made the same source-boundary move that `memory` and `profile` have started making.

Recommended direction:

- keep the current remote-only flow
- but if search ever gains multiple backends, cached state, or local/offline variants, introduce a
  clearer search source layer rather than extending route-shaped hooks indefinitely

## `src/features/subagents`

### Medium: `subagents` currently owns configuration and UI, while execution lives mostly under `chat`

Inside `src/features/subagents`, the feature currently owns:

- settings normalization
- local editing flow
- list/editor UI
- delegation input/output contract

Relevant files:

- [src/features/subagents/settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/subagents/settings.ts)
- [src/features/subagents/hooks/use-subagent-settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/subagents/hooks/use-subagent-settings.ts)
- [src/features/subagents/delegation-contract.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/subagents/delegation-contract.ts)
- [src/features/subagents/components/subagent-content.tsx](/Users/harvey/Desktop/github/ai-agent-template/src/features/subagents/components/subagent-content.tsx)

But the actual execution/runtime layer lives mostly elsewhere:

- [src/features/chat/agent-runtime/build-agent-input.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/build-agent-input.ts)
- [src/features/chat/agent-runtime/execute-agent-run.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/agent-runtime/execute-agent-run.ts)
- [src/features/chat/ai/tools/delegate_to_subagent.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/chat/ai/tools/delegate_to_subagent.ts)

This split is understandable for V1, but it means the feature boundary is currently closer to:

- “subagent configuration feature”

than:

- “fully self-contained subagent system”

Recommended direction:

- keep execution inside chat while the product remains chat-first
- but treat `subagents` as a feature that should gradually expose clearer runtime-facing contracts,
  rather than leaving runtime behavior permanently scattered across chat files

### Medium: built-in subagents and user-defined subagents still share one flat settings model

The feature currently uses one `SubagentDefinition` model for both:

- built-in preset agents from [src/config/subagent.ts](/Users/harvey/Desktop/github/ai-agent-template/src/config/subagent.ts)
- user-created agents from the editor flow

Relevant files:

- [src/features/subagents/types.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/subagents/types.ts)
- [src/features/subagents/settings.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/subagents/settings.ts)
- [src/features/subagents/components/subagent-editor-dialog.tsx](/Users/harvey/Desktop/github/ai-agent-template/src/features/subagents/components/subagent-editor-dialog.tsx)

That is simple and flexible, but it also means the feature does not yet distinguish between:

- versioned built-in roles/presets
- fully user-authored subagents

If built-ins ever need migration rules, protected fields, preset upgrades, or special UI treatment,
the current flat model will start carrying two different responsibilities.

Recommended direction:

- keep the shared `SubagentDefinition` for V1
- but if built-ins become more opinionated, separate:
  - preset metadata / defaults
  - user-customized subagent instances

### Low: the delegation contract already mixes execution result shape and UI message shape

`delegation-contract.ts` defines the result of delegated work, but it already carries an `AI SDK`
`UIMessage`:

- [src/features/subagents/delegation-contract.ts](/Users/harvey/Desktop/github/ai-agent-template/src/features/subagents/delegation-contract.ts)

That works because the feature is tightly integrated with the chat UI, but it also means the
feature contract is not purely “subagent runtime output”. It is partly a render contract for the
chat tool card.

Recommended direction:

- keep the current contract while subagents remain chat-native
- but if subagent execution results ever need to be reused outside the chat tool UI, separate:
  - runtime result payload
  - chat-renderable message projection
