import { convertToModelMessages, type UIMessage } from 'ai';

import {
  buildConversationSummaryContext,
  resolveConversationSummaryConfig,
} from '@/features/chat/ai/memory/summary';
import type { ChatProfileMemorySettings } from '@/features/chat/server/chat-request-context';

export async function buildChatMessagesWithSummary(
  messages: UIMessage[],
  summary?: string | null,
  memorySettings?: ChatProfileMemorySettings | null
) {
  const config = resolveConversationSummaryConfig(memorySettings);
  const summaryMessage = summary ? buildConversationSummaryContext(summary) : null;

  if (!summaryMessage || messages.length <= config.recentMessageWindow) {
    return convertToModelMessages(messages as unknown as UIMessage[]);
  }

  const scopedMessages = [summaryMessage, ...messages.slice(-config.recentMessageWindow)];
  return convertToModelMessages(scopedMessages as unknown as UIMessage[]);
}
