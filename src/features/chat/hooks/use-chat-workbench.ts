'use client';

import { useCallback, useMemo, useState } from 'react';
import type { UIMessage } from 'ai';
import { toast } from 'sonner';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { normalizeLocale } from '@/config/i18n';
import { CHAT_UI_CONFIG } from '@/config/app';
import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { createConversationRecord } from '@/features/chat/data/conversation-operations';
import { useChatBrowserTitle } from '@/features/chat/hooks/use-chat-browser-title';
import { useChatController } from '@/features/chat/hooks/use-chat-controller';
import { useChatModelSelection } from '@/features/chat/hooks/use-chat-model-selection';
import { useConversationRecords } from '@/features/chat/hooks/use-conversation-records';
import { useInvalidConversationGuard } from '@/features/chat/hooks/use-invalid-conversation-guard';
import { useChatSession } from '@/features/chat/hooks/use-chat-session';
import { useChatSync } from '@/features/chat/hooks/use-chat-sync';
import { useSidebarConversations } from '@/features/chat/hooks/use-sidebar-conversations';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { getInitialMessages } from '@/features/chat/utils/chat-config';
import { useModelProfile } from '@/features/models/hooks/use-model-profile';
import { getChatModelOptions } from '@/features/models/utils/profile';

interface UseChatWorkbenchOptions {
  initialConversationId: string | null;
  initialConversations: ConversationSummary[];
  initialConversationsHasMore: boolean;
  invalidConversationId: boolean;
  initialMessages: UIMessage[];
}

export function useChatWorkbench({
  initialConversationId,
  initialConversations,
  initialConversationsHasMore,
  invalidConversationId,
  initialMessages,
}: UseChatWorkbenchOptions) {
  const t = useTranslations();
  const locale = normalizeLocale(useLocale());
  const titleLocale = locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthUser();
  const models = useModelProfile(user);
  const persistedSelectedModelId = models.profile.settings.models.selectedChatModelId;
  const { updateMemorySettings, updateSelectedChatModelId } = models;

  const starterMessages = useMemo(() => getInitialMessages(), []);
  const urlConversationId = useMemo(
    () => searchParams.get('id') ?? searchParams.get('conversation') ?? null,
    [searchParams]
  );

  const availableModels = useMemo(
    () => getChatModelOptions(models.profile.settings),
    [models.profile.settings]
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [isStartingThread, setIsStartingThread] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);
  const [bootstrappingThreadId, setBootstrappingThreadId] = useState<string | null>(null);

  const effectivePendingThreadId = urlConversationId ? null : pendingThreadId;
  const activeThreadId = urlConversationId ?? effectivePendingThreadId;

  const sidebar = useSidebarConversations({
    initialConversations,
    initialHasMore: initialConversationsHasMore,
    isAuthenticated: !!user,
    searchQuery: sidebarSearchQuery,
    onLoadError: useCallback(() => {
      toast.error(t('chat.errors.load_more_failed'));
    }, [t]),
  });

  const useChatInitialMessages =
    urlConversationId != null &&
    initialConversationId === urlConversationId &&
    initialMessages.length > 0
      ? initialMessages
      : starterMessages;
  const activeConversationSummary = useMemo(
    () =>
      sidebar.conversations.find((conversation) => conversation.id === activeThreadId)?.summary ??
      null,
    [activeThreadId, sidebar.conversations]
  );
  const activeConversationTitle = useMemo(
    () =>
      sidebar.conversations.find((conversation) => conversation.id === activeThreadId)?.title ??
      null,
    [activeThreadId, sidebar.conversations]
  );

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    stop,
    error,
    regenerate,
    selectedModel,
    runtimeModel,
  } = useChatSession({
    activeThreadId,
    availableModels,
    conversationSummary: activeConversationSummary,
    initialMessages: useChatInitialMessages,
    locale,
    onFinish: () => {
      window.setTimeout(() => {
        router.refresh();
      }, CHAT_UI_CONFIG.POST_FINISH_REFRESH_DELAY_MS);
    },
    profileSettings: models.profile.settings,
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  useChatSync({
    urlConversationId,
    initialConversationId,
    initialMessages,
    starterMessages,
    isBusy,
    pendingThreadId: effectivePendingThreadId,
    setMessages,
    bootstrappingThreadId,
    clearBootstrapping: useCallback(() => {
      setBootstrappingThreadId(null);
    }, []),
  });

  const createConversation = useCallback(
    async (initialMessage: string) =>
      createConversationRecord({
        initialMessage,
        locale: titleLocale,
        runtimeModel,
        user,
      }),
    [runtimeModel, titleLocale, user]
  );

  const { handleClearChat, handleSubmit } = useChatController({
    activeThreadId,
    input,
    isBusy,
    isStartingThread,
    pathname,
    onCreateConversation: createConversation,
    onCreateError: () => toast.error(t('chat.errors.create_conversation_failed')),
    onSendMessage: sendMessage,
    onSendError: () => toast.error(t('chat.errors.send_message_failed')),
    onStop: stop,
    router,
    setBootstrappingThreadId,
    setInput,
    setIsStartingThread,
    setMessages,
    setPendingThreadId,
    sidebar,
    starterMessages,
  });

  const conversationRecordActions = useConversationRecords({
    activeThreadId,
    activeThreadTitle: activeConversationTitle,
    handleClearChat,
    isBusy,
    locale: titleLocale,
    messages,
    onOptimisticRemoveConversation: sidebar.removeConversation,
    onOptimisticPatchConversation: sidebar.patchConversation,
    router,
    runtimeModel,
    setMessages,
    urlConversationId,
    user,
  });

  useChatModelSelection({
    availableModels,
    isLoading: models.isLoading,
    persistedSelectedModelId,
    updateSelectedChatModelId,
  });

  const handleModelChange = useCallback(
    (value: string) => {
      void updateSelectedChatModelId(value, {
        silent: true,
      });
    },
    [updateSelectedChatModelId]
  );

  const guardedSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (models.isLoading) {
        return;
      }

      if (!runtimeModel) {
        toast.error(t('chat.errors.model_not_configured'));
        return;
      }

      handleSubmit(event);
    },
    [handleSubmit, models.isLoading, runtimeModel, t]
  );

  const guardedRegenerate = useCallback(() => {
    if (models.isLoading) {
      return;
    }

    if (!runtimeModel) {
      toast.error(t('chat.errors.model_not_configured'));
      return;
    }

    void regenerate();
  }, [models.isLoading, regenerate, runtimeModel, t]);

  useChatBrowserTitle(t('common.app_name'), activeConversationTitle);

  useInvalidConversationGuard({
    bootstrappingThreadId,
    effectivePendingThreadId,
    handleClearChat,
    invalidConversationId,
    isBusy,
    isStartingThread,
    t,
    toastError: toast.error,
    urlConversationId,
  });

  return {
    activeThreadId,
    error,
    handleClearChat,
    handleSubmit: guardedSubmit,
    input,
    isAuthenticated: !!user,
    isBusy,
    isSidebarOpen,
    isStartingThread,
    memorySettings: models.profile.settings.memory,
    setMemorySettings: updateMemorySettings,
    isModelsLoading: models.isLoading,
    locale,
    messages,
    regenerate: guardedRegenerate,
    renameConversation: conversationRecordActions.renameConversation,
    availableModels,
    selectedModel,
    setSelectedModel: handleModelChange,
    setInput,
    setIsSidebarOpen,
    setSidebarSearchQuery,
    sidebar,
    sidebarSearchQuery,
    status,
    deleteConversation: conversationRecordActions.deleteConversation,
    stop,
  };
}
