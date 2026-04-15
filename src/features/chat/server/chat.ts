import type { UIMessage } from 'ai';

import { AI_CONFIG } from '@/config/chat';
import { AppError, ErrorCode, handleErrorWithLocale } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { logger } from '@/lib/logger';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import { runGenerateTextWorkflow } from '@/features/chat/ai/workflows';
import { createChatFinishHandler } from '@/features/chat/server/chat-finish';
import {
  loadChatRequestContext,
  resolveChatRequestLocale,
} from '@/features/chat/server/chat-request-context';
import { chatPostSchema } from '@/features/chat/server/schemas';
import { getMessageText } from '@/features/chat/storage/conversation-analysis';
import { assertChatCapableRuntimeModel } from '@/features/models/utils/model-capabilities';
import { buildRagContext, retrieveRelevantChunks } from '@/features/rag/server/retrieval';
import { hasRagAccess } from '@/features/rag/settings';
import type { RagSourceItem } from '@/features/rag/types';

export const maxDuration = AI_CONFIG.CHAT_MAX_DURATION;

export async function handleChatPost(request: Request) {
  const locale = resolveChatRequestLocale(request);

  try {
    const {
      conversationId,
      conversationSummary,
      mcpSettings,
      messages,
      ragSettings,
      runtimeModel,
      sandboxSettings,
      searchSettings,
    } = await validateRequest(request, chatPostSchema);
    const resolvedConversationId = conversationId ?? null;

    if (!runtimeModel) {
      throw new AppError(
        ErrorCode.INPUT_INVALID,
        'A runtime model configuration is required for chat requests.',
        400
      );
    }

    assertChatCapableRuntimeModel(runtimeModel);

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const {
      agentTools,
      closeAgentResources,
      hasAgentTools,
      memoryContext,
      memorySettings,
      mcpInjectedTools,
      persistedConversationSummary,
      ragSettings: resolvedRagSettings,
    } = await loadChatRequestContext({
      conversationId: resolvedConversationId,
      mcpSettings,
      ragSettings,
      sandboxSettings,
      searchSettings,
      supabase,
      user,
    });

    let ragContext: string | null = null;
    let ragSources: RagSourceItem[] = [];
    if (user && resolvedRagSettings && hasRagAccess(resolvedRagSettings)) {
      const latestUserMessage = [...(messages as unknown as UIMessage[])]
        .reverse()
        .find((message) => message.role === 'user');
      const latestUserQuery = latestUserMessage ? getMessageText(latestUserMessage) : '';

      if (latestUserQuery) {
        try {
          const retrievedChunks = await retrieveRelevantChunks({
            query: latestUserQuery,
            ragSettings: resolvedRagSettings,
            supabase,
            userId: user.id,
          });
          ragContext = buildRagContext(retrievedChunks, resolvedRagSettings);
          ragSources = retrievedChunks.map((chunk) => ({
            content: chunk.content,
            documentId: chunk.documentId,
            documentTitle: chunk.documentTitle,
            id: chunk.id,
            score: chunk.score,
            source: chunk.source,
          }));
        } catch (ragError) {
          logger.warn('Chat request: failed to retrieve RAG context', {
            error: ragError instanceof Error ? ragError.message : String(ragError),
          });
        }
      }
    }

    let result;
    try {
      result = await runGenerateTextWorkflow({
        conversationSummary,
        hasAgentTools,
        locale,
        memoryContext,
        memorySettings,
        messages: messages as unknown as UIMessage[],
        mcpInjectedTools,
        persistedConversationSummary,
        ragContext,
        runtimeModel,
        tools: agentTools,
      });
    } catch (workflowError) {
      await closeAgentResources?.();
      throw workflowError;
    }

    result.consumeStream();

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type !== 'finish' || ragSources.length === 0) {
          return undefined;
        }

        return {
          ragSources,
        };
      },
      originalMessages: messages as unknown as UIMessage[],
      onFinish: createChatFinishHandler({
        closeAgentResources,
        conversationId: resolvedConversationId,
        locale,
        memorySettings,
        runtimeModel,
        supabase,
        user,
      }),
      onError: () => t(locale, 'chat.errors.request_failed'),
    });
  } catch (error) {
    return handleErrorWithLocale(error, locale);
  }
}
