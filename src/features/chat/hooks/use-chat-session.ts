'use client';

import { useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

import type { AppProfileSettings, ChatModelOption } from '@/features/models/types';
import { resolveChatRuntimeModel } from '@/features/models/utils/profile';

interface UseChatSessionOptions {
  activeThreadId: string | null;
  availableModels: ChatModelOption[];
  initialMessages: UIMessage[];
  locale: string;
  onFinish: () => void;
  profileSettings: AppProfileSettings | null;
}

export function useChatSession({
  activeThreadId,
  availableModels,
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
            runtimeModel: runtimeModel ?? undefined,
            conversationId:
              (requestBody.conversationId as string | undefined) ?? activeThreadId ?? undefined,
          },
        }),
      }),
    [activeThreadId, locale, runtimeModel]
  );

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
