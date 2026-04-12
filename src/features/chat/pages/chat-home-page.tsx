'use client';

import Link from 'next/link';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import {
  BlocksIcon,
  BotIcon,
  BrainIcon,
  PlugIcon,
  Settings2Icon,
  ShieldEllipsisIcon,
  WrenchIcon,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { CONVERSATION_SIDEBAR_PAGE_SIZE } from '@/config/conversations';
import { AI_CONFIG } from '@/config/app';
import { HEADER_NAV_ITEMS, type HeaderNavItemId } from '@/config/navigation';
import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { type ModelId } from '@/config/models';
import { ChatComposer } from '@/features/chat/components/chat-composer';
import { ChatMessageList } from '@/features/chat/components/chat-message-list';
import { ChatSidebar } from '@/features/chat/components/chat-sidebar';
import { AuthDialog } from '@/features/auth/components/auth-dialog';
import { getInitialMessages } from '@/features/chat/lib/chat-config';
import type { ConversationSummary } from '@/server/storage/types';
import { cn } from '@/lib/utils';

const NAV_ICONS = {
  providers: PlugIcon,
  agents: BotIcon,
  plugins: BlocksIcon,
  tools: WrenchIcon,
  skills: ShieldEllipsisIcon,
  memory: BrainIcon,
  settings: Settings2Icon,
} as const;

type WorkbenchView = 'chat' | HeaderNavItemId;

interface ChatHomePageProps {
  activeView?: WorkbenchView;
  initialConversationId?: string | null;
  initialConversations?: ConversationSummary[];
  initialConversationsHasMore?: boolean;
  initialMessages?: UIMessage[];
}

/**
 * Chat routing model:
 * - `?id=` in the URL is the source of truth for which conversation is open (or absent = new chat).
 * - `pendingThreadId` only covers the gap until `router.replace` updates search params.
 * - New thread (logged-in): await create conversation → set URL `?id=` → show the user message in the UI → then call `sendMessage` for the stream (no optimistic bubble before the row exists).
 * - `bootstrappingThreadIdRef` skips the sync effect for that id until the server has persisted messages, so an empty RSC payload does not wipe the first user message.
 * - Same-URL refresh: if the client list is longer than `initialMessages`, keep the client (save/refresh race).
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
  /** Until the router reflects POST /conversations, this supplies the active id for API + sidebar. */
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);
  /** One optimistic row at the top until refresh lists the new conversation. */
  const [pendingSidebarHead, setPendingSidebarHead] = useState<ConversationSummary | null>(null);
  const [sidebarExtra, setSidebarExtra] = useState<ConversationSummary[]>([]);
  const [sidebarHasMore, setSidebarHasMore] = useState(initialConversationsHasMore);
  const [sidebarLoadingMore, setSidebarLoadingMore] = useState(false);
  const sidebarExtraRef = useRef<ConversationSummary[]>([]);
  const sidebarLoadMoreInFlightRef = useRef(false);

  const activeThreadId = urlConversationId ?? pendingThreadId;

  const initialConversationIdsKey = useMemo(
    () => initialConversations.map((c) => c.id).join(','),
    [initialConversations]
  );

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
  const prevUrlConversationIdRef = useRef<string | null>(null);
  /** First turn after POST /conversations: ignore empty server payloads until messages are saved. */
  const bootstrappingThreadIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (pendingThreadId != null && urlConversationId === pendingThreadId) {
      setPendingThreadId(null);
    }
  }, [pendingThreadId, urlConversationId]);

  useEffect(() => {
    if (urlConversationId == null) {
      setPendingThreadId(null);
    }
  }, [urlConversationId]);

  useEffect(() => {
    if (
      pendingSidebarHead != null &&
      initialConversations.some((c) => c.id === pendingSidebarHead.id)
    ) {
      setPendingSidebarHead(null);
    }
  }, [initialConversations, pendingSidebarHead]);

  useEffect(() => {
    setSidebarExtra([]);
  }, [initialConversationIdsKey]);

  useEffect(() => {
    setSidebarHasMore(initialConversationsHasMore);
  }, [initialConversationsHasMore]);

  useEffect(() => {
    sidebarExtraRef.current = sidebarExtra;
  }, [sidebarExtra]);

  const loadMoreConversations = useCallback(async () => {
    if (!user || sidebarLoadMoreInFlightRef.current || !sidebarHasMore) {
      return;
    }

    sidebarLoadMoreInFlightRef.current = true;
    setSidebarLoadingMore(true);
    const offset = initialConversations.length + sidebarExtraRef.current.length;

    try {
      const params = new URLSearchParams({
        limit: String(CONVERSATION_SIDEBAR_PAGE_SIZE),
        offset: String(offset),
      });
      const response = await fetch(`/api/conversations?${params.toString()}`);

      if (!response.ok) {
        return;
      }

      const data: { conversations: ConversationSummary[]; hasMore: boolean } =
        await response.json();

      setSidebarExtra((previous) => {
        const seen = new Set<string>([
          ...initialConversations.map((c) => c.id),
          ...previous.map((c) => c.id),
        ]);
        const merged = [...previous];
        for (const item of data.conversations) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            merged.push(item);
          }
        }
        return merged;
      });
      setSidebarHasMore(data.hasMore);
    } finally {
      sidebarLoadMoreInFlightRef.current = false;
      setSidebarLoadingMore(false);
    }
  }, [user, sidebarHasMore, initialConversations]);

  /** Keep message list aligned with URL + server; never trust stale props when the URL has no `id`. */
  useEffect(() => {
    if (urlConversationId == null) {
      bootstrappingThreadIdRef.current = null;
      if (pendingThreadId == null) {
        prevUrlConversationIdRef.current = null;
        startTransition(() => {
          setMessages(starterMessages);
        });
      }
      return;
    }

    const urlChanged = prevUrlConversationIdRef.current !== urlConversationId;
    prevUrlConversationIdRef.current = urlConversationId;

    if (initialConversationId !== urlConversationId) {
      return;
    }

    if (urlChanged) {
      if (bootstrappingThreadIdRef.current === urlConversationId) {
        return;
      }
      if (isBusy) {
        return;
      }
      if (initialMessages.length > 0) {
        startTransition(() => {
          setMessages(initialMessages);
        });
      } else {
        startTransition(() => {
          setMessages(starterMessages);
        });
      }
      return;
    }

    if (initialMessages.length > 0) {
      if (urlConversationId === bootstrappingThreadIdRef.current) {
        bootstrappingThreadIdRef.current = null;
      }
      startTransition(() => {
        setMessages((current) =>
          current.length > initialMessages.length ? current : initialMessages
        );
      });
      return;
    }

    if (isBusy) {
      return;
    }
  }, [
    initialConversationId,
    initialMessages,
    isBusy,
    pendingThreadId,
    setMessages,
    starterMessages,
    urlConversationId,
  ]);

  const sidebarConversations = useMemo(() => {
    const base =
      pendingSidebarHead != null &&
      !initialConversations.some((c) => c.id === pendingSidebarHead.id)
        ? [pendingSidebarHead, ...initialConversations]
        : initialConversations;

    if (sidebarExtra.length === 0) {
      return base;
    }

    const seen = new Set(base.map((c) => c.id));
    const rest = sidebarExtra.filter((c) => !seen.has(c.id));
    return [...base, ...rest];
  }, [initialConversations, pendingSidebarHead, sidebarExtra]);

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

      if (!text || isBusy || isStartingThread) {
        return;
      }

      if (!activeThreadId && user) {
        setIsStartingThread(true);
        let created: { id: string; title: string };
        try {
          created = await createConversation(text);
        } catch (creationError) {
          console.error(creationError);
          setIsStartingThread(false);
          return;
        }
        setIsStartingThread(false);

        setPendingThreadId(created.id);
        setPendingSidebarHead({
          id: created.id,
          lastMessageAt: new Date().toISOString(),
          preview: null,
          title: created.title,
        });
        bootstrappingThreadIdRef.current = created.id;
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
        } catch (streamError) {
          console.error(streamError);
          bootstrappingThreadIdRef.current = null;
          setInput(text);
        }

        return;
      }

      setInput('');
      await sendMessage(
        { text },
        activeThreadId
          ? {
              body: { conversationId: activeThreadId },
            }
          : undefined
      );
    })();
  };

  const handleClearChat = () => {
    if (isBusy) {
      stop();
    }

    bootstrappingThreadIdRef.current = null;
    setPendingSidebarHead(null);
    setPendingThreadId(null);
    setMessages(getInitialMessages(t));
    setInput('');

    const cleanPath = pathname;
    window.history.replaceState(window.history.state, '', cleanPath);
    router.replace(cleanPath, { scroll: false });
  };

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
            conversations={sidebarConversations}
            hasMoreConversations={sidebarHasMore}
            isLoadingMoreConversations={sidebarLoadingMore}
            isOpen={isSidebarOpen}
            onClearChat={handleClearChat}
            onLoadMoreConversations={loadMoreConversations}
            onToggleOpen={() => setIsSidebarOpen((value) => !value)}
          />
        </div>

        <section className="bg-background flex min-h-0 flex-1 flex-col transition-[width] duration-300 ease-out">
          <div className="border-border border-b px-4 py-2">
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
                  <LanguageSwitcher triggerClassName="w-32" />
                  <ThemeToggle />
                  <AuthDialog
                    closeLabel={t('common.cancel')}
                    configurationMissingDescription={t('auth.configuration_missing_description')}
                    configurationMissingTitle={t('auth.configuration_missing_title')}
                    description={t('auth.dialog_description')}
                    githubLabel={t('auth.sign_in_with_github')}
                    googleLabel={t('auth.sign_in_with_google')}
                    signInLabel={t('auth.sign_in')}
                    signOutLabel={t('auth.sign_out')}
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
