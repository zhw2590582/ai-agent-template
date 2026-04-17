/**
 * useSidebarConversations — sidebar state orchestration.
 *
 * Combines pagination, search, and optimistic head state.
 * Keeps UI components dumb by exposing a single data shape.
 */

'use client';

import { startTransition, useEffect, useMemo } from 'react';

import type { ConversationSummary } from '@/features/chat/storage/types';
import { useConversationListSource } from '@/features/chat/hooks/use-conversation-list-source';
import { useConversationListStore } from '@/features/chat/hooks/use-conversation-list-store';

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
  const { baseConversations, hasMore, isLoadingMore, loadMore } = useConversationListSource({
    initialConversations,
    initialHasMore,
    isAuthenticated,
    onLoadError,
    searchQuery,
  });

  // Clear optimistic inserted conversation once the underlying source catches up.
  useEffect(() => {
    const insertedConversationId = listStore.state.insertedConversation?.id;

    if (
      insertedConversationId &&
      baseConversations.some((conversation) => conversation.id === insertedConversationId)
    ) {
      startTransition(() => {
        listStore.clearInsertedConversation(insertedConversationId);
      });
    }
  }, [baseConversations, listStore]);

  const conversations = useMemo(() => {
    return listStore.buildList(baseConversations);
  }, [baseConversations, listStore]);

  return {
    conversations,
    insertConversation: listStore.insertConversation,
    hasMore,
    isLoadingMore,
    loadMore,
    patchConversation: listStore.patchConversation,
    removeConversation: listStore.removeConversation,
    setPendingSidebarHead: listStore.clearInsertedConversation,
  };
}
