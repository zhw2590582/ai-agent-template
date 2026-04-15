import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/database.types';
import type { RetrievedRagChunk } from '@/features/rag/types';

interface MatchRagChunksArgs {
  filter_knowledge_base_id?: string | null;
  filter_user_id: string;
  match_count: number;
  match_threshold: number;
  query_embedding: string;
}

interface MatchRagChunksRow {
  content: string;
  document_id: string;
  document_title: string;
  id: string;
  knowledge_base_id: string;
  metadata: Record<string, unknown> | null;
  score: number;
  source: string | null;
}

function mapRetrievedChunk(row: MatchRagChunksRow): RetrievedRagChunk {
  return {
    content: row.content,
    documentId: row.document_id,
    documentTitle: row.document_title,
    id: row.id,
    knowledgeBaseId: row.knowledge_base_id,
    metadata: row.metadata ?? {},
    score: row.score,
    source: row.source,
  };
}

export async function matchRagChunks(
  client: SupabaseClient<Database>,
  args: MatchRagChunksArgs
): Promise<RetrievedRagChunk[]> {
  const rpc = client.rpc('match_rag_chunks' as never, args as never) as PromiseLike<{
    data: MatchRagChunksRow[] | null;
    error: unknown;
  }>;

  const { data, error } = await rpc;

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRetrievedChunk);
}
