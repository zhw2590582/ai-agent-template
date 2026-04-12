'use client';

import { useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

import { AI_CONFIG } from '@/config/app';
import { type ModelId } from '@/config/models';

interface UseChatSessionOptions {
  activeThreadId: string | null;
  initialMessages: UIMessage[];
  locale: string;
  onFinish: () => void;
}

export function useChatSession({
  activeThreadId,
  initialMessages,
  locale,
  onFinish,
}: UseChatSessionOptions) {
  const [selectedModel, setSelectedModel] = useState<ModelId>(AI_CONFIG.DEFAULT_MODEL);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/chat?lang=${locale}`,
        prepareSendMessagesRequest: ({
          messages,
          id,
          trigger,
          messageId,
          body: requestBody = {},
        }) => ({
          body: {
            ...requestBody,
            id,
            trigger,
            messageId,
            messages,
            model: selectedModel,
            conversationId:
              (requestBody.conversationId as string | undefined) ?? activeThreadId ?? undefined,
          },
        }),
      }),
    [activeThreadId, locale, selectedModel]
  );

  const chat = useChat({
    onFinish,
    transport,
    messages: initialMessages,
  });

  return {
    ...chat,
    selectedModel,
    setSelectedModel,
  };
}
