import type { UIMessage } from 'ai';

import type { ChatRuntimeModel } from '@/features/models/types';
import type { AgentRuntimeOverrides } from '@/features/chat/agent-runtime/runtime-overrides';
import type { AgentTransportRequest } from '@/features/chat/agent-runtime/types';
import type { RuntimeSkill } from '@/features/skills/types';

interface BuildAgentRunRequestOptions {
  activeThreadId: string | null;
  body?: Record<string, unknown>;
  conversationSummary?: string | null;
  guestMemoryContext?: string | null;
  id?: string;
  messageId?: string;
  messages: UIMessage[];
  runtimeSkills?: RuntimeSkill[] | null;
  runtimeModel: ChatRuntimeModel | null;
  runtimeOverrides?: AgentRuntimeOverrides | null;
  trigger?: string;
}

export function buildAgentRunRequest({
  activeThreadId,
  body = {},
  conversationSummary,
  guestMemoryContext,
  id,
  messageId,
  messages,
  runtimeSkills,
  runtimeModel,
  runtimeOverrides,
  trigger,
}: BuildAgentRunRequestOptions): AgentTransportRequest {
  return {
    ...body,
    conversationId: (body.conversationId as string | undefined) ?? activeThreadId ?? undefined,
    conversationSummary: conversationSummary ?? undefined,
    guestMemoryContext: guestMemoryContext ?? undefined,
    id,
    messageId,
    messages,
    runtimeSkills: runtimeSkills?.length ? runtimeSkills : undefined,
    runtimeOverrides: runtimeOverrides ?? undefined,
    runtimeModel: runtimeModel ?? undefined,
    trigger,
  };
}
