'use client';

import { memo, useCallback } from 'react';
import type { UIMessage } from 'ai';
import { CopyIcon, RefreshCcwIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { getTextContent, getToolParts } from '@/features/chat/lib/message-utils';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { cn } from '@/lib/utils';

interface ChatMessageListProps {
  isSidebarOpen: boolean;
  error?: Error;
  messages: UIMessage[];
  onRetry: () => void;
}

/* ---------- Single message row (memoized to reduce streaming re-renders) ---------- */

interface ChatMessageRowProps {
  message: UIMessage;
  messageKey: string;
  isLastAssistant: boolean;
  isSidebarOpen: boolean;
  getToolTitle: (toolName: string) => string;
  onCopy: (text: string) => void;
  onRetry: () => void;
}

const ChatMessageRow = memo(function ChatMessageRow({
  message,
  messageKey,
  isLastAssistant,
  isSidebarOpen,
  getToolTitle,
  onCopy,
  onRetry,
}: ChatMessageRowProps) {
  const t = useTranslations();
  const toolParts = getToolParts(message);
  const textContent = getTextContent(message);

  return (
    <div className="w-full">
      {textContent ? (
        <Message from={message.role}>
          <MessageContent
            className={cn(message.role === 'user' ? 'max-w-[85%] rounded-[1.6rem]' : 'max-w-none')}
          >
            <MessageResponse>{textContent}</MessageResponse>
          </MessageContent>
        </Message>
      ) : null}

      {toolParts.length > 0 ? (
        <div className={cn('mt-3 ml-0', isSidebarOpen ? 'max-w-4xl' : 'max-w-6xl')}>
          {toolParts.map((part, partIndex) => {
            const toolName = part.type.replace('tool-', '');
            const toolKey =
              'toolCallId' in part &&
              part.toolCallId != null &&
              String(part.toolCallId).trim() !== ''
                ? part.toolCallId
                : `tool-${messageKey}-${partIndex}`;

            return (
              <Tool
                key={toolKey}
                className="border-border/80 bg-card/60"
                defaultOpen={part.state !== 'output-available'}
              >
                <ToolHeader state={part.state} title={getToolTitle(toolName)} type={part.type} />
                <ToolContent>
                  {'input' in part && part.input !== undefined ? (
                    <ToolInput input={part.input} />
                  ) : null}
                  <ToolOutput
                    errorText={'errorText' in part ? part.errorText : undefined}
                    output={'output' in part ? part.output : undefined}
                  />
                </ToolContent>
              </Tool>
            );
          })}
        </div>
      ) : null}

      {message.role === 'assistant' && isLastAssistant && textContent ? (
        <MessageActions className="mt-2">
          <MessageAction
            label={t('chat.actions.retry')}
            onClick={onRetry}
            tooltip={t('chat.actions.regenerate')}
          >
            <RefreshCcwIcon className="size-3.5" />
          </MessageAction>
          <MessageAction
            label={t('chat.actions.copy')}
            onClick={() => onCopy(textContent)}
            tooltip={t('chat.actions.copy_response')}
          >
            <CopyIcon className="size-3.5" />
          </MessageAction>
        </MessageActions>
      ) : null}
    </div>
  );
});

/* ---------- Message list container ---------- */

export function ChatMessageList({ isSidebarOpen, error, messages, onRetry }: ChatMessageListProps) {
  const t = useTranslations();
  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant')?.id;

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

  const getToolTitle = (toolName: string) => {
    if (toolName === 'weather') return t('tools.weather.name');
    if (toolName === 'calculator') return t('tools.calculator.name');
    if (toolName === 'datetime') return t('tools.datetime.name');
    return toolName;
  };

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
              <p className="text-muted-foreground mt-3 text-base leading-7">
                {t('chat.empty_state.description')}
              </p>
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
              onRetry={onRetry}
              onCopy={handleCopy}
            />
          );
        })}

        {error ? (
          <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl border px-5 py-4 text-sm">
            {t('chat.errors.request_failed')}
          </div>
        ) : null}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
