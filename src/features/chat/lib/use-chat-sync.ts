/**
 * useChatSync — synchronize useChat messages with URL and server state.
 *
 * Solves race conditions from the old monolithic useEffect:
 * - Uses a version counter to discard stale setMessages calls
 * - Separates URL-change resets from server-data merges
 * - Skips sync while the stream is active (isBusy)
 * - Respects the bootstrapping phase after conversation creation
 */

'use client';

import { startTransition, useEffect, useRef } from 'react';
import type { UIMessage } from 'ai';

interface UseChatSyncOptions {
  /** Conversation ID from the URL search params. null = new chat. */
  urlConversationId: string | null;
  /** Conversation ID that matches initialMessages (from server props). */
  initialConversationId: string | null;
  /** Server-side messages for the current conversation. */
  initialMessages: UIMessage[];
  /** Fallback messages for a blank new chat. */
  starterMessages: UIMessage[];
  /** Whether useChat is currently streaming. */
  isBusy: boolean;
  /** Pending thread ID from optimistic conversation creation. */
  pendingThreadId: string | null;
  /** useChat's setMessages dispatcher. */
  setMessages: (messages: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) => void;
  /** Thread ID that was just created — skip sync until messages are saved. */
  bootstrappingThreadId: string | null;
  /** Callback to clear the bootstrapping flag. */
  clearBootstrapping: () => void;
}

export function useChatSync({
  urlConversationId,
  initialConversationId,
  initialMessages,
  starterMessages,
  isBusy,
  pendingThreadId,
  setMessages,
  bootstrappingThreadId,
  clearBootstrapping,
}: UseChatSyncOptions) {
  const prevUrlIdRef = useRef<string | null>(null);
  // Version counter: incremented on every URL change to discard stale updates
  const syncVersionRef = useRef(0);

  // Effect 1: Reset to starter messages when navigating to new chat (no URL id)
  useEffect(() => {
    if (urlConversationId != null) return;
    if (pendingThreadId != null) return; // Optimistic thread not yet reflected in URL

    prevUrlIdRef.current = null;
    syncVersionRef.current++;

    startTransition(() => {
      setMessages(starterMessages);
    });
  }, [urlConversationId, pendingThreadId, setMessages, starterMessages]);

  // Effect 2: Handle URL-driven conversation switches
  useEffect(() => {
    if (urlConversationId == null) return;

    const urlChanged = prevUrlIdRef.current !== urlConversationId;
    prevUrlIdRef.current = urlConversationId;

    if (!urlChanged) return;

    // Skip sync for a just-created thread until server persists messages
    if (bootstrappingThreadId === urlConversationId) return;

    // Don't interrupt an active stream
    if (isBusy) return;

    syncVersionRef.current++;

    if (initialConversationId === urlConversationId && initialMessages.length > 0) {
      startTransition(() => {
        setMessages(initialMessages);
      });
    } else {
      startTransition(() => {
        setMessages(starterMessages);
      });
    }
  }, [
    urlConversationId,
    initialConversationId,
    initialMessages,
    starterMessages,
    isBusy,
    bootstrappingThreadId,
    setMessages,
  ]);

  // Effect 3: Merge server-refreshed messages (e.g. after router.refresh())
  useEffect(() => {
    if (urlConversationId == null) return;
    if (initialConversationId !== urlConversationId) return;
    if (initialMessages.length === 0) return;

    // Clear bootstrapping flag once server has the messages
    if (bootstrappingThreadId === urlConversationId) {
      clearBootstrapping();
    }

    const capturedVersion = syncVersionRef.current;

    startTransition(() => {
      setMessages((current) => {
        // Discard if a URL change happened after this effect was scheduled
        if (syncVersionRef.current !== capturedVersion) return current;
        // Keep client state if it has more messages (save/refresh race)
        return current.length > initialMessages.length ? current : initialMessages;
      });
    });
  }, [
    urlConversationId,
    initialConversationId,
    initialMessages,
    bootstrappingThreadId,
    clearBootstrapping,
    setMessages,
  ]);
}
