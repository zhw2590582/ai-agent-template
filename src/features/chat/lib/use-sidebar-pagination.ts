'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CONVERSATION_SIDEBAR_PAGE_SIZE } from '@/config/conversations';
import type { ConversationSummary } from '@/server/storage/types';
import { fetchConversationPage } from '@/features/chat/lib/sidebar-conversation-service';

interface UseSidebarPaginationOptions {
  initialConversations: ConversationSummary[];
  initialHasMore: boolean;
  isAuthenticated: boolean;
  isSearching: boolean;
  onLoadError?: () => void;
}

export function useSidebarPagination({
  initialConversations,
  initialHasMore,
  isAuthenticated,
  isSearching,
  onLoadError,
}: UseSidebarPaginationOptions) {
  const [extra, setExtra] = useState<ConversationSummary[]>([]);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  const inFlightRef = useRef(false);
  const extraRef = useRef<ConversationSummary[]>([]);

  useEffect(() => {
    extraRef.current = extra;
  }, [extra]);

  const initialIdsKey = useMemo(
    () => initialConversations.map((c) => c.id).join(','),
    [initialConversations]
  );

  useEffect(() => {
    setExtra([]);
  }, [initialIdsKey]);

  useEffect(() => {
    setHasMore(initialHasMore);
  }, [initialHasMore]);

  const loadMore = useCallback(async () => {
    if (!isAuthenticated || inFlightRef.current || !hasMore || isSearching) return;

    inFlightRef.current = true;
    setIsLoading(true);
    const offset = initialConversations.length + extraRef.current.length;

    try {
      const data = await fetchConversationPage({
        limit: CONVERSATION_SIDEBAR_PAGE_SIZE,
        offset,
      });
      setExtra((prev) => {
        const seen = new Set([...initialConversations.map((c) => c.id), ...prev.map((c) => c.id)]);
        const merged = [...prev];
        for (const item of data.conversations) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            merged.push(item);
          }
        }
        return merged;
      });
      setHasMore(data.hasMore);
    } catch {
      onLoadError?.();
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, initialConversations, isAuthenticated, isSearching, onLoadError]);

  return { extra, hasMore, isLoading, loadMore };
}
