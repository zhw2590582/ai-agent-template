'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CHAT_UI_CONFIG } from '@/config/chat';
import type { RagSettings } from '@/features/rag/types';

interface UseRagSettingsOptions {
  onClose?: () => void;
  onRagSettingsChange: (updater: (settings: RagSettings) => RagSettings) => Promise<boolean> | void;
  saveFailedMessage: string;
  saveSuccessMessage: string;
  settings: RagSettings;
}

export function useRagSettings({
  onClose,
  onRagSettingsChange,
  saveFailedMessage,
  saveSuccessMessage,
  settings,
}: UseRagSettingsOptions) {
  const [localSettings, setLocalSettings] = useState(settings);
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

  const updateSettings = (updater: (settings: RagSettings) => RagSettings) => {
    setLocalSettings((current) => updater(current));
  };

  const resetAndClose = () => {
    setLocalSettings(settings);
    onClose?.();
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const success = await onRagSettingsChange(() => localSettings);
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
    isDirty,
    isSaving,
    localSettings,
    resetAndClose,
    save,
    showSaved,
    updateSettings,
  };
}
