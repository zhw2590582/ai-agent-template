'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
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

import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { AI_CONFIG } from '@/config/app';
import { HEADER_NAV_ITEMS, type HeaderNavItemId } from '@/config/navigation';
import { type ModelId } from '@/config/models';
import { ChatComposer } from '@/features/chat/components/chat-composer';
import { ChatMessageList } from '@/features/chat/components/chat-message-list';
import { ChatSidebar } from '@/features/chat/components/chat-sidebar';
import { getInitialMessages } from '@/features/chat/lib/chat-config';
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
}

export function ChatHomePage({ activeView = 'chat' }: ChatHomePageProps) {
  const t = useTranslations();
  const locale = useLocale();
  const initialMessages = useMemo(() => getInitialMessages(t), [t]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelId>(AI_CONFIG.DEFAULT_MODEL);
  const [input, setInput] = useState('');
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
          },
        }),
      }),
    [locale, selectedModel]
  );
  const { messages, sendMessage, setMessages, status, stop, error, regenerate } = useChat({
    transport,
    messages: initialMessages,
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();

    if (!text || isBusy) {
      return;
    }

    sendMessage({ text });
    setInput('');
  };

  const handleClearChat = () => {
    if (isBusy) {
      stop();
    }

    setMessages(getInitialMessages(t));
    setInput('');
  };

  const handleSelectHistory = (value: string) => {
    setInput(value);
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
            isSidebarOpen ? 'w-[280px]' : 'w-16'
          )}
        >
          <ChatSidebar
            isOpen={isSidebarOpen}
            messages={messages}
            onClearChat={handleClearChat}
            onSelectHistory={handleSelectHistory}
            onToggleOpen={() => setIsSidebarOpen((value) => !value)}
          />
        </div>

        <section className="bg-background flex min-h-0 flex-1 flex-col transition-[width] duration-300 ease-out">
          <div className="border-border border-b px-6 py-4">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
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
