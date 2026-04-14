import type { UIMessage } from 'ai';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { CONVERSATION_SIDEBAR_PAGE_SIZE, PAGINATION_CONFIG } from '@/config/app';
import { AppError, ErrorCode, handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import {
  createConversation,
  deleteConversation,
  listConversationsForUserPage,
  listConversationsForUserSearchPage,
  mapConversationSummary,
  renameConversation,
  saveConversationMessages,
  updateConversationSummary,
  upsertProfileFromAuthUser,
} from '@/features/chat/storage';
import {
  createConversationSchema,
  deleteConversationSchema,
  patchConversationSchema,
} from '@/features/chat/server/schemas';

/** Authenticate and return the Supabase user, or throw 401. */
async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ErrorCode.INPUT_INVALID, 'Authentication required.', 401);
  }

  return { supabase, user };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query') ?? '').trim();
    const offset = Math.min(
      PAGINATION_CONFIG.CONVERSATIONS_MAX_OFFSET,
      Math.max(0, Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0)
    );
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '', 10);
    const limit = Number.isFinite(limitParam)
      ? Math.min(PAGINATION_CONFIG.CONVERSATIONS_MAX_LIMIT, Math.max(1, limitParam))
      : CONVERSATION_SIDEBAR_PAGE_SIZE;

    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.CONVERSATIONS_READ,
      identityKey: user.id,
      namespace: 'api:conversations:read',
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    const { hasMore, rows } = query
      ? await listConversationsForUserSearchPage(user.id, supabase, {
          limit,
          offset,
          query,
        })
      : await listConversationsForUserPage(user.id, supabase, {
          limit,
          offset,
        });

    return Response.json({
      conversations: rows.map(mapConversationSummary),
      hasMore,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { initialMessage } = await validateRequest(request, createConversationSchema);
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.CONVERSATIONS_WRITE,
      identityKey: user.id,
      namespace: 'api:conversations:write',
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    const conversation = await createConversation({ initialMessage, userId: user.id }, supabase);

    if (!conversation) {
      throw new AppError(ErrorCode.UNKNOWN, 'Conversation creation failed.', 500);
    }

    return Response.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { conversationId, messages, summary, title } = await validateRequest(
      request,
      patchConversationSchema
    );
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.CONVERSATIONS_WRITE,
      identityKey: user.id,
      namespace: 'api:conversations:write',
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    if (messages) {
      await saveConversationMessages(
        {
          conversationId,
          messages: messages as unknown as UIMessage[],
          userId: user.id,
        },
        supabase
      );
    } else if (summary !== undefined) {
      await updateConversationSummary(
        {
          conversationId,
          summary,
          userId: user.id,
        },
        supabase
      );
    } else if (title) {
      await renameConversation(
        {
          conversationId,
          title,
          userId: user.id,
        },
        supabase
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { conversationId } = await validateRequest(request, deleteConversationSchema);
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.CONVERSATIONS_WRITE,
      identityKey: user.id,
      namespace: 'api:conversations:write',
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    await deleteConversation(
      {
        conversationId,
        userId: user.id,
      },
      supabase
    );

    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
