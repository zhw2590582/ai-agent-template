import { RAG_CONFIG } from '@/config/rag';
import type { EmbeddingProvider } from '@/features/rag/server/providers/embedding-provider';
import type { RerankProvider } from '@/features/rag/server/providers/rerank-provider';
import { VoyageEmbeddingProvider } from '@/features/rag/server/providers/voyage-embedding-provider';
import { VoyageRerankProvider } from '@/features/rag/server/providers/voyage-rerank-provider';
import type { RagProviderId } from '@/features/rag/types';

interface RagProviderConnection {
  apiKey: string;
  provider?: RagProviderId | null;
}

interface RagProviderDefinition {
  createEmbeddingProvider: (apiKey: string) => EmbeddingProvider;
  createRerankProvider: (apiKey: string) => RerankProvider;
  getResolvedApiKey: (apiKey: string) => string;
}

const ragProviderDefinitions: Record<RagProviderId, RagProviderDefinition> = {
  voyage: {
    createEmbeddingProvider: (apiKey) =>
      new VoyageEmbeddingProvider({
        apiKey,
        dimensions: RAG_CONFIG.EMBEDDING_DIMENSIONS,
        model: RAG_CONFIG.DEFAULT_EMBEDDING_MODEL,
      }),
    createRerankProvider: (apiKey) =>
      new VoyageRerankProvider({
        apiKey,
        model: RAG_CONFIG.DEFAULT_RERANK_MODEL,
      }),
    getResolvedApiKey: (apiKey) => apiKey.trim(),
  },
};

export function resolveRagProvider(provider?: RagProviderId | null): RagProviderId {
  return provider === 'voyage' ? provider : RAG_CONFIG.DEFAULT_PROVIDER;
}

function getRagProviderDefinition(provider?: RagProviderId | null) {
  return ragProviderDefinitions[resolveRagProvider(provider)];
}

export function getResolvedRagProviderApiKey({ apiKey, provider }: RagProviderConnection) {
  return getRagProviderDefinition(provider).getResolvedApiKey(apiKey);
}

export function hasResolvedEmbeddingAccess(connection: RagProviderConnection) {
  return Boolean(getResolvedRagProviderApiKey(connection));
}

export function createEmbeddingProvider({
  apiKey,
  provider,
}: RagProviderConnection): EmbeddingProvider {
  const resolvedApiKey = getResolvedRagProviderApiKey({
    apiKey,
    provider,
  });

  if (!resolvedApiKey) {
    throw new Error('RAG embedding configuration is missing.');
  }

  return getRagProviderDefinition(provider).createEmbeddingProvider(resolvedApiKey);
}

export function createRerankProvider({ apiKey, provider }: RagProviderConnection): RerankProvider {
  const resolvedApiKey = getResolvedRagProviderApiKey({
    apiKey,
    provider,
  });

  if (!resolvedApiKey) {
    throw new Error('RAG rerank configuration is missing.');
  }

  return getRagProviderDefinition(provider).createRerankProvider(resolvedApiKey);
}
