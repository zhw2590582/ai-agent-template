'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { UIMessage } from 'ai';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import type { Locale } from '@/config/i18n';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import {
  deleteConversationRecord,
  generateConversationRecordTitle,
  generateConversationRecordSummary,
  getConversationMessages,
  persistConversationMessages,
  renameConversationRecord,
} from '@/features/chat/data/conversation-operations';
import {
  buildConversationTitleFromText,
  getMessageText,
} from '@/features/chat/storage/conversation-analysis';
import type { ChatRuntimeModel } from '@/features/models/types';

function isLocalConversationId(conversationId: string | null) {
  return Boolean(conversationId?.startsWith('local-'));
}

interface UseConversationRecordsOptions {
  activeThreadId: string | null;
  activeThreadTitle: string | null;
  handleClearChat: () => void;
  isBusy: boolean;
  locale: Locale;
  messages: UIMessage[];
  onOptimisticRemoveConversation: (conversationId: string) => void;
  onOptimisticPatchConversation: (
    conversationId: string,
    patch: {
      id?: string;
      lastMessageAt?: string;
      preview?: string | null;
      title?: string;
    }
  ) => void;
  router: AppRouterInstance;
  runtimeModel?: ChatRuntimeModel | null;
  setMessages: (messages: UIMessage[]) => void;
  urlConversationId: string | null;
  user: AuthUserSnapshot | null;
}

export function useConversationRecords({
  activeThreadId,
  activeThreadTitle,
  handleClearChat,
  isBusy,
  locale,
  messages,
  onOptimisticRemoveConversation,
  onOptimisticPatchConversation,
  router,
  runtimeModel,
  setMessages,
  urlConversationId,
  user,
}: UseConversationRecordsOptions) {
  const t = useTranslations();
  const generatedTitleKeyRef = useRef<string | null>(null);

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
        const response = await fetch('/api/chat/title', {
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

  const renameConversation = useCallback(
    async (conversationId: string, title: string) => {
      const success = await renameConversationRecord({
        conversationId,
        title,
        user,
      });

      if (!success) {
        toast.error(t('chat.errors.rename_conversation_failed'));
        return false;
      }

      onOptimisticPatchConversation(conversationId, {
        title: title.trim(),
      });

      if (user) {
        router.refresh();
      }

      return true;
    },
    [onOptimisticPatchConversation, router, t, user]
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      const success = await deleteConversationRecord({
        conversationId,
        user,
      });

      if (!success) {
        toast.error(t('chat.errors.delete_conversation_failed'));
        return false;
      }

      onOptimisticRemoveConversation(conversationId);

      if (activeThreadId === conversationId) {
        handleClearChat();
      }

      if (user) {
        router.refresh();
      }

      return true;
    },
    [activeThreadId, handleClearChat, onOptimisticRemoveConversation, router, t, user]
  );

  return {
    deleteConversation,
    renameConversation,
  };
}
