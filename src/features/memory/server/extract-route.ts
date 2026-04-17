import type { UIMessage } from 'ai';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { DEFAULT_LOCALE, type Locale } from '@/config/i18n';
import { handleErrorWithLocale } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';
import { extractConversationMemories } from '@/features/memory/storage/memory-extraction';
import { memoryExtractPostSchema } from '@/features/chat/server/schemas';

export async function handleMemoryExtractPost(request: Request) {
  let locale: Locale = DEFAULT_LOCALE;

  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.MEMORIES_EXTRACT,
      namespace: API_NAMESPACES.MEMORIES_EXTRACT,
    });

    const input = await validateRequest(request, memoryExtractPostSchema);
    locale = input.locale;

    const memories = await extractConversationMemories(input.messages as UIMessage[], {
      locale: input.locale,
      runtimeModel: input.runtimeModel,
    });

    return Response.json({ memories });
  } catch (error) {
    return handleErrorWithLocale(error, locale);
  }
}
