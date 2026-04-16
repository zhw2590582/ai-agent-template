import type { SupabaseClient } from '@supabase/supabase-js';

import { RAG_CONFIG } from '@/config/rag';
import type { Database } from '@/lib/supabase/database.types';
import { logger } from '@/lib/logger';
import { embedQueryWithProvider } from '@/features/rag/server/embeddings';
import { createRerankProvider, hasResolvedEmbeddingAccess } from '@/features/rag/server/providers';
import { matchRagChunks } from '@/features/rag/storage/rag-repository';
import type { RagSettings, RetrievedRagChunk } from '@/features/rag/types';

function toVectorLiteral(embedding: number[]) {
  return `[${embedding.join(',')}]`;
}

export async function generateQueryEmbedding(
  query: string,
  ragSettings: Pick<RagSettings, 'apiKey' | 'provider'>
) {
  if (!hasResolvedEmbeddingAccess(ragSettings)) {
    throw new Error('RAG embedding configuration is missing.');
  }

  return embedQueryWithProvider(query, ragSettings);
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

  if (!hasResolvedEmbeddingAccess(ragSettings)) {
    logger.warn('RAG retrieval skipped: embedding configuration missing');
    return [];
  }

  const embedding = await generateQueryEmbedding(query, ragSettings);
  const candidateMatchCount = Math.min(
    RAG_CONFIG.MAX_CANDIDATE_MATCH_COUNT,
    Math.max(
      ragSettings.matchCount,
      ragSettings.matchCount * RAG_CONFIG.RERANK_CANDIDATE_MULTIPLIER
    )
  );
  const retrievedChunks = await matchRagChunks(supabase, {
    filter_user_id: userId,
    match_count: candidateMatchCount,
    match_threshold: ragSettings.matchThreshold,
    query_embedding: toVectorLiteral(embedding),
  });

  if (retrievedChunks.length <= 1) {
    return retrievedChunks;
  }

  try {
    const rerankedResults = await createRerankProvider(ragSettings).rerank({
      documents: retrievedChunks.map((chunk) => chunk.content),
      query,
      topK: ragSettings.matchCount,
    });

    if (rerankedResults.length === 0) {
      return retrievedChunks.slice(0, ragSettings.matchCount);
    }

    return rerankedResults
      .map((result) => {
        const chunk = retrievedChunks[result.index];

        if (!chunk) {
          return null;
        }

        return {
          ...chunk,
          score: result.score,
        };
      })
      .filter((chunk): chunk is RetrievedRagChunk => Boolean(chunk));
  } catch (rerankError) {
    logger.warn('RAG retrieval: rerank failed, falling back to vector order', {
      error: rerankError instanceof Error ? rerankError.message : String(rerankError),
    });

    return retrievedChunks.slice(0, ragSettings.matchCount);
  }
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
