import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import type { UIMessage } from 'ai';

import { DEFAULT_LOCALE } from '@/config/i18n';
import { generateConversationSummary } from '@/features/chat/ai/memory/summary';
import { chatSummaryPostSchema } from '@/features/chat/server/schemas';
import { handleErrorWithLocale } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.CHAT_SUMMARY,
      namespace: 'api:chat-summary',
    });

    const { existingSummary, locale, messages, runtimeModel } = await validateRequest(
      request,
      chatSummaryPostSchema
    );

    const summary = await generateConversationSummary(messages as unknown as UIMessage[], {
      existingSummary,
      locale: locale ?? DEFAULT_LOCALE,
      runtimeModel,
    });

    return Response.json({ summary });
  } catch (error) {
    return handleErrorWithLocale(error, DEFAULT_LOCALE);
  }
}
