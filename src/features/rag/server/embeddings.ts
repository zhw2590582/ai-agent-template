import { embed, embedMany } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

import { env } from '@/config/env';
import { RAG_CONFIG } from '@/config/rag';

function getResolvedEmbeddingApiKey(apiKey: string) {
  return apiKey.trim() || env.RAG_EMBEDDING_API_KEY || '';
}

function createEmbeddingModel(apiKey: string) {
  const resolvedApiKey = getResolvedEmbeddingApiKey(apiKey);

  if (!resolvedApiKey || !env.RAG_EMBEDDING_MODEL) {
    throw new Error('RAG embedding configuration is missing.');
  }

  const provider = createOpenAI({
    apiKey: resolvedApiKey,
    baseURL: env.RAG_EMBEDDING_BASE_URL || undefined,
    name: 'rag-embedding',
  });

  return provider.embedding(env.RAG_EMBEDDING_MODEL);
}

function assertEmbeddingDimensions(embeddings: number[][]) {
  for (const embedding of embeddings) {
    if (embedding.length !== RAG_CONFIG.EMBEDDING_DIMENSIONS) {
      throw new Error(
        `RAG embedding dimension mismatch. Expected ${RAG_CONFIG.EMBEDDING_DIMENSIONS}, received ${embedding.length}.`
      );
    }
  }
}

export function hasResolvedEmbeddingAccess(apiKey: string) {
  return Boolean(getResolvedEmbeddingApiKey(apiKey) && env.RAG_EMBEDDING_MODEL);
}

export async function embedQueryWithProvider(query: string, apiKey: string) {
  const { embedding } = await embed({
    model: createEmbeddingModel(apiKey),
    value: query,
  });

  assertEmbeddingDimensions([embedding]);
  return embedding;
}

export async function embedDocumentsWithProvider(values: string[], apiKey: string) {
  if (values.length === 0) {
    return [];
  }

  const { embeddings } = await embedMany({
    model: createEmbeddingModel(apiKey),
    values,
  });

  assertEmbeddingDimensions(embeddings);
  return embeddings;
}
