import { convertToModelMessages, streamText, type UIMessage } from 'ai';

import { AI_CONFIG } from '@/config/app';
import {
  DEFAULT_LOCALE,
  LOCALE_DETECTION_STRATEGY,
  isSupportedLocale,
  type Locale,
} from '@/config/i18n';
import { AppError, ErrorCode, handleErrorWithLocale } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { logger } from '@/lib/logger';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import { getRuntimeChatModel } from '@/features/chat/ai/models';
import { getSystemPrompt } from '@/features/chat/ai/prompts';
import { agentTools } from '@/features/chat/ai/tools';
import { chatPostSchema } from '@/features/chat/server/schemas';
import { saveConversationMessages } from '@/features/chat/storage';

export const maxDuration = 30;

function getLocaleFromRequest(request: Request): Locale {
  const url = new URL(request.url);
  const queryLocale = url.searchParams.get('lang');

  if (isSupportedLocale(queryLocale)) {
    return queryLocale;
  }

  const cookie = request.headers.get('cookie') ?? '';
  const localeFromCookie = cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${LOCALE_DETECTION_STRATEGY.cookieName}=`))
    ?.split('=')[1]
    ?.slice(0, 10); // Limit length to prevent abuse

  if (isSupportedLocale(localeFromCookie)) {
    return localeFromCookie;
  }

  const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';
  if (acceptLanguage.includes('en')) {
    return 'en-US';
  }

  return DEFAULT_LOCALE;
}

const hasAgentTools = Object.keys(agentTools).length > 0;

export async function handleChatPost(request: Request) {
  const locale = getLocaleFromRequest(request);

  try {
    const { conversationId, messages, runtimeModel } = await validateRequest(
      request,
      chatPostSchema
    );

    if (!runtimeModel) {
      throw new AppError(
        ErrorCode.INPUT_INVALID,
        'A runtime model configuration is required for chat requests.',
        400
      );
    }

    const result = streamText({
      model: getRuntimeChatModel(runtimeModel),
      system: getSystemPrompt(locale),
      messages: await convertToModelMessages(messages as unknown as UIMessage[]),
      ...(hasAgentTools ? { tools: agentTools } : {}),
      maxOutputTokens: AI_CONFIG.DEFAULT_MAX_TOKENS,
    });

    result.consumeStream();

    return result.toUIMessageStreamResponse({
      originalMessages: messages as unknown as UIMessage[],
      onFinish: async ({ messages: responseMessages }) => {
        if (!conversationId) {
          return;
        }

        try {
          const supabase = await createSupabaseServerClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            logger.warn('Chat onFinish: user not authenticated, messages not saved', {
              conversationId,
            });
            return;
          }

          await saveConversationMessages(
            {
              conversationId,
              messages: responseMessages,
              runtimeModel,
              userId: user.id,
            },
            supabase
          );
        } catch (saveError) {
          logger.error('Chat onFinish: failed to save messages', {
            conversationId,
            error: saveError instanceof Error ? saveError.message : String(saveError),
          });
        }
      },
      onError: () => t(locale, 'chat.errors.request_failed'),
    });
  } catch (error) {
    return handleErrorWithLocale(error, locale);
  }
}
