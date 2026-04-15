'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CHAT_UI_CONFIG } from '@/config/chat';
import type { SandboxSettings } from '@/features/sandbox/types';

interface UseSandboxSettingsOptions {
  onClose?: () => void;
  onSandboxSettingsChange: (
    updater: (settings: SandboxSettings) => SandboxSettings
  ) => Promise<boolean> | void;
  saveFailedMessage: string;
  saveSuccessMessage: string;
  settings: SandboxSettings;
}

export function useSandboxSettings({
  onClose,
  onSandboxSettingsChange,
  saveFailedMessage,
  saveSuccessMessage,
  settings,
}: UseSandboxSettingsOptions) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
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

  const isDirty = JSON.stringify(localSettings) !== JSON.stringify(settings);

  const updateSettings = (updater: (settings: SandboxSettings) => SandboxSettings) => {
    setLocalSettings((current) => updater(current));
  };

  const resetAndClose = () => {
    setLocalSettings(settings);
    onClose?.();
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const success = await onSandboxSettingsChange(() => localSettings);
      if (success === false) {
        toast.error(saveFailedMessage);
        return false;
      }

      setShowSaved(true);
      toast.success(saveSuccessMessage);
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isApiKeyVisible,
    isDirty,
    isSaving,
    localSettings,
    resetAndClose,
    save,
    setIsApiKeyVisible,
    showSaved,
    updateSettings,
  };
}
