export type SkillCapability = 'browser' | 'fs' | 'git' | 'http' | 'mcp' | 'prompt' | 'shell';

export interface SkillDefinition {
  capabilities: SkillCapability[];
  description: string;
  enabled: boolean;
  id: string;
  name: string;
  sourceUrl: string;
}

export interface SkillsSettings {
  enabled: boolean;
  skills: SkillDefinition[];
}
