'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import {
  deleteConversationRecord,
  renameConversationRecord,
} from '@/features/chat/data/conversation-operations';

interface UseConversationRecordActionsOptions {
  activeThreadId: string | null;
  handleClearChat: () => void;
  onOptimisticPatchConversation: (
    conversationId: string,
    patch: {
      id?: string;
      lastMessageAt?: string;
      preview?: string | null;
      title?: string;
    }
  ) => void;
  onOptimisticRemoveConversation: (conversationId: string) => void;
  router: AppRouterInstance;
  user: AuthUserSnapshot | null;
}

export function useConversationRecordActions({
  activeThreadId,
  handleClearChat,
  onOptimisticPatchConversation,
  onOptimisticRemoveConversation,
  router,
  user,
}: UseConversationRecordActionsOptions) {
  const t = useTranslations();

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
