import { createMCPClient, type MCPClient } from '@ai-sdk/mcp';
import type { ToolSet } from 'ai';

import { AppError, ErrorCode } from '@/lib/errors';
import { hasMcpConnectionSettings } from '@/features/mcp/settings';
import type { McpServerSettings, McpSettings } from '@/features/mcp/types';

function sanitizeToolToken(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24);
}

function getServerLabel(server: McpServerSettings, client: MCPClient) {
  return server.serverName.trim() || client.serverInfo.name || 'MCP';
}

function createTransportHeaders(server: McpServerSettings) {
  const token = server.bearerToken.trim();

  if (!token) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function classifyMcpConnectionError(error: unknown): AppError {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (
    normalized.includes('401') ||
    normalized.includes('403') ||
    normalized.includes('unauthorized') ||
    normalized.includes('forbidden')
  ) {
    return new AppError(
      ErrorCode.API_KEY_INVALID,
      'MCP server authentication failed. Check the bearer token or server key settings.',
      401,
      { reason: 'auth' }
    );
  }

  if (normalized.includes('404') || normalized.includes('not found')) {
    return new AppError(
      ErrorCode.INPUT_INVALID,
      'MCP endpoint was not found. Check the server URL and transport type.',
      404,
      { reason: 'not_found' }
    );
  }

  if (
    normalized.includes('timeout') ||
    normalized.includes('timed out') ||
    normalized.includes('abort')
  ) {
    return new AppError(
      ErrorCode.API_TIMEOUT,
      'MCP connection timed out. The server may be slow or unreachable.',
      504,
      { reason: 'timeout' }
    );
  }

  if (
    normalized.includes('fetch failed') ||
    normalized.includes('network') ||
    normalized.includes('econnrefused') ||
    normalized.includes('enotfound')
  ) {
    return new AppError(
      ErrorCode.API_NETWORK,
      'MCP server could not be reached. Check the URL, network access, and server status.',
      502,
      { reason: 'network' }
    );
  }

  return new AppError(
    ErrorCode.TOOL_EXECUTION_ERROR,
    'MCP server handshake failed. Check the endpoint, transport type, and server compatibility.',
    502,
    { reason: 'handshake', rawMessage: message }
  );
}

export async function createRemoteMcpClient(server: McpServerSettings) {
  if (!hasMcpConnectionSettings(server)) {
    return null;
  }

  const headers = createTransportHeaders(server);

  return createMCPClient({
    transport: {
      type: server.transport,
      url: server.serverUrl.trim(),
      ...(headers ? { headers } : {}),
      redirect: 'error',
    },
  });
}

export async function listRemoteMcpTools(server: McpServerSettings) {
  const client = await createRemoteMcpClient(server);

  if (!client) {
    return null;
  }

  try {
    const definitions = await client.listTools();

    return {
      serverId: server.id,
      serverName: getServerLabel(server, client),
      serverVersion: client.serverInfo.version,
      toolNames: definitions.tools.map((tool) => tool.name),
    };
  } catch (error) {
    throw classifyMcpConnectionError(error);
  } finally {
    await client.close();
  }
}

export async function createMcpAgentToolBundles(settings: McpSettings): Promise<{
  clients: MCPClient[];
  injectedTools: Array<{
    injectedToolName: string;
    originalToolName: string;
    serverId: string;
    serverName: string;
  }>;
  serverNames: string[];
  tools: ToolSet;
}> {
  const tools: ToolSet = {};
  const clients: MCPClient[] = [];
  const injectedTools: Array<{
    injectedToolName: string;
    originalToolName: string;
    serverId: string;
    serverName: string;
  }> = [];
  const serverNames: string[] = [];

  for (const server of settings.servers) {
    if (!server.enabled || !hasMcpConnectionSettings(server)) {
      continue;
    }

    const client = await createRemoteMcpClient(server);

    if (!client) {
      continue;
    }

    const definitions = await client.listTools();
    const rawTools = client.toolsFromDefinitions(definitions);
    const serverName = getServerLabel(server, client);
    const toolPrefix = `mcp_${sanitizeToolToken(serverName) || sanitizeToolToken(server.id) || 'server'}`;

    Object.assign(
      tools,
      Object.fromEntries(
        Object.entries(rawTools).map(([name, tool]) => {
          const injectedToolName = `${toolPrefix}_${sanitizeToolToken(name)}`;
          injectedTools.push({
            injectedToolName,
            originalToolName: name,
            serverId: server.id,
            serverName,
          });

          return [injectedToolName, tool];
        })
      )
    );

    clients.push(client);
    serverNames.push(serverName);
  }

  return {
    clients,
    injectedTools,
    serverNames,
    tools,
  };
}
