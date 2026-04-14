'use client';

import { CopyIcon, PencilIcon, RefreshCcwIcon, SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { MessageAction, MessageActions } from '@/components/ai-elements/message';
import { Shimmer } from '@/components/ai-elements/shimmer';

type ChatStreamStatus = 'error' | 'ready' | 'streaming' | 'submitted';

interface ChatMessageActionsProps {
  isLastAssistant: boolean;
  onCopy: (text: string) => void;
  onEditUserMessage: (text: string) => void;
  onRetry: () => void;
  role: 'assistant' | 'system' | 'user';
  status: ChatStreamStatus;
  textContent: string;
}

export function ChatMessageActions({
  isLastAssistant,
  onCopy,
  onEditUserMessage,
  onRetry,
  role,
  status,
  textContent,
}: ChatMessageActionsProps) {
  const t = useTranslations();
  const isAssistantStreaming = role === 'assistant' && isLastAssistant && status === 'streaming';

  if (isAssistantStreaming) {
    return (
      <div className="text-muted-foreground mt-3 flex items-center gap-2 pl-1 text-sm">
        <SparklesIcon className="size-3.5 shrink-0" />
        <Shimmer as="span" className="text-sm">
          {t('chat.streaming.responding')}
        </Shimmer>
      </div>
    );
  }

  if (role === 'assistant' && isLastAssistant && textContent && status !== 'streaming') {
    return (
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
    );
  }

  if (role === 'user' && textContent) {
    return (
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
    );
  }

  return null;
}
