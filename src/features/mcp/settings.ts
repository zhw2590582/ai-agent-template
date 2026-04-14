import { MCP_CONFIG } from '@/config/mcp';
import type { McpServerSettings, McpSettings } from '@/features/mcp/types';

function createDefaultServer(index = 1): McpServerSettings {
  return {
    bearerToken: '',
    enabled: true,
    id: `mcp-server-${index}`,
    serverName: `${MCP_CONFIG.DEFAULT_SERVER_NAME} ${index}`,
    serverUrl: '',
    transport: MCP_CONFIG.DEFAULT_TRANSPORT,
  };
}

function normalizeMcpServer(input: unknown, index: number): McpServerSettings {
  const existing =
    typeof input === 'object' && input != null ? (input as Partial<McpServerSettings>) : {};
  const fallback = createDefaultServer(index + 1);

  return {
    bearerToken: typeof existing.bearerToken === 'string' ? existing.bearerToken : '',
    enabled: existing.enabled ?? true,
    id:
      typeof existing.id === 'string' && existing.id.trim().length > 0 ? existing.id : fallback.id,
    serverName:
      typeof existing.serverName === 'string' && existing.serverName.trim().length > 0
        ? existing.serverName
        : fallback.serverName,
    serverUrl: typeof existing.serverUrl === 'string' ? existing.serverUrl : '',
    transport: existing.transport === 'sse' ? 'sse' : MCP_CONFIG.DEFAULT_TRANSPORT,
  };
}

export function createMcpServerDraft(index: number, existingIds: string[] = []) {
  let server = createDefaultServer(index);

  while (existingIds.includes(server.id)) {
    server = createDefaultServer(index + 1);
    index += 1;
  }

  return server;
}

export function hasMcpConnectionSettings(server: McpServerSettings | null | undefined) {
  return Boolean(server?.serverUrl.trim().length);
}

export function hasMcpAccess(settings: McpSettings | null | undefined) {
  return Boolean(
    settings?.enabled &&
    settings.servers.some((server) => server.enabled && hasMcpConnectionSettings(server))
  );
}

export function normalizeMcpSettings(input: unknown): McpSettings {
  const existing =
    typeof input === 'object' && input != null ? (input as Record<string, unknown>) : {};

  const serversInput = Array.isArray(existing.servers) ? existing.servers : [];
  const servers = serversInput.map((server, index) => normalizeMcpServer(server, index));
  const fallbackServers = servers.length > 0 ? servers : [createDefaultServer(1)];

  const selectedServerId =
    typeof existing.selectedServerId === 'string' &&
    fallbackServers.some((server) => server.id === existing.selectedServerId)
      ? existing.selectedServerId
      : (fallbackServers[0]?.id ?? null);

  return {
    enabled: typeof existing.enabled === 'boolean' ? existing.enabled : false,
    selectedServerId,
    servers: fallbackServers,
  };
}
