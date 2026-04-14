'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { MemorySettings } from '@/features/auth/profile/types';

interface UseMemorySettingsDraftOptions {
  onMemorySettingsChange: (
    updater: (settings: MemorySettings) => MemorySettings
  ) => Promise<boolean> | void;
  settings: MemorySettings;
  t: (key: string) => string;
}

export function useMemorySettingsDraft({
  onMemorySettingsChange,
  settings,
  t,
}: UseMemorySettingsDraftOptions) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const isSettingsDirty = useMemo(
    () => JSON.stringify(localSettings) !== JSON.stringify(settings),
    [localSettings, settings]
  );

  const updateDraftSettings = (updater: (settings: MemorySettings) => MemorySettings) => {
    setLocalSettings((current) => updater(current));
  };

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const result = await onMemorySettingsChange(() => localSettings);
      if (result === false) {
        toast.error(t('memory_page.toast.settings_update_failed'));
        return false;
      }

      return true;
    } finally {
      setIsSavingSettings(false);
    }
  };

  return {
    isSavingSettings,
    isSettingsDirty,
    localSettings,
    resetDraftSettings: () => setLocalSettings(settings),
    saveSettings,
    updateDraftSettings,
  };
}
