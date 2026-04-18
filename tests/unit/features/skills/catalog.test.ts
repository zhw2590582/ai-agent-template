import { describe, expect, it } from 'vitest';

import {
  buildSkillDefinitionFromPackage,
  parseResolvedSkillCatalogItem,
  resolveSkillPathFromDirectoryNames,
  toInstalledSkillPackage,
} from '@/features/skills/catalog';
import type { SkillCatalogItem } from '@/features/skills/types';

describe('skills catalog helpers', () => {
  const catalogItem: SkillCatalogItem = {
    id: 'antfu-nuxt',
    installs: 1234,
    name: 'Nuxt',
    skillId: 'nuxt',
    source: 'antfu/skills',
  };

  it('parses SKILL.md metadata into a resolved skill item', () => {
    const markdown = `---
name: Nuxt
description: Build and review Nuxt applications
metadata:
  version: 1.2.3
---

# Nuxt

Use this skill when building Nuxt applications.

- Supports project setup
- Supports reviews
`;

    const result = parseResolvedSkillCatalogItem({
      files: [
        {
          content: markdown,
          path: 'SKILL.md',
        },
        {
          content: '{"version":"1.2.3"}',
          path: 'metadata.json',
        },
      ],
      item: catalogItem,
      markdown,
      resolvedSkillPath: 'nuxt',
    });

    expect(result.name).toBe('Nuxt');
    expect(result.description).toBe('Build and review Nuxt applications');
    expect(result.summary).toContain('Nuxt');
    expect(result.version).toBe('1.2.3');
    expect(result.skillPath).toBe('nuxt');
    expect(result.files).toHaveLength(2);
    expect(result.githubUrl).toBe('https://github.com/antfu/skills/tree/HEAD/skills/nuxt');
    expect(result.rawSkillUrl).toBe(
      'https://raw.githubusercontent.com/antfu/skills/HEAD/skills/nuxt/SKILL.md'
    );
    expect(result.capabilities).toEqual(['prompt']);
  });

  it('converts a resolved skill into an installed package and display definition', () => {
    const resolved = parseResolvedSkillCatalogItem({
      files: [
        {
          content: '# Nuxt\n\nUse this skill to build Nuxt apps.',
          path: 'SKILL.md',
        },
      ],
      item: catalogItem,
      markdown: `# Nuxt\n\nUse this skill to build Nuxt apps.`,
      resolvedSkillPath: 'nuxt',
    });

    const installed = toInstalledSkillPackage(resolved);
    const definition = buildSkillDefinitionFromPackage(installed);

    expect(installed.id).toBe('antfu-nuxt');
    expect(installed.files).toEqual([
      {
        content: '# Nuxt\n\nUse this skill to build Nuxt apps.',
        path: 'SKILL.md',
      },
    ]);
    expect(installed.githubUrl).toBe('https://github.com/antfu/skills/tree/HEAD/skills/nuxt');
    expect(installed.skillPath).toBe('nuxt');
    expect(definition).toEqual({
      capabilities: ['prompt'],
      description: installed.description,
      enabled: true,
      id: 'antfu-nuxt',
      name: 'Nuxt',
      sourceUrl: 'https://github.com/antfu/skills/tree/HEAD/skills/nuxt',
    });
  });

  it('matches an aliased skill id to the closest GitHub directory name', () => {
    const result = resolveSkillPathFromDirectoryNames(
      {
        id: 'vercel-labs/agent-skills/vercel-react-view-transitions',
        installs: 14188,
        name: 'vercel-react-view-transitions',
        skillId: 'vercel-react-view-transitions',
        source: 'vercel-labs/agent-skills',
      },
      ['composition-patterns', 'deploy-to-vercel', 'react-best-practices', 'react-view-transitions']
    );

    expect(result).toBe('react-view-transitions');
  });
});
