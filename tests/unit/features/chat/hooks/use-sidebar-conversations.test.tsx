/** @vitest-environment jsdom */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CHAT_UI_CONFIG } from '@/config/chat';
import { useSidebarConversations } from '@/features/chat/hooks/use-sidebar-conversations';

describe('useSidebarConversations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('loads additional search results when the sidebar stays in search mode', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          conversations: [
            {
              id: 'conversation-1',
              lastMessageAt: '2026-04-16T00:00:00.000Z',
              preview: 'First preview',
              title: 'First result',
            },
          ],
          hasMore: true,
        }),
        ok: true,
      })
      .mockResolvedValueOnce({
        json: async () => ({
          conversations: [
            {
              id: 'conversation-2',
              lastMessageAt: '2026-04-16T00:01:00.000Z',
              preview: 'Second preview',
              title: 'Second result',
            },
          ],
          hasMore: false,
        }),
        ok: true,
      });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() =>
      useSidebarConversations({
        initialConversations: [],
        initialHasMore: false,
        isAuthenticated: true,
        searchQuery: 'agent',
      })
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(CHAT_UI_CONFIG.SIDEBAR_SEARCH_DEBOUNCE_MS);
    });

    expect(result.current.conversations.map((conversation) => conversation.id)).toEqual([
      'conversation-1',
    ]);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.conversations.map((conversation) => conversation.id)).toEqual([
      'conversation-1',
      'conversation-2',
    ]);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('offset=0'),
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('offset=1'),
      expect.objectContaining({
        signal: undefined,
      })
    );
  });
});
