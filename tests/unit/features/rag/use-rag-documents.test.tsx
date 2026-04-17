/** @vitest-environment jsdom */

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toastError, toastSuccess } = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: toastError,
    success: toastSuccess,
  },
}));

import { useRagDocuments } from '@/features/rag/hooks/use-rag-documents';

describe('useRagDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the current document list when refresh fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [
            {
              id: 'doc-1',
              title: 'Doc 1',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() =>
      useRagDocuments({
        deleteFailedMessage: 'delete failed',
        deleteSuccessMessage: 'delete success',
        importFailedMessage: 'import failed',
        importSuccessMessage: (count) => count,
        loadFailedMessage: 'load failed',
        reindexFailedMessage: 'reindex failed',
        reindexSuccessMessage: (count) => count,
      })
    );

    await waitFor(() => {
      expect(result.current.documents).toHaveLength(1);
    });

    await act(async () => {
      await result.current.refreshDocuments();
    });

    expect(result.current.documents).toEqual([
      expect.objectContaining({
        id: 'doc-1',
        title: 'Doc 1',
      }),
    ]);
    expect(toastError).toHaveBeenCalledWith('load failed');
  });
});
