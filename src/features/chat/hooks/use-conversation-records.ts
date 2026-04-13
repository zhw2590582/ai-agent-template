'use client';

import { useCallback, useEffect } from 'react';
import type { UIMessage } from 'ai';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import {
  deleteConversationRecord,
  getConversationMessages,
  persistConversationMessages,
  renameConversationRecord,
} from '@/features/chat/data/conversation-operations';
import type { ChatRuntimeModel } from '@/features/models/types';

interface UseConversationRecordsOptions {
  activeThreadId: string | null;
  handleClearChat: () => void;
  isBusy: boolean;
  locale: 'zh-CN' | 'en-US';
  messages: UIMessage[];
  router: AppRouterInstance;
  runtimeModel?: ChatRuntimeModel | null;
  setMessages: (messages: UIMessage[]) => void;
  urlConversationId: string | null;
  user: AuthUserSnapshot | null;
}

export function useConversationRecords({
  activeThreadId,
  handleClearChat,
  isBusy,
  locale,
  messages,
  router,
  runtimeModel,
  setMessages,
  urlConversationId,
  user,
}: UseConversationRecordsOptions) {
  const t = useTranslations();

  useEffect(() => {
    if (user || !urlConversationId || isBusy) {
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
    if (user || !activeThreadId || messages.length === 0) {
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

      if (user) {
        router.refresh();
      }

      return true;
    },
    [router, t, user]
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

      if (activeThreadId === conversationId) {
        handleClearChat();
      }

      if (user) {
        router.refresh();
      }

      return true;
    },
    [activeThreadId, handleClearChat, router, t, user]
  );

  return {
    deleteConversation,
    renameConversation,
  };
}
