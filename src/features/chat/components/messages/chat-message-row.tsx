'use client';

import { memo } from 'react';
import type { UIMessage } from 'ai';

import { ChatMessageActions } from '@/features/chat/components/messages/chat-message-actions';
import { ChatMessageParts } from '@/features/chat/components/messages/chat-message-parts';
import { ChatRagSources } from '@/features/chat/components/messages/chat-rag-sources';
import { getTextContent } from '@/features/chat/utils/message-utils';
import { cn } from '@/lib/utils';

type ChatStreamStatus = 'error' | 'ready' | 'streaming' | 'submitted';

interface ChatMessageRowProps {
  getToolTitle: (toolName: string) => string;
  isLastAssistant: boolean;
  isSidebarOpen: boolean;
  message: UIMessage;
  messageKey: string;
  onCopy: (text: string) => void;
  onEditUserMessage: (text: string) => void;
  onRetry: () => void;
  status: ChatStreamStatus;
}

export const ChatMessageRow = memo(function ChatMessageRow({
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
  return (
    <div className={cn('w-full', message.role === 'user' && 'group')}>
      <ChatMessageParts
        getToolTitle={getToolTitle}
        isSidebarOpen={isSidebarOpen}
        message={message}
        messageKey={messageKey}
      />
      {message.role === 'assistant' ? <ChatRagSources message={message} /> : null}
      <ChatMessageActions
        isLastAssistant={isLastAssistant}
        onCopy={onCopy}
        onEditUserMessage={onEditUserMessage}
        onRetry={onRetry}
        role={message.role}
        status={status}
        textContent={getTextContent(message)}
      />
    </div>
  );
});
