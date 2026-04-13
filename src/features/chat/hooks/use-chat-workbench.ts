'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UIMessage } from 'ai';
import { toast } from 'sonner';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { useChatController } from '@/features/chat/hooks/use-chat-controller';
import { useChatSession } from '@/features/chat/hooks/use-chat-session';
import { useChatSync } from '@/features/chat/hooks/use-chat-sync';
import { useSidebarConversations } from '@/features/chat/hooks/use-sidebar-conversations';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { getInitialMessages } from '@/features/chat/utils/chat-config';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthUser();

  const starterMessages = useMemo(() => getInitialMessages(t), [t]);
  const urlConversationId = useMemo(
    () => searchParams.get('id') ?? searchParams.get('conversation') ?? null,
    [searchParams]
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [isStartingThread, setIsStartingThread] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);
  const [bootstrappingThreadId, setBootstrappingThreadId] = useState<string | null>(null);
  const invalidIdHandledRef = useRef(false);

  const activeThreadId = urlConversationId ?? pendingThreadId;

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
    setSelectedModel,
  } = useChatSession({
    activeThreadId,
    initialMessages: useChatInitialMessages,
    locale,
    onFinish: () => {
      router.refresh();
    },
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  if (pendingThreadId != null && urlConversationId === pendingThreadId) {
    setPendingThreadId(null);
  }

  if (urlConversationId == null && pendingThreadId != null) {
    setPendingThreadId(null);
  }

  useChatSync({
    urlConversationId,
    initialConversationId,
    initialMessages,
    starterMessages,
    isBusy,
    pendingThreadId,
    setMessages,
    bootstrappingThreadId,
    clearBootstrapping: useCallback(() => {
      setBootstrappingThreadId(null);
    }, []),
  });

  const createConversation = async (initialMessage: string) => {
    const response = await fetch('/api/conversations', {
      body: JSON.stringify({ initialMessage }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }

    const data: { conversation: { id: string; title: string } } = await response.json();
    return data.conversation;
  };

  const { handleClearChat, handleSubmit } = useChatController({
    activeThreadId,
    input,
    isBusy,
    isStartingThread,
    pathname,
    userId: user?.id ?? null,
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

  useEffect(() => {
    if (!urlConversationId) {
      invalidIdHandledRef.current = false;
      return;
    }

    if (!invalidConversationId) return;
    if (pendingThreadId || bootstrappingThreadId || isStartingThread || isBusy) return;
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
    pendingThreadId,
    t,
    urlConversationId,
  ]);

  return {
    activeThreadId,
    error,
    handleClearChat,
    handleSubmit,
    input,
    isBusy,
    isSidebarOpen,
    isStartingThread,
    locale,
    messages,
    regenerate,
    selectedModel,
    setInput,
    setIsSidebarOpen,
    setSelectedModel,
    setSidebarSearchQuery,
    sidebar,
    sidebarSearchQuery,
    status,
    stop,
  };
}
