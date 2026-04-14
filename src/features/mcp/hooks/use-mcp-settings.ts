'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CHAT_UI_CONFIG } from '@/config/chat';
import { createMcpServerDraft } from '@/features/mcp/settings';
import type { McpServerSettings, McpSettings } from '@/features/mcp/types';

interface McpTestResult {
  serverName: string | null;
  serverVersion: string | null;
  toolNames: string[];
}

export type { McpTestResult };

interface UseMcpSettingsOptions {
  onClose?: () => void;
  onMcpSettingsChange: (updater: (settings: McpSettings) => McpSettings) => Promise<boolean> | void;
  saveFailedMessage: string;
  saveSuccessMessage: string;
  settings: McpSettings;
  testFailedMessage: string;
  testSuccessMessage: (count: string, serverName: string) => string;
}

export function useMcpSettings({
  onClose,
  onMcpSettingsChange,
  saveFailedMessage,
  saveSuccessMessage,
  settings,
  testFailedMessage,
  testSuccessMessage,
}: UseMcpSettingsOptions) {
  const [savedSettings, setSavedSettings] = useState(settings);
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [testingServerId, setTestingServerId] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, McpTestResult>>({});

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

  const createServerDraft = () =>
    createMcpServerDraft(
      localSettings.servers.length + 1,
      localSettings.servers.map((item) => item.id)
    );

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

  const removeServer = (serverId: string) => {
    setLocalSettings((current) => {
      return {
        ...current,
        servers: current.servers.filter((server) => server.id !== serverId),
      };
    });

    setTestResults((results) => {
      const nextResults = { ...results };
      delete nextResults[serverId];
      return nextResults;
    });
  };

  const resetAndClose = () => {
    setLocalSettings(savedSettings);
    setTestResults({});
    onClose?.();
  };

  const runConnectionTest = async (server: McpServerSettings) => {
    setTestingServerId(server.id);
    try {
      const response = await fetch('/api/mcp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server,
        }),
      });

      if (!response.ok) {
        setTestResults((results) => {
          const nextResults = { ...results };
          delete nextResults[server.id];
          return nextResults;
        });
        toast.error(testFailedMessage);
        return null;
      }

      const data = (await response.json()) as {
        serverName?: string | null;
        serverVersion?: string | null;
        toolNames?: string[];
      };

      const result = {
        serverName: data.serverName ?? null,
        serverVersion: data.serverVersion ?? null,
        toolNames: Array.isArray(data.toolNames) ? data.toolNames : [],
      };

      setTestResults((results) => ({
        ...results,
        [server.id]: result,
      }));

      toast.success(
        testSuccessMessage(String(result.toolNames.length), result.serverName ?? server.serverName)
      );
      return result;
    } finally {
      setTestingServerId((current) => (current === server.id ? null : current));
    }
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

  const saveServer = async (server: McpServerSettings, mode: 'add' | 'edit') => {
    const nextSavedSettings: McpSettings = {
      ...savedSettings,
      servers:
        mode === 'add'
          ? [...savedSettings.servers, server]
          : savedSettings.servers.map((item) => (item.id === server.id ? server : item)),
    };

    setIsSaving(true);
    try {
      const success = await onMcpSettingsChange(() => nextSavedSettings);

      if (success === false) {
        toast.error(saveFailedMessage);
        return false;
      }

      setSavedSettings(nextSavedSettings);
      setLocalSettings((current) => ({
        ...current,
        servers:
          mode === 'add'
            ? [...current.servers, server]
            : current.servers.map((item) => (item.id === server.id ? server : item)),
      }));
      setShowSaved(true);
      toast.success(saveSuccessMessage);
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteServer = async (serverId: string) => {
    const nextSavedSettings: McpSettings = {
      ...savedSettings,
      servers: savedSettings.servers.filter((server) => server.id !== serverId),
    };

    setIsSaving(true);
    try {
      const success = await onMcpSettingsChange(() => nextSavedSettings);

      if (success === false) {
        toast.error(saveFailedMessage);
        return false;
      }

      setSavedSettings(nextSavedSettings);
      removeServer(serverId);
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
