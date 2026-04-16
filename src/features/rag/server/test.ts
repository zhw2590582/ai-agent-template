import type { RagSettings } from '@/features/rag/types';
import { generateQueryEmbedding } from '@/features/rag/server/retrieval';

export async function runRagConnectionTest(ragSettings: Pick<RagSettings, 'apiKey' | 'provider'>) {
  const embedding = await generateQueryEmbedding('RAG connection test', ragSettings);

  return {
    dimensions: embedding.length,
  };
}
