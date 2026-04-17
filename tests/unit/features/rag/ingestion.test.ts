import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockChunkDocumentText,
  mockDeleteRagChunksForDocument,
  mockDeleteRagDocumentForUser,
  mockEmbedDocumentsWithProvider,
  mockEnsureDefaultKnowledgeBase,
  mockGetRagDocumentForUser,
  mockInsertRagChunks,
  mockInsertRagDocument,
  mockListRagChunksForDocument,
  mockLoggerError,
  mockUpdateRagDocument,
} = vi.hoisted(() => ({
  mockChunkDocumentText: vi.fn(),
  mockDeleteRagChunksForDocument: vi.fn(),
  mockDeleteRagDocumentForUser: vi.fn(),
  mockEmbedDocumentsWithProvider: vi.fn(),
  mockEnsureDefaultKnowledgeBase: vi.fn(),
  mockGetRagDocumentForUser: vi.fn(),
  mockInsertRagChunks: vi.fn(),
  mockInsertRagDocument: vi.fn(),
  mockListRagChunksForDocument: vi.fn(),
  mockLoggerError: vi.fn(),
  mockUpdateRagDocument: vi.fn(),
}));

vi.mock('@/features/rag/server/chunking', () => ({
  chunkDocumentText: mockChunkDocumentText,
}));

vi.mock('@/features/rag/server/embeddings', () => ({
  embedDocumentsWithProvider: mockEmbedDocumentsWithProvider,
}));

vi.mock('@/features/rag/storage/rag-documents', () => ({
  deleteRagChunksForDocument: mockDeleteRagChunksForDocument,
  deleteRagDocumentForUser: mockDeleteRagDocumentForUser,
  ensureDefaultKnowledgeBase: mockEnsureDefaultKnowledgeBase,
  getRagDocumentForUser: mockGetRagDocumentForUser,
  insertRagChunks: mockInsertRagChunks,
  insertRagDocument: mockInsertRagDocument,
  listRagChunksForDocument: mockListRagChunksForDocument,
  updateRagDocument: mockUpdateRagDocument,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
  },
}));

import { ingestRagTextDocument, reindexRagDocument } from '@/features/rag/server/ingestion';

describe('rag ingestion rollback', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockChunkDocumentText.mockReturnValue(['chunk-a']);
    mockEmbedDocumentsWithProvider.mockResolvedValue([[1, 2, 3]]);
    mockEnsureDefaultKnowledgeBase.mockResolvedValue({ id: 'kb-1' });
    mockInsertRagDocument.mockResolvedValue({
      id: 'doc-1',
      metadata: {},
    });
    mockDeleteRagDocumentForUser.mockResolvedValue(undefined);
    mockGetRagDocumentForUser.mockResolvedValue({
      id: 'doc-1',
      metadata: {
        originalText: 'Original text',
      },
    });
    mockListRagChunksForDocument.mockResolvedValue([
      {
        chunk_index: 0,
        content: 'old chunk',
        document_id: 'doc-1',
        embedding: [9, 9, 9],
        metadata: {
          characterCount: 8,
        },
      },
    ]);
    mockDeleteRagChunksForDocument.mockResolvedValue(undefined);
    mockUpdateRagDocument.mockResolvedValue({
      id: 'doc-1',
      metadata: {},
    });
  });

  it('deletes a newly created document when chunk insertion fails', async () => {
    const expectedError = new Error('chunk insert failed');
    mockInsertRagChunks.mockRejectedValue(expectedError);

    await expect(
      ingestRagTextDocument({
        apiKey: 'test-key',
        content: 'Original text',
        provider: 'voyage',
        supabase: {} as never,
        title: 'Doc',
        userId: 'user-1',
      })
    ).rejects.toThrow('chunk insert failed');

    expect(mockDeleteRagDocumentForUser).toHaveBeenCalledWith(expect.anything(), 'doc-1');
  });

  it('restores previous chunks when reindex chunk replacement fails', async () => {
    const expectedError = new Error('new chunk insert failed');
    mockInsertRagChunks.mockRejectedValueOnce(expectedError).mockResolvedValueOnce(undefined);

    await expect(
      reindexRagDocument({
        apiKey: 'test-key',
        documentId: 'doc-1',
        provider: 'voyage',
        supabase: {} as never,
      })
    ).rejects.toThrow('new chunk insert failed');

    expect(mockDeleteRagChunksForDocument).toHaveBeenCalledWith(expect.anything(), 'doc-1');
    expect(mockInsertRagChunks).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({
          chunk_index: 0,
          content: 'old chunk',
          document_id: 'doc-1',
          embedding: [9, 9, 9],
        }),
      ])
    );
  });
});
