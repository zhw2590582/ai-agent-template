'use client';

import { STORAGE_KEYS, WINDOW_EVENTS } from '@/config/keys';
import { normalizeSkillsSettings } from '@/features/skills/settings';
import type { SkillsSettings } from '@/features/skills/types';
import { createLocalStorageStore } from '@/lib/local-storage-store';

const EMPTY_SKILLS_SETTINGS = normalizeSkillsSettings();

function parseSkillsSettings(input: unknown) {
  if (typeof input !== 'object' || input == null) {
    return null;
  }

  return normalizeSkillsSettings(input as Partial<SkillsSettings>);
}

const localSkillsSettingsStore = createLocalStorageStore<SkillsSettings>({
  emptyValue: EMPTY_SKILLS_SETTINGS,
  eventName: WINDOW_EVENTS.LOCAL_SKILLS_SETTINGS_UPDATED,
  parse: parseSkillsSettings,
  prepareForWrite: (settings) => normalizeSkillsSettings(settings),
  storageKey: STORAGE_KEYS.LOCAL_SKILLS_SETTINGS,
});

export function readLocalSkillsSettings() {
  return localSkillsSettingsStore.read();
}

export function writeLocalSkillsSettings(settings: SkillsSettings) {
  localSkillsSettingsStore.write(normalizeSkillsSettings(settings));
}

export function subscribeToLocalSkillsSettingsUpdates(onChange: () => void) {
  return localSkillsSettingsStore.subscribe(onChange);
}
