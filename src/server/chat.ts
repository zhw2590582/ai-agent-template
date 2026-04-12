import { convertToModelMessages, streamText, type UIMessage } from 'ai';

import { AI_CONFIG } from '@/config/app';
import { LOCALE_DETECTION_STRATEGY } from '@/config/i18n';
import { handleErrorWithLocale } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { defaultModel, getChatModel } from '@/server/ai/models';
import { DEFAULT_SYSTEM_PROMPT } from '@/server/ai/prompts';
import { saveConversationMessages } from '@/server/storage/conversations';
import { agentTools } from '@/server/ai/tools';

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
    ?.split('=')[1];

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
    const {
      conversationId,
      messages,
      model,
    }: {
      conversationId?: string;
      messages: UIMessage[];
      model?: string;
    } = await request.json();

    const result = streamText({
      model: model ? getChatModel(model) : defaultModel.chat,
      system: DEFAULT_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools: agentTools,
      maxOutputTokens: AI_CONFIG.DEFAULT_MAX_TOKENS,
    });

    result.consumeStream();

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages: responseMessages }) => {
        if (!conversationId) {
          return;
        }

        const supabase = await createSupabaseServerClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        await saveConversationMessages(
          {
            conversationId,
            messages: responseMessages,
          },
          supabase
        );
      },
      onError: () => t(locale, 'chat.errors.request_failed'),
    });
  } catch (error) {
    return handleErrorWithLocale(error, locale);
  }
}
