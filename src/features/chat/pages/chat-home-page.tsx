'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UIMessage } from 'ai';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { type HeaderNavItemId } from '@/config/navigation';
import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { ChatComposer } from '@/features/chat/components/chat-composer';
import { ChatMessageList } from '@/features/chat/components/chat-message-list';
import { ChatPlaceholder } from '@/features/chat/components/chat-placeholder';
import { ChatSidebar } from '@/features/chat/components/chat-sidebar';
import { ChatTopBar } from '@/features/chat/components/chat-topbar';
import { getInitialMessages } from '@/features/chat/lib/chat-config';
import { useChatController } from '@/features/chat/lib/use-chat-controller';
import { useChatSession } from '@/features/chat/lib/use-chat-session';
import { useChatSync } from '@/features/chat/lib/use-chat-sync';
import { useSidebarConversations } from '@/features/chat/lib/use-sidebar-conversations';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { cn } from '@/lib/utils';

type WorkbenchView = 'chat' | HeaderNavItemId | 'settings';

interface ChatHomePageProps {
  activeView?: WorkbenchView;
  initialConversationId?: string | null;
  initialConversations?: ConversationSummary[];
  initialConversationsHasMore?: boolean;
  invalidConversationId?: boolean;
  initialMessages?: UIMessage[];
}

/**
 * Chat routing model:
 * - `?id=` in the URL is the source of truth for which conversation is open.
 * - `pendingThreadId` covers the gap until `router.replace` updates search params.
 * - Message sync logic lives in useChatSync to avoid monolithic effects.
 * - Sidebar state lives in useSidebarConversations.
 */
export function ChatHomePage({
  activeView = 'chat',
  initialConversationId = null,
  initialConversations = [],
  initialConversationsHasMore = false,
  invalidConversationId = false,
  initialMessages = [],
}: ChatHomePageProps) {
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

  /* ------ Sidebar state ------ */

  const sidebar = useSidebarConversations({
    initialConversations,
    initialHasMore: initialConversationsHasMore,
    isAuthenticated: !!user,
    searchQuery: sidebarSearchQuery,
    onLoadError: useCallback(() => {
      toast.error(t('chat.errors.load_more_failed'));
    }, [t]),
  });

  /* ------ Transport ------ */

  /* ------ useChat ------ */

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

  /* ------ Sync pending thread ID with URL ------ */

  // Clear pendingThreadId once URL reflects it
  // (using a ref comparison to avoid extra effects)
  if (pendingThreadId != null && urlConversationId === pendingThreadId) {
    // Safe to call setState during render when the value actually changes
    setPendingThreadId(null);
  }

  if (urlConversationId == null && pendingThreadId != null) {
    setPendingThreadId(null);
  }

  /* ------ Message sync ------ */

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

  /* ------ Handlers ------ */

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

  /* ------ Render ------ */

  const isChatView = activeView === 'chat';

  const renderMainContent = () =>
    isChatView ? (
      <>
        <ChatMessageList
          error={error}
          isSidebarOpen={isSidebarOpen}
          messages={messages}
          onRetry={() => regenerate()}
        />
        <ChatComposer
          input={input}
          isBusy={isBusy || isStartingThread}
          isCreatingThread={isStartingThread}
          isSidebarOpen={isSidebarOpen}
          model={selectedModel}
          onModelChange={setSelectedModel}
          onStop={stop}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          status={isStartingThread ? 'submitted' : status}
        />
      </>
    ) : (
      <ChatPlaceholder activeView={activeView} t={t} />
    );

  return (
    <main className="bg-background text-foreground h-screen">
      <div className="flex h-full w-full overflow-hidden">
        <div
          className={cn(
            'hidden overflow-hidden transition-[width] duration-300 ease-out lg:block',
            isSidebarOpen ? 'w-70' : 'w-16'
          )}
        >
          <ChatSidebar
            activeConversationId={activeThreadId}
            conversations={sidebar.conversations}
            hasMoreConversations={sidebar.hasMore}
            isLoadingMoreConversations={sidebar.isLoadingMore}
            isOpen={isSidebarOpen}
            onClearChat={handleClearChat}
            onLoadMoreConversations={sidebar.loadMore}
            onSearchQueryChange={setSidebarSearchQuery}
            searchQuery={sidebarSearchQuery}
            onToggleOpen={() => setIsSidebarOpen((v) => !v)}
          />
        </div>

        <section className="bg-background flex min-h-0 flex-1 flex-col transition-[width] duration-300 ease-out">
          <ChatTopBar activeView={activeView} locale={locale} t={t} />

          {renderMainContent()}
        </section>
      </div>
    </main>
  );
}
