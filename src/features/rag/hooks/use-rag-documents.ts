'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { RagDocument } from '@/features/rag/types';

interface UseRagDocumentsOptions {
  deleteFailedMessage: string;
  deleteSuccessMessage: string;
  enabled?: boolean;
  importFailedMessage: string;
  importSuccessMessage: (count: string) => string;
  reindexFailedMessage: string;
  reindexSuccessMessage: (count: string) => string;
}

type RagDocumentImportInput = {
  apiKey: string;
  file: File;
  source: string;
  title: string;
  type: 'file';
};

export function useRagDocuments({
  deleteFailedMessage,
  deleteSuccessMessage,
  enabled = true,
  importFailedMessage,
  importSuccessMessage,
  reindexFailedMessage,
  reindexSuccessMessage,
}: UseRagDocumentsOptions) {
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isReindexingId, setIsReindexingId] = useState<string | null>(null);

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
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    void loadDocuments();
  }, [enabled, loadDocuments]);

  const importDocument = async (input: RagDocumentImportInput) => {
    setIsImporting(true);
    try {
      const response = await fetch('/api/rag/documents', {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.set('apiKey', input.apiKey);
          formData.set('file', input.file);
          formData.set('source', input.source);
          formData.set('title', input.title);
          return formData;
        })(),
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

  const reindexDocument = async (input: { apiKey: string; id: string }) => {
    setIsReindexingId(input.id);
    try {
      const response = await fetch('/api/rag/documents', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        toast.error(data?.error?.message || reindexFailedMessage);
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

      toast.success(reindexSuccessMessage(String(data.chunkCount ?? 0)));
      return true;
    } finally {
      setIsReindexingId(null);
    }
  };

  return {
    deleteDocument,
    documents,
    importDocument,
    isDeletingId,
    isImporting,
    isLoading,
    isReindexingId,
    refreshDocuments: loadDocuments,
    reindexDocument,
  };
}
