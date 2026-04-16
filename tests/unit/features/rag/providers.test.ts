import { describe, expect, it } from 'vitest';

import { RAG_CONFIG } from '@/config/rag';
import {
  createEmbeddingProvider,
  createRerankProvider,
  getResolvedRagProviderApiKey,
  hasResolvedEmbeddingAccess,
  resolveRagProvider,
} from '@/features/rag/server/providers';
import { VoyageEmbeddingProvider } from '@/features/rag/server/providers/voyage-embedding-provider';
import { VoyageRerankProvider } from '@/features/rag/server/providers/voyage-rerank-provider';

describe('rag provider registry', () => {
  it('resolves the current default provider', () => {
    expect(resolveRagProvider()).toBe(RAG_CONFIG.DEFAULT_PROVIDER);
    expect(resolveRagProvider('voyage')).toBe('voyage');
  });

  it('normalizes provider api keys and access checks through the registry', () => {
    expect(
      getResolvedRagProviderApiKey({
        apiKey: '  test-key  ',
        provider: 'voyage',
      })
    ).toBe('test-key');
    expect(
      hasResolvedEmbeddingAccess({
        apiKey: '   ',
        provider: 'voyage',
      })
    ).toBe(false);
  });

  it('creates voyage providers through the factory surface', () => {
    expect(
      createEmbeddingProvider({
        apiKey: 'test-key',
        provider: 'voyage',
      })
    ).toBeInstanceOf(VoyageEmbeddingProvider);
    expect(
      createRerankProvider({
        apiKey: 'test-key',
        provider: 'voyage',
      })
    ).toBeInstanceOf(VoyageRerankProvider);
  });
});
