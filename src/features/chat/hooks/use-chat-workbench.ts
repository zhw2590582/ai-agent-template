'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UIMessage } from 'ai';
import { toast } from 'sonner';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { createConversationRecord } from '@/features/chat/data/conversation-operations';
import { useChatController } from '@/features/chat/hooks/use-chat-controller';
import { useConversationRecords } from '@/features/chat/hooks/use-conversation-records';
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
  const locale = useLocale();
  const titleLocale = locale === 'en-US' ? 'en-US' : 'zh-CN';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthUser();
  const models = useModelProfile(user);
  const persistedSelectedModelId = models.profile.settings.models.selectedChatModelId;
  const { updateSelectedChatModelId } = models;

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
  const invalidIdHandledRef = useRef(false);

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
    initialMessages: useChatInitialMessages,
    locale,
    onFinish: () => {
      router.refresh();
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
    handleClearChat,
    isBusy,
    locale: titleLocale,
    messages,
    router,
    runtimeModel,
    setMessages,
    urlConversationId,
    user,
  });

  useEffect(() => {
    if (models.isLoading || availableModels.length === 0) {
      return;
    }

    const hasPersistedModel = availableModels.some(
      (model) => model.id === persistedSelectedModelId
    );

    if (hasPersistedModel) {
      return;
    }

    void updateSelectedChatModelId(availableModels[0]?.id ?? null, {
      silent: true,
    });
  }, [availableModels, models.isLoading, persistedSelectedModelId, updateSelectedChatModelId]);

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

  useEffect(() => {
    if (!urlConversationId) {
      invalidIdHandledRef.current = false;
      return;
    }

    if (!invalidConversationId) return;
    if (effectivePendingThreadId || bootstrappingThreadId || isStartingThread || isBusy) return;
    if (invalidIdHandledRef.current) return;

    invalidIdHandledRef.current = true;
    toast.error(t('chat.errors.invalid_conversation'));
    window.setTimeout(() => {
      handleClearChat();
    }, 350);
  }, [
    bootstrappingThreadId,
    handleClearChat,
    invalidConversationId,
    isBusy,
    isStartingThread,
    effectivePendingThreadId,
    t,
    urlConversationId,
  ]);

  return {
    activeThreadId,
    error,
    handleClearChat,
    handleSubmit: guardedSubmit,
    input,
    isBusy,
    isSidebarOpen,
    isStartingThread,
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
