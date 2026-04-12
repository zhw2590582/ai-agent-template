'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
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
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

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
  initialMessages?: UIMessage[];
}

export function ChatHomePage({
  activeView = 'chat',
  initialConversationId = null,
  initialConversations = [],
  initialMessages = [],
}: ChatHomePageProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthUser();
  const starterMessages = useMemo(() => getInitialMessages(t), [t]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelId>(AI_CONFIG.DEFAULT_MODEL);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/chat?lang=${locale}`,
        prepareSendMessagesRequest: ({ messages, id, trigger, messageId }) => ({
          body: {
            id,
            trigger,
            messageId,
            messages,
            model: selectedModel,
            conversationId,
          },
        }),
      }),
    [conversationId, locale, selectedModel]
  );
  const { messages, sendMessage, setMessages, status, stop, error, regenerate } = useChat({
    onFinish: () => {
      router.refresh();
    },
    transport,
    messages: initialMessages.length > 0 ? initialMessages : starterMessages,
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  const createConversation = async (initialMessage: string) => {
    const response = await fetch('/api/conversations', {
      body: JSON.stringify({ initialMessage }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }

    const data: { conversation: { id: string } } = await response.json();
    return data.conversation.id;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void (async () => {
      event.preventDefault();
      const text = input.trim();

      if (!text || isBusy) {
        return;
      }

      let nextConversationId = conversationId;

      if (!nextConversationId && user) {
        nextConversationId = await createConversation(text);
        setConversationId(nextConversationId);
        router.replace(`/${locale}?id=${nextConversationId}`);
      }

      await sendMessage(
        { text },
        nextConversationId
          ? {
              body: {
                conversationId: nextConversationId,
              },
            }
          : undefined
      );
      setInput('');
    })();
  };

  const handleClearChat = () => {
    if (isBusy) {
      stop();
    }

    setMessages(getInitialMessages(t));
    setInput('');
    setConversationId(null);
    router.push(pathname);
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
            isBusy={isBusy}
            isSidebarOpen={isSidebarOpen}
            model={selectedModel}
            onModelChange={setSelectedModel}
            onStop={stop}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            status={status}
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
            activeConversationId={conversationId}
            conversations={initialConversations}
            isOpen={isSidebarOpen}
            onClearChat={handleClearChat}
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
