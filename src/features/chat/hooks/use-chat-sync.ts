'use client';

import { startTransition, useEffect, useMemo, useRef } from 'react';
import type { UIMessage } from 'ai';

import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import { createConversationRecordSource } from '@/features/chat/sources/conversation-record-source';
import {
  getConversationSyncPhase,
  hasUrlChanged,
  pickNewMessages,
  shouldMergeServerMessages,
  shouldResetToStarter,
  shouldSkipUrlSync,
} from '@/features/chat/utils/chat-sync';

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
  /** Most recent local conversation id whose messages are hydrated into useChat state. */
  hydratedConversationId: string | null;
  /** Callback to update the hydrated local conversation id. */
  setHydratedConversationId: (conversationId: string | null) => void;
  /** Current user snapshot to resolve local vs remote conversation sources. */
  user: AuthUserSnapshot | null;
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
  hydratedConversationId,
  setHydratedConversationId,
  user,
}: UseChatSyncOptions) {
  const recordSource = useMemo(() => createConversationRecordSource(user), [user]);
  const prevUrlIdRef = useRef<string | null>(null);
  // Version counter: incremented on every URL change to discard stale updates
  const syncVersionRef = useRef(0);

  // Effect 1: Reset to starter messages when navigating to new chat (no URL id)
  useEffect(() => {
    if (!shouldResetToStarter({ urlConversationId, pendingThreadId })) return;

    prevUrlIdRef.current = null;
    syncVersionRef.current++;
    if (hydratedConversationId !== null) {
      setHydratedConversationId(null);
    }

    startTransition(() => {
      setMessages(starterMessages);
    });
  }, [
    hydratedConversationId,
    pendingThreadId,
    setHydratedConversationId,
    setMessages,
    starterMessages,
    urlConversationId,
  ]);

  // Effect 2: Handle URL-driven conversation switches
  useEffect(() => {
    if (urlConversationId == null) return;

    const urlChanged = hasUrlChanged(prevUrlIdRef.current, urlConversationId);
    prevUrlIdRef.current = urlConversationId;

    if (!urlChanged) return;

    if (hydratedConversationId !== urlConversationId) {
      setHydratedConversationId(null);
    }

    const phase = getConversationSyncPhase({
      activeThreadId: urlConversationId,
      bootstrappingThreadId,
      hydratedConversationId,
      urlConversationId,
    });

    if (shouldSkipUrlSync({ urlConversationId, phase, isBusy })) return;

    syncVersionRef.current++;
    const capturedVersion = syncVersionRef.current;

    const cachedMessages = recordSource.getCachedMessages(urlConversationId);
    const initialUrlMessages =
      initialConversationId === urlConversationId && initialMessages.length > 0
        ? initialMessages
        : null;

    startTransition(() => {
      setMessages(cachedMessages ?? initialUrlMessages ?? starterMessages);
    });

    if (cachedMessages || initialUrlMessages) {
      setHydratedConversationId(urlConversationId);

      if (!cachedMessages) {
        return;
      }
    }

    void (async () => {
      const nextMessages =
        (cachedMessages
          ? await recordSource.refreshMessages(urlConversationId)
          : await recordSource.getMessages(urlConversationId)) ?? starterMessages;

      if (nextMessages !== starterMessages) {
        recordSource.cacheMessages(urlConversationId, nextMessages);
      }

      if (syncVersionRef.current !== capturedVersion) {
        return;
      }

      setHydratedConversationId(urlConversationId);

      startTransition(() => {
        setMessages((current) => {
          if (syncVersionRef.current !== capturedVersion) {
            return current;
          }

          return pickNewMessages({ current, server: nextMessages });
        });
      });
    })();
  }, [
    initialConversationId,
    initialMessages,
    isBusy,
    bootstrappingThreadId,
    hydratedConversationId,
    recordSource,
    setHydratedConversationId,
    setMessages,
    starterMessages,
    urlConversationId,
  ]);

  // Effect 3: Merge route-provided messages when they already match the active conversation
  useEffect(() => {
    if (!shouldMergeServerMessages({ urlConversationId, initialConversationId, initialMessages })) {
      return;
    }

    // Clear bootstrapping flag once server has the messages
    if (
      getConversationSyncPhase({
        activeThreadId: urlConversationId,
        bootstrappingThreadId,
        hydratedConversationId,
        urlConversationId,
      }) === 'bootstrapping'
    ) {
      clearBootstrapping();
    }

    if (urlConversationId) {
      recordSource.cacheMessages(urlConversationId, initialMessages);
      if (hydratedConversationId !== urlConversationId) {
        setHydratedConversationId(urlConversationId);
      }
    }

    const capturedVersion = syncVersionRef.current;

    startTransition(() => {
      setMessages((current) => {
        // Discard if a URL change happened after this effect was scheduled
        if (syncVersionRef.current !== capturedVersion) return current;
        // Keep client state if it has more messages (save/refresh race)
        return pickNewMessages({ current, server: initialMessages });
      });
    });
  }, [
    recordSource,
    urlConversationId,
    initialConversationId,
    initialMessages,
    bootstrappingThreadId,
    clearBootstrapping,
    hydratedConversationId,
    setMessages,
    setHydratedConversationId,
  ]);
}
