import { createMCPClient, type MCPClient } from '@ai-sdk/mcp';
import type { ToolSet } from 'ai';

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
  } finally {
    await client.close();
  }
}

export async function createMcpAgentToolBundles(settings: McpSettings): Promise<{
  clients: MCPClient[];
  serverNames: string[];
  tools: ToolSet;
}> {
  const tools: ToolSet = {};
  const clients: MCPClient[] = [];
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
        Object.entries(rawTools).map(([name, tool]) => [
          `${toolPrefix}_${sanitizeToolToken(name)}`,
          tool,
        ])
      )
    );

    clients.push(client);
    serverNames.push(serverName);
  }

  return {
    clients,
    serverNames,
    tools,
  };
}
