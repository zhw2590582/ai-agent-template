import { MCP_CONFIG } from '@/config/mcp';
import type { McpServerSettings, McpSettings } from '@/features/mcp/types';

function createServerId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? `mcp-server-${crypto.randomUUID()}`
    : `mcp-server-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultServer(index = 1): McpServerSettings {
  return {
    bearerToken: '',
    enabled: true,
    id: createServerId(),
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

function dedupeServersById(servers: McpServerSettings[]) {
  const seenIds = new Set<string>();

  return servers.filter((server) => {
    if (seenIds.has(server.id)) {
      return false;
    }

    seenIds.add(server.id);
    return true;
  });
}

export function createMcpServerDraft(index: number) {
  return createDefaultServer(index);
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
  const servers = dedupeServersById(
    serversInput.map((server, index) => normalizeMcpServer(server, index))
  );
  const fallbackServers = servers.length > 0 ? servers : [createDefaultServer(1)];

  return {
    enabled: typeof existing.enabled === 'boolean' ? existing.enabled : false,
    servers: fallbackServers,
  };
}
