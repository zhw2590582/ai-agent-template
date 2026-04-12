import type { UIMessage } from 'ai';

import { CONVERSATION_SIDEBAR_PAGE_SIZE } from '@/config/app';
import { AppError, ErrorCode, handleError } from '@/lib/errors';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import {
  createConversation,
  listConversationsForUserPage,
  listConversationsForUserSearchPage,
  mapConversationSummary,
  saveConversationMessages,
  upsertProfileFromAuthUser,
} from '@/features/chat/storage';
import { createConversationSchema, patchConversationSchema } from '@/features/chat/server/schemas';

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

const MAX_OFFSET = 10_000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query') ?? '').trim();
    const offset = Math.min(
      MAX_OFFSET,
      Math.max(0, Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0)
    );
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '', 10);
    const limit = Number.isFinite(limitParam)
      ? Math.min(50, Math.max(1, limitParam))
      : CONVERSATION_SIDEBAR_PAGE_SIZE;

    const { supabase, user } = await requireAuth();
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
    const { conversationId, messages } = await validateRequest(request, patchConversationSchema);
    const { supabase, user } = await requireAuth();
    await upsertProfileFromAuthUser(user, {}, supabase);

    await saveConversationMessages(
      {
        conversationId,
        messages: messages as unknown as UIMessage[],
        userId: user.id,
      },
      supabase
    );

    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
