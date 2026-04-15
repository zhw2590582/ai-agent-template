'use client';

import { useCallback, useMemo, useState } from 'react';
import type { UIMessage } from 'ai';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { normalizeLocale } from '@/config/i18n';
import { CHAT_UI_CONFIG } from '@/config/chat';
import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { useAppProfile } from '@/features/auth/profile/use-app-profile';
import { createConversationRecord } from '@/features/chat/data/conversation-operations';
import { useChatBrowserTitle } from '@/features/chat/hooks/use-chat-browser-title';
import { useChatController } from '@/features/chat/hooks/use-chat-controller';
import { useChatModelSelection } from '@/features/chat/hooks/use-chat-model-selection';
import { useConversationRecords } from '@/features/chat/hooks/use-conversation-records';
import { useChatThreadState } from '@/features/chat/hooks/use-chat-thread-state';
import { useInvalidConversationGuard } from '@/features/chat/hooks/use-invalid-conversation-guard';
import { useChatSession } from '@/features/chat/hooks/use-chat-session';
import { useChatSync } from '@/features/chat/hooks/use-chat-sync';
import { useSidebarConversations } from '@/features/chat/hooks/use-sidebar-conversations';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { getInitialMessages } from '@/features/chat/utils/chat-config';
import { isChatCapableModel } from '@/features/models/utils/model-capabilities';
import { getChatModelOptions } from '@/features/models/utils/runtime-model';

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
  const { user } = useAuthUser();
  const models = useAppProfile(user);
  const persistedSelectedModelId = models.profile.settings.models.selectedChatModelId;
  const {
    updateMcpSettings,
    updateMemorySettings,
    updateSandboxSettings,
    updateSelectedChatModelId,
  } = models;

  const starterMessages = useMemo(() => getInitialMessages(), []);
  const availableModels = useMemo(
    () => getChatModelOptions(models.profile.settings),
    [models.profile.settings]
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const {
    activeThreadId,
    bootstrappingThreadId,
    effectivePendingThreadId,
    input,
    isStartingThread,
    setBootstrappingThreadId,
    setInput,
    setIsStartingThread,
    setPendingThreadId,
    urlConversationId,
  } = useChatThreadState();

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
  const selectedModelOption = useMemo(
    () => availableModels.find((model) => model.id === selectedModel) ?? null,
    [availableModels, selectedModel]
  );

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
    }, [setBootstrappingThreadId]),
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

      if (selectedModelOption && !isChatCapableModel(selectedModelOption)) {
        toast.error(t('chat.errors.model_not_chat_capable'));
        return;
      }

      handleSubmit(event);
    },
    [handleSubmit, models.isLoading, runtimeModel, selectedModelOption, t]
  );

  const guardedRegenerate = useCallback(() => {
    if (models.isLoading) {
      return;
    }

    if (!runtimeModel) {
      toast.error(t('chat.errors.model_not_configured'));
      return;
    }

    if (selectedModelOption && !isChatCapableModel(selectedModelOption)) {
      toast.error(t('chat.errors.model_not_chat_capable'));
      return;
    }

    void regenerate();
  }, [models.isLoading, regenerate, runtimeModel, selectedModelOption, t]);

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
    isModelsLoading: models.isLoading,
    locale,
    memorySettings: models.profile.settings.memory,
    mcpSettings: models.profile.settings.mcp,
    sandboxSettings: models.profile.settings.sandbox,
    searchSettings: models.profile.settings.search,
    setMcpSettings: updateMcpSettings,
    setSearchSettings: models.updateSearchSettings,
    setSandboxSettings: updateSandboxSettings,
    setMemorySettings: updateMemorySettings,
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
