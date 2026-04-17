'use client';

import { useEffect, useRef } from 'react';
import type { UIMessage } from 'ai';

import { API_ROUTES } from '@/config/api';
import type { Locale } from '@/config/i18n';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import type { MemorySettings } from '@/features/auth/profile/types';
import {
  generateConversationRecordMemories,
  generateConversationRecordTitle,
  generateConversationRecordSummary,
  getConversationMessages,
  persistConversationMessages,
} from '@/features/chat/data/conversation-operations';
import {
  buildConversationTitleFromText,
  getMessageText,
} from '@/features/chat/storage/conversation-analysis';
import {
  areLocalConversationThreadsLoaded,
  getLocalConversationThread,
} from '@/features/chat/storage/local-conversations';
import type { ChatRuntimeModel } from '@/features/models/types';

function isLocalConversationId(conversationId: string | null) {
  return Boolean(conversationId?.startsWith('local-'));
}

function areMessagesEqual(left: UIMessage[], right: UIMessage[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function hasLoadedActiveLocalConversationMessages(input: {
  activeThreadId: string | null;
  bootstrappingThreadId: string | null;
  messages: UIMessage[];
  urlConversationId: string | null;
  user: AuthUserSnapshot | null;
}) {
  if (
    input.user ||
    !input.activeThreadId ||
    !input.urlConversationId ||
    input.activeThreadId !== input.urlConversationId ||
    !isLocalConversationId(input.activeThreadId)
  ) {
    return true;
  }

  if (input.bootstrappingThreadId === input.activeThreadId) {
    return true;
  }

  if (!areLocalConversationThreadsLoaded()) {
    return false;
  }

  const localMessages = getLocalConversationThread(input.activeThreadId)?.messages ?? null;

  if (!localMessages) {
    return true;
  }

  return areMessagesEqual(localMessages, input.messages);
}

interface UseConversationRecordSyncOptions {
  activeThreadId: string | null;
  activeThreadTitle: string | null;
  bootstrappingThreadId: string | null;
  isBusy: boolean;
  locale: Locale;
  memorySettings: MemorySettings;
  messages: UIMessage[];
  onOptimisticPatchConversation: (
    conversationId: string,
    patch: {
      id?: string;
      lastMessageAt?: string;
      preview?: string | null;
      title?: string;
    }
  ) => void;
  runtimeModel?: ChatRuntimeModel | null;
  setMessages: (messages: UIMessage[]) => void;
  urlConversationId: string | null;
  user: AuthUserSnapshot | null;
}

export function useConversationRecordSync({
  activeThreadId,
  activeThreadTitle,
  bootstrappingThreadId,
  isBusy,
  locale,
  memorySettings,
  messages,
  onOptimisticPatchConversation,
  runtimeModel,
  setMessages,
  urlConversationId,
  user,
}: UseConversationRecordSyncOptions) {
  const generatedTitleKeyRef = useRef<string | null>(null);
  const generatedMemoryKeyRef = useRef<string | null>(null);
  const hydratedLocalConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (user || !urlConversationId || !isLocalConversationId(urlConversationId)) {
      hydratedLocalConversationIdRef.current = null;
      return;
    }

    if (isBusy || hydratedLocalConversationIdRef.current === urlConversationId) {
      return;
    }

    let cancelled = false;
    const targetConversationId = urlConversationId;

    void (async () => {
      const localMessages = await getConversationMessages({
        conversationId: targetConversationId,
        user,
      });

      if (!localMessages || cancelled) {
        return;
      }

      hydratedLocalConversationIdRef.current = targetConversationId;
      setMessages(localMessages);
    })();

    return () => {
      cancelled = true;
    };
  }, [isBusy, setMessages, urlConversationId, user]);

  useEffect(() => {
    if (
      user ||
      !activeThreadId ||
      !isLocalConversationId(activeThreadId) ||
      messages.length === 0
    ) {
      return;
    }

    if (
      !hasLoadedActiveLocalConversationMessages({
        activeThreadId,
        bootstrappingThreadId,
        messages,
        urlConversationId,
        user,
      })
    ) {
      return;
    }

    persistConversationMessages({
      conversationId: activeThreadId,
      locale,
      messages,
      runtimeModel,
      user,
    });
  }, [
    activeThreadId,
    bootstrappingThreadId,
    locale,
    messages,
    runtimeModel,
    urlConversationId,
    user,
  ]);

  useEffect(() => {
    if (
      user ||
      isBusy ||
      !activeThreadId ||
      !isLocalConversationId(activeThreadId) ||
      messages.length === 0 ||
      !runtimeModel
    ) {
      return;
    }

    if (
      !hasLoadedActiveLocalConversationMessages({
        activeThreadId,
        bootstrappingThreadId,
        messages,
        urlConversationId,
        user,
      })
    ) {
      return;
    }

    generateConversationRecordTitle({
      conversationId: activeThreadId,
      locale,
      runtimeModel,
      user,
    });
  }, [
    activeThreadId,
    bootstrappingThreadId,
    isBusy,
    locale,
    messages,
    runtimeModel,
    urlConversationId,
    user,
  ]);

  useEffect(() => {
    if (!user || isBusy || !activeThreadId || !runtimeModel || messages.length === 0) {
      return;
    }

    const firstUserMessage = messages.find(
      (message) => message.role === 'user' && getMessageText(message).length > 0
    );

    if (!firstUserMessage) {
      return;
    }

    const input = getMessageText(firstUserMessage);
    const fallbackTitle = buildConversationTitleFromText(input);

    if (activeThreadTitle && activeThreadTitle.trim() !== fallbackTitle) {
      return;
    }

    const requestKey = `${activeThreadId}:${input}`;
    if (generatedTitleKeyRef.current === requestKey) {
      return;
    }

    generatedTitleKeyRef.current = requestKey;

    void (async () => {
      try {
        const response = await fetch(API_ROUTES.chatTitle, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input,
            locale,
            runtimeModel,
          }),
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { title?: string };
        const generatedTitle = data.title?.trim();

        if (!generatedTitle) {
          return;
        }

        onOptimisticPatchConversation(activeThreadId, {
          title: generatedTitle,
        });
      } catch {
        // Keep the existing sidebar title if generation fails.
      }
    })();
  }, [
    activeThreadId,
    activeThreadTitle,
    isBusy,
    locale,
    messages,
    onOptimisticPatchConversation,
    runtimeModel,
    user,
  ]);

  useEffect(() => {
    if (
      user ||
      isBusy ||
      !activeThreadId ||
      !isLocalConversationId(activeThreadId) ||
      messages.length === 0 ||
      !runtimeModel
    ) {
      return;
    }

    if (
      !hasLoadedActiveLocalConversationMessages({
        activeThreadId,
        bootstrappingThreadId,
        messages,
        urlConversationId,
        user,
      })
    ) {
      return;
    }

    generateConversationRecordSummary({
      conversationId: activeThreadId,
      locale,
      runtimeModel,
      user,
    });
  }, [
    activeThreadId,
    bootstrappingThreadId,
    isBusy,
    locale,
    messages,
    runtimeModel,
    urlConversationId,
    user,
  ]);

  useEffect(() => {
    if (
      user ||
      isBusy ||
      !memorySettings.enabled ||
      !memorySettings.autoWrite ||
      !activeThreadId ||
      !isLocalConversationId(activeThreadId) ||
      messages.length === 0 ||
      !runtimeModel
    ) {
      return;
    }

    if (
      !hasLoadedActiveLocalConversationMessages({
        activeThreadId,
        bootstrappingThreadId,
        messages,
        urlConversationId,
        user,
      })
    ) {
      return;
    }

    const lastMessage = messages.at(-1);
    const requestKey = `${activeThreadId}:${messages.length}:${lastMessage?.id ?? ''}`;

    if (generatedMemoryKeyRef.current === requestKey) {
      return;
    }

    generatedMemoryKeyRef.current = requestKey;

    void generateConversationRecordMemories({
      conversationId: activeThreadId,
      locale,
      messages,
      runtimeModel,
      user,
    });
  }, [
    activeThreadId,
    bootstrappingThreadId,
    isBusy,
    locale,
    memorySettings.autoWrite,
    memorySettings.enabled,
    messages,
    runtimeModel,
    urlConversationId,
    user,
  ]);
}
