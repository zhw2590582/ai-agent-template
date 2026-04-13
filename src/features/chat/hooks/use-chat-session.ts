'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const runtimeModelRef = useRef(runtimeModel);
  const activeThreadIdRef = useRef(activeThreadId);

  useEffect(() => {
    runtimeModelRef.current = runtimeModel;
    activeThreadIdRef.current = activeThreadId;
  }, [activeThreadId, runtimeModel]);

  /* eslint-disable react-hooks/refs */
  const [transport] = useState(
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
