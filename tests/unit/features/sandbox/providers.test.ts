import { describe, expect, it } from 'vitest';

import { SANDBOX_CONFIG } from '@/config/sandbox';
import {
  createSandboxRuntimeSession,
  resolveSandboxProvider,
} from '@/features/sandbox/server/providers';
import { E2BSandboxSession } from '@/features/sandbox/server/e2b-client';
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
    autoPause: false,
    enabled: true,
    envVarsText: '',
    provider: 'e2b',
    secure: true,
    template: 'base',
    timeoutSeconds: 300,
    workingDirectory: '/home/user',
    ...overrides,
  };
}

describe('sandbox provider registry', () => {
  it('resolves the current default provider', () => {
    expect(resolveSandboxProvider()).toBe(SANDBOX_CONFIG.DEFAULT_PROVIDER);
    expect(resolveSandboxProvider('e2b')).toBe('e2b');
  });

  it('creates the e2b runtime session through the factory surface', () => {
    expect(createSandboxRuntimeSession(createSandboxSettings())).toBeInstanceOf(E2BSandboxSession);
  });
});
