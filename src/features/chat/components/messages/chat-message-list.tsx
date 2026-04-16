'use client';

import { useCallback } from 'react';
import type { UIMessage } from 'ai';
import { AlertCircleIcon, SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { ChatMessageRow } from '@/features/chat/components/messages/chat-message-row';
import {
  getChatDisplayErrorMessage,
  isChatModelError,
  isChatRateLimitError,
} from '@/features/chat/utils/chat-errors';
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
  const modelErrorLabel = t('errors.model_error');
  const rateLimitLabel = t('chat.errors.rate_limit');
  const requestFailedLabel = t('chat.errors.request_failed');
  const requestFailedTitle = t('chat.errors.request_failed_title');
  const errorMessage =
    messages.length > 0 && error
      ? isChatRateLimitError(error)
        ? rateLimitLabel
        : getChatDisplayErrorMessage(error, requestFailedLabel)
      : null;
  const errorTitle =
    messages.length > 0 && error
      ? isChatRateLimitError(error)
        ? rateLimitLabel
        : isChatModelError(error)
          ? modelErrorLabel
          : requestFailedTitle
      : null;
  const showErrorTitle = errorMessage != null && errorTitle != null && errorMessage !== errorTitle;
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
          'mx-auto flex w-full flex-col gap-6 px-4 py-6 transition-[max-width] duration-300 ease-out sm:px-6 sm:py-8',
          isSidebarOpen ? 'max-w-4xl' : 'max-w-6xl'
        )}
      >
        {messages.length === 0 ? (
          <div className="flex min-h-[36vh] items-center justify-center sm:min-h-[42vh]">
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
          <Message from="assistant">
            <MessageContent className="text-muted-foreground flex-row items-center gap-2 text-sm">
              <SparklesIcon className="size-3.5 shrink-0" />
              <Shimmer as="span" className="text-sm">
                {t('chat.status.thinking')}
              </Shimmer>
            </MessageContent>
          </Message>
        ) : null}

        {errorMessage ? (
          <Alert className="rounded-2xl" variant="destructive">
            <AlertCircleIcon />
            {showErrorTitle ? <AlertTitle>{errorTitle}</AlertTitle> : null}
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
