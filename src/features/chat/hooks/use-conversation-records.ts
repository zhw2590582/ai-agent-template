'use client';

import type { UIMessage } from 'ai';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import type { Locale } from '@/config/i18n';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import type { MemorySettings } from '@/features/auth/profile/types';
import { useConversationRecordActions } from '@/features/chat/hooks/use-conversation-record-actions';
import { useConversationRecordSync } from '@/features/chat/hooks/use-conversation-record-sync';
import type { ChatRuntimeModel } from '@/features/models/types';

interface UseConversationRecordsOptions {
  activeThreadId: string | null;
  activeThreadTitle: string | null;
  handleClearChat: () => void;
  isBusy: boolean;
  locale: Locale;
  memorySettings: MemorySettings;
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
  memorySettings,
  messages,
  onOptimisticRemoveConversation,
  onOptimisticPatchConversation,
  router,
  runtimeModel,
  setMessages,
  urlConversationId,
  user,
}: UseConversationRecordsOptions) {
  useConversationRecordSync({
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
  });

  const { deleteConversation, renameConversation } = useConversationRecordActions({
    activeThreadId,
    handleClearChat,
    onOptimisticPatchConversation,
    onOptimisticRemoveConversation,
    router,
    user,
  });

  return {
    deleteConversation,
    renameConversation,
  };
}
