import { getSystemPrompt } from '@/features/chat/ai/core/prompts';
import { buildChatMessagesWithSummary } from '@/features/chat/server/chat-message-context';
import type { BuildAgentInputOptions } from '@/features/chat/agent-runtime/types';
import { listActiveSubagents } from '@/features/subagents/settings';
import type { SubagentDefinition, SubagentToolAccess } from '@/features/subagents/types';

function formatToolAccess(toolAccess: SubagentToolAccess) {
  switch (toolAccess) {
    case 'web':
      return 'web tools';
    case 'code':
      return 'sandbox tools';
    case 'rag':
      return 'retrieved knowledge-base context';
    default:
      return 'no tools';
  }
}

function buildSubagentRoster(agents: SubagentDefinition[]) {
  if (agents.length === 0) {
    return null;
  }

  return agents
    .map((agent) => {
      const lines = [`- ${agent.name} (${agent.id})`];

      if (agent.description) {
        lines.push(`  Description: ${agent.description}`);
      }

      lines.push(`  Allowed tools: ${formatToolAccess(agent.toolAccess)}`);

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
