'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { RagDocument } from '@/features/rag/types';

interface UseRagDocumentsOptions {
  deleteFailedMessage: string;
  deleteSuccessMessage: string;
  importFailedMessage: string;
  importSuccessMessage: (count: string) => string;
}

export function useRagDocuments({
  deleteFailedMessage,
  deleteSuccessMessage,
  importFailedMessage,
  importSuccessMessage,
}: UseRagDocumentsOptions) {
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/rag/documents');
      if (!response.ok) {
        setDocuments([]);
        return;
      }

      const data = (await response.json()) as { documents?: RagDocument[] };
      setDocuments(data.documents ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const importDocument = async (input: {
    apiKey: string;
    content: string;
    source: string;
    title: string;
  }) => {
    setIsImporting(true);
    try {
      const response = await fetch('/api/rag/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        toast.error(data?.error?.message || importFailedMessage);
        return false;
      }

      const data = (await response.json()) as { chunkCount?: number; document?: RagDocument };
      if (data.document) {
        setDocuments((current) => [
          data.document!,
          ...current.filter((item) => item.id !== data.document!.id),
        ]);
      } else {
        await loadDocuments();
      }

      toast.success(importSuccessMessage(String(data.chunkCount ?? 0)));
      return true;
    } finally {
      setIsImporting(false);
    }
  };

  const deleteDocument = async (id: string) => {
    setIsDeletingId(id);
    try {
      const response = await fetch('/api/rag/documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        toast.error(data?.error?.message || deleteFailedMessage);
        return false;
      }

      setDocuments((current) => current.filter((item) => item.id !== id));
      toast.success(deleteSuccessMessage);
      return true;
    } finally {
      setIsDeletingId(null);
    }
  };

  return {
    deleteDocument,
    documents,
    importDocument,
    isDeletingId,
    isImporting,
    isLoading,
    refreshDocuments: loadDocuments,
  };
}
