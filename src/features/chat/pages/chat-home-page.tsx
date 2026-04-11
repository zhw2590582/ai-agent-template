'use client';

import { useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useTranslations } from 'next-intl';

import { ChatComposer } from '@/features/chat/components/chat-composer';
import { ChatMessageList } from '@/features/chat/components/chat-message-list';
import { ChatSidebar } from '@/features/chat/components/chat-sidebar';
import { getInitialMessages, getStarterPrompts } from '@/features/chat/lib/chat-config';

export function ChatHomePage() {
  const t = useTranslations();
  const starterPrompts = useMemo(() => getStarterPrompts(t), [t]);
  const initialMessages = useMemo(() => getInitialMessages(t), [t]);
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
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

  const handleQuickPrompt = (prompt: string) => {
    if (isBusy) {
      return;
    }

    sendMessage({ text: prompt });
  };

  return (
    <main className="bg-background text-foreground h-screen">
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ChatSidebar
          isBusy={isBusy}
          messages={messages}
          onQuickPrompt={handleQuickPrompt}
          starterPrompts={starterPrompts}
        />

        <section className="bg-background flex min-h-0 flex-col">
          <div className="border-border border-b px-6 py-4">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-muted-foreground text-[11px] tracking-[0.32em] uppercase">
                  {t('chat.subtitle')}
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{t('chat.title')}</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="border-border bg-muted text-muted-foreground rounded-full border px-3 py-1 text-xs tracking-[0.22em] uppercase">
                  {status === 'ready'
                    ? t('chat.status.ready')
                    : status === 'error'
                      ? t('chat.status.error')
                      : t('chat.status.thinking')}
                </div>
              </div>
            </div>
          </div>

          <ChatMessageList error={error} messages={messages} onRetry={() => regenerate()} />

          <ChatComposer
            input={input}
            isBusy={isBusy}
            onStop={stop}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            status={status}
          />
        </section>
      </div>
    </main>
  );
}
