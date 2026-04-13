# Memory V1 Design

最后更新：2026-04-13

## Goal

Memory V1 focuses on three things:

1. Conversation summaries
2. Long-term user memories
3. Memory controls in the workbench UI

This version does not integrate Mem0 or any external memory provider.
Supabase is the only source of truth.

## Product Scope

Memory V1 is provider-agnostic and storage-first.

It should support:

- Summarizing long conversations
- Saving stable user preferences and facts
- Injecting relevant memories into future chats
- Letting users inspect, delete, and control memory behavior

It should not yet support:

- Vector search
- External memory providers
- Graph memory
- Multi-agent memory sharing
- Automatic memory backend switching

## Page Design

The `Memory` page should be memory-first, not provider-first.

It should have three sections inside the existing workbench layout.

### 1. Memory Controls

This section manages behavior, not content.

Show:

- `Enable memory`
- `Allow automatic memory writing`
- `Allow cross-conversation memory use`
- `Clear all memories`

Optional later:

- `Memory write sensitivity`
- `Only remember explicit user preferences`

### 2. Saved Memories

This is the main section.

Show a list of long-term memories such as:

- Preferred language
- Writing preferences
- Favorite tools or frameworks
- Stable personal facts the user wants remembered

Each item should show:

- Content
- Memory type
- Source
- Last updated time
- Delete action

Later we can add:

- Pin / unpin
- Edit memory
- Confidence / relevance

### 3. Conversation Summaries

This section shows short-term conversation memory.

Show a list of conversation-level summaries:

- Conversation title
- Summary text
- Last refreshed time
- Open conversation action

This helps users understand what the system is carrying forward without exposing raw message history.

## Suggested UI Structure

Recommended feature structure:

```text
src/features/memory/
├── pages/
│   └── memory-page.tsx
├── components/
│   ├── memory-controls.tsx
│   ├── memory-list.tsx
│   ├── memory-summary-list.tsx
│   └── empty-memory-state.tsx
├── hooks/
│   └── use-memory-page.ts
├── server/
│   ├── memories.ts
│   └── summaries.ts
├── storage/
│   └── memories.ts
├── utils/
│   └── memory.ts
└── types.ts
```

## Data Model

Memory V1 should use two storage layers:

1. Conversation summaries on `conversations`
2. Long-term memories in a dedicated `memories` table

### Why not store everything in `profiles.settings`?

Because long-term memory needs:

- independent records
- querying
- filtering
- source tracking
- deletion

`profiles.settings` is still fine for memory configuration flags, but not for the full memory dataset.

## Proposed Supabase Changes

### 1. Extend `conversations`

Current table already supports message persistence.
Add summary fields:

- `summary text`
- `summary_updated_at timestamptz`

Purpose:

- store compressed conversation memory
- support future context injection
- power the `Conversation Summaries` UI section

### 2. Add `memories`

Proposed schema:

```sql
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  kind text not null,
  content text not null,
  source text not null default 'auto',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
```

Recommended indexes:

```sql
create index if not exists memories_user_id_updated_at_idx
  on public.memories (user_id, updated_at desc);

create index if not exists memories_user_id_kind_idx
  on public.memories (user_id, kind);

create index if not exists memories_conversation_id_idx
  on public.memories (conversation_id);
```

Recommended RLS:

```sql
alter table public.memories enable row level security;

create policy "Users can view own memories"
  on public.memories
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own memories"
  on public.memories
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own memories"
  on public.memories
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own memories"
  on public.memories
  for delete
  using (auth.uid() = user_id);
```

## Field Semantics

### `kind`

Suggested values:

- `preference`
- `fact`
- `profile`
- `workflow`
- `manual`

Keep this flat in V1.
Do not over-model too early.

### `source`

Suggested values:

- `auto`
- `manual`
- `summary`

This lets us distinguish:

- model-extracted memory
- user-created memory
- memory derived from summarization pipelines

### `status`

Suggested values:

- `active`
- `archived`
- `deleted`

V1 can treat anything except `active` as hidden.

## Configuration Storage

Keep memory settings in `profiles.settings`.

Suggested shape:

```ts
settings: {
  memory: {
    enabled: boolean;
    autoWrite: boolean;
    crossConversation: boolean;
  }
}
```

This is configuration only.
Actual memory records should stay in `public.memories`.

## Write Strategy

Memory V1 should be conservative.

Recommended rules:

1. Only write long-term memory for authenticated users
2. Only write memory when `memory.enabled` and `memory.autoWrite` are both true
3. Prefer extracting stable user preferences and long-lived facts
4. Do not store transient chat content as long-term memory

Examples worth storing:

- "I prefer TypeScript over JavaScript"
- "Use concise answers"
- "My default stack is Next.js and Supabase"

Examples not worth storing:

- one-off requests
- temporary debugging states
- generic task content with no lasting value

## Read Strategy

Before a chat response:

1. Load conversation summary for the current conversation
2. Load a small set of relevant active memories for the current user
3. Inject both into the chat context in a controlled way

V1 should keep this simple:

- no semantic retrieval yet
- no ranking model yet
- start with latest active memories by kind and recency

## Injection Strategy

Recommended order for future chat context assembly:

1. System prompt
2. Memory context block
3. Conversation summary
4. Recent messages

This keeps long-term memory distinct from raw conversation history.

## Guest Behavior

Memory V1 should not create long-term memories for guest users.

Guest users can still have:

- local conversation threads
- local conversation titles

But not:

- durable long-term memory
- cross-conversation memory

This keeps the first version simpler and avoids building local long-term memory storage too early.

## Implementation Order

Recommended sequence:

1. Add summary fields to `conversations`
2. Add `memories` table
3. Build read/write storage helpers
4. Add `Memory` page UI
5. Inject summaries and memories into chat requests

## Open Decisions

Still intentionally undecided:

- whether users can manually edit auto-written memories in V1
- whether summaries are regenerated on every assistant turn or only periodically
- whether `manual` memories should allow custom tags

These can be decided during implementation without changing the core schema direction.
