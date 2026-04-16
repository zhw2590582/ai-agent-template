create extension if not exists pgcrypto;
create extension if not exists vector;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  locale text,
  theme text,
  settings jsonb not null default '{}'::jsonb,
  memory_summary text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  messages jsonb not null default '[]'::jsonb,
  analysis jsonb not null default '{}'::jsonb,
  summary text,
  summary_updated_at timestamptz,
  last_message_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

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

create table if not exists public.rag_knowledge_bases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rag_documents (
  id uuid primary key default gen_random_uuid(),
  knowledge_base_id uuid not null references public.rag_knowledge_bases (id) on delete cascade,
  title text not null,
  source text,
  content_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.rag_documents (id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1024),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists conversations_user_id_last_message_at_idx
  on public.conversations (user_id, last_message_at desc);

create index if not exists memories_user_id_updated_at_idx
  on public.memories (user_id, updated_at desc);

create index if not exists memories_user_id_kind_idx
  on public.memories (user_id, kind);

create index if not exists memories_conversation_id_idx
  on public.memories (conversation_id);

create unique index if not exists rag_chunks_document_id_chunk_index_idx
  on public.rag_chunks (document_id, chunk_index);

create index if not exists rag_knowledge_bases_user_id_idx
  on public.rag_knowledge_bases (user_id, updated_at desc);

create index if not exists rag_documents_knowledge_base_id_idx
  on public.rag_documents (knowledge_base_id, updated_at desc);

create index if not exists rag_chunks_document_id_idx
  on public.rag_chunks (document_id);

create index if not exists rag_chunks_embedding_idx
  on public.rag_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.memories enable row level security;
alter table public.rag_knowledge_bases enable row level security;
alter table public.rag_documents enable row level security;
alter table public.rag_chunks enable row level security;

create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Users can view own conversations"
  on public.conversations
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.conversations
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.conversations
  for delete
  using (auth.uid() = user_id);

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

create policy "Users can view own rag knowledge bases"
  on public.rag_knowledge_bases
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own rag knowledge bases"
  on public.rag_knowledge_bases
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rag knowledge bases"
  on public.rag_knowledge_bases
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own rag knowledge bases"
  on public.rag_knowledge_bases
  for delete
  using (auth.uid() = user_id);

create policy "Users can view own rag documents"
  on public.rag_documents
  for select
  using (
    exists (
      select 1
      from public.rag_knowledge_bases kb
      where kb.id = knowledge_base_id
        and kb.user_id = auth.uid()
    )
  );

create policy "Users can insert own rag documents"
  on public.rag_documents
  for insert
  with check (
    exists (
      select 1
      from public.rag_knowledge_bases kb
      where kb.id = knowledge_base_id
        and kb.user_id = auth.uid()
    )
  );

create policy "Users can update own rag documents"
  on public.rag_documents
  for update
  using (
    exists (
      select 1
      from public.rag_knowledge_bases kb
      where kb.id = knowledge_base_id
        and kb.user_id = auth.uid()
    )
  );

create policy "Users can delete own rag documents"
  on public.rag_documents
  for delete
  using (
    exists (
      select 1
      from public.rag_knowledge_bases kb
      where kb.id = knowledge_base_id
        and kb.user_id = auth.uid()
    )
  );

create policy "Users can view own rag chunks"
  on public.rag_chunks
  for select
  using (
    exists (
      select 1
      from public.rag_documents d
      join public.rag_knowledge_bases kb on kb.id = d.knowledge_base_id
      where d.id = document_id
        and kb.user_id = auth.uid()
    )
  );

create policy "Users can insert own rag chunks"
  on public.rag_chunks
  for insert
  with check (
    exists (
      select 1
      from public.rag_documents d
      join public.rag_knowledge_bases kb on kb.id = d.knowledge_base_id
      where d.id = document_id
        and kb.user_id = auth.uid()
    )
  );

create policy "Users can update own rag chunks"
  on public.rag_chunks
  for update
  using (
    exists (
      select 1
      from public.rag_documents d
      join public.rag_knowledge_bases kb on kb.id = d.knowledge_base_id
      where d.id = document_id
        and kb.user_id = auth.uid()
    )
  );

create policy "Users can delete own rag chunks"
  on public.rag_chunks
  for delete
  using (
    exists (
      select 1
      from public.rag_documents d
      join public.rag_knowledge_bases kb on kb.id = d.knowledge_base_id
      where d.id = document_id
        and kb.user_id = auth.uid()
    )
  );

create or replace function public.match_rag_chunks(
  query_embedding vector(1024),
  match_count integer,
  match_threshold double precision,
  filter_user_id uuid,
  filter_knowledge_base_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  knowledge_base_id uuid,
  content text,
  source text,
  score double precision,
  metadata jsonb,
  document_title text
)
language sql
stable
as $$
  select
    c.id,
    c.document_id,
    d.knowledge_base_id,
    c.content,
    d.source,
    1 - (c.embedding <=> query_embedding) as score,
    c.metadata,
    d.title as document_title
  from public.rag_chunks c
  join public.rag_documents d on d.id = c.document_id
  join public.rag_knowledge_bases kb on kb.id = d.knowledge_base_id
  where kb.user_id = filter_user_id
    and (filter_knowledge_base_id is null or kb.id = filter_knowledge_base_id)
    and c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= match_threshold
  order by c.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
before update on public.conversations
for each row
execute function public.set_updated_at();

drop trigger if exists memories_set_updated_at on public.memories;
create trigger memories_set_updated_at
before update on public.memories
for each row
execute function public.set_updated_at();

drop trigger if exists rag_knowledge_bases_set_updated_at on public.rag_knowledge_bases;
create trigger rag_knowledge_bases_set_updated_at
before update on public.rag_knowledge_bases
for each row
execute function public.set_updated_at();

drop trigger if exists rag_documents_set_updated_at on public.rag_documents;
create trigger rag_documents_set_updated_at
before update on public.rag_documents
for each row
execute function public.set_updated_at();

drop trigger if exists rag_chunks_set_updated_at on public.rag_chunks;
create trigger rag_chunks_set_updated_at
before update on public.rag_chunks
for each row
execute function public.set_updated_at();
