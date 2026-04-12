/**
 * useSidebarConversations — sidebar state orchestration.
 *
 * Combines pagination, search, and optimistic head state.
 * Keeps UI components dumb by exposing a single data shape.
 */

'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';

import type { ConversationSummary } from '@/server/storage/types';
import { useSidebarPagination } from '@/features/chat/lib/use-sidebar-pagination';
import { useSidebarSearch } from '@/features/chat/lib/use-sidebar-search';

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
    if (isSearching) return search.results;
    const base =
      pendingSidebarHead && !initialConversations.some((c) => c.id === pendingSidebarHead.id)
        ? [pendingSidebarHead, ...initialConversations]
        : initialConversations;

    if (pagination.extra.length === 0) return base;

    const seen = new Set(base.map((c) => c.id));
    return [...base, ...pagination.extra.filter((c) => !seen.has(c.id))];
  }, [initialConversations, isSearching, pagination.extra, pendingSidebarHead, search.results]);

  return {
    conversations,
    hasMore: isSearching ? search.hasMore : pagination.hasMore,
    isLoadingMore: isSearching ? search.isLoading : pagination.isLoading,
    loadMore: pagination.loadMore,
    setPendingSidebarHead,
  };
}
