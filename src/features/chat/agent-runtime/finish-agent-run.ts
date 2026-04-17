import { logger } from '@/lib/logger';
import { logAgentRunFinished } from '@/features/chat/agent-runtime/run-telemetry';
import { saveConversationMessages } from '@/features/chat/storage';
import { savePersistedConversationMemories } from '@/features/memory/server/server-memory-source';
import type {
  AgentRunFinishEvent,
  CreateAgentRunFinishHandlerOptions,
} from '@/features/chat/agent-runtime/types';

export function createAgentRunFinishHandler({
  closeAgentResources,
  locale,
  memorySettings,
  runMetadata,
  supabase,
  user,
}: CreateAgentRunFinishHandlerOptions) {
  return ({ finishReason, isAborted, messages: responseMessages }: AgentRunFinishEvent) => {
    void (async () => {
      try {
        if (!runMetadata.conversationId) {
          return;
        }

        if (!user) {
          logger.warn('Chat onFinish: user not authenticated, messages not saved', {
            conversationId: runMetadata.conversationId,
          });
          return;
        }

        try {
          await saveConversationMessages(
            {
              conversationId: runMetadata.conversationId,
              locale,
              memorySettings,
              messages: responseMessages,
              runtimeModel: runMetadata.runtimeModel,
              userId: user.id,
            },
            supabase
          );
        } catch (saveError) {
          logger.error('Chat onFinish: failed to save messages', {
            conversationId: runMetadata.conversationId,
            error: saveError instanceof Error ? saveError.message : String(saveError),
          });
        }

        if (!memorySettings?.enabled || !memorySettings.autoWrite) {
          return;
        }

        try {
          await savePersistedConversationMemories({
            client: supabase,
            conversationId: runMetadata.conversationId,
            locale,
            messages: responseMessages,
            runtimeModel: runMetadata.runtimeModel,
            userId: user.id,
          });
        } catch (memoryError) {
          logger.error('Chat onFinish: failed to save memories', {
            conversationId: runMetadata.conversationId,
            error: memoryError instanceof Error ? memoryError.message : String(memoryError),
          });
        }
      } finally {
        await closeAgentResources?.();
        logAgentRunFinished({
          finishReason,
          isAborted,
          responseMessageCount: responseMessages.length,
          runMetadata,
        });
      }
    })().catch((error) => {
      logger.error('Chat onFinish: unexpected background failure', {
        conversationId: runMetadata.conversationId,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  };
}
