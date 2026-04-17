import type { McpServerSettings, McpSettings } from '@/features/mcp/types';

function upsertServer(servers: McpServerSettings[], server: McpServerSettings) {
  const existingIndex = servers.findIndex((item) => item.id === server.id);

  if (existingIndex === -1) {
    return [...servers, server];
  }

  return servers.map((item) => (item.id === server.id ? server : item));
}

export function buildNextMcpSettingsForServerSave(
  localSettings: McpSettings,
  server: McpServerSettings
) {
  return {
    ...localSettings,
    servers: upsertServer(localSettings.servers, server),
  };
}

export function buildNextMcpSettingsForServerDelete(localSettings: McpSettings, serverId: string) {
  return {
    ...localSettings,
    servers: localSettings.servers.filter((server) => server.id !== serverId),
  };
}
