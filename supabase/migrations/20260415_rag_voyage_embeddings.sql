drop index if exists public.rag_chunks_embedding_idx;

update public.rag_chunks
set embedding = null
where embedding is not null;

alter table public.rag_chunks
alter column embedding type vector(1024);

create index if not exists rag_chunks_embedding_idx
  on public.rag_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

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
