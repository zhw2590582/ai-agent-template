'use client';

import type { UIMessage } from 'ai';

import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { cn } from '@/lib/utils';

import { ChatToolPart } from '@/features/chat/components/messages/chat-tool-part';

interface ChatMessagePartsProps {
  getToolTitle: (toolName: string) => string;
  isSidebarOpen: boolean;
  message: UIMessage;
  messageKey: string;
}

function isToolPart(
  part: UIMessage['parts'][number]
): part is Extract<UIMessage['parts'][number], { type: `tool-${string}` | 'dynamic-tool' }> {
  return part.type === 'dynamic-tool' || part.type.startsWith('tool-');
}

export function ChatMessageParts({
  getToolTitle,
  isSidebarOpen,
  message,
  messageKey,
}: ChatMessagePartsProps) {
  return message.parts.map((part, partIndex) => {
    if (part.type === 'text') {
      if (!part.text) {
        return null;
      }

      return (
        <Message from={message.role} key={`${messageKey}-text-${partIndex}`}>
          <MessageContent
            className={cn(message.role === 'user' ? 'max-w-[85%] rounded-[1.6rem]' : 'max-w-none')}
          >
            <MessageResponse>{part.text}</MessageResponse>
          </MessageContent>
        </Message>
      );
    }

    if (!isToolPart(part)) {
      return null;
    }

    return (
      <ChatToolPart
        getToolTitle={getToolTitle}
        isSidebarOpen={isSidebarOpen}
        key={`${messageKey}-tool-${partIndex}`}
        messageKey={messageKey}
        part={part}
        partIndex={partIndex}
      />
    );
  });
}
