'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CHAT_UI_CONFIG } from '@/config/chat';
import type { SkillDefinition, SkillsSettings } from '@/features/skills/types';

interface UseSkillsSettingsOptions {
  onClose?: () => void;
  onSkillsSettingsChange: (
    updater: (settings: SkillsSettings) => SkillsSettings
  ) => Promise<boolean> | void;
  saveFailedMessage: string;
  saveSuccessMessage: string;
  settings: SkillsSettings;
}

export function useSkillsSettings({
  onClose,
  onSkillsSettingsChange,
  saveFailedMessage,
  saveSuccessMessage,
  settings,
}: UseSkillsSettingsOptions) {
  const [savedSettings, setSavedSettings] = useState(settings);
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    setSavedSettings(settings);
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!showSaved) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowSaved(false);
    }, CHAT_UI_CONFIG.SAVE_FEEDBACK_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [showSaved]);

  const isDirty = JSON.stringify(localSettings) !== JSON.stringify(savedSettings);

  const updateSettings = (updater: (settings: SkillsSettings) => SkillsSettings) => {
    setLocalSettings((current) => updater(current));
  };

  const saveSkill = async (skill: SkillDefinition, mode: 'add' | 'edit') => {
    const nextSkills =
      mode === 'add'
        ? [...localSettings.skills, skill]
        : localSettings.skills.map((item) => (item.id === skill.id ? skill : item));

    setLocalSettings((current) => ({
      ...current,
      skills: nextSkills,
    }));

    return true;
  };

  const deleteSkill = async (skillId: string) => {
    setLocalSettings((current) => ({
      ...current,
      skills: current.skills.filter((skill) => skill.id !== skillId),
    }));

    return true;
  };

  const resetAndClose = () => {
    setLocalSettings(savedSettings);
    onClose?.();
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const success = await onSkillsSettingsChange(() => localSettings);

      if (success === false) {
        toast.error(saveFailedMessage);
        return false;
      }

      setSavedSettings(localSettings);
      setShowSaved(true);
      toast.success(saveSuccessMessage);
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    deleteSkill,
    isDirty,
    isSaving,
    localSettings,
    resetAndClose,
    save,
    saveSkill,
    showSaved,
    updateSettings,
  };
}
