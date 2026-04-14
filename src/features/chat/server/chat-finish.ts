import type { UIMessage } from 'ai';
import type { SupabaseClient, User } from '@supabase/supabase-js';

import type { Locale } from '@/config/i18n';
import { logger } from '@/lib/logger';
import type { ChatRuntimeModel } from '@/features/models/types';
import { saveConversationMessages } from '@/features/chat/storage';
import { saveConversationMemories } from '@/features/memory/storage/memories';
import type { ChatProfileMemorySettings } from '@/features/chat/server/chat-request-context';

interface CreateChatFinishHandlerOptions {
  conversationId: string | null;
  locale: Locale;
  memorySettings: ChatProfileMemorySettings | null;
  runtimeModel: ChatRuntimeModel;
  supabase: SupabaseClient;
  user: User | null;
}

export function createChatFinishHandler({
  conversationId,
  locale,
  memorySettings,
  runtimeModel,
  supabase,
  user,
}: CreateChatFinishHandlerOptions) {
  return ({ messages: responseMessages }: { messages: UIMessage[] }) => {
    if (!conversationId) {
      return;
    }

    void (async () => {
      if (!user) {
        logger.warn('Chat onFinish: user not authenticated, messages not saved', {
          conversationId,
        });
        return;
      }

      try {
        await saveConversationMessages(
          {
            conversationId,
            locale,
            memorySettings,
            messages: responseMessages,
            runtimeModel,
            userId: user.id,
          },
          supabase
        );
      } catch (saveError) {
        logger.error('Chat onFinish: failed to save messages', {
          conversationId,
          error: saveError instanceof Error ? saveError.message : String(saveError),
        });
      }

      if (!memorySettings?.enabled || !memorySettings.autoWrite) {
        return;
      }

      try {
        await saveConversationMemories(
          {
            conversationId,
            locale,
            messages: responseMessages,
            runtimeModel,
            userId: user.id,
          },
          supabase
        );
      } catch (memoryError) {
        logger.error('Chat onFinish: failed to save memories', {
          conversationId,
          error: memoryError instanceof Error ? memoryError.message : String(memoryError),
        });
      }
    })();
  };
}
