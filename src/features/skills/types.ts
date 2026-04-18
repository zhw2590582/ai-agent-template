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

export interface SkillCatalogItem {
  id: string;
  installs: number;
  name: string;
  skillId: string;
  source: string;
}

export interface InstalledSkillFile {
  content: string;
  path: string;
}

export interface RuntimeSkill {
  description: string;
  files: InstalledSkillFile[];
  id: string;
  name: string;
  skillPath: string;
  source: string;
  summary: string;
}

export interface InstalledSkillPackage {
  capabilities: SkillCapability[];
  description: string;
  files: InstalledSkillFile[];
  githubUrl: string;
  id: string;
  installedAt: string;
  markdown: string;
  name: string;
  rawSkillUrl: string;
  skillId: string;
  skillPath: string;
  source: string;
  summary: string;
  updatedAt: string;
  version: string | null;
}

export interface ResolvedSkillCatalogItem extends SkillCatalogItem {
  capabilities: SkillCapability[];
  description: string;
  files: InstalledSkillFile[];
  githubUrl: string;
  markdown: string;
  rawSkillUrl: string;
  skillPath: string;
  summary: string;
  version: string | null;
}
