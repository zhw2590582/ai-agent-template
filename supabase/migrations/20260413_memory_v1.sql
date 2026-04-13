alter table public.conversations
  add column if not exists summary text,
  add column if not exists summary_updated_at timestamptz;

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

create index if not exists memories_user_id_updated_at_idx
  on public.memories (user_id, updated_at desc);

create index if not exists memories_user_id_kind_idx
  on public.memories (user_id, kind);

create index if not exists memories_conversation_id_idx
  on public.memories (conversation_id);

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

drop trigger if exists memories_set_updated_at on public.memories;
create trigger memories_set_updated_at
before update on public.memories
for each row
execute function public.set_updated_at();
