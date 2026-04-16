'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CHAT_UI_CONFIG } from '@/config/chat';
import type { SubagentDefinition, SubagentSettings } from '@/features/subagent/types';

interface UseSubagentSettingsOptions {
  onClose?: () => void;
  onSubagentSettingsChange: (
    updater: (settings: SubagentSettings) => SubagentSettings
  ) => Promise<boolean> | void;
  saveFailedMessage: string;
  saveSuccessMessage: string;
  settings: SubagentSettings;
}

export function useSubagentSettings({
  onClose,
  onSubagentSettingsChange,
  saveFailedMessage,
  saveSuccessMessage,
  settings,
}: UseSubagentSettingsOptions) {
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

  const updateSettings = (updater: (settings: SubagentSettings) => SubagentSettings) => {
    setLocalSettings((current) => updater(current));
  };

  const saveAgent = async (agent: SubagentDefinition, mode: 'add' | 'edit') => {
    setLocalSettings((current) => ({
      ...current,
      agents:
        mode === 'add'
          ? [...current.agents, agent]
          : current.agents.map((item) => (item.id === agent.id ? agent : item)),
    }));

    return true;
  };

  const deleteAgent = async (agentId: string) => {
    setLocalSettings((current) => ({
      ...current,
      agents: current.agents.filter((agent) => agent.id !== agentId),
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
      const success = await onSubagentSettingsChange(() => localSettings);

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
    deleteAgent,
    isDirty,
    isSaving,
    localSettings,
    resetAndClose,
    save,
    saveAgent,
    showSaved,
    updateSettings,
  };
}
