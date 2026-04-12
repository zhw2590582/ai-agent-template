import { convertToModelMessages, streamText, type UIMessage } from 'ai';

import { AI_CONFIG } from '@/config/app';
import { LOCALE_DETECTION_STRATEGY } from '@/config/i18n';
import { handleErrorWithLocale } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { logger } from '@/lib/logger';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import { defaultModel, getChatModel } from '@/features/chat/ai/models';
import { getSystemPrompt } from '@/features/chat/ai/prompts';
import { chatPostSchema } from '@/features/chat/server/schemas';
import { saveConversationMessages } from '@/features/chat/storage';
import { agentTools } from '@/features/chat/ai/tools';

export const maxDuration = 30;

function getLocaleFromRequest(request: Request): 'zh-CN' | 'en-US' {
  const url = new URL(request.url);
  const queryLocale = url.searchParams.get('lang');

  if (queryLocale === 'zh-CN' || queryLocale === 'en-US') {
    return queryLocale;
  }

  const cookie = request.headers.get('cookie') ?? '';
  const localeFromCookie = cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${LOCALE_DETECTION_STRATEGY.cookieName}=`))
    ?.split('=')[1]
    ?.slice(0, 10); // Limit length to prevent abuse

  if (localeFromCookie === 'zh-CN' || localeFromCookie === 'en-US') {
    return localeFromCookie;
  }

  const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';
  if (acceptLanguage.includes('en')) {
    return 'en-US';
  }

  return 'zh-CN';
}

export async function handleChatPost(request: Request) {
  const locale = getLocaleFromRequest(request);

  try {
    const { conversationId, messages, model } = await validateRequest(request, chatPostSchema);

    const result = streamText({
      model: model ? getChatModel(model) : defaultModel.chat,
      system: getSystemPrompt(locale),
      messages: await convertToModelMessages(messages as unknown as UIMessage[]),
      tools: agentTools,
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
