'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CHAT_UI_CONFIG } from '@/config/chat';
import { createMcpServerDraft } from '@/features/mcp/settings';
import {
  useMcpServerActions,
  type McpTestResult,
} from '@/features/mcp/hooks/use-mcp-server-actions';
import type { McpServerSettings, McpSettings } from '@/features/mcp/types';

export type { McpTestResult };

interface UseMcpSettingsOptions {
  onClose?: () => void;
  onMcpSettingsChange: (updater: (settings: McpSettings) => McpSettings) => Promise<boolean> | void;
  saveFailedMessage: string;
  saveSuccessMessage: string;
  settings: McpSettings;
  testMessageByReason: (reason: string | null, fallbackMessage: string | null) => string;
  testSuccessMessage: (count: string, serverName: string) => string;
}

export function useMcpSettings({
  onClose,
  onMcpSettingsChange,
  saveFailedMessage,
  saveSuccessMessage,
  settings,
  testMessageByReason,
  testSuccessMessage,
}: UseMcpSettingsOptions) {
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

  const createServerDraft = () => createMcpServerDraft(localSettings.servers.length + 1);

  const isDirty = JSON.stringify(localSettings) !== JSON.stringify(savedSettings);

  const updateSettings = (updater: (settings: McpSettings) => McpSettings) => {
    setLocalSettings((current) => updater(current));
  };

  const updateServer = (
    serverId: string,
    updater: (server: McpServerSettings) => McpServerSettings
  ) => {
    setLocalSettings((current) => ({
      ...current,
      servers: current.servers.map((server) => (server.id === serverId ? updater(server) : server)),
    }));
  };

  const { deleteServer, runConnectionTest, saveServer, testResults, testingServerId } =
    useMcpServerActions({
      localSettings,
      onMcpSettingsChange,
      saveFailedMessage,
      saveSuccessMessage,
      setIsSaving,
      setLocalSettings,
      setSavedSettings,
      setShowSaved,
      testMessageByReason,
      testSuccessMessage,
    });

  const resetAndClose = () => {
    setLocalSettings(savedSettings);
    onClose?.();
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const success = await onMcpSettingsChange(() => localSettings);

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
    createServerDraft,
    deleteServer,
    isDirty,
    isSaving,
    localSettings,
    resetAndClose,
    runConnectionTest,
    save,
    saveServer,
    showSaved,
    testResults,
    testingServerId,
    updateServer,
    updateSettings,
  };
}
