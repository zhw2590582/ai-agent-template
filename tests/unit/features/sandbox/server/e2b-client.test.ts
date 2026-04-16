import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createMock, runMock, sandboxMock } = vi.hoisted(() => {
  const run = vi.fn();
  const sandbox = {
    commands: {
      run,
    },
    files: {
      read: vi.fn(),
      write: vi.fn(),
    },
    kill: vi.fn(async () => {}),
    sandboxId: 'sandbox_123',
  };

  return {
    createMock: vi.fn(async () => sandbox),
    runMock: run,
    sandboxMock: sandbox,
  };
});

vi.mock('e2b', () => ({
  Sandbox: {
    create: createMock,
  },
}));

import { SandboxSession } from '@/features/sandbox/server/e2b-client';
import type { SandboxSettings } from '@/features/sandbox/types';

function createSandboxSettings(overrides?: Partial<SandboxSettings>): SandboxSettings {
  return {
    access: {
      allowCommands: true,
      allowFileDownload: true,
      allowFileUpload: true,
      allowFilesystem: true,
      allowInternetAccess: true,
      allowPty: false,
    },
    apiKey: 'test-key',
    autoPause: true,
    enabled: true,
    envVarsText: '',
    secure: false,
    template: 'base',
    timeoutSeconds: 300,
    workingDirectory: '/workspace/project',
    ...overrides,
  };
}

describe('SandboxSession', () => {
  beforeEach(() => {
    createMock.mockClear();
    runMock.mockReset();
    sandboxMock.kill.mockClear();
  });

  it('creates the configured workspace root before running commands', async () => {
    runMock
      .mockResolvedValueOnce({
        exitCode: 0,
        stderr: '',
        stdout: '',
      })
      .mockResolvedValueOnce({
        exitCode: 0,
        stderr: '',
        stdout: 'ok',
      });

    const session = new SandboxSession(createSandboxSettings());
    const result = await session.runCommand({
      command: 'pwd',
    });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(runMock).toHaveBeenNthCalledWith(1, "mkdir -p -- '/workspace/project'", {
      timeoutMs: 10_000,
    });
    expect(runMock).toHaveBeenNthCalledWith(2, 'pwd', {
      cwd: '/workspace/project',
      envs: undefined,
      timeoutMs: 60_000,
    });
    expect(result).toMatchObject({
      cwd: '/workspace/project',
      exitCode: 0,
      stdout: 'ok',
    });
  });
});
