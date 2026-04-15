import { RAG_CONFIG } from '@/config/rag';
import { createEmbeddingProvider } from '@/features/rag/server/providers';

function assertEmbeddingDimensions(embeddings: number[][]) {
  for (const embedding of embeddings) {
    if (embedding.length !== RAG_CONFIG.EMBEDDING_DIMENSIONS) {
      throw new Error(
        `RAG embedding dimension mismatch. Expected ${RAG_CONFIG.EMBEDDING_DIMENSIONS}, received ${embedding.length}.`
      );
    }
  }
}

export async function embedQueryWithProvider(query: string, apiKey: string) {
  const embedding = await createEmbeddingProvider(apiKey).embedQuery(query);

  assertEmbeddingDimensions([embedding]);
  return embedding;
}

export async function embedDocumentsWithProvider(values: string[], apiKey: string) {
  if (values.length === 0) {
    return [];
  }

  const embeddings = await createEmbeddingProvider(apiKey).embedDocuments(values);

  assertEmbeddingDimensions(embeddings);
  return embeddings;
}
