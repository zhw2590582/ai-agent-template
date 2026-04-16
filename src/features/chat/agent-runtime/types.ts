import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { FinishReason, ToolSet, UIMessage } from 'ai';

import type { Locale } from '@/config/i18n';
import type {
  AgentRunMetadata,
  AgentRunMetadataBase,
} from '@/features/chat/agent-runtime/run-metadata';
import type { McpSettings } from '@/features/mcp/types';
import type { ChatRuntimeModel } from '@/features/models/types';
import type { RagSettings, RagSourceItem } from '@/features/rag/types';
import type { SandboxSettings } from '@/features/sandbox/types';
import type { SearchSettings } from '@/features/search/types';
import type { SubagentSettings } from '@/features/subagents/types';

export interface ChatProfileMemorySettings {
  autoWrite?: boolean;
  contextMaxItems?: number;
  crossConversation?: boolean;
  enabled?: boolean;
  recentMessageWindow?: number;
  summaryMinMessages?: number;
}

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
  mcpSettings?: McpSettings;
  messages: UIMessage[];
  ragSettings?: RagSettings;
  runtimeModel?: ChatRuntimeModel;
  sandboxSettings?: SandboxSettings;
  searchSettings?: SearchSettings;
  subagentSettings?: SubagentSettings;
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
  runMetadataBase: AgentRunMetadataBase;
  subagentSettings: SubagentSettings | null;
}

export interface ResolveAgentRunContextOptions {
  conversationId: string | null;
  mcpSettings: unknown;
  ragSettings: unknown;
  runtimeModel: ChatRuntimeModel;
  sandboxSettings: unknown;
  searchSettings: unknown;
  subagentSettings: unknown;
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
