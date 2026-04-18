import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { FinishReason, ToolSet, UIMessage } from 'ai';

import type { Locale } from '@/config/i18n';
import type { AgentRuntimeOverrides } from '@/features/chat/agent-runtime/runtime-overrides';
import type {
  AgentRunMetadata,
  AgentRunMetadataBase,
} from '@/features/chat/agent-runtime/run-metadata';
import type { ChatRuntimeModel } from '@/features/models/types';
import type { RagSettings, RagSourceItem } from '@/features/rag/types';
import type { RuntimeSkill } from '@/features/skills/types';
import type { SubagentSettings } from '@/features/subagents/types';
import type { MemorySettings } from '@/features/settings/types';

export type ChatProfileMemorySettings = Partial<MemorySettings>;

export interface ChatProfileRagSettings {
  apiKey?: string;
  enabled?: boolean;
  matchCount?: number;
  matchThreshold?: number;
  maxContextCharacters?: number;
  provider?: RagSettings['provider'];
}

export interface McpInjectedToolMetadata {
  injectedToolName: string;
  originalToolName: string;
  serverId: string;
  serverName: string;
}

export interface AgentRunRequest {
  conversationId?: string;
  conversationSummary?: string;
  guestMemoryContext?: string;
  messages: UIMessage[];
  runtimeSkills?: RuntimeSkill[];
  runtimeOverrides?: AgentRuntimeOverrides;
  runtimeModel?: ChatRuntimeModel;
}

export interface AgentTransportRequest extends AgentRunRequest {
  [key: string]: unknown;
  id?: string;
  messageId?: string;
  trigger?: string;
}

export interface AgentRunContext {
  agentTools: ToolSet;
  closeAgentResources?: () => Promise<void>;
  hasAgentTools: boolean;
  mcpInjectedTools: McpInjectedToolMetadata[];
  memoryContext: string | null;
  memorySettings: ChatProfileMemorySettings | null;
  persistedConversationSummary: string | null;
  ragSettings: RagSettings | null;
  runtimeSkills: RuntimeSkill[];
  runMetadataBase: AgentRunMetadataBase;
  subagentSettings: SubagentSettings | null;
}

export interface ResolveAgentRunContextOptions {
  conversationId: string | null;
  guestMemoryContext?: string | null;
  runtimeSkills?: RuntimeSkill[];
  runtimeOverrides: unknown;
  runtimeModel: ChatRuntimeModel;
  supabase: SupabaseClient;
  user: User | null;
}

export interface BuildAgentInputOptions {
  conversationSummary?: string | null;
  locale: Locale;
  memoryContext?: string | null;
  memorySettings?: ChatProfileMemorySettings | null;
  messages: UIMessage[];
  persistedConversationSummary?: string | null;
  ragContext?: string | null;
  runtimeSkills?: RuntimeSkill[];
  subagentSettings?: SubagentSettings | null;
}

export interface ExecuteAgentRunOptions extends BuildAgentInputOptions {
  hasAgentTools: boolean;
  mcpInjectedTools?: McpInjectedToolMetadata[];
  runtimeModel: ChatRuntimeModel;
  tools: ToolSet;
}

export interface ResolveAgentRagContextOptions {
  messages: UIMessage[];
  ragSettings: RagSettings | null;
  supabase: SupabaseClient;
  user: User | null;
}

export interface ResolvedAgentRagContext {
  ragContext: string | null;
  ragSources: RagSourceItem[];
}

export interface CreateAgentRunFinishHandlerOptions {
  closeAgentResources?: () => Promise<void>;
  locale: Locale;
  memorySettings?: ChatProfileMemorySettings | null;
  runMetadata: AgentRunMetadata;
  supabase: SupabaseClient;
  user: User | null;
}

export interface CreateAgentRunResponseOptions extends ExecuteAgentRunOptions {
  closeAgentResources?: () => Promise<void>;
  ragSources?: RagSourceItem[];
  runMetadataBase: AgentRunMetadataBase;
  supabase: SupabaseClient;
  user: User | null;
}

export interface AgentRunFinishEvent {
  finishReason?: FinishReason;
  isAborted: boolean;
  messages: UIMessage[];
}
