import { getSystemPrompt } from '@/features/chat/ai/core/prompts';
import { buildChatMessagesWithSummary } from '@/features/chat/server/chat-message-context';
import type { BuildAgentInputOptions } from '@/features/chat/agent-runtime/types';

export async function buildAgentInput({
  conversationSummary,
  locale,
  memoryContext,
  memorySettings,
  messages,
  persistedConversationSummary,
  ragContext,
}: BuildAgentInputOptions) {
  return {
    messages: await buildChatMessagesWithSummary(
      messages,
      persistedConversationSummary ?? conversationSummary ?? null,
      memorySettings
    ),
    system: getSystemPrompt(locale, {
      memoryContext,
      ragContext,
    }),
  };
}
