export const SUBAGENT_TOOL_ACCESS_VALUES = ['none', 'web', 'code', 'rag'] as const;

export type SubagentToolAccess = (typeof SUBAGENT_TOOL_ACCESS_VALUES)[number];

export interface SubagentDefinition {
  description: string;
  enabled: boolean;
  id: string;
  maxTokens: number;
  name: string;
  systemPrompt: string;
  temperature: number;
  themeColor: string;
  toolAccess: SubagentToolAccess;
}

export interface SubagentSettings {
  agents: SubagentDefinition[];
  enabled: boolean;
}
