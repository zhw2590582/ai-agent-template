'use client';

import { STORAGE_KEYS, WINDOW_EVENTS } from '@/config/keys';
import type { InstalledSkillPackage } from '@/features/skills/types';
import { createIndexedDbStore } from '@/lib/indexed-db-store';

const EMPTY_INSTALLED_SKILLS: InstalledSkillPackage[] = [];

function parseInstalledSkillPackages(input: unknown) {
  if (!Array.isArray(input)) {
    return null;
  }

  return input
    .map((item) => {
      if (
        !item ||
        typeof item !== 'object' ||
        typeof item.id !== 'string' ||
        typeof item.name !== 'string' ||
        typeof item.source !== 'string' ||
        typeof item.skillId !== 'string' ||
        typeof item.githubUrl !== 'string' ||
        typeof item.rawSkillUrl !== 'string' ||
        typeof item.markdown !== 'string' ||
        typeof item.installedAt !== 'string' ||
        typeof item.updatedAt !== 'string' ||
        !Array.isArray(item.capabilities)
      ) {
        return null;
      }

      const files =
        Array.isArray(item.files) &&
        item.files.every(
          (file: unknown) =>
            !!file &&
            typeof file === 'object' &&
            typeof (file as Record<string, unknown>).path === 'string' &&
            typeof (file as Record<string, unknown>).content === 'string'
        )
          ? item.files
          : [
              {
                content: item.markdown,
                path: 'SKILL.md',
              },
            ];

      return {
        ...item,
        files,
        skillPath: typeof item.skillPath === 'string' ? item.skillPath : item.skillId,
      } satisfies InstalledSkillPackage;
    })
    .filter((item): item is InstalledSkillPackage => item != null)
    .sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt)
    ) as InstalledSkillPackage[];
}

const installedSkillsStore = createIndexedDbStore<InstalledSkillPackage[]>({
  emptyValue: EMPTY_INSTALLED_SKILLS,
  eventName: WINDOW_EVENTS.LOCAL_INSTALLED_SKILLS_UPDATED,
  parse: parseInstalledSkillPackages,
  prepareForWrite: (skills) =>
    [...skills].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
  storageKey: STORAGE_KEYS.LOCAL_INSTALLED_SKILLS,
});

export function readInstalledSkillPackages() {
  return installedSkillsStore.read();
}

export async function ensureInstalledSkillsLoaded() {
  return await installedSkillsStore.ensureLoaded();
}

export function subscribeToInstalledSkillUpdates(onChange: () => void) {
  return installedSkillsStore.subscribe(onChange);
}

export async function upsertInstalledSkillPackage(skillPackage: InstalledSkillPackage) {
  await ensureInstalledSkillsLoaded();
  const existing = readInstalledSkillPackages();
  const next = [
    {
      ...skillPackage,
      installedAt:
        existing.find((item) => item.id === skillPackage.id)?.installedAt ??
        skillPackage.installedAt,
      updatedAt: new Date().toISOString(),
    },
    ...existing.filter((item) => item.id !== skillPackage.id),
  ];

  await installedSkillsStore.write(next);
  return next[0];
}

export async function removeInstalledSkillPackage(skillId: string) {
  await ensureInstalledSkillsLoaded();
  const existing = readInstalledSkillPackages();
  const next = existing.filter((item) => item.id !== skillId);

  if (next.length === existing.length) {
    return false;
  }

  await installedSkillsStore.write(next);
  return true;
}

export async function getInstalledSkillPackage(skillId: string) {
  await ensureInstalledSkillsLoaded();
  return readInstalledSkillPackages().find((item) => item.id === skillId) ?? null;
}
