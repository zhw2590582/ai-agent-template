import { describe, expect, it } from 'vitest';

import {
  buildNextMcpSettingsForServerDelete,
  buildNextMcpSettingsForServerSave,
} from '@/features/mcp/server-state';
import type { McpServerSettings, McpSettings } from '@/features/mcp/types';

function createServer(overrides: Partial<McpServerSettings>): McpServerSettings {
  return {
    bearerToken: '',
    enabled: true,
    id: 'server-1',
    serverName: 'Server 1',
    serverUrl: 'https://example.com/mcp',
    transport: 'http',
    ...overrides,
  };
}

describe('mcp server state helpers', () => {
  it('saves a server on top of the current local settings snapshot', () => {
    const existingServer = createServer({
      id: 'server-1',
      serverName: 'Existing server',
    });
    const unrelatedDraftChange = createServer({
      id: 'server-2',
      serverName: 'Draft-only server',
      serverUrl: 'https://draft.example.com/mcp',
    });
    const updatedServer = {
      ...existingServer,
      serverName: 'Updated server',
    };
    const localSettings: McpSettings = {
      enabled: false,
      servers: [existingServer, unrelatedDraftChange],
    };

    expect(buildNextMcpSettingsForServerSave(localSettings, updatedServer)).toEqual({
      enabled: false,
      servers: [updatedServer, unrelatedDraftChange],
    });
  });

  it('deletes a server without dropping unrelated local changes', () => {
    const serverToDelete = createServer({
      id: 'server-1',
    });
    const remainingDraftServer = createServer({
      bearerToken: 'draft-token',
      id: 'server-2',
      serverName: 'Draft server',
      serverUrl: 'https://draft.example.com/mcp',
    });
    const localSettings: McpSettings = {
      enabled: false,
      servers: [serverToDelete, remainingDraftServer],
    };

    expect(buildNextMcpSettingsForServerDelete(localSettings, serverToDelete.id)).toEqual({
      enabled: false,
      servers: [remainingDraftServer],
    });
  });
});
