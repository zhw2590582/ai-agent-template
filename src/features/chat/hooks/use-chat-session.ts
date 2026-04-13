'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

import type { AppProfileSettings, ChatModelOption } from '@/features/models/types';
import { readApiError } from '@/lib/api-client';
import { resolveChatRuntimeModel } from '@/features/models/utils/profile';
import { CHAT_RATE_LIMIT_ERROR_CODE } from '@/features/chat/utils/chat-errors';

interface UseChatSessionOptions {
  activeThreadId: string | null;
  availableModels: ChatModelOption[];
  conversationSummary?: string | null;
  initialMessages: UIMessage[];
  locale: string;
  onFinish: () => void;
  profileSettings: AppProfileSettings | null;
}

export function useChatSession({
  activeThreadId,
  availableModels,
  conversationSummary,
  initialMessages,
  locale,
  onFinish,
  profileSettings,
}: UseChatSessionOptions) {
  const selectedModel = useMemo(() => {
    const profileSelectedModel = profileSettings?.models.selectedChatModelId ?? '';

    if (availableModels.length === 0) {
      return '';
    }

    if (
      profileSelectedModel &&
      availableModels.some((model) => model.id === profileSelectedModel)
    ) {
      return profileSelectedModel;
    }

    return availableModels[0]?.id ?? '';
  }, [availableModels, profileSettings?.models.selectedChatModelId]);

  const runtimeModel = useMemo(() => {
    if (!profileSettings) {
      return null;
    }

    return resolveChatRuntimeModel(profileSettings, selectedModel);
  }, [profileSettings, selectedModel]);
  const runtimeModelRef = useRef(runtimeModel);
  const activeThreadIdRef = useRef(activeThreadId);
  const conversationSummaryRef = useRef(conversationSummary);

  useEffect(() => {
    runtimeModelRef.current = runtimeModel;
    activeThreadIdRef.current = activeThreadId;
    conversationSummaryRef.current = conversationSummary;
  }, [activeThreadId, conversationSummary, runtimeModel]);

  /* eslint-disable react-hooks/refs */
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: `/api/chat?lang=${locale}`,
        fetch: async (input, init) => {
          const response = await fetch(input, init);

          if (response.status === 429) {
            const error = await readApiError(response);

            if (error.code === CHAT_RATE_LIMIT_ERROR_CODE) {
              throw new Error(CHAT_RATE_LIMIT_ERROR_CODE);
            }
          }

          return response;
        },
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
            conversationSummary: conversationSummaryRef.current ?? undefined,
            runtimeModel: runtimeModelRef.current ?? undefined,
            conversationId:
              (requestBody.conversationId as string | undefined) ??
              activeThreadIdRef.current ??
              undefined,
          },
        }),
      })
  );
  /* eslint-enable react-hooks/refs */

  const chat = useChat({
    onFinish,
    transport,
    messages: initialMessages,
  });

  return {
    ...chat,
    runtimeModel,
    selectedModel,
  };
}
