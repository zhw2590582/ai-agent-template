import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { CONVERSATION_SUMMARY_PAGE_SIZE } from '@/config/chat';
import { PAGINATION_CONFIG } from '@/config/limits';
import { API_NAMESPACES } from '@/config/namespaces';
import { requireAuthenticatedUser } from '@/features/auth/server/session';
import { upsertProfileFromAuthUser } from '@/features/auth/storage/profiles';
import { listConversationsWithSummaryPage, mapConversationSummary } from '@/features/chat/storage';
import { handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';

function resolveSummaryPage(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = Math.min(
    PAGINATION_CONFIG.CONVERSATIONS_MAX_OFFSET,
    Math.max(0, Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0)
  );
  const limitParam = Number.parseInt(searchParams.get('limit') ?? '', 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(PAGINATION_CONFIG.CONVERSATIONS_MAX_LIMIT, Math.max(1, limitParam))
    : CONVERSATION_SUMMARY_PAGE_SIZE;

  return { limit, offset };
}

export async function GET(request: Request) {
  try {
    const { limit, offset } = resolveSummaryPage(request);
    const { supabase, user } = await requireAuthenticatedUser();

    enforceRateLimit(request, {
      config: API_RATE_LIMITS.CONVERSATIONS_READ,
      identityKey: user.id,
      namespace: API_NAMESPACES.CONVERSATIONS_READ,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    const { rows, total } = await listConversationsWithSummaryPage(user.id, supabase, {
      limit,
      offset,
    });

    return Response.json({
      conversations: rows.map(mapConversationSummary),
      total,
    });
  } catch (error) {
    return handleError(error);
  }
}
