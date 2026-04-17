import type { MemoryListItem } from '@/features/memory/types';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { DEFAULT_LOCALE, type Locale } from '@/config/i18n';
import { handleErrorWithLocale } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';
import { memoryConsolidatePostSchema } from '@/features/chat/server/schemas';
import { consolidateMemoryKind } from '@/features/memory/storage/memory-consolidation';

export async function handleMemoryConsolidatePost(request: Request) {
  let locale: Locale = DEFAULT_LOCALE;

  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.MEMORIES_CONSOLIDATE,
      namespace: API_NAMESPACES.MEMORIES_CONSOLIDATE,
    });

    const input = await validateRequest(request, memoryConsolidatePostSchema);
    locale = input.locale;

    const contents = await consolidateMemoryKind(input.memories as MemoryListItem[], {
      kind: input.kind,
      locale: input.locale,
      runtimeModel: input.runtimeModel,
    });

    return Response.json({ contents });
  } catch (error) {
    return handleErrorWithLocale(error, locale);
  }
}
