'use client';

import { useEffect, useRef, useState } from 'react';

import { CHAT_UI_CONFIG, CONVERSATION_SIDEBAR_PAGE_SIZE } from '@/config/app';
import { fetchConversationPage } from '@/features/chat/data/sidebar-conversation-service';
import type { ConversationSummary } from '@/features/chat/storage/types';

interface UseSidebarSearchOptions {
  isAuthenticated: boolean;
  searchQuery: string;
  onLoadError?: () => void;
}

export function useSidebarSearch({
  isAuthenticated,
  onLoadError,
  searchQuery,
}: UseSidebarSearchOptions) {
  const [results, setResults] = useState<ConversationSummary[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!isAuthenticated || trimmed.length === 0) {
      setResults([]);
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setResults([]);
    setHasMore(false);
    setIsLoading(true);

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const data = await fetchConversationPage({
          limit: CONVERSATION_SIDEBAR_PAGE_SIZE,
          offset: 0,
          query: trimmed,
          signal: controller.signal,
        });
        if (requestIdRef.current !== requestId) return;
        setResults(data.conversations);
        setHasMore(data.hasMore);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          onLoadError?.();
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }, CHAT_UI_CONFIG.SIDEBAR_SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [isAuthenticated, onLoadError, searchQuery]);

  return { hasMore, isLoading, results };
}
