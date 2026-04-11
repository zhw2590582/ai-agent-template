'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

import { ChatComposer } from '@/features/chat/components/chat-composer';
import { ChatMessageList } from '@/features/chat/components/chat-message-list';
import { ChatSidebar } from '@/features/chat/components/chat-sidebar';
import { INITIAL_MESSAGES } from '@/features/chat/lib/chat-config';

export function ChatHomePage() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    messages: INITIAL_MESSAGES,
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
    <main className="min-h-screen bg-[#f5f1ea] text-stone-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(120,113,108,0.18),_transparent_30%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
          <ChatSidebar
            isBusy={isBusy}
            messages={messages}
            onQuickPrompt={handleQuickPrompt}
          />

          <section className="flex min-h-[70vh] flex-col rounded-[2.2rem] border border-stone-200/80 bg-white/75 shadow-[0_20px_60px_rgba(28,25,23,0.10)] backdrop-blur">
            <div className="border-b border-stone-200/80 px-5 py-5 sm:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.32em] text-stone-500">
                    Stream
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                    直接开始对话
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs uppercase tracking-[0.22em] text-stone-500">
                    {status === 'ready'
                      ? 'Ready'
                      : status === 'error'
                        ? 'Error'
                        : 'Thinking'}
                  </div>
                  {isBusy ? (
                    <button
                      type="button"
                      onClick={() => stop()}
                      className="rounded-full bg-stone-950 px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-50"
                    >
                      Stop
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <ChatMessageList
              error={error}
              messages={messages}
              onRetry={() => regenerate()}
            />

            <ChatComposer
              input={input}
              isBusy={isBusy}
              onInputChange={setInput}
              onSubmit={handleSubmit}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

