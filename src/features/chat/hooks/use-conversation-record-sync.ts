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
import type { ChatRuntimeModel } from '@/features/models/types';

function isLocalConversationId(conversationId: string | null) {
  return Boolean(conversationId?.startsWith('local-'));
}

interface UseConversationRecordSyncOptions {
  activeThreadId: string | null;
  activeThreadTitle: string | null;
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

  useEffect(() => {
    if (user || !urlConversationId || !isLocalConversationId(urlConversationId) || isBusy) {
      return;
    }

    const localMessages = getConversationMessages({
      conversationId: urlConversationId,
      user,
    });
    if (!localMessages) {
      return;
    }

    setMessages(localMessages);
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

    persistConversationMessages({
      conversationId: activeThreadId,
      locale,
      messages,
      runtimeModel,
      user,
    });
  }, [activeThreadId, locale, messages, runtimeModel, user]);

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

    generateConversationRecordTitle({
      conversationId: activeThreadId,
      locale,
      runtimeModel,
      user,
    });
  }, [activeThreadId, isBusy, locale, messages.length, runtimeModel, user]);

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

    generateConversationRecordSummary({
      conversationId: activeThreadId,
      locale,
      runtimeModel,
      user,
    });
  }, [activeThreadId, isBusy, locale, messages.length, runtimeModel, user]);

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
    isBusy,
    locale,
    memorySettings.autoWrite,
    memorySettings.enabled,
    messages,
    runtimeModel,
    user,
  ]);
}
