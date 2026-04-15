import type {
  RerankProvider,
  RerankedDocument,
} from '@/features/rag/server/providers/rerank-provider';

interface VoyageRerankProviderOptions {
  apiKey: string;
  model: string;
}

interface VoyageRerankResponse {
  data?: Array<{
    index?: number;
    relevance_score?: number;
  }>;
}

function assertRerankResults(
  results: Array<{ index?: number; relevance_score?: number }>
): RerankedDocument[] {
  return results
    .filter((result): result is { index: number; relevance_score: number } => {
      return typeof result.index === 'number' && typeof result.relevance_score === 'number';
    })
    .map((result) => ({
      index: result.index,
      score: result.relevance_score,
    }));
}

export class VoyageRerankProvider implements RerankProvider {
  constructor(private readonly options: VoyageRerankProviderOptions) {}

  async rerank({ documents, query, topK }: { documents: string[]; query: string; topK: number }) {
    if (documents.length === 0) {
      return [];
    }

    const response = await fetch('https://api.voyageai.com/v1/rerank', {
      body: JSON.stringify({
        documents,
        model: this.options.model,
        query,
        top_k: topK,
        truncation: true,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.options.apiKey}`,
      },
      method: 'POST',
    });

    if (!response.ok) {
      let detail = '';

      try {
        const payload = (await response.json()) as {
          detail?: string;
          error?: string | { message?: string };
        };
        detail =
          typeof payload.detail === 'string'
            ? payload.detail
            : typeof payload.error === 'string'
              ? payload.error
              : payload.error?.message || '';
      } catch {
        detail = '';
      }

      throw new Error(detail || `Voyage rerank request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as VoyageRerankResponse;
    return assertRerankResults(payload.data ?? []);
  }
}
