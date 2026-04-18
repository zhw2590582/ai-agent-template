import type { RuntimeSkill } from '@/features/skills/types';

function stripFrontmatter(content: string) {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? content.slice(match[0].length).trim() : content.trim();
}

function normalizeSkillName(value: string) {
  return value.trim().toLowerCase();
}

function normalizeSkillFilePath(value: string) {
  return value
    .trim()
    .replace(/^\.?\//, '')
    .replace(/\\/g, '/');
}

export function buildRuntimeSkillsPrompt(skills: RuntimeSkill[]) {
  if (skills.length === 0) {
    return null;
  }

  return skills
    .map((skill) => `- ${skill.name} (${skill.id})\n  Description: ${skill.description}`)
    .join('\n');
}

export function findRuntimeSkill(skills: RuntimeSkill[], nameOrId: string) {
  const needle = normalizeSkillName(nameOrId);

  return (
    skills.find((skill) => normalizeSkillName(skill.name) === needle) ??
    skills.find((skill) => normalizeSkillName(skill.id) === needle)
  );
}

export function readRuntimeSkillInstructions(skill: RuntimeSkill) {
  const skillFile = skill.files.find((file) => normalizeSkillFilePath(file.path) === 'SKILL.md');

  if (!skillFile) {
    return null;
  }

  return stripFrontmatter(skillFile.content);
}

export function readRuntimeSkillFile(skill: RuntimeSkill, path: string) {
  const normalizedPath = normalizeSkillFilePath(path);

  return skill.files.find((file) => normalizeSkillFilePath(file.path) === normalizedPath) ?? null;
}
