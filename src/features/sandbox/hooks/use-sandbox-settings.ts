'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CHAT_UI_CONFIG } from '@/config/chat';
import type { SandboxSettings, SandboxTemplateOption } from '@/features/sandbox/types';

interface UseSandboxSettingsOptions {
  onClose?: () => void;
  onSandboxSettingsChange: (
    updater: (settings: SandboxSettings) => SandboxSettings
  ) => Promise<boolean> | void;
  saveFailedMessage: string;
  saveSuccessMessage: string;
  settings: SandboxSettings;
  testFailedMessage: string;
  testSuccessMessage: (template: string) => string;
}

export function useSandboxSettings({
  onClose,
  onSandboxSettingsChange,
  saveFailedMessage,
  saveSuccessMessage,
  settings,
  testFailedMessage,
  testSuccessMessage,
}: UseSandboxSettingsOptions) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [templateOptions, setTemplateOptions] = useState<SandboxTemplateOption[]>([]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    const apiKey = settings.apiKey.trim();

    if (!apiKey) {
      setTemplateOptions([]);
      return;
    }

    let cancelled = false;

    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const response = await fetch('/api/sandbox/templates', {
          body: JSON.stringify({
            apiKey,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        if (!response.ok) {
          if (!cancelled) {
            setTemplateOptions([]);
          }
          return;
        }

        const data = (await response.json()) as {
          templates?: SandboxTemplateOption[];
        };

        if (!cancelled) {
          setTemplateOptions(Array.isArray(data.templates) ? data.templates : []);
        }
      } catch {
        if (!cancelled) {
          setTemplateOptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTemplates(false);
        }
      }
    };

    void loadTemplates();

    return () => {
      cancelled = true;
    };
  }, [settings.apiKey]);

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

  const runConnectionTest = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/sandbox/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localSettings),
      });

      if (!response.ok) {
        toast.error(testFailedMessage);
        return;
      }

      const data = (await response.json()) as { template?: string };
      toast.success(testSuccessMessage(String(data.template ?? localSettings.template)));
    } finally {
      setIsTesting(false);
    }
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
    isLoadingTemplates,
    isSaving,
    isTesting,
    localSettings,
    resetAndClose,
    runConnectionTest,
    save,
    setIsApiKeyVisible,
    showSaved,
    templateOptions,
    updateSettings,
  };
}
