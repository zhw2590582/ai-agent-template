'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [selectedModel, setSelectedModel] = useState(
    profileSettings?.models.selectedChatModelId ?? ''
  );

  useEffect(() => {
    const profileSelectedModel = profileSettings?.models.selectedChatModelId ?? '';

    if (!selectedModel && profileSelectedModel) {
      setSelectedModel(profileSelectedModel);
    }
  }, [profileSettings?.models.selectedChatModelId, selectedModel]);

  useEffect(() => {
    if (availableModels.length === 0) {
      if (selectedModel) {
        setSelectedModel('');
      }
      return;
    }

    if (availableModels.some((model) => model.id === selectedModel)) {
      return;
    }

    setSelectedModel(availableModels[0]?.id ?? '');
  }, [availableModels, selectedModel]);

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
    [activeThreadId, locale, runtimeModel, selectedModel]
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
    setSelectedModel,
  };
}
