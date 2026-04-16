import { RAG_CONFIG } from '@/config/rag';
import { createEmbeddingProvider } from '@/features/rag/server/providers';
import type { RagProviderId } from '@/features/rag/types';

interface RagProviderConnection {
  apiKey: string;
  provider: RagProviderId;
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

export async function embedQueryWithProvider(query: string, connection: RagProviderConnection) {
  const embedding = await createEmbeddingProvider(connection).embedQuery(query);

  assertEmbeddingDimensions([embedding]);
  return embedding;
}

export async function embedDocumentsWithProvider(
  values: string[],
  connection: RagProviderConnection
) {
  if (values.length === 0) {
    return [];
  }

  const embeddings = await createEmbeddingProvider(connection).embedDocuments(values);

  assertEmbeddingDimensions(embeddings);
  return embeddings;
}
