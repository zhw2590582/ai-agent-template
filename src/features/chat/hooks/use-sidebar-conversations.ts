/**
 * useSidebarConversations — sidebar state orchestration.
 *
 * Combines pagination, search, and optimistic head state.
 * Keeps UI components dumb by exposing a single data shape.
 */

'use client';

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

import type { ConversationSummary } from '@/features/chat/storage/types';
import { useSidebarPagination } from '@/features/chat/hooks/use-sidebar-pagination';
import { useSidebarSearch } from '@/features/chat/hooks/use-sidebar-search';
import {
  listLocalConversationSummaries,
  subscribeToLocalConversationUpdates,
} from '@/features/chat/storage/local-conversations';

const EMPTY_CONVERSATIONS: ConversationSummary[] = [];

interface UseSidebarConversationsOptions {
  initialConversations: ConversationSummary[];
  initialHasMore: boolean;
  isAuthenticated: boolean;
  searchQuery?: string;
  /** Called when loading more conversations fails. */
  onLoadError?: () => void;
}

export function useSidebarConversations({
  initialConversations,
  initialHasMore,
  isAuthenticated,
  searchQuery = '',
  onLoadError,
}: UseSidebarConversationsOptions) {
  const [pendingSidebarHead, setPendingSidebarHead] = useState<ConversationSummary | null>(null);
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
  const isSearching = searchQuery.trim().length > 0;

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

  // Clear optimistic head once it appears in the server list
  useEffect(() => {
    if (pendingSidebarHead && initialConversations.some((c) => c.id === pendingSidebarHead.id)) {
      startTransition(() => {
        setPendingSidebarHead(null);
      });
    }
  }, [initialConversations, pendingSidebarHead]);

  const conversations = useMemo(() => {
    if (!isAuthenticated) {
      const base =
        pendingSidebarHead && !localConversations.some((c) => c.id === pendingSidebarHead.id)
          ? [pendingSidebarHead, ...localConversations]
          : localConversations;

      if (!isSearching) {
        return base;
      }

      const query = searchQuery.trim().toLowerCase();
      return base.filter((item) => item.title.toLowerCase().includes(query));
    }

    if (isSearching) return search.results;
    const base =
      pendingSidebarHead && !initialConversations.some((c) => c.id === pendingSidebarHead.id)
        ? [pendingSidebarHead, ...initialConversations]
        : initialConversations;

    if (pagination.extra.length === 0) return base;

    const seen = new Set(base.map((c) => c.id));
    return [...base, ...pagination.extra.filter((c) => !seen.has(c.id))];
  }, [
    initialConversations,
    isAuthenticated,
    isSearching,
    localConversations,
    pagination.extra,
    pendingSidebarHead,
    search.results,
    searchQuery,
  ]);

  return {
    conversations,
    hasMore: isAuthenticated ? (isSearching ? search.hasMore : pagination.hasMore) : false,
    isLoadingMore: isAuthenticated
      ? isSearching
        ? search.isLoading
        : pagination.isLoading
      : false,
    loadMore: pagination.loadMore,
    setPendingSidebarHead,
  };
}
