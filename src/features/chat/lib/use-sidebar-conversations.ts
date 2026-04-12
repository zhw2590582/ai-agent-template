/**
 * useSidebarConversations — manage sidebar conversation list with infinite scroll.
 *
 * Separates sidebar state from the main chat logic to reduce coupling.
 * Uses a ref-based in-flight guard to prevent duplicate pagination requests.
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CONVERSATION_SIDEBAR_PAGE_SIZE } from '@/config/conversations';
import type { ConversationSummary } from '@/server/storage/types';

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
  const [sidebarExtra, setSidebarExtra] = useState<ConversationSummary[]>([]);
  const [sidebarHasMore, setSidebarHasMore] = useState(initialHasMore);
  const [sidebarLoadingMore, setSidebarLoadingMore] = useState(false);
  const [searchResults, setSearchResults] = useState<ConversationSummary[]>([]);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRequestIdRef = useRef(0);

  const inFlightRef = useRef(false);
  const extraRef = useRef<ConversationSummary[]>([]);

  // Keep ref in sync
  useEffect(() => {
    extraRef.current = sidebarExtra;
  }, [sidebarExtra]);

  // Stable key derived from initial data — reset extras when server data changes
  const initialIdsKey = useMemo(
    () => initialConversations.map((c) => c.id).join(','),
    [initialConversations]
  );

  useEffect(() => {
    setSidebarExtra([]);
  }, [initialIdsKey]);

  useEffect(() => {
    setSidebarHasMore(initialHasMore);
  }, [initialHasMore]);

  // Clear optimistic head once it appears in the server list
  useEffect(() => {
    if (pendingSidebarHead && initialConversations.some((c) => c.id === pendingSidebarHead.id)) {
      setPendingSidebarHead(null);
    }
  }, [initialConversations, pendingSidebarHead]);

  const loadMore = useCallback(async () => {
    if (!isAuthenticated || inFlightRef.current || !sidebarHasMore || searchQuery.trim()) return;

    inFlightRef.current = true;
    setSidebarLoadingMore(true);
    const offset = initialConversations.length + extraRef.current.length;

    try {
      const params = new URLSearchParams({
        limit: String(CONVERSATION_SIDEBAR_PAGE_SIZE),
        offset: String(offset),
      });
      const response = await fetch(`/api/conversations?${params.toString()}`);
      if (!response.ok) {
        onLoadError?.();
        return;
      }

      const data: { conversations: ConversationSummary[]; hasMore: boolean } =
        await response.json();

      setSidebarExtra((prev) => {
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
      setSidebarHasMore(data.hasMore);
    } finally {
      inFlightRef.current = false;
      setSidebarLoadingMore(false);
    }
  }, [isAuthenticated, sidebarHasMore, initialConversations, onLoadError, searchQuery]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!isAuthenticated || trimmed.length === 0) {
      setSearchResults([]);
      setSearchHasMore(false);
      setSearchLoading(false);
      return;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;
    setSearchResults([]);
    setSearchHasMore(false);
    setSearchLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          limit: String(CONVERSATION_SIDEBAR_PAGE_SIZE),
          offset: '0',
          query: trimmed,
        });
        const response = await fetch(`/api/conversations?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          onLoadError?.();
          return;
        }
        const data: { conversations: ConversationSummary[]; hasMore: boolean } =
          await response.json();
        if (searchRequestIdRef.current !== requestId) return;
        setSearchResults(data.conversations);
        setSearchHasMore(data.hasMore);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          onLoadError?.();
        }
      } finally {
        if (searchRequestIdRef.current === requestId) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [isAuthenticated, onLoadError, searchQuery]);

  const conversations = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    const base =
      pendingSidebarHead && !initialConversations.some((c) => c.id === pendingSidebarHead.id)
        ? [pendingSidebarHead, ...initialConversations]
        : initialConversations;

    if (sidebarExtra.length === 0) return base;

    const seen = new Set(base.map((c) => c.id));
    return [...base, ...sidebarExtra.filter((c) => !seen.has(c.id))];
  }, [initialConversations, pendingSidebarHead, searchQuery, searchResults, sidebarExtra]);

  return {
    conversations,
    hasMore: searchQuery.trim() ? searchHasMore : sidebarHasMore,
    isLoadingMore: searchQuery.trim() ? searchLoading : sidebarLoadingMore,
    loadMore,
    setPendingSidebarHead,
  };
}
