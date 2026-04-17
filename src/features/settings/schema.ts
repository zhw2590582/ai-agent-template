import { z } from 'zod';

import { RAG_CONFIG } from '@/config/rag';
import { SANDBOX_CONFIG } from '@/config/sandbox';
import { SEARCH_CONFIG } from '@/config/search';
import { SUBAGENT_CONFIG } from '@/config/subagent';
import { SUBAGENT_TOOL_ACCESS_VALUES } from '@/features/subagents/types';

export const memorySettingsSchema = z.object({
  autoWrite: z.boolean(),
  contextMaxItems: z.number().int(),
  crossConversation: z.boolean(),
  enabled: z.boolean(),
  recentMessageWindow: z.number().int(),
  summaryMinMessages: z.number().int(),
});

export const mcpServerSettingsSchema = z.object({
  bearerToken: z.string(),
  enabled: z.boolean(),
  id: z.string(),
  serverName: z.string(),
  serverUrl: z.string(),
  transport: z.enum(['http', 'sse']),
});

export const mcpSettingsSchema = z.object({
  enabled: z.boolean(),
  servers: z.array(mcpServerSettingsSchema),
});

export const modelsSettingsSchema = z.object({
  providers: z.record(z.string(), z.unknown()),
  selectedChatModelId: z.string().nullable(),
});

export const ragSettingsSchema = z.object({
  apiKey: z.string(),
  enabled: z.boolean(),
  matchCount: z.number().int(),
  matchThreshold: z.number(),
  maxContextCharacters: z.number().int(),
  provider: z.enum(RAG_CONFIG.PROVIDER_IDS),
});

export const searchSettingsSchema = z.object({
  crawl: z.object({
    allowExternal: z.boolean(),
    maxDepth: z.number().int(),
    pageLimit: z.number().int(),
  }),
  enabled: z.boolean(),
  extract: z.object({
    chunksPerSource: z.number().int(),
    extractDepth: z.enum(['advanced', 'basic']),
    format: z.enum(['markdown', 'text']),
  }),
  search: z.object({
    maxResults: z.number().int(),
    searchDepth: z.enum(['advanced', 'basic']),
    topic: z.enum(['finance', 'general', 'news']),
  }),
  apiKey: z.string(),
  provider: z.enum(SEARCH_CONFIG.PROVIDER_IDS),
});

export const sandboxAccessSettingsSchema = z.object({
  allowCommands: z.boolean(),
  allowFileDownload: z.boolean(),
  allowFileUpload: z.boolean(),
  allowFilesystem: z.boolean(),
  allowInternetAccess: z.boolean(),
  allowPty: z.boolean(),
});

export const sandboxSettingsSchema = z.object({
  access: sandboxAccessSettingsSchema,
  apiKey: z.string(),
  autoPause: z.boolean(),
  enabled: z.boolean(),
  envVarsText: z.string(),
  provider: z.enum(SANDBOX_CONFIG.PROVIDER_IDS),
  secure: z.boolean(),
  template: z.string(),
  timeoutSeconds: z.number().int(),
  workingDirectory: z.string(),
});

export const skillsSettingsSchema = z.object({
  enabled: z.boolean(),
  skills: z.array(
    z.object({
      capabilities: z.array(z.enum(['browser', 'fs', 'git', 'http', 'mcp', 'prompt', 'shell'])),
      description: z.string(),
      enabled: z.boolean(),
      id: z.string(),
      name: z.string(),
      sourceUrl: z.string(),
    })
  ),
});

export const subagentDefinitionSchema = z.object({
  description: z.string(),
  enabled: z.boolean(),
  id: z.string(),
  maxTokens: z.number().int().min(SUBAGENT_CONFIG.MIN_TOKENS).max(SUBAGENT_CONFIG.MAX_TOKENS),
  name: z.string(),
  systemPrompt: z.string(),
  temperature: z.number().min(SUBAGENT_CONFIG.MIN_TEMPERATURE).max(SUBAGENT_CONFIG.MAX_TEMPERATURE),
  themeColor: z.string(),
  toolAccess: z.enum(SUBAGENT_TOOL_ACCESS_VALUES),
});

export const subagentSettingsSchema = z.object({
  agents: z.array(subagentDefinitionSchema),
  enabled: z.boolean(),
});

export const appProfileSettingsSchema = z.object({
  memory: memorySettingsSchema,
  mcp: mcpSettingsSchema,
  models: modelsSettingsSchema,
  rag: ragSettingsSchema,
  sandbox: sandboxSettingsSchema,
  search: searchSettingsSchema,
  skills: skillsSettingsSchema,
  subagent: subagentSettingsSchema,
});

export const agentRuntimeOverridesSchema = appProfileSettingsSchema
  .pick({
    mcp: true,
    memory: true,
    rag: true,
    sandbox: true,
    search: true,
    subagent: true,
  })
  .partial();

export const runtimeModelSchema = z.object({
  apiFormat: z.enum(['anthropic', 'openai']),
  apiKey: z.string().min(1),
  baseUrl: z.string().min(1),
  modelId: z.string().min(1),
  providerId: z.string().min(1),
});

export type AgentRuntimeOverridesInput = z.infer<typeof agentRuntimeOverridesSchema>;
