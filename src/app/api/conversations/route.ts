import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { AppError, ErrorCode, handleError } from '@/lib/errors';
import { createConversation } from '@/server/storage/conversations';

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
