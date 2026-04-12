import { CONVERSATION_SIDEBAR_PAGE_SIZE } from '@/config/conversations';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { AppError, ErrorCode, handleError } from '@/lib/errors';
import {
  createConversation,
  listConversationsForUserPage,
  mapConversationSummary,
  saveConversationMessages,
} from '@/server/storage/conversations';
import { upsertProfileFromAuthUser } from '@/server/storage/profiles';
import type { UIMessage } from 'ai';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = Math.max(0, Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0);
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '', 10);
    const limit = Number.isFinite(limitParam)
      ? Math.min(50, Math.max(1, limitParam))
      : CONVERSATION_SIDEBAR_PAGE_SIZE;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AppError(ErrorCode.INPUT_INVALID, 'Authentication required.', 401);
    }

    await upsertProfileFromAuthUser(user, {}, supabase);

    const { hasMore, rows } = await listConversationsForUserPage(user.id, supabase, {
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
    const { initialMessage }: { initialMessage?: string } = await request.json();

    if (!initialMessage || !initialMessage.trim()) {
      throw new AppError(ErrorCode.INPUT_INVALID, 'Initial message is required.', 400);
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AppError(ErrorCode.INPUT_INVALID, 'Authentication required.', 401);
    }

    await upsertProfileFromAuthUser(user, {}, supabase);

    const conversation = await createConversation(
      {
        initialMessage: initialMessage.trim(),
        userId: user.id,
      },
      supabase
    );

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
    const {
      conversationId,
      messages,
    }: {
      conversationId?: string;
      messages?: UIMessage[];
    } = await request.json();

    if (!conversationId) {
      throw new AppError(ErrorCode.INPUT_INVALID, 'Conversation ID is required.', 400);
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new AppError(ErrorCode.INPUT_INVALID, 'Messages are required.', 400);
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AppError(ErrorCode.INPUT_INVALID, 'Authentication required.', 401);
    }

    await upsertProfileFromAuthUser(user, {}, supabase);
    await saveConversationMessages(
      {
        conversationId,
        messages,
      },
      supabase
    );

    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
