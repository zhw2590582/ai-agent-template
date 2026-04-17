import type { UIMessage } from 'ai';

import { AI_CONFIG } from '@/config/chat';
import { AppError, ErrorCode, handleErrorWithLocale } from '@/lib/errors';
import {
  createAgentRunResponse,
  resolveAgentRagContext,
  resolveAgentRunContext,
} from '@/features/chat/agent-runtime/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import { resolveChatRequestLocale } from '@/features/chat/server/chat-request-context';
import { chatPostSchema } from '@/features/chat/server/schemas';
import { assertChatCapableRuntimeModel } from '@/features/models/utils/model-capabilities';

export const maxDuration = AI_CONFIG.CHAT_MAX_DURATION;

export async function handleChatPost(request: Request) {
  const locale = resolveChatRequestLocale(request);

  try {
    const {
      conversationId,
      conversationSummary,
      guestMemoryContext,
      messages,
      runtimeModel,
      runtimeOverrides,
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
    const originalMessages = messages as unknown as UIMessage[];

    const supabase = await createSupabaseServerClient();
    let user = null;

    try {
      const authResult = await supabase.auth.getUser();
      user = authResult.data.user;
    } catch {
      user = null;
    }
    const {
      agentTools,
      closeAgentResources,
      hasAgentTools,
      memoryContext,
      memorySettings,
      mcpInjectedTools,
      persistedConversationSummary,
      ragSettings: resolvedRagSettings,
      runMetadataBase,
      subagentSettings: resolvedSubagentSettings,
    } = await resolveAgentRunContext({
      conversationId: resolvedConversationId,
      guestMemoryContext,
      runtimeOverrides,
      runtimeModel,
      supabase,
      user,
    });

    const { ragContext, ragSources } = await resolveAgentRagContext({
      messages: originalMessages,
      ragSettings: resolvedRagSettings,
      supabase,
      user,
    });

    return createAgentRunResponse({
      closeAgentResources,
      conversationSummary,
      hasAgentTools,
      locale,
      memoryContext,
      memorySettings,
      messages: originalMessages,
      mcpInjectedTools,
      persistedConversationSummary,
      ragContext,
      ragSources,
      runMetadataBase,
      runtimeModel,
      subagentSettings: resolvedSubagentSettings,
      supabase,
      tools: agentTools,
      user,
    });
  } catch (error) {
    return handleErrorWithLocale(error, locale);
  }
}
