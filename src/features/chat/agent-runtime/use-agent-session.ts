'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

import { API_ROUTES } from '@/config/api';
import type { AppProfileSettings } from '@/features/auth/profile/types';
import { buildAgentRunRequest } from '@/features/chat/agent-runtime/build-agent-run-request';
import { CHAT_RATE_LIMIT_ERROR_CODE, ChatRequestError } from '@/features/chat/utils/chat-errors';
import { resolveChatRuntimeModel } from '@/features/models/utils/runtime-model';
import type { ChatModelOption } from '@/features/models/types';
import { buildMemoryContext } from '@/features/memory/storage/memory-retrieval';
import {
  ensureLocalMemoriesLoaded,
  readLocalMemories,
} from '@/features/memory/storage/local-memories';
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
  const isAuthenticatedRef = useRef(isAuthenticated);
  const memorySettingsRef = useRef(profileSettings?.memory);
  const mcpSettingsRef = useRef(profileSettings?.mcp);
  const ragSettingsRef = useRef(profileSettings?.rag);
  const sandboxSettingsRef = useRef(profileSettings?.sandbox);
  const searchSettingsRef = useRef(profileSettings?.search);
  const subagentSettingsRef = useRef(profileSettings?.subagent);

  useEffect(() => {
    runtimeModelRef.current = runtimeModel;
    activeThreadIdRef.current = activeThreadId;
    conversationSummaryRef.current = conversationSummary;
    isAuthenticatedRef.current = isAuthenticated;
    memorySettingsRef.current = profileSettings?.memory;
    mcpSettingsRef.current = profileSettings?.mcp;
    ragSettingsRef.current = profileSettings?.rag;
    sandboxSettingsRef.current = profileSettings?.sandbox;
    searchSettingsRef.current = profileSettings?.search;
    subagentSettingsRef.current = profileSettings?.subagent;
  }, [
    activeThreadId,
    conversationSummary,
    isAuthenticated,
    profileSettings?.memory,
    profileSettings?.mcp,
    profileSettings?.rag,
    profileSettings?.sandbox,
    profileSettings?.search,
    profileSettings?.subagent,
    runtimeModel,
  ]);

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
            memorySettingsRef.current?.enabled &&
            memorySettingsRef.current.crossConversation
          ) {
            await ensureLocalMemoriesLoaded();
            guestMemoryContext = buildMemoryContext(readLocalMemories(), {
              memorySettings: memorySettingsRef.current,
            });
          }

          return {
            body: buildAgentRunRequest({
              activeThreadId: activeThreadIdRef.current,
              body: requestBody,
              conversationSummary: conversationSummaryRef.current,
              guestMemoryContext,
              id,
              mcpSettings: mcpSettingsRef.current,
              memorySettings: memorySettingsRef.current,
              messageId,
              messages,
              ragSettings: ragSettingsRef.current,
              runtimeModel: runtimeModelRef.current,
              sandboxSettings: sandboxSettingsRef.current,
              searchSettings: searchSettingsRef.current,
              subagentSettings: subagentSettingsRef.current,
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
