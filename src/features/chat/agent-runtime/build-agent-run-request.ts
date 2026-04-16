import type { UIMessage } from 'ai';

import type { McpSettings } from '@/features/mcp/types';
import type { ChatRuntimeModel } from '@/features/models/types';
import type { RagSettings } from '@/features/rag/types';
import type { SandboxSettings } from '@/features/sandbox/types';
import type { SearchSettings } from '@/features/search/types';
import type { SubagentSettings } from '@/features/subagent/types';
import type { AgentTransportRequest } from '@/features/chat/agent-runtime/types';

interface BuildAgentRunRequestOptions {
  activeThreadId: string | null;
  body?: Record<string, unknown>;
  conversationSummary?: string | null;
  id?: string;
  mcpSettings?: McpSettings;
  messageId?: string;
  messages: UIMessage[];
  ragSettings?: RagSettings;
  runtimeModel: ChatRuntimeModel | null;
  sandboxSettings?: SandboxSettings;
  searchSettings?: SearchSettings;
  subagentSettings?: SubagentSettings;
  trigger?: string;
}

export function buildAgentRunRequest({
  activeThreadId,
  body = {},
  conversationSummary,
  id,
  mcpSettings,
  messageId,
  messages,
  ragSettings,
  runtimeModel,
  sandboxSettings,
  searchSettings,
  subagentSettings,
  trigger,
}: BuildAgentRunRequestOptions): AgentTransportRequest {
  return {
    ...body,
    conversationId: (body.conversationId as string | undefined) ?? activeThreadId ?? undefined,
    conversationSummary: conversationSummary ?? undefined,
    id,
    messageId,
    messages,
    mcpSettings,
    ragSettings,
    runtimeModel: runtimeModel ?? undefined,
    sandboxSettings,
    searchSettings,
    subagentSettings,
    trigger,
  };
}
