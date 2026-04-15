import { RAG_CONFIG } from '@/config/rag';
import type { EmbeddingProvider } from '@/features/rag/server/providers/embedding-provider';
import type { RerankProvider } from '@/features/rag/server/providers/rerank-provider';
import { VoyageEmbeddingProvider } from '@/features/rag/server/providers/voyage-embedding-provider';
import { VoyageRerankProvider } from '@/features/rag/server/providers/voyage-rerank-provider';

export function getResolvedEmbeddingApiKey(apiKey: string) {
  return apiKey.trim();
}

export function hasResolvedEmbeddingAccess(apiKey: string) {
  return Boolean(getResolvedEmbeddingApiKey(apiKey));
}

export function getResolvedEmbeddingModel() {
  return RAG_CONFIG.DEFAULT_EMBEDDING_MODEL;
}

export function getResolvedRerankModel() {
  return RAG_CONFIG.DEFAULT_RERANK_MODEL;
}

export function createEmbeddingProvider(apiKey: string): EmbeddingProvider {
  const resolvedApiKey = getResolvedEmbeddingApiKey(apiKey);

  if (!resolvedApiKey) {
    throw new Error('RAG embedding configuration is missing.');
  }

  return new VoyageEmbeddingProvider({
    apiKey: resolvedApiKey,
    dimensions: RAG_CONFIG.EMBEDDING_DIMENSIONS,
    model: getResolvedEmbeddingModel(),
  });
}

export function createRerankProvider(apiKey: string): RerankProvider {
  const resolvedApiKey = getResolvedEmbeddingApiKey(apiKey);

  if (!resolvedApiKey) {
    throw new Error('RAG rerank configuration is missing.');
  }

  return new VoyageRerankProvider({
    apiKey: resolvedApiKey,
    model: getResolvedRerankModel(),
  });
}
