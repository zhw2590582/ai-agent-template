'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import {
  BotIcon,
  BrainIcon,
  FlaskConicalIcon,
  PlugIcon,
  ServerIcon,
  SettingsIcon,
  ShieldEllipsisIcon,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { AI_CONFIG } from '@/config/app';
import { HEADER_NAV_ITEMS, type HeaderNavItemId } from '@/config/navigation';
import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { type ModelId } from '@/config/models';
import { ChatComposer } from '@/features/chat/components/chat-composer';
import { ChatMessageList } from '@/features/chat/components/chat-message-list';
import { ChatSidebar } from '@/features/chat/components/chat-sidebar';
import { AuthDialog } from '@/features/auth/components/auth-dialog';
import { getInitialMessages } from '@/features/chat/lib/chat-config';
import { useChatSync } from '@/features/chat/lib/use-chat-sync';
import { useSidebarConversations } from '@/features/chat/lib/use-sidebar-conversations';
import type { ConversationSummary } from '@/server/storage/types';
import { cn } from '@/lib/utils';

const NAV_ICONS = {
  providers: PlugIcon,
  agents: BotIcon,
  sandbox: FlaskConicalIcon,
  mcp: ServerIcon,
  skills: ShieldEllipsisIcon,
  memory: BrainIcon,
} as const;

type WorkbenchView = 'chat' | HeaderNavItemId | 'settings';

interface ChatHomePageProps {
  activeView?: WorkbenchView;
  initialConversationId?: string | null;
  initialConversations?: ConversationSummary[];
  initialConversationsHasMore?: boolean;
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
  const [selectedModel, setSelectedModel] = useState<ModelId>(AI_CONFIG.DEFAULT_MODEL);
  const [input, setInput] = useState('');
  const [isStartingThread, setIsStartingThread] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);
  const [bootstrappingThreadId, setBootstrappingThreadId] = useState<string | null>(null);

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

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/chat?lang=${locale}`,
        prepareSendMessagesRequest: ({
          messages,
          id,
          trigger,
          messageId,
          body: requestBody = {},
        }) => ({
          body: {
            ...requestBody,
            id,
            trigger,
            messageId,
            messages,
            model: selectedModel,
            conversationId:
              (requestBody.conversationId as string | undefined) ?? activeThreadId ?? undefined,
          },
        }),
      }),
    [activeThreadId, locale, selectedModel]
  );

  /* ------ useChat ------ */

  const useChatInitialMessages =
    urlConversationId != null &&
    initialConversationId === urlConversationId &&
    initialMessages.length > 0
      ? initialMessages
      : starterMessages;

  const { messages, sendMessage, setMessages, status, stop, error, regenerate } = useChat({
    onFinish: () => {
      router.refresh();
    },
    transport,
    messages: useChatInitialMessages,
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void (async () => {
      event.preventDefault();
      const text = input.trim();

      if (!text || isBusy || isStartingThread) return;

      // New thread for logged-in user
      if (!activeThreadId && user) {
        setIsStartingThread(true);
        let created: { id: string; title: string };
        try {
          created = await createConversation(text);
        } catch {
          toast.error(t('chat.errors.create_conversation_failed'));
          setIsStartingThread(false);
          return;
        }
        setIsStartingThread(false);

        setPendingThreadId(created.id);
        sidebar.setPendingSidebarHead({
          id: created.id,
          lastMessageAt: new Date().toISOString(),
          preview: null,
          title: created.title,
        });
        setBootstrappingThreadId(created.id);
        router.replace(`${pathname}?id=${created.id}`, { scroll: false });

        const userMessage: UIMessage = {
          id: nanoid(),
          role: 'user',
          parts: [{ type: 'text', text }],
        };
        setMessages([userMessage]);
        setInput('');

        try {
          await sendMessage(undefined, {
            body: { conversationId: created.id },
          });
        } catch {
          toast.error(t('chat.errors.send_message_failed'));
          setBootstrappingThreadId(null);
          setInput(text);
        }

        return;
      }

      // Existing thread or anonymous chat
      setInput('');
      await sendMessage(
        { text },
        activeThreadId ? { body: { conversationId: activeThreadId } } : undefined
      );
    })();
  };

  const handleClearChat = () => {
    if (isBusy) stop();

    setBootstrappingThreadId(null);
    sidebar.setPendingSidebarHead(null);
    setPendingThreadId(null);
    setMessages(getInitialMessages(t));
    setInput('');

    const cleanPath = pathname;
    window.history.replaceState(window.history.state, '', cleanPath);
    router.replace(cleanPath, { scroll: false });
  };

  /* ------ Render ------ */

  const isChatView = activeView === 'chat';

  const renderMainContent = () => {
    if (isChatView) {
      return (
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
      );
    }

    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-8">
        <section className="border-border bg-card/70 w-full max-w-2xl rounded-[2rem] border p-8 shadow-2xl shadow-black/10">
          <div className="text-muted-foreground text-[11px] tracking-[0.28em] uppercase">
            {t(`navigation.${activeView}`)}
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            {t(`placeholders.${activeView}.title`)}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-7">
            {t(`placeholders.${activeView}.description`)}
          </p>
        </section>
      </div>
    );
  };

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
          <div className="border-border h-12 border-b px-4 py-2">
            <div className="flex w-full flex-col gap-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {HEADER_NAV_ITEMS.map((item) => {
                    const Icon = NAV_ICONS[item.id];
                    return (
                      <Button
                        key={item.id}
                        asChild
                        size="sm"
                        variant={activeView === item.id ? 'secondary' : 'ghost'}
                      >
                        <Link href={`/${locale}/${item.id}`}>
                          <Icon data-icon="inline-start" />
                          {t(item.translationKey)}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <LanguageSwitcher triggerClassName="w-10" />
                  <ThemeToggle />
                  <Button asChild size="icon" type="button" variant="outline">
                    <Link aria-label={t('navigation.settings')} href={`/${locale}/settings`}>
                      <SettingsIcon />
                    </Link>
                  </Button>
                  <AuthDialog
                    closeLabel={t('common.cancel')}
                    configurationMissingDescription={t('auth.configuration_missing_description')}
                    configurationMissingTitle={t('auth.configuration_missing_title')}
                    description={t('auth.dialog_description')}
                    githubLabel={t('auth.sign_in_with_github')}
                    googleLabel={t('auth.sign_in_with_google')}
                    signInLabel={t('auth.sign_in')}
                    signInFailedLabel={t('auth.errors.sign_in_failed')}
                    signOutLabel={t('auth.sign_out')}
                    signOutFailedLabel={t('auth.errors.sign_out_failed')}
                    signOutSuccessLabel={t('auth.toast.sign_out_success')}
                    signedInAsLabel={t('auth.signed_in_as')}
                    title={t('auth.title')}
                  />
                </div>
              </div>
            </div>
          </div>

          {renderMainContent()}
        </section>
      </div>
    </main>
  );
}
