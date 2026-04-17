'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
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
import {
  buildLocalConversationMemoryExtractionKey,
  getLocalConversationThread,
} from '@/features/chat/storage/local-conversations';
import { isLocalConversationId } from '@/features/chat/utils/chat-sync';
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
  urlConversationId,
  user,
}: UseConversationRecordSyncOptions) {
  const recordSource = useMemo(() => createConversationRecordSource(user), [user]);
  const generatedTitleKeyRef = useRef<string | null>(null);
  const generatedMemoryKeyRef = useRef<string | null>(null);
  const buildSyncPlan = useCallback(
    () =>
      recordSource.getSyncPlan({
        activeThreadId,
        bootstrappingThreadId,
        isBusy,
        messages,
        urlConversationId,
      }),
    [activeThreadId, bootstrappingThreadId, isBusy, messages, recordSource, urlConversationId]
  );

  useEffect(() => {
    const syncPlan = buildSyncPlan();

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

      if (syncPlan.shouldClearBootstrappingAfterPersist) {
        clearBootstrapping();
      }
    })();
  }, [activeThreadId, clearBootstrapping, locale, messages, runtimeModel, user, buildSyncPlan]);

  useEffect(() => {
    const syncPlan = buildSyncPlan();

    if (!activeThreadId || !runtimeModel || !syncPlan.shouldRunDerivedState) {
      return;
    }

    generateConversationRecordTitle({
      conversationId: activeThreadId,
      locale,
      runtimeModel,
      user,
    });
  }, [activeThreadId, buildSyncPlan, locale, runtimeModel, user]);

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
    const syncPlan = buildSyncPlan();

    if (!activeThreadId || !runtimeModel || !syncPlan.shouldRunDerivedState) {
      return;
    }

    generateConversationRecordSummary({
      conversationId: activeThreadId,
      locale,
      runtimeModel,
      user,
    });
  }, [activeThreadId, buildSyncPlan, locale, runtimeModel, user]);

  useEffect(() => {
    const syncPlan = buildSyncPlan();

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
    const extractionKey = buildLocalConversationMemoryExtractionKey(messages);

    if (generatedMemoryKeyRef.current === requestKey) {
      return;
    }

    if (!user && isLocalConversationId(activeThreadId)) {
      const localThread = getLocalConversationThread(activeThreadId);

      if (localThread?.memoryExtractionKey === extractionKey) {
        generatedMemoryKeyRef.current = requestKey;
        return;
      }
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
    locale,
    memorySettings.autoWrite,
    memorySettings.enabled,
    messages,
    runtimeModel,
    user,
    buildSyncPlan,
  ]);
}
