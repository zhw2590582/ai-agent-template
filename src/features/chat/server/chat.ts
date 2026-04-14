import { streamText, type UIMessage } from 'ai';

import { AI_CONFIG } from '@/config/chat';
import { AppError, ErrorCode, handleErrorWithLocale } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import { getRuntimeChatModel } from '@/features/chat/ai/core/models';
import { getSystemPrompt } from '@/features/chat/ai/core/prompts';
import { buildChatMessagesWithSummary } from '@/features/chat/server/chat-message-context';
import { createChatFinishHandler } from '@/features/chat/server/chat-finish';
import {
  loadChatRequestContext,
  resolveChatRequestLocale,
} from '@/features/chat/server/chat-request-context';
import { chatPostSchema } from '@/features/chat/server/schemas';

export const maxDuration = AI_CONFIG.CHAT_MAX_DURATION;

export async function handleChatPost(request: Request) {
  const locale = resolveChatRequestLocale(request);

  try {
    const { conversationId, conversationSummary, messages, runtimeModel, searchSettings } =
      await validateRequest(request, chatPostSchema);
    const resolvedConversationId = conversationId ?? null;

    if (!runtimeModel) {
      throw new AppError(
        ErrorCode.INPUT_INVALID,
        'A runtime model configuration is required for chat requests.',
        400
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const {
      agentTools,
      hasAgentTools,
      memoryContext,
      memorySettings,
      persistedConversationSummary,
    } = await loadChatRequestContext({
      conversationId: resolvedConversationId,
      searchSettings,
      supabase,
      user,
    });

    console.log({ agentTools });

    const result = streamText({
      model: getRuntimeChatModel(runtimeModel),
      system: getSystemPrompt(locale, {
        memoryContext,
        webSearchEnabled: hasAgentTools,
      }),
      messages: await buildChatMessagesWithSummary(
        messages as unknown as UIMessage[],
        persistedConversationSummary ?? conversationSummary ?? null,
        memorySettings
      ),
      ...(hasAgentTools ? { tools: agentTools } : {}),
      maxOutputTokens: AI_CONFIG.DEFAULT_MAX_TOKENS,
    });

    result.consumeStream();

    return result.toUIMessageStreamResponse({
      originalMessages: messages as unknown as UIMessage[],
      onFinish: createChatFinishHandler({
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
