import type {
  InstalledSkillPackage,
  ResolvedSkillCatalogItem,
  SkillCapability,
  SkillCatalogItem,
  SkillDefinition,
} from '@/features/skills/types';

const DEFAULT_SKILL_CAPABILITIES: SkillCapability[] = ['prompt'];

function trimQuotes(value: string) {
  return value.replace(/^['"]|['"]$/g, '').trim();
}

function extractFrontmatter(markdown: string) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);

  return {
    body: match ? markdown.slice(match[0].length) : markdown,
    frontmatter: match?.[1] ?? '',
  };
}

function readFrontmatterValue(frontmatter: string, key: string) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? trimQuotes(match[1]) : null;
}

function readNestedFrontmatterValue(frontmatter: string, parentKey: string, childKey: string) {
  const parentIndex = frontmatter.search(new RegExp(`^${parentKey}:\\s*$`, 'm'));

  if (parentIndex === -1) {
    return null;
  }

  const nestedBlock = frontmatter.slice(parentIndex);
  const match = nestedBlock.match(new RegExp(`^\\s+${childKey}:\\s*(.+)$`, 'm'));
  return match ? trimQuotes(match[1]) : null;
}

function stripMarkdownInline(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[`*_>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSummary(markdownBody: string) {
  const sections = markdownBody
    .split(/\n\s*\n/)
    .map((section) => stripMarkdownInline(section))
    .filter(Boolean);

  return sections[0] ?? '';
}

function normalizePathSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
}

function buildSkillPathNeedles(item: SkillCatalogItem) {
  const idTail = item.id.startsWith(`${item.source}/`)
    ? item.id.slice(item.source.length + 1)
    : item.id;

  return [item.skillId, item.name, idTail]
    .map(normalizePathSegment)
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);
}

export function resolveSkillPathFromDirectoryNames(
  item: SkillCatalogItem,
  directoryNames: string[]
): string | null {
  const normalizedDirectories = directoryNames.map((name) => ({
    name,
    normalized: normalizePathSegment(name),
  }));
  const needles = buildSkillPathNeedles(item);

  for (const needle of needles) {
    const exactMatch = normalizedDirectories.find((entry) => entry.normalized === needle);

    if (exactMatch) {
      return exactMatch.name;
    }

    const suffixMatch = normalizedDirectories.find(
      (entry) => needle.endsWith(`-${entry.normalized}`) || entry.normalized.endsWith(`-${needle}`)
    );

    if (suffixMatch) {
      return suffixMatch.name;
    }
  }

  return null;
}

export function buildSkillGithubUrl(source: string, skillPath: string) {
  return `https://github.com/${source}/tree/HEAD/skills/${skillPath}`;
}

export function buildSkillRawMarkdownUrl(source: string, skillPath: string) {
  return `https://raw.githubusercontent.com/${source}/HEAD/skills/${skillPath}/SKILL.md`;
}

export function buildSkillDefinitionFromPackage(
  skillPackage: Pick<
    InstalledSkillPackage,
    'capabilities' | 'description' | 'githubUrl' | 'id' | 'name'
  >
): SkillDefinition {
  return {
    activationMode: 'lazy',
    capabilities: skillPackage.capabilities,
    description: skillPackage.description,
    enabled: true,
    id: skillPackage.id,
    name: skillPackage.name,
    sourceUrl: skillPackage.githubUrl,
  };
}

export function parseResolvedSkillCatalogItem(input: {
  files?: InstalledSkillPackage['files'];
  item: SkillCatalogItem;
  markdown: string;
  resolvedSkillPath?: string;
}): ResolvedSkillCatalogItem {
  const { body, frontmatter } = extractFrontmatter(input.markdown);
  const version = readNestedFrontmatterValue(frontmatter, 'metadata', 'version');
  const name = readFrontmatterValue(frontmatter, 'name') ?? input.item.name;
  const description =
    readFrontmatterValue(frontmatter, 'description') || extractSummary(body) || input.item.name;
  const skillPath = input.resolvedSkillPath ?? input.item.skillId;

  return {
    ...input.item,
    capabilities: DEFAULT_SKILL_CAPABILITIES,
    description,
    files: input.files ?? [
      {
        content: input.markdown,
        path: 'SKILL.md',
      },
    ],
    githubUrl: buildSkillGithubUrl(input.item.source, skillPath),
    markdown: input.markdown,
    name,
    rawSkillUrl: buildSkillRawMarkdownUrl(input.item.source, skillPath),
    skillPath,
    summary: extractSummary(body),
    version,
  };
}

export function toInstalledSkillPackage(skill: ResolvedSkillCatalogItem): InstalledSkillPackage {
  const now = new Date().toISOString();

  return {
    capabilities: skill.capabilities,
    description: skill.description,
    files: skill.files,
    githubUrl: skill.githubUrl,
    id: skill.id,
    installedAt: now,
    markdown: skill.markdown,
    name: skill.name,
    rawSkillUrl: skill.rawSkillUrl,
    skillId: skill.skillId,
    skillPath: skill.skillPath,
    source: skill.source,
    summary: skill.summary,
    updatedAt: now,
    version: skill.version,
  };
}

export function buildResolvedSkillCatalogItemFromPackage(
  skillPackage: InstalledSkillPackage
): ResolvedSkillCatalogItem {
  return {
    capabilities: skillPackage.capabilities,
    description: skillPackage.description,
    files: skillPackage.files,
    githubUrl: skillPackage.githubUrl,
    id: skillPackage.id,
    installs: 0,
    markdown: skillPackage.markdown,
    name: skillPackage.name,
    rawSkillUrl: skillPackage.rawSkillUrl,
    skillId: skillPackage.skillId,
    skillPath: skillPackage.skillPath,
    source: skillPackage.source,
    summary: skillPackage.summary,
    version: skillPackage.version,
  };
}
