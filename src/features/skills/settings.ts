import type {
  SkillActivationMode,
  SkillCapability,
  SkillDefinition,
  SkillsSettings,
} from '@/features/skills/types';

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

function isSkillActivationMode(value: unknown): value is SkillActivationMode {
  return value === 'eager' || value === 'lazy';
}

function toTitleCase(value: string) {
  return value
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function deriveSkillMetadataFromUrl(sourceUrl: string) {
  const trimmedUrl = sourceUrl.trim();

  if (!trimmedUrl) {
    return {
      description: '',
      name: '',
    };
  }

  try {
    const url = new URL(trimmedUrl);
    const pathname = url.pathname.replace(/\/+$/, '');
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments.at(-1) ?? url.hostname;
    const normalizedSegment = lastSegment.replace(/\.[a-z0-9]+$/i, '');
    const name = toTitleCase(normalizedSegment) || url.hostname;
    const description = `Imported from ${url.hostname}${pathname || '/'}`;

    return { description, name };
  } catch {
    const fallback = trimmedUrl
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '')
      .split('/')
      .filter(Boolean)
      .at(-1);
    const name = fallback ? toTitleCase(fallback) : 'Imported Skill';

    return {
      description: `Imported from ${trimmedUrl}`,
      name,
    };
  }
}

function normalizeSkillDefinition(
  input: Partial<SkillDefinition>,
  index: number
): SkillDefinition | null {
  const sourceUrl = typeof input.sourceUrl === 'string' ? input.sourceUrl.trim() : '';
  const derived = deriveSkillMetadataFromUrl(sourceUrl);
  const name =
    typeof input.name === 'string' && input.name.trim() ? input.name.trim() : derived.name;

  if (!sourceUrl || !name) {
    return null;
  }

  return {
    activationMode: isSkillActivationMode(input.activationMode) ? input.activationMode : 'lazy',
    capabilities: Array.isArray(input.capabilities)
      ? [...new Set(input.capabilities.filter(isSkillCapability))]
      : ['prompt'],
    description:
      typeof input.description === 'string' && input.description.trim()
        ? input.description.trim()
        : derived.description,
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
    activationMode: 'lazy',
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
