import { embed } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import type { SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/config/env';
import { RAG_CONFIG } from '@/config/rag';
import type { Database } from '@/lib/supabase/database.types';
import { logger } from '@/lib/logger';
import { matchRagChunks } from '@/features/rag/storage/rag-repository';
import type { RagSettings, RetrievedRagChunk } from '@/features/rag/types';

function getResolvedEmbeddingApiKey(apiKey: string) {
  return apiKey.trim() || env.RAG_EMBEDDING_API_KEY || '';
}

function toVectorLiteral(embedding: number[]) {
  return `[${embedding.join(',')}]`;
}

export async function generateQueryEmbedding(query: string, apiKey: string) {
  const resolvedApiKey = getResolvedEmbeddingApiKey(apiKey);

  if (!resolvedApiKey || !env.RAG_EMBEDDING_MODEL) {
    throw new Error('RAG embedding configuration is missing.');
  }

  const provider = createOpenAI({
    apiKey: resolvedApiKey,
    baseURL: env.RAG_EMBEDDING_BASE_URL || undefined,
    name: 'rag-embedding',
  });

  const { embedding } = await embed({
    model: provider.embedding(env.RAG_EMBEDDING_MODEL),
    value: query,
  });

  if (embedding.length !== RAG_CONFIG.EMBEDDING_DIMENSIONS) {
    throw new Error(
      `RAG embedding dimension mismatch. Expected ${RAG_CONFIG.EMBEDDING_DIMENSIONS}, received ${embedding.length}.`
    );
  }

  return embedding;
}

export async function retrieveRelevantChunks({
  query,
  ragSettings,
  supabase,
  userId,
}: {
  query: string;
  ragSettings: RagSettings;
  supabase: SupabaseClient<Database>;
  userId: string;
}): Promise<RetrievedRagChunk[]> {
  if (!ragSettings.enabled || query.trim().length === 0) {
    return [];
  }

  if (!getResolvedEmbeddingApiKey(ragSettings.apiKey) || !env.RAG_EMBEDDING_MODEL) {
    logger.warn('RAG retrieval skipped: embedding configuration missing');
    return [];
  }

  const embedding = await generateQueryEmbedding(query, ragSettings.apiKey);

  return matchRagChunks(supabase, {
    filter_knowledge_base_id: ragSettings.knowledgeBaseId,
    filter_user_id: userId,
    match_count: ragSettings.matchCount,
    match_threshold: ragSettings.matchThreshold,
    query_embedding: toVectorLiteral(embedding),
  });
}

export function buildRagContext(chunks: RetrievedRagChunk[], ragSettings: RagSettings) {
  if (chunks.length === 0) {
    return null;
  }

  const lines: string[] = [
    'Use the following retrieved knowledge base excerpts only when they are relevant to the current request.',
    'If the excerpts are insufficient, say so plainly instead of inventing details.',
    'When grounding an answer in these excerpts, cite them inline using [KB1], [KB2], etc.',
    '',
  ];

  let usedCharacters = 0;

  chunks.forEach((chunk, index) => {
    if (usedCharacters >= ragSettings.maxContextCharacters) {
      return;
    }

    const label = `KB${index + 1}`;
    const sourceLine = [chunk.documentTitle, chunk.source].filter(Boolean).join(' • ');
    const remainingBudget = ragSettings.maxContextCharacters - usedCharacters;
    const content =
      chunk.content.length > remainingBudget
        ? `${chunk.content.slice(0, Math.max(0, remainingBudget - 1)).trimEnd()}…`
        : chunk.content;

    lines.push(`[${label}] ${sourceLine}`);
    lines.push(content);
    lines.push('');
    usedCharacters += content.length;
  });

  return lines.join('\n').trim();
}
