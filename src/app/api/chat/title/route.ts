import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { DEFAULT_LOCALE } from '@/config/i18n';
import { API_NAMESPACES } from '@/config/namespaces';
import { generateConversationTitle } from '@/features/chat/ai/memory/title';
import { chatTitlePostSchema } from '@/features/chat/server/schemas';
import { handleErrorWithLocale } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.CHAT_TITLE,
      namespace: API_NAMESPACES.CHAT_TITLE,
    });

    const { input, locale, runtimeModel } = await validateRequest(request, chatTitlePostSchema);
    const title = await generateConversationTitle(input, {
      locale: locale ?? DEFAULT_LOCALE,
      runtimeModel,
    });

    return Response.json({ title });
  } catch (error) {
    return handleErrorWithLocale(error, DEFAULT_LOCALE);
  }
}
