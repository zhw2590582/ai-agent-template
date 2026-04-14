'use client';

import { memo, useCallback } from 'react';
import type { UIMessage } from 'ai';
import { CopyIcon, PencilIcon, RefreshCcwIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

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
import { Shimmer } from '@/components/ai-elements/shimmer';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { isChatRateLimitError } from '@/features/chat/utils/chat-errors';
import { getTextContent } from '@/features/chat/utils/message-utils';
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

function isToolPart(
  part: UIMessage['parts'][number]
): part is Extract<UIMessage['parts'][number], { type: `tool-${string}` | 'dynamic-tool' }> {
  return part.type === 'dynamic-tool' || part.type.startsWith('tool-');
}

interface ChatMessageRowProps {
  getToolTitle: (toolName: string) => string;
  isLastAssistant: boolean;
  isSidebarOpen: boolean;
  message: UIMessage;
  messageKey: string;
  onCopy: (text: string) => void;
  onEditUserMessage: (text: string) => void;
  onRetry: () => void;
  status: 'error' | 'ready' | 'streaming' | 'submitted';
}

const ChatMessageRow = memo(function ChatMessageRow({
  getToolTitle,
  isLastAssistant,
  isSidebarOpen,
  message,
  messageKey,
  onCopy,
  onEditUserMessage,
  onRetry,
  status,
}: ChatMessageRowProps) {
  const t = useTranslations();
  const textContent = getTextContent(message);
  const isAssistantStreaming =
    message.role === 'assistant' &&
    isLastAssistant &&
    (status === 'streaming' || status === 'submitted');

  return (
    <div className={cn('w-full', message.role === 'user' && 'group')}>
      {message.parts.map((part, partIndex) => {
        if (part.type === 'text') {
          if (!part.text) {
            return null;
          }

          return (
            <Message from={message.role} key={`${messageKey}-text-${partIndex}`}>
              <MessageContent
                className={cn(
                  message.role === 'user' ? 'max-w-[85%] rounded-[1.6rem]' : 'max-w-none'
                )}
              >
                <MessageResponse>{part.text}</MessageResponse>
              </MessageContent>
            </Message>
          );
        }

        if (!isToolPart(part)) {
          return null;
        }

        const toolName = part.type === 'dynamic-tool' ? 'tool' : part.type.replace('tool-', '');
        const toolKey =
          'toolCallId' in part && part.toolCallId != null && String(part.toolCallId).trim() !== ''
            ? part.toolCallId
            : `tool-${messageKey}-${partIndex}`;
        const toolStateKey = `${toolKey}:${part.state}`;

        return (
          <div className={cn('ml-0', isSidebarOpen ? 'max-w-4xl' : 'max-w-6xl')} key={toolStateKey}>
            <div className="pt-3">
              <Tool
                className="border-border/80 bg-card/60"
                defaultOpen={part.state !== 'output-available'}
              >
                {part.type === 'dynamic-tool' ? (
                  <ToolHeader
                    state={part.state}
                    title={getToolTitle(toolName)}
                    toolName={toolName}
                    type={part.type}
                  />
                ) : (
                  <ToolHeader state={part.state} title={getToolTitle(toolName)} type={part.type} />
                )}
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
            </div>
          </div>
        );
      })}

      {isAssistantStreaming ? (
        <div className="mt-3 pl-1">
          <Shimmer as="p" duration={1} className="text-muted-foreground text-sm">
            {t('chat.streaming.responding')}
          </Shimmer>
        </div>
      ) : null}

      {message.role === 'assistant' && isLastAssistant && textContent && status === 'ready' ? (
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

      {message.role === 'user' && textContent ? (
        <MessageActions className="mt-2 justify-end opacity-0 transition-opacity group-hover:opacity-100">
          <MessageAction
            label={t('chat.actions.edit')}
            onClick={() => onEditUserMessage(textContent)}
            tooltip={t('chat.actions.edit_message')}
          >
            <PencilIcon className="size-3.5" />
          </MessageAction>
          <MessageAction
            label={t('chat.actions.copy')}
            onClick={() => onCopy(textContent)}
            tooltip={t('chat.actions.copy_message')}
          >
            <CopyIcon className="size-3.5" />
          </MessageAction>
        </MessageActions>
      ) : null}
    </div>
  );
});

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
