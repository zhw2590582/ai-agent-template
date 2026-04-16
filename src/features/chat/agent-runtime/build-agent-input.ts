import { getSystemPrompt } from '@/features/chat/ai/core/prompts';
import { buildChatMessagesWithSummary } from '@/features/chat/server/chat-message-context';
import type { BuildAgentInputOptions } from '@/features/chat/agent-runtime/types';
import { listActiveSubagents } from '@/features/subagent/settings';
import type { SubagentDefinition } from '@/features/subagent/types';

function buildSubagentRoster(agents: SubagentDefinition[]) {
  if (agents.length === 0) {
    return null;
  }

  return agents
    .map((agent) => {
      const lines = [`- ${agent.name}`];

      if (agent.description) {
        lines.push(`  Description: ${agent.description}`);
      }

      lines.push(`  Temperature: ${agent.temperature}`);
      lines.push(`  Max tokens: ${agent.maxTokens}`);
      lines.push(`  System prompt: ${agent.systemPrompt}`);

      return lines.join('\n');
    })
    .join('\n');
}

export async function buildAgentInput({
  conversationSummary,
  locale,
  memoryContext,
  memorySettings,
  messages,
  persistedConversationSummary,
  ragContext,
  subagentSettings,
}: BuildAgentInputOptions) {
  const activeSubagents = listActiveSubagents(subagentSettings);

  return {
    messages: await buildChatMessagesWithSummary(
      messages,
      persistedConversationSummary ?? conversationSummary ?? null,
      memorySettings
    ),
    system: getSystemPrompt(locale, {
      memoryContext,
      ragContext,
      subagentRoster: buildSubagentRoster(activeSubagents),
    }),
  };
}
