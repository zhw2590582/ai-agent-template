'use client';

import type { UIMessage } from 'ai';

import { ToolInvocationDisplay } from '@/features/tools/components/tool-invocation';
import { getTextContent, getToolParts } from '@/features/chat/lib/message-utils';

interface ChatMessageListProps {
  error?: Error;
  messages: UIMessage[];
  onRetry: () => void;
}

export function ChatMessageList({
  error,
  messages,
  onRetry,
}: ChatMessageListProps) {
  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
      {messages.map(message => {
        const toolParts = getToolParts(message);
        const textContent = getTextContent(message);

        return (
          <article
            key={message.id}
            className={`max-w-3xl rounded-[1.9rem] px-5 py-4 ${
              message.role === 'user'
                ? 'ml-auto bg-stone-950 text-stone-50'
                : 'mr-auto border border-stone-200 bg-[#faf7f2] text-stone-900'
            }`}
          >
            <div className="mb-3 text-[11px] uppercase tracking-[0.3em] opacity-60">
              {message.role === 'user' ? 'You' : 'Agent'}
            </div>

            {textContent ? (
              <div className="whitespace-pre-wrap text-sm leading-7">
                {textContent}
              </div>
            ) : null}

            {toolParts.length > 0 ? (
              <ToolInvocationDisplay parts={toolParts} />
            ) : null}
          </article>
        );
      })}

      {messages.length === 1 ? (
        <div className="rounded-[1.9rem] border border-dashed border-stone-300 bg-white/60 px-6 py-10 text-center text-sm leading-7 text-stone-500">
          试试问一个需要工具的问题，比如天气、时间，或者让它帮你做个计算。
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[1.6rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          请求失败。请检查 `DEEPSEEK_API_KEY` 配置，或稍后重试。
          <button
            type="button"
            onClick={onRetry}
            className="ml-3 rounded-full border border-red-300 px-3 py-1 text-xs uppercase tracking-[0.2em]"
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}

