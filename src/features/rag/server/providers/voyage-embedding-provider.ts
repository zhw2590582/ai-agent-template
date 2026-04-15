import type { EmbeddingProvider } from '@/features/rag/server/providers/embedding-provider';

interface VoyageEmbeddingProviderOptions {
  apiKey: string;
  dimensions: number;
  model: string;
}

interface VoyageEmbedResponse {
  data?: Array<{
    embedding?: number[];
  }>;
}

function assertEmbeddingArray(
  embeddings: Array<number[] | undefined>,
  expectedCount: number
): number[][] {
  if (embeddings.length !== expectedCount || embeddings.some((embedding) => !embedding)) {
    throw new Error('Voyage embedding response was incomplete.');
  }

  return embeddings as number[][];
}

async function requestVoyageEmbeddings({
  apiKey,
  dimensions,
  input,
  inputType,
  model,
}: {
  apiKey: string;
  dimensions: number;
  input: string | string[];
  inputType: 'document' | 'query';
  model: string;
}) {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    body: JSON.stringify({
      input,
      input_type: inputType,
      model,
      output_dimension: dimensions,
      output_dtype: 'float',
      truncation: true,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
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

    throw new Error(detail || `Voyage embedding request failed with status ${response.status}.`);
  }

  return (await response.json()) as VoyageEmbedResponse;
}

export class VoyageEmbeddingProvider implements EmbeddingProvider {
  constructor(private readonly options: VoyageEmbeddingProviderOptions) {}

  async embedQuery(input: string) {
    const response = await requestVoyageEmbeddings({
      apiKey: this.options.apiKey,
      dimensions: this.options.dimensions,
      input,
      inputType: 'query',
      model: this.options.model,
    });

    const embeddings = assertEmbeddingArray(
      (response.data ?? []).map((item) => item.embedding),
      1
    );

    return embeddings[0];
  }

  async embedDocuments(inputs: string[]) {
    if (inputs.length === 0) {
      return [];
    }

    const response = await requestVoyageEmbeddings({
      apiKey: this.options.apiKey,
      dimensions: this.options.dimensions,
      input: inputs,
      inputType: 'document',
      model: this.options.model,
    });

    return assertEmbeddingArray(
      (response.data ?? []).map((item) => item.embedding),
      inputs.length
    );
  }
}
