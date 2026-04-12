import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { AppError, ErrorCode, handleError } from '@/lib/errors';
import { createConversation, saveConversationMessages } from '@/server/storage/conversations';
import { upsertProfileFromAuthUser } from '@/server/storage/profiles';
import type { UIMessage } from 'ai';

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
