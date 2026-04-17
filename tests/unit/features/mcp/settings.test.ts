import { describe, expect, it } from 'vitest';

import { createMcpServerDraft, normalizeMcpSettings } from '@/features/mcp/settings';

describe('mcp settings', () => {
  it('defaults to an empty server list', () => {
    expect(normalizeMcpSettings(undefined)).toEqual({
      enabled: false,
      servers: [],
    });
  });

  it('creates a new server draft only when explicitly requested', () => {
    const draft = createMcpServerDraft(1);

    expect(draft.enabled).toBe(true);
    expect(draft.serverName).toBe('Remote MCP 1');
    expect(draft.serverUrl).toBe('');
    expect(draft.transport).toBe('http');
    expect(draft.id).toMatch(/^mcp-server-/);
  });
});
