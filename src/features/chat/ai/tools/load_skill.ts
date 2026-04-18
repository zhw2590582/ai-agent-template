import { tool } from 'ai';
import { z } from 'zod';

import {
  findRuntimeSkill,
  readRuntimeSkillFile,
  readRuntimeSkillInstructions,
} from '@/features/skills/runtime';
import type { RuntimeSkill } from '@/features/skills/types';

export function createLoadSkillTool(runtimeSkills: RuntimeSkill[]) {
  if (runtimeSkills.length === 0) {
    return null;
  }

  return tool({
    description:
      'Load a skill to get specialized instructions. Use this when the current task matches one of the available installed skills.',
    inputSchema: z.object({
      name: z.string().min(1).describe('The skill name or id to load'),
    }),
    execute: async ({ name }) => {
      const skill = findRuntimeSkill(runtimeSkills, name);

      if (!skill) {
        return {
          error: `Skill '${name}' not found`,
        };
      }

      const instructions = readRuntimeSkillInstructions(skill);

      if (!instructions) {
        return {
          error: `Skill '${skill.name}' is missing SKILL.md`,
        };
      }

      return {
        availableFiles: skill.files
          .map((file) => file.path)
          .filter((path) => path !== 'SKILL.md')
          .sort(),
        content: instructions,
        skillDirectory: `skills/${skill.skillPath}`,
        skillId: skill.id,
        skillName: skill.name,
      };
    },
  });
}

export function createReadSkillFileTool(runtimeSkills: RuntimeSkill[]) {
  if (runtimeSkills.length === 0) {
    return null;
  }

  return tool({
    description:
      'Read a supporting file from an installed skill, such as a references document, metadata file, script, or template.',
    inputSchema: z.object({
      name: z.string().min(1).describe('The skill name or id that owns the file'),
      path: z
        .string()
        .min(1)
        .describe(
          'A relative file path inside the skill directory, for example references/guide.md'
        ),
    }),
    execute: async ({ name, path }) => {
      const skill = findRuntimeSkill(runtimeSkills, name);

      if (!skill) {
        return {
          error: `Skill '${name}' not found`,
        };
      }

      const file = readRuntimeSkillFile(skill, path);

      if (!file) {
        return {
          error: `File '${path}' not found in skill '${skill.name}'`,
        };
      }

      return {
        content: file.content,
        path: file.path,
        skillDirectory: `skills/${skill.skillPath}`,
        skillId: skill.id,
        skillName: skill.name,
      };
    },
  });
}
