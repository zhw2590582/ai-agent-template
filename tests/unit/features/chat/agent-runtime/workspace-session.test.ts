import { beforeEach, describe, expect, it, vi } from 'vitest';

const { MockSandboxSession, mockBuildWorkspaceManifest, sandboxInstances } = vi.hoisted(() => {
  const instances: Array<{
    close: ReturnType<typeof vi.fn>;
    options?: {
      onLifecycleEvent?: (event: { reason?: string; sandboxId?: string; type: string }) => void;
    };
    settings: unknown;
  }> = [];

  class HoistedMockSandboxSession {
    close = vi.fn(async (reason: string = 'completed') => {
      this.options?.onLifecycleEvent?.({
        reason,
        type: 'closed',
      });
    });

    constructor(
      public settings: unknown,
      public options?: {
        onLifecycleEvent?: (event: { reason?: string; sandboxId?: string; type: string }) => void;
      }
    ) {
      instances.push(this);
    }
  }

  return {
    MockSandboxSession: HoistedMockSandboxSession,
    mockBuildWorkspaceManifest: vi.fn(),
    sandboxInstances: instances,
  };
});

vi.mock('@/features/chat/agent-runtime/workspace-manifest', () => ({
  buildWorkspaceManifest: mockBuildWorkspaceManifest,
}));

vi.mock('@/features/sandbox/server/e2b-client', () => ({
  SandboxSession: MockSandboxSession,
}));

import { createWorkspaceSession } from '@/features/chat/agent-runtime/workspace-session';

describe('createWorkspaceSession', () => {
  beforeEach(() => {
    mockBuildWorkspaceManifest.mockReset();
    sandboxInstances.length = 0;
  });

  it('marks sessions without runtime access as unavailable and closes locally', async () => {
    mockBuildWorkspaceManifest.mockReturnValue({
      enabled: true,
      hasRuntimeAccess: false,
      provider: 'e2b',
      template: 'base',
      toolPolicy: {
        allowCommands: false,
        allowFilesystem: false,
      },
      workspaceRoot: '/workspace',
    });

    const session = createWorkspaceSession({
      sandboxSettings: { enabled: true } as never,
    });

    expect(session.sandboxSession).toBeNull();
    expect(session.telemetry.sessionState).toBe('unavailable');

    await session.close('completed');

    expect(session.telemetry).toMatchObject({
      closeReason: 'completed',
      sessionState: 'closed',
    });
  });

  it('tracks lifecycle events and delegates closing to the sandbox session', async () => {
    mockBuildWorkspaceManifest.mockReturnValue({
      enabled: true,
      hasRuntimeAccess: true,
      provider: 'e2b',
      template: 'base',
      toolPolicy: {
        allowCommands: true,
        allowFilesystem: true,
      },
      workspaceRoot: '/workspace',
    });

    const session = createWorkspaceSession({
      sandboxSettings: { enabled: true } as never,
    });
    const sandboxSession = sandboxInstances[0];

    expect(sandboxSession).toBeDefined();
    expect(session.telemetry.sessionState).toBe('configured');

    sandboxSession?.options?.onLifecycleEvent?.({
      type: 'connecting',
    });
    expect(session.telemetry.sessionState).toBe('connecting');

    sandboxSession?.options?.onLifecycleEvent?.({
      sandboxId: 'sandbox_123',
      type: 'connected',
    });
    expect(session.telemetry).toMatchObject({
      closeReason: null,
      sandboxCreated: true,
      sandboxId: 'sandbox_123',
      sessionState: 'ready',
    });

    sandboxSession?.options?.onLifecycleEvent?.({
      type: 'connect_failed',
    });
    expect(session.telemetry).toMatchObject({
      sandboxId: null,
      sessionState: 'configured',
    });

    sandboxSession?.options?.onLifecycleEvent?.({
      type: 'recovering',
    });
    expect(session.telemetry.sessionState).toBe('recovering');

    await session.close('error');

    expect(sandboxSession?.close).toHaveBeenCalledWith('error');
    expect(session.telemetry).toMatchObject({
      closeReason: 'error',
      sessionState: 'closed',
    });
  });
});
