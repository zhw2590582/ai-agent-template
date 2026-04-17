'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import type { ConversationSummary } from '@/features/chat/storage/types';
import { useSidebarPagination } from '@/features/chat/hooks/use-sidebar-pagination';
import { useSidebarSearch } from '@/features/chat/hooks/use-sidebar-search';
import {
  ensureLocalConversationThreadsLoaded,
  listLocalConversationSummaries,
  subscribeToLocalConversationUpdates,
} from '@/features/chat/storage/local-conversations';

const EMPTY_CONVERSATIONS: ConversationSummary[] = [];

interface UseConversationListSourceOptions {
  initialConversations: ConversationSummary[];
  initialHasMore: boolean;
  isAuthenticated: boolean;
  onLoadError?: () => void;
  searchQuery?: string;
}

export function useConversationListSource({
  initialConversations,
  initialHasMore,
  isAuthenticated,
  onLoadError,
  searchQuery = '',
}: UseConversationListSourceOptions) {
  const isSearching = searchQuery.trim().length > 0;
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      isAuthenticated ? () => {} : subscribeToLocalConversationUpdates(onStoreChange),
    [isAuthenticated]
  );
  const getSnapshot = useCallback(
    () => (isAuthenticated ? EMPTY_CONVERSATIONS : listLocalConversationSummaries()),
    [isAuthenticated]
  );
  const localConversations = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => EMPTY_CONVERSATIONS
  );

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    void ensureLocalConversationThreadsLoaded();
  }, [isAuthenticated]);

  const search = useSidebarSearch({
    isAuthenticated,
    searchQuery,
    onLoadError,
  });

  const pagination = useSidebarPagination({
    initialConversations,
    initialHasMore,
    isAuthenticated,
    isSearching,
    onLoadError,
  });

  if (!isAuthenticated) {
    const baseConversations =
      isSearching && searchQuery.trim()
        ? localConversations.filter((item) =>
            item.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
          )
        : localConversations;

    return {
      baseConversations,
      hasMore: false,
      isLoadingMore: false,
      isSearching,
      loadMore: async () => {},
    };
  }

  return {
    baseConversations: isSearching
      ? search.results
      : [...initialConversations, ...pagination.extra].filter(
          (conversation, index, array) =>
            array.findIndex((item) => item.id === conversation.id) === index
        ),
    hasMore: isSearching ? search.hasMore : pagination.hasMore,
    isLoadingMore: isSearching ? search.isLoading : pagination.isLoading,
    isSearching,
    loadMore: isSearching ? search.loadMore : pagination.loadMore,
  };
}
