import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  closeFirstClientMock,
  closeSecondClientMock,
  createMCPClientMock,
  listToolsFirstClientMock,
  listToolsSecondClientMock,
  toolsFromDefinitionsFirstClientMock,
  toolsFromDefinitionsSecondClientMock,
} = vi.hoisted(() => ({
  closeFirstClientMock: vi.fn(async () => {}),
  closeSecondClientMock: vi.fn(async () => {}),
  createMCPClientMock: vi.fn(),
  listToolsFirstClientMock: vi.fn(),
  listToolsSecondClientMock: vi.fn(),
  toolsFromDefinitionsFirstClientMock: vi.fn(),
  toolsFromDefinitionsSecondClientMock: vi.fn(),
}));

vi.mock('@ai-sdk/mcp', () => ({
  createMCPClient: createMCPClientMock,
}));

import { createMcpAgentToolBundles } from '@/features/mcp/server/mcp-client';
import type { McpSettings } from '@/features/mcp/types';

function createSettings(): McpSettings {
  return {
    enabled: true,
    servers: [
      {
        bearerToken: '',
        enabled: true,
        id: 'server-1',
        serverName: 'Alpha',
        serverUrl: 'https://alpha.example.com/mcp',
        transport: 'http',
      },
      {
        bearerToken: '',
        enabled: true,
        id: 'server-2',
        serverName: 'Beta',
        serverUrl: 'https://beta.example.com/mcp',
        transport: 'http',
      },
    ],
  };
}

describe('createMcpAgentToolBundles', () => {
  beforeEach(() => {
    closeFirstClientMock.mockClear();
    closeSecondClientMock.mockClear();
    createMCPClientMock.mockReset();
    listToolsFirstClientMock.mockReset();
    listToolsSecondClientMock.mockReset();
    toolsFromDefinitionsFirstClientMock.mockReset();
    toolsFromDefinitionsSecondClientMock.mockReset();
  });

  it('closes initialized clients when a later server fails during tool discovery', async () => {
    const firstClient = {
      close: closeFirstClientMock,
      listTools: listToolsFirstClientMock,
      serverInfo: {
        name: 'Alpha',
        version: '1.0.0',
      },
      toolsFromDefinitions: toolsFromDefinitionsFirstClientMock,
    };
    const secondClient = {
      close: closeSecondClientMock,
      listTools: listToolsSecondClientMock,
      serverInfo: {
        name: 'Beta',
        version: '1.0.0',
      },
      toolsFromDefinitions: toolsFromDefinitionsSecondClientMock,
    };

    createMCPClientMock.mockResolvedValueOnce(firstClient).mockResolvedValueOnce(secondClient);
    listToolsFirstClientMock.mockResolvedValue({
      tools: [{ name: 'search_docs' }],
    });
    toolsFromDefinitionsFirstClientMock.mockReturnValue({
      search_docs: { description: 'Search docs' },
    });
    listToolsSecondClientMock.mockRejectedValue(new Error('beta tools failed'));

    await expect(createMcpAgentToolBundles(createSettings())).rejects.toThrow('beta tools failed');

    expect(closeFirstClientMock).toHaveBeenCalledTimes(1);
    expect(closeSecondClientMock).toHaveBeenCalledTimes(1);
  });
});
