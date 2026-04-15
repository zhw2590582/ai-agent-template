import { generateQueryEmbedding } from '@/features/rag/server/retrieval';

export async function runRagConnectionTest(apiKey: string) {
  const embedding = await generateQueryEmbedding('RAG connection test', apiKey);

  return {
    dimensions: embedding.length,
  };
}
