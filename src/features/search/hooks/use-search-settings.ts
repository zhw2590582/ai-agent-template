'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { API_ROUTES } from '@/config/api';
import { CHAT_UI_CONFIG } from '@/config/chat';
import type { SearchSettings } from '@/features/search/types';

interface UseSearchSettingsOptions {
  onClose?: () => void;
  onSearchSettingsChange: (
    updater: (settings: SearchSettings) => SearchSettings
  ) => Promise<boolean> | void;
  saveFailedMessage: string;
  saveSuccessMessage: string;
  settings: SearchSettings;
  testFailedMessage: string;
  testSuccessMessage: (count: string) => string;
}

export function useSearchSettings({
  onClose,
  onSearchSettingsChange,
  saveFailedMessage,
  saveSuccessMessage,
  settings,
  testFailedMessage,
  testSuccessMessage,
}: UseSearchSettingsOptions) {
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

  const updateSettings = (updater: (settings: SearchSettings) => SearchSettings) => {
    setLocalSettings((current) => updater(current));
  };

  const runConnectionTest = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(API_ROUTES.searchTest, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: localSettings.tavilyApiKey,
          maxResults: localSettings.search.maxResults,
          searchDepth: localSettings.search.searchDepth,
          topic: localSettings.search.topic,
        }),
      });

      if (!response.ok) {
        toast.error(testFailedMessage);
        return;
      }

      const data = (await response.json()) as { resultCount?: number };
      toast.success(testSuccessMessage(String(data.resultCount ?? 0)));
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
      const success = await onSearchSettingsChange(() => localSettings);
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
    setLocalSettings,
    showSaved,
    updateSettings,
  };
}
