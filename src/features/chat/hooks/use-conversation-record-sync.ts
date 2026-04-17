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
  hydratedConversationId: string | null;
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

interface ConversationDerivedStatePlan {
  memoryRequestKey: string | null;
  remoteTitleInput: string | null;
  shouldSkipCachedMemoryExtraction: boolean;
  shouldGenerateLocalTitle: boolean;
  shouldGenerateMemories: boolean;
  shouldGenerateRemoteTitle: boolean;
  shouldGenerateSummary: boolean;
}

export function useConversationRecordSync({
  activeThreadId,
  activeThreadTitle,
  bootstrappingThreadId,
  clearBootstrapping,
  hydratedConversationId,
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
        hydratedConversationId,
        isBusy,
        messages,
        urlConversationId,
      }),
    [
      activeThreadId,
      bootstrappingThreadId,
      hydratedConversationId,
      isBusy,
      messages,
      recordSource,
      urlConversationId,
    ]
  );
  const derivedStatePlan = useMemo<ConversationDerivedStatePlan>(() => {
    const syncPlan = buildSyncPlan();
    const firstUserMessage = messages.find(
      (message) => message.role === 'user' && getMessageText(message).length > 0
    );
    const lastMessage = messages.at(-1);
    const remoteTitleInput = firstUserMessage ? getMessageText(firstUserMessage) : null;
    const fallbackTitle = remoteTitleInput
      ? buildConversationTitleFromText(remoteTitleInput)
      : null;
    const memoryRequestKey =
      activeThreadId && lastMessage
        ? `${activeThreadId}:${messages.length}:${lastMessage.id}`
        : activeThreadId
          ? `${activeThreadId}:${messages.length}:`
          : null;
    const memoryExtractionKey =
      activeThreadId && messages.length > 0
        ? buildLocalConversationMemoryExtractionKey(messages)
        : null;
    const shouldSkipCachedMemoryExtraction = Boolean(
      !user &&
      activeThreadId &&
      memoryExtractionKey &&
      isLocalConversationId(activeThreadId) &&
      getLocalConversationThread(activeThreadId)?.memoryExtractionKey === memoryExtractionKey
    );
    const shouldGenerateRemoteTitle = Boolean(
      user &&
      !isBusy &&
      activeThreadId &&
      runtimeModel &&
      remoteTitleInput &&
      (!activeThreadTitle || activeThreadTitle.trim() === fallbackTitle)
    );

    return {
      memoryRequestKey,
      remoteTitleInput,
      shouldSkipCachedMemoryExtraction,
      shouldGenerateLocalTitle: Boolean(
        activeThreadId && runtimeModel && syncPlan.shouldRunDerivedState
      ),
      shouldGenerateMemories: Boolean(
        memorySettings.enabled &&
        memorySettings.autoWrite &&
        activeThreadId &&
        runtimeModel &&
        syncPlan.shouldRunDerivedState
      ),
      shouldGenerateRemoteTitle,
      shouldGenerateSummary: Boolean(
        activeThreadId && runtimeModel && syncPlan.shouldRunDerivedState
      ),
    };
  }, [
    activeThreadId,
    activeThreadTitle,
    buildSyncPlan,
    isBusy,
    memorySettings.autoWrite,
    memorySettings.enabled,
    messages,
    runtimeModel,
    user,
  ]);

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
    if (
      !derivedStatePlan.shouldGenerateRemoteTitle ||
      !activeThreadId ||
      !runtimeModel ||
      !derivedStatePlan.remoteTitleInput
    ) {
      return;
    }
    const input = derivedStatePlan.remoteTitleInput;

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
    derivedStatePlan.remoteTitleInput,
    derivedStatePlan.shouldGenerateRemoteTitle,
    locale,
    onOptimisticPatchConversation,
    runtimeModel,
  ]);

  useEffect(() => {
    if (
      !activeThreadId ||
      !runtimeModel ||
      (!derivedStatePlan.shouldGenerateLocalTitle &&
        !derivedStatePlan.shouldGenerateSummary &&
        !derivedStatePlan.shouldGenerateMemories)
    ) {
      return;
    }

    if (derivedStatePlan.shouldGenerateLocalTitle) {
      generateConversationRecordTitle({
        conversationId: activeThreadId,
        locale,
        runtimeModel,
        user,
      });
    }

    if (derivedStatePlan.shouldGenerateSummary) {
      generateConversationRecordSummary({
        conversationId: activeThreadId,
        locale,
        runtimeModel,
        user,
      });
    }

    if (!derivedStatePlan.shouldGenerateMemories || !derivedStatePlan.memoryRequestKey) {
      return;
    }

    if (generatedMemoryKeyRef.current === derivedStatePlan.memoryRequestKey) {
      return;
    }

    if (derivedStatePlan.shouldSkipCachedMemoryExtraction) {
      generatedMemoryKeyRef.current = derivedStatePlan.memoryRequestKey;
      return;
    }

    generatedMemoryKeyRef.current = derivedStatePlan.memoryRequestKey;

    void generateConversationRecordMemories({
      conversationId: activeThreadId,
      locale,
      messages,
      runtimeModel,
      user,
    });
  }, [
    activeThreadId,
    derivedStatePlan.memoryRequestKey,
    derivedStatePlan.shouldGenerateLocalTitle,
    derivedStatePlan.shouldGenerateMemories,
    derivedStatePlan.shouldGenerateSummary,
    derivedStatePlan.shouldSkipCachedMemoryExtraction,
    locale,
    messages,
    runtimeModel,
    user,
  ]);
}
