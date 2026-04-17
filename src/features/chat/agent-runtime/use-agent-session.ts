'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

import { API_ROUTES } from '@/config/api';
import { buildAgentRunRequest } from '@/features/chat/agent-runtime/build-agent-run-request';
import { buildAgentRuntimeOverrides } from '@/features/chat/agent-runtime/runtime-overrides';
import { CHAT_RATE_LIMIT_ERROR_CODE, ChatRequestError } from '@/features/chat/utils/chat-errors';
import { resolveChatRuntimeModel } from '@/features/models/utils/runtime-model';
import type { ChatModelOption } from '@/features/models/types';
import { createClientMemorySource } from '@/features/memory/sources/client-memory-source';
import type { AppProfileSettings } from '@/features/settings/types';
import { readApiError } from '@/lib/api-client';

interface UseAgentSessionOptions {
  activeThreadId: string | null;
  availableModels: ChatModelOption[];
  conversationSummary?: string | null;
  initialMessages: UIMessage[];
  isAuthenticated: boolean;
  locale: string;
  onFinish: () => void;
  profileSettings: AppProfileSettings | null;
}

export function useAgentSession({
  activeThreadId,
  availableModels,
  conversationSummary,
  initialMessages,
  isAuthenticated,
  locale,
  onFinish,
  profileSettings,
}: UseAgentSessionOptions) {
  const guestMemorySource = useMemo(() => createClientMemorySource({ isAuthenticated: false }), []);
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
  const runtimeOverrides = useMemo(
    () => buildAgentRuntimeOverrides(profileSettings),
    [profileSettings]
  );
  const runtimeModelRef = useRef(runtimeModel);
  const activeThreadIdRef = useRef(activeThreadId);
  const conversationSummaryRef = useRef(conversationSummary);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const runtimeOverridesRef = useRef(runtimeOverrides);

  useEffect(() => {
    runtimeModelRef.current = runtimeModel;
    activeThreadIdRef.current = activeThreadId;
    conversationSummaryRef.current = conversationSummary;
    isAuthenticatedRef.current = isAuthenticated;
    runtimeOverridesRef.current = runtimeOverrides;
  }, [activeThreadId, conversationSummary, isAuthenticated, runtimeModel, runtimeOverrides]);

  /* eslint-disable react-hooks/refs */
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: `${API_ROUTES.chat}?lang=${locale}`,
        fetch: async (input, init) => {
          const response = await fetch(input, init);

          if (!response.ok) {
            const error = await readApiError(response);

            if (error.code === CHAT_RATE_LIMIT_ERROR_CODE) {
              throw new ChatRequestError(
                error.code,
                error.message ?? CHAT_RATE_LIMIT_ERROR_CODE,
                error.details,
                response.status
              );
            }

            throw new ChatRequestError(
              error.code,
              error.message ?? `Request failed (${response.status})`,
              error.details,
              response.status
            );
          }

          return response;
        },
        prepareSendMessagesRequest: async ({
          messages,
          id,
          trigger,
          messageId,
          body: requestBody = {},
        }) => {
          let guestMemoryContext: string | null = null;

          if (
            !isAuthenticatedRef.current &&
            runtimeOverridesRef.current?.memory?.enabled &&
            runtimeOverridesRef.current.memory.crossConversation
          ) {
            guestMemoryContext = await guestMemorySource.buildContext({
              memorySettings: runtimeOverridesRef.current.memory,
            });
          }

          return {
            body: buildAgentRunRequest({
              activeThreadId: activeThreadIdRef.current,
              body: requestBody,
              conversationSummary: conversationSummaryRef.current,
              guestMemoryContext,
              id,
              messageId,
              messages,
              runtimeModel: runtimeModelRef.current,
              runtimeOverrides: runtimeOverridesRef.current,
              trigger,
            }),
          };
        },
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
