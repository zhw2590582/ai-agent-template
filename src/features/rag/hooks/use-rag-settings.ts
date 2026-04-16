'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { API_ROUTES } from '@/config/api';
import { CHAT_UI_CONFIG } from '@/config/chat';
import type { RagSettings } from '@/features/rag/types';

interface UseRagSettingsOptions {
  onClose?: () => void;
  onRagSettingsChange: (updater: (settings: RagSettings) => RagSettings) => Promise<boolean> | void;
  saveFailedMessage: string;
  saveSuccessMessage: string;
  settings: RagSettings;
  testFailedMessage: string;
  testSuccessMessage: (dimensions: string) => string;
}

export function useRagSettings({
  onClose,
  onRagSettingsChange,
  saveFailedMessage,
  saveSuccessMessage,
  settings,
  testFailedMessage,
  testSuccessMessage,
}: UseRagSettingsOptions) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
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

  const runConnectionTest = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(API_ROUTES.ragTest, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: localSettings.apiKey,
          provider: localSettings.provider,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        toast.error(data?.error?.message || testFailedMessage);
        return;
      }

      const data = (await response.json()) as { dimensions?: number };
      toast.success(testSuccessMessage(String(data.dimensions ?? 0)));
    } finally {
      setIsTesting(false);
    }
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
    isApiKeyVisible,
    isDirty,
    isSaving,
    isTesting,
    localSettings,
    resetAndClose,
    runConnectionTest,
    save,
    setIsApiKeyVisible,
    showSaved,
    updateSettings,
  };
}
