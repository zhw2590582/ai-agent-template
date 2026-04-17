import type { UIMessage } from 'ai';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { DEFAULT_LOCALE, type Locale } from '@/config/i18n';
import { handleErrorWithLocale } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';
import { memoryExtractPostSchema } from '@/features/chat/server/schemas';
import { extractRequestMemories } from '@/features/memory/server/server-memory-source';

export async function handleMemoryExtractPost(request: Request) {
  let locale: Locale = DEFAULT_LOCALE;

  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.MEMORIES_EXTRACT,
      namespace: API_NAMESPACES.MEMORIES_EXTRACT,
    });

    const input = await validateRequest(request, memoryExtractPostSchema);
    locale = input.locale;

    const memories = await extractRequestMemories({
      locale: input.locale,
      messages: input.messages as UIMessage[],
      runtimeModel: input.runtimeModel,
    });

    return Response.json({ memories });
  } catch (error) {
    return handleErrorWithLocale(error, locale);
  }
}
