export interface SubagentDefinition {
  description: string;
  enabled: boolean;
  id: string;
  maxTokens: number;
  name: string;
  systemPrompt: string;
  temperature: number;
  themeColor: string;
}

export interface SubagentSettings {
  agents: SubagentDefinition[];
  enabled: boolean;
}
