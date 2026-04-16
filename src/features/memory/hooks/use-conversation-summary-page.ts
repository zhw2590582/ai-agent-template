'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { CONVERSATION_SUMMARY_PAGE_SIZE } from '@/config/chat';
import { fetchConversationSummaryPage } from '@/features/chat/data/conversation-summary-service';
import {
  listLocalConversationSummaries,
  subscribeToLocalConversationUpdates,
} from '@/features/chat/storage/local-conversations';
import type { ConversationSummary } from '@/features/chat/storage/types';

const EMPTY_SUMMARIES: ConversationSummary[] = [];

interface UseConversationSummaryPageOptions {
  isAuthenticated: boolean;
  onLoadError?: () => void;
}

interface RemoteSummaryPageState {
  page: number;
  source: 'authenticated';
  summaries: ConversationSummary[];
  total: number;
}

export function useConversationSummaryPage({
  isAuthenticated,
  onLoadError,
}: UseConversationSummaryPageOptions) {
  const [page, setPage] = useState(1);
  const [remotePageState, setRemotePageState] = useState<RemoteSummaryPageState | null>(null);
  const [resolvedRequest, setResolvedRequest] = useState<{
    page: number;
    refreshKey: number;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestIdRef = useRef(0);
  const source = isAuthenticated ? 'authenticated' : 'local';

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
  const localTotalPages = Math.max(
    1,
    Math.ceil(localSummaryItems.length / CONVERSATION_SUMMARY_PAGE_SIZE)
  );
  const remoteTotal = remotePageState?.source === 'authenticated' ? remotePageState.total : 0;
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
          source: 'authenticated',
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

  const remoteSummaries =
    remotePageState?.source === source && remotePageState.page === currentPage
      ? remotePageState.summaries
      : EMPTY_SUMMARIES;
  const isLoading =
    isAuthenticated &&
    (resolvedRequest == null ||
      resolvedRequest.page !== currentPage ||
      resolvedRequest.refreshKey !== refreshKey);

  return {
    currentPage,
    isLoading,
    refresh: () => setRefreshKey((value) => value + 1),
    setPage: (nextPage: number) => setPage(Math.min(Math.max(nextPage, 1), totalPages)),
    summaries: isAuthenticated ? remoteSummaries : paginatedLocalSummaries,
    totalItems: isAuthenticated ? remoteTotal : localSummaryItems.length,
    totalPages,
  };
}
