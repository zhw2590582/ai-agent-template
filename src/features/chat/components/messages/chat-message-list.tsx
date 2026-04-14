'use client';

import { useCallback } from 'react';
import type { UIMessage } from 'ai';
import { SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { ChatMessageRow } from '@/features/chat/components/messages/chat-message-row';
import { isChatRateLimitError } from '@/features/chat/utils/chat-errors';
import { cn } from '@/lib/utils';

interface ChatMessageListProps {
  error?: Error;
  isSidebarOpen: boolean;
  messages: UIMessage[];
  onEditUserMessage: (text: string) => void;
  onRetry: () => void;
  status: 'error' | 'ready' | 'streaming' | 'submitted';
}

function formatToolTitle(toolName: string) {
  return toolName
    .replace(/^get/, '')
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ChatMessageList({
  error,
  isSidebarOpen,
  messages,
  onEditUserMessage,
  onRetry,
  status,
}: ChatMessageListProps) {
  const t = useTranslations();
  const errorMessage = error
    ? isChatRateLimitError(error)
      ? t('chat.errors.rate_limit')
      : t('chat.errors.request_failed')
    : null;
  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant')?.id;
  const latestMessage = messages[messages.length - 1];
  const showPendingThinking =
    status === 'submitted' && latestMessage?.role === 'user' && messages.length > 0;

  const handleCopy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(t('chat.toast.copied'));
      } catch {
        toast.error(t('chat.toast.copy_failed'));
      }
    },
    [t]
  );

  const getToolTitle = (toolName: string) => formatToolTitle(toolName);

  return (
    <Conversation className="min-h-0 flex-1">
      <ConversationContent
        className={cn(
          'mx-auto flex w-full flex-col gap-6 px-6 py-8 transition-[max-width] duration-300 ease-out',
          isSidebarOpen ? 'max-w-4xl' : 'max-w-6xl'
        )}
      >
        {messages.length === 0 ? (
          <div className="flex min-h-[42vh] items-center justify-center">
            <div className="max-w-2xl text-center">
              <h3 className="text-3xl font-semibold tracking-tight">
                {t('chat.empty_state.title')}
              </h3>
              {t('chat.empty_state.description') ? (
                <p className="text-muted-foreground mt-3 text-base leading-7">
                  {t('chat.empty_state.description')}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {messages.map((message, messageIndex) => {
          const messageKey =
            message.id != null && String(message.id).trim() !== ''
              ? message.id
              : `message-${messageIndex}`;

          return (
            <ChatMessageRow
              key={messageKey}
              getToolTitle={getToolTitle}
              isLastAssistant={message.id === lastAssistantMessageId}
              isSidebarOpen={isSidebarOpen}
              message={message}
              messageKey={messageKey}
              onCopy={handleCopy}
              onEditUserMessage={onEditUserMessage}
              onRetry={onRetry}
              status={status}
            />
          );
        })}

        {showPendingThinking ? (
          <div className="text-muted-foreground flex items-center gap-2 pl-1 text-sm">
            <SparklesIcon className="size-3.5 shrink-0" />
            <Shimmer as="span" className="text-sm">
              {t('chat.status.thinking')}
            </Shimmer>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl border px-5 py-4 text-sm">
            {errorMessage}
          </div>
        ) : null}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
