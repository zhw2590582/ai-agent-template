'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';

import { CONVERSATION_SUMMARY_PAGE_SIZE } from '@/config/chat';
import { API_ROUTES } from '@/config/api';
import { fetchConversationSummaryPage } from '@/features/chat/data/conversation-summary-service';
import {
  ensureLocalConversationThreadsLoaded,
  listLocalConversationSummaries,
  subscribeToLocalConversationUpdates,
  updateLocalConversationSummary,
} from '@/features/chat/storage/local-conversations';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { getApiErrorToastMessage } from '@/lib/api-client';

const EMPTY_SUMMARIES: ConversationSummary[] = [];

interface RemoteSummaryPageState {
  page: number;
  summaries: ConversationSummary[];
  total: number;
}

interface UseConversationSummarySourceOptions {
  isAuthenticated: boolean;
  onLoadError?: () => void;
  t: (key: string) => string;
}

export function useConversationSummarySource({
  isAuthenticated,
  onLoadError,
  t,
}: UseConversationSummarySourceOptions) {
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [resolvedRequest, setResolvedRequest] = useState<{
    page: number;
    refreshKey: number;
  } | null>(null);
  const [remotePageState, setRemotePageState] = useState<RemoteSummaryPageState | null>(null);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      isAuthenticated ? () => {} : subscribeToLocalConversationUpdates(onStoreChange),
    [isAuthenticated]
  );
  const getSnapshot = useCallback(
    () => (isAuthenticated ? EMPTY_SUMMARIES : listLocalConversationSummaries()),
    [isAuthenticated]
  );
  const localSummaries = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_SUMMARIES);
  const localSummaryItems = useMemo(
    () => localSummaries.filter((summary) => summary.summary?.trim()),
    [localSummaries]
  );

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    void ensureLocalConversationThreadsLoaded();
  }, [isAuthenticated]);
  const localTotalPages = Math.max(
    1,
    Math.ceil(localSummaryItems.length / CONVERSATION_SUMMARY_PAGE_SIZE)
  );
  const remoteTotal = remotePageState?.total ?? 0;
  const remoteTotalPages = Math.max(1, Math.ceil(remoteTotal / CONVERSATION_SUMMARY_PAGE_SIZE));
  const totalPages = isAuthenticated ? remoteTotalPages : localTotalPages;
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();

    void fetchConversationSummaryPage({
      limit: CONVERSATION_SUMMARY_PAGE_SIZE,
      offset: (currentPage - 1) * CONVERSATION_SUMMARY_PAGE_SIZE,
      signal: controller.signal,
    })
      .then((data) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setRemotePageState({
          page: currentPage,
          summaries: data.conversations,
          total: data.total,
        });
        setResolvedRequest({ page: currentPage, refreshKey });
      })
      .catch((error) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        if ((error as Error).name !== 'AbortError') {
          setResolvedRequest({ page: currentPage, refreshKey });
          onLoadError?.();
        }
      });

    return () => {
      controller.abort();
    };
  }, [currentPage, isAuthenticated, onLoadError, refreshKey]);

  const paginatedLocalSummaries = useMemo(() => {
    const startIndex = (currentPage - 1) * CONVERSATION_SUMMARY_PAGE_SIZE;
    return localSummaryItems.slice(startIndex, startIndex + CONVERSATION_SUMMARY_PAGE_SIZE);
  }, [currentPage, localSummaryItems]);

  const summaries =
    isAuthenticated && remotePageState?.page === currentPage
      ? remotePageState.summaries
      : isAuthenticated
        ? EMPTY_SUMMARIES
        : paginatedLocalSummaries;
  const totalItems = isAuthenticated ? remoteTotal : localSummaryItems.length;
  const isLoading =
    isAuthenticated &&
    (resolvedRequest == null ||
      resolvedRequest.page !== currentPage ||
      resolvedRequest.refreshKey !== refreshKey);

  const refresh = () => setRefreshKey((value) => value + 1);

  const handleDeleteSummary = async (conversationId: string) => {
    setPendingDeleteId(conversationId);
    try {
      if (!isAuthenticated) {
        return await updateLocalConversationSummary({
          id: conversationId,
          summary: null,
        });
      }

      const response = await fetch(API_ROUTES.conversations, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId, summary: null }),
      });

      if (!response.ok) {
        toast.error(
          await getApiErrorToastMessage(response, t, 'memory_page.toast.summary_delete_failed')
        );
        return false;
      }

      refresh();
      return true;
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleEditSummary = async (input: { conversationId: string; summary: string }) => {
    setPendingEditId(input.conversationId);
    try {
      if (!isAuthenticated) {
        return await updateLocalConversationSummary({
          id: input.conversationId,
          summary: input.summary,
        });
      }

      const response = await fetch(API_ROUTES.conversations, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: input.conversationId,
          summary: input.summary.trim(),
        }),
      });

      if (!response.ok) {
        toast.error(
          await getApiErrorToastMessage(response, t, 'memory_page.toast.summary_update_failed')
        );
        return false;
      }

      refresh();
      return true;
    } finally {
      setPendingEditId(null);
    }
  };

  return {
    currentPage,
    handleDeleteSummary,
    handleEditSummary,
    isLoading,
    pendingDeleteId,
    pendingEditId,
    refresh,
    setPage: (nextPage: number) => setPage(Math.min(Math.max(nextPage, 1), totalPages)),
    summaries,
    totalItems,
    totalPages,
  };
}
