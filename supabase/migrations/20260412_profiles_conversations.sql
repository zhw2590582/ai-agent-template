create extension if not exists pgcrypto;

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
  last_message_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists conversations_user_id_last_message_at_idx
  on public.conversations (user_id, last_message_at desc);

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
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
