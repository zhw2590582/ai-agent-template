'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { UIMessage } from 'ai';

import { API_ROUTES } from '@/config/api';
import type { Locale } from '@/config/i18n';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import type { MemorySettings } from '@/features/auth/profile/types';
import {
  generateConversationRecordMemories,
  generateConversationRecordSummary,
  generateConversationRecordTitle,
  persistConversationMessages,
} from '@/features/chat/data/conversation-operations';
import { createConversationRecordSource } from '@/features/chat/sources/conversation-record-source';
import {
  buildConversationTitleFromText,
  getMessageText,
} from '@/features/chat/storage/conversation-analysis';
import type { ChatRuntimeModel } from '@/features/models/types';

interface UseConversationRecordSyncOptions {
  activeThreadId: string | null;
  activeThreadTitle: string | null;
  bootstrappingThreadId: string | null;
  clearBootstrapping: () => void;
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
  clearBootstrapping,
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
  const recordSource = useMemo(() => createConversationRecordSource(user), [user]);
  const generatedTitleKeyRef = useRef<string | null>(null);
  const generatedMemoryKeyRef = useRef<string | null>(null);
  const hydratedConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const syncPlan = recordSource.getSyncPlan({
      activeThreadId,
      bootstrappingThreadId,
      hydratedConversationId: hydratedConversationIdRef.current,
      isBusy,
      messages,
      urlConversationId,
    });

    if (!syncPlan.hydrationConversationId) {
      hydratedConversationIdRef.current = null;
      return;
    }

    let cancelled = false;
    const targetConversationId = syncPlan.hydrationConversationId;

    void (async () => {
      const sourceMessages = await recordSource.getMessages(targetConversationId);

      if (!sourceMessages || cancelled) {
        return;
      }

      hydratedConversationIdRef.current = targetConversationId;
      setMessages(sourceMessages);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    activeThreadId,
    bootstrappingThreadId,
    isBusy,
    messages,
    recordSource,
    setMessages,
    urlConversationId,
  ]);

  useEffect(() => {
    const syncPlan = recordSource.getSyncPlan({
      activeThreadId,
      bootstrappingThreadId,
      hydratedConversationId: hydratedConversationIdRef.current,
      isBusy,
      messages,
      urlConversationId,
    });

    if (!activeThreadId || !syncPlan.shouldPersistMessages) {
      return;
    }

    void (async () => {
      await persistConversationMessages({
        conversationId: activeThreadId,
        locale,
        messages,
        runtimeModel,
        user,
      });

      if (bootstrappingThreadId === activeThreadId && !isBusy) {
        clearBootstrapping();
      }
    })();
  }, [
    activeThreadId,
    bootstrappingThreadId,
    clearBootstrapping,
    isBusy,
    locale,
    messages,
    recordSource,
    runtimeModel,
    urlConversationId,
    user,
  ]);

  useEffect(() => {
    const syncPlan = recordSource.getSyncPlan({
      activeThreadId,
      bootstrappingThreadId,
      hydratedConversationId: hydratedConversationIdRef.current,
      isBusy,
      messages,
      urlConversationId,
    });

    if (!activeThreadId || !runtimeModel || !syncPlan.shouldRunDerivedState) {
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
    recordSource,
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
    const syncPlan = recordSource.getSyncPlan({
      activeThreadId,
      bootstrappingThreadId,
      hydratedConversationId: hydratedConversationIdRef.current,
      isBusy,
      messages,
      urlConversationId,
    });

    if (!activeThreadId || !runtimeModel || !syncPlan.shouldRunDerivedState) {
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
    recordSource,
    runtimeModel,
    urlConversationId,
    user,
  ]);

  useEffect(() => {
    const syncPlan = recordSource.getSyncPlan({
      activeThreadId,
      bootstrappingThreadId,
      hydratedConversationId: hydratedConversationIdRef.current,
      isBusy,
      messages,
      urlConversationId,
    });

    if (
      !memorySettings.enabled ||
      !memorySettings.autoWrite ||
      !activeThreadId ||
      !runtimeModel ||
      !syncPlan.shouldRunDerivedState
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
    recordSource,
    user,
    urlConversationId,
  ]);
}
