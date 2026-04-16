import { describe, expect, it } from 'vitest';

import {
  buildAgentRunMetadataContext,
  createAgentRunMetadata,
  createAgentRunMetadataBase,
} from '@/features/chat/agent-runtime/run-metadata';

describe('run metadata helpers', () => {
  const runMetadataBase = createAgentRunMetadataBase({
    conversationId: 'conversation_1',
    hasAgentTools: true,
    hasSearchTools: true,
    mcpServerNames: ['server-a', 'server-b'],
    runtimeModel: {
      apiFormat: 'openai',
      apiKey: 'test-key',
      baseUrl: 'https://example.com/v1',
      modelId: 'gpt-test',
      providerId: 'provider-test',
    },
    userId: 'user_1',
    workspaceManifest: {
      access: {
        allowCommands: true,
        allowFileDownload: true,
        allowFileUpload: true,
        allowFilesystem: true,
        allowInternetAccess: true,
        allowPty: false,
      },
      autoPause: false,
      enabled: true,
      envVars: {
        NODE_ENV: 'test',
      },
      hasRuntimeAccess: true,
      provider: 'e2b',
      secure: true,
      template: 'base',
      timeoutSeconds: 300,
      toolPolicy: {
        allowCommands: true,
        allowFilesystem: true,
      },
      workspaceRoot: '/workspace',
    },
    workspaceTelemetry: {
      closeReason: null,
      createdAt: '2026-04-16T00:00:00.000Z',
      lastEventAt: '2026-04-16T00:00:05.000Z',
      sandboxCreated: true,
      sandboxId: 'sandbox_123',
      sessionState: 'ready',
    },
  });

  it('adds derived rag metadata on top of the base metadata', () => {
    const metadata = createAgentRunMetadata(runMetadataBase, {
      ragSourceCount: 3,
    });

    expect(metadata.ragSourceCount).toBe(3);
    expect(metadata.mcpServerNames).toEqual(['server-a', 'server-b']);
    expect(metadata.workspaceTelemetry.sessionState).toBe('ready');
  });

  it('builds a flat telemetry context from aggregated metadata', () => {
    const context = buildAgentRunMetadataContext(
      createAgentRunMetadata(runMetadataBase, {
        ragSourceCount: 2,
      })
    );

    expect(context).toMatchObject({
      conversationId: 'conversation_1',
      hasAgentTools: true,
      hasSearchTools: true,
      mcpServerCount: 2,
      modelId: 'gpt-test',
      providerId: 'provider-test',
      ragSourceCount: 2,
      userId: 'user_1',
      workspaceProvider: 'e2b',
      workspaceRoot: '/workspace',
      workspaceSandboxCreated: true,
      workspaceSandboxId: 'sandbox_123',
      workspaceSessionState: 'ready',
      workspaceTemplate: 'base',
    });
  });
});
