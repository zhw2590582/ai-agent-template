/**
 * useSidebarConversations — sidebar state orchestration.
 *
 * Combines pagination, search, and optimistic head state.
 * Keeps UI components dumb by exposing a single data shape.
 */

'use client';

import { startTransition, useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

import type { ConversationSummary } from '@/features/chat/storage/types';
import { useSidebarPagination } from '@/features/chat/hooks/use-sidebar-pagination';
import { useSidebarSearch } from '@/features/chat/hooks/use-sidebar-search';
import {
  ensureLocalConversationThreadsLoaded,
  listLocalConversationSummaries,
  subscribeToLocalConversationUpdates,
} from '@/features/chat/storage/local-conversations';
import { useConversationListStore } from '@/features/chat/hooks/use-conversation-list-store';

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
  const listStore = useConversationListStore();
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

  // Clear optimistic inserted conversation once the underlying source catches up.
  useEffect(() => {
    const insertedConversationId = listStore.state.insertedConversation?.id;
    const baseConversations = isAuthenticated ? initialConversations : localConversations;

    if (
      insertedConversationId &&
      baseConversations.some((conversation) => conversation.id === insertedConversationId)
    ) {
      startTransition(() => {
        listStore.clearInsertedConversation(insertedConversationId);
      });
    }
  }, [initialConversations, isAuthenticated, listStore, localConversations]);

  const conversations = useMemo(() => {
    if (!isAuthenticated) {
      const base = listStore.buildList(localConversations);

      if (!isSearching) return base;

      const query = searchQuery.trim().toLowerCase();
      return base.filter((item) => item.title.toLowerCase().includes(query));
    }

    if (isSearching) return listStore.buildList(search.results);
    const base = listStore.buildList(initialConversations);

    if (pagination.extra.length === 0) return base;

    const seen = new Set(base.map((c) => c.id));
    return listStore.buildList([...base, ...pagination.extra.filter((c) => !seen.has(c.id))]);
  }, [
    initialConversations,
    isAuthenticated,
    isSearching,
    listStore,
    localConversations,
    pagination.extra,
    search.results,
    searchQuery,
  ]);

  return {
    conversations,
    insertConversation: listStore.insertConversation,
    hasMore: isAuthenticated ? (isSearching ? search.hasMore : pagination.hasMore) : false,
    isLoadingMore: isAuthenticated
      ? isSearching
        ? search.isLoading
        : pagination.isLoading
      : false,
    loadMore: isSearching ? search.loadMore : pagination.loadMore,
    patchConversation: listStore.patchConversation,
    removeConversation: listStore.removeConversation,
    setPendingSidebarHead: listStore.clearInsertedConversation,
  };
}
