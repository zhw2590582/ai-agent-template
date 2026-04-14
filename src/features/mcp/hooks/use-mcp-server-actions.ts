'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { readApiError } from '@/lib/api-client';
import type { McpServerSettings, McpSettings } from '@/features/mcp/types';

interface McpTestResult {
  capabilities: {
    elicitation: boolean;
    logging: boolean;
    prompts: boolean;
    resources: boolean;
    roots: boolean;
    sampling: boolean;
    tools: boolean;
  };
  prompts: Array<{
    arguments: Array<{
      description?: string;
      name: string;
      required: boolean;
    }>;
    description?: string;
    name: string;
    title?: string;
  }>;
  resources: Array<{
    description?: string;
    mimeType?: string;
    name: string;
    title?: string;
    uri: string;
  }>;
  serverName: string | null;
  serverVersion: string | null;
  toolNames: string[];
}

interface UseMcpServerActionsOptions {
  onMcpSettingsChange: (updater: (settings: McpSettings) => McpSettings) => Promise<boolean> | void;
  saveFailedMessage: string;
  saveSuccessMessage: string;
  savedSettings: McpSettings;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  setLocalSettings: React.Dispatch<React.SetStateAction<McpSettings>>;
  setSavedSettings: React.Dispatch<React.SetStateAction<McpSettings>>;
  setShowSaved: React.Dispatch<React.SetStateAction<boolean>>;
  testMessageByReason: (reason: string | null, fallbackMessage: string | null) => string;
  testSuccessMessage: (count: string, serverName: string) => string;
}

export type { McpTestResult };

export function useMcpServerActions({
  onMcpSettingsChange,
  saveFailedMessage,
  saveSuccessMessage,
  savedSettings,
  setIsSaving,
  setLocalSettings,
  setSavedSettings,
  setShowSaved,
  testMessageByReason,
  testSuccessMessage,
}: UseMcpServerActionsOptions) {
  const [testingServerId, setTestingServerId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, McpTestResult>>({});

  const clearTestResult = (serverId: string) => {
    setTestResults((results) => {
      const nextResults = { ...results };
      delete nextResults[serverId];
      return nextResults;
    });
  };

  const removeServerFromLocalState = (serverId: string) => {
    setLocalSettings((current) => ({
      ...current,
      servers: current.servers.filter((server) => server.id !== serverId),
    }));
    clearTestResult(serverId);
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
        const error = await readApiError(response);
        clearTestResult(server.id);
        const reason =
          typeof error.details === 'object' &&
          error.details != null &&
          'reason' in error.details &&
          typeof error.details.reason === 'string'
            ? error.details.reason
            : null;
        toast.error(testMessageByReason(reason, error.message));
        return null;
      }

      const data = (await response.json()) as {
        capabilities?: {
          elicitation?: boolean;
          logging?: boolean;
          prompts?: boolean;
          resources?: boolean;
          roots?: boolean;
          sampling?: boolean;
          tools?: boolean;
        };
        prompts?: Array<{
          arguments?: Array<{
            description?: string;
            name?: string;
            required?: boolean;
          }>;
          description?: string;
          name?: string;
          title?: string;
        }>;
        resources?: Array<{
          description?: string;
          mimeType?: string;
          name?: string;
          title?: string;
          uri?: string;
        }>;
        serverName?: string | null;
        serverVersion?: string | null;
        toolNames?: string[];
      };

      const result = {
        capabilities: {
          elicitation: Boolean(data.capabilities?.elicitation),
          logging: Boolean(data.capabilities?.logging),
          prompts: Boolean(data.capabilities?.prompts),
          resources: Boolean(data.capabilities?.resources),
          roots: Boolean(data.capabilities?.roots),
          sampling: Boolean(data.capabilities?.sampling),
          tools: Boolean(data.capabilities?.tools),
        },
        prompts: Array.isArray(data.prompts)
          ? data.prompts
              .filter((prompt) => typeof prompt?.name === 'string')
              .map((prompt) => ({
                arguments: Array.isArray(prompt.arguments)
                  ? prompt.arguments
                      .filter((argument) => typeof argument?.name === 'string')
                      .map((argument) => ({
                        description:
                          typeof argument.description === 'string'
                            ? argument.description
                            : undefined,
                        name: argument.name!,
                        required: Boolean(argument.required),
                      }))
                  : [],
                description:
                  typeof prompt.description === 'string' ? prompt.description : undefined,
                name: prompt.name!,
                title: typeof prompt.title === 'string' ? prompt.title : undefined,
              }))
          : [],
        resources: Array.isArray(data.resources)
          ? data.resources
              .filter(
                (resource) =>
                  typeof resource?.name === 'string' && typeof resource?.uri === 'string'
              )
              .map((resource) => ({
                description:
                  typeof resource.description === 'string' ? resource.description : undefined,
                mimeType: typeof resource.mimeType === 'string' ? resource.mimeType : undefined,
                name: resource.name!,
                title: typeof resource.title === 'string' ? resource.title : undefined,
                uri: resource.uri!,
              }))
          : [],
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
      removeServerFromLocalState(serverId);
      setShowSaved(true);
      toast.success(saveSuccessMessage);
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    clearTestResult,
    deleteServer,
    runConnectionTest,
    saveServer,
    testResults,
    testingServerId,
  };
}
