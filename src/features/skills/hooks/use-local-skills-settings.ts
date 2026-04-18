'use client';

import { useCallback, useEffect, useState } from 'react';

import { normalizeSkillsSettings } from '@/features/skills/settings';
import {
  readLocalSkillsSettings,
  subscribeToLocalSkillsSettingsUpdates,
  writeLocalSkillsSettings,
} from '@/features/skills/storage/local-skills-settings';
import type { SkillsSettings } from '@/features/skills/types';

export function useLocalSkillsSettings() {
  const [skillsSettings, setSkillsSettings] = useState<SkillsSettings>(() =>
    readLocalSkillsSettings()
  );

  useEffect(() => {
    const syncSettings = () => {
      setSkillsSettings(readLocalSkillsSettings());
    };

    syncSettings();
    return subscribeToLocalSkillsSettingsUpdates(syncSettings);
  }, []);

  const updateSkillsSettings = useCallback(
    async (updater: (settings: SkillsSettings) => SkillsSettings) => {
      const nextSettings = normalizeSkillsSettings(updater(readLocalSkillsSettings()));
      writeLocalSkillsSettings(nextSettings);
      setSkillsSettings(nextSettings);
      return true;
    },
    []
  );

  return {
    skillsSettings,
    updateSkillsSettings,
  };
}
