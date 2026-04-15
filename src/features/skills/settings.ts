import type { SkillCapability, SkillDefinition, SkillsSettings } from '@/features/skills/types';

export const SKILL_CAPABILITIES: SkillCapability[] = [
  'prompt',
  'mcp',
  'http',
  'fs',
  'shell',
  'git',
  'browser',
];

function isSkillCapability(value: unknown): value is SkillCapability {
  return typeof value === 'string' && SKILL_CAPABILITIES.includes(value as SkillCapability);
}

function normalizeSkillDefinition(
  input: Partial<SkillDefinition>,
  index: number
): SkillDefinition | null {
  const sourceUrl = typeof input.sourceUrl === 'string' ? input.sourceUrl.trim() : '';
  const name = typeof input.name === 'string' ? input.name.trim() : '';

  if (!sourceUrl || !name) {
    return null;
  }

  return {
    capabilities: Array.isArray(input.capabilities)
      ? [...new Set(input.capabilities.filter(isSkillCapability))]
      : ['prompt'],
    description: typeof input.description === 'string' ? input.description.trim() : '',
    enabled: input.enabled ?? true,
    id:
      typeof input.id === 'string' && input.id.trim().length > 0
        ? input.id.trim()
        : `skill-${index + 1}`,
    name,
    sourceUrl,
  };
}

export function createSkillDraft(index: number): SkillDefinition {
  return {
    capabilities: ['prompt'],
    description: '',
    enabled: true,
    id: `skill-${index}`,
    name: '',
    sourceUrl: '',
  };
}

export function normalizeSkillsSettings(input?: Partial<SkillsSettings> | null): SkillsSettings {
  return {
    enabled: input?.enabled ?? false,
    skills: Array.isArray(input?.skills)
      ? input.skills
          .map((skill, index) => normalizeSkillDefinition(skill, index))
          .filter((skill): skill is SkillDefinition => skill != null)
      : [],
  };
}
