'use client';

import type { SkillsSettings } from '@/features/skills/types';
import type { RuntimeSkill } from '@/features/skills/types';
import {
  ensureInstalledSkillsLoaded,
  readInstalledSkillPackages,
} from '@/features/skills/storage/local-installed-skills';

export interface ClientSkillsSource {
  buildRuntimeSkills: (options: {
    skillsSettings: SkillsSettings | null | undefined;
  }) => Promise<RuntimeSkill[]>;
}

export function createClientSkillsSource(): ClientSkillsSource {
  return {
    buildRuntimeSkills: async ({ skillsSettings }) => {
      if (!skillsSettings?.enabled) {
        return [];
      }

      await ensureInstalledSkillsLoaded();
      const enabledSkillIds = new Set(
        skillsSettings.skills.filter((skill) => skill.enabled).map((skill) => skill.id)
      );

      return readInstalledSkillPackages()
        .filter((skillPackage) => enabledSkillIds.has(skillPackage.id))
        .map((skillPackage) => ({
          description: skillPackage.description,
          files: skillPackage.files,
          id: skillPackage.id,
          name: skillPackage.name,
          skillPath: skillPackage.skillPath,
          source: skillPackage.source,
          summary: skillPackage.summary,
        }));
    },
  };
}
