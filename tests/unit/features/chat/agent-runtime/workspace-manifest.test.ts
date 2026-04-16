/** @vitest-environment node */

import { describe, expect, it } from 'vitest';

import { SANDBOX_CONFIG } from '@/config/sandbox';
import { buildWorkspaceManifest } from '@/features/chat/agent-runtime/workspace-manifest';
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
    apiKey: 'sandbox-key',
    autoPause: false,
    enabled: true,
    envVarsText: 'FOO=bar\n# comment\nBAZ=qux',
    provider: 'e2b',
    secure: true,
    template: '  custom-template  ',
    timeoutSeconds: 300,
    workingDirectory: '  /tmp/project  ',
    ...overrides,
  };
}

describe('buildWorkspaceManifest', () => {
  it('returns null when sandbox settings are absent', () => {
    expect(
      buildWorkspaceManifest({
        sandboxSettings: null,
      })
    ).toBeNull();
  });

  it('derives workspace manifest from sandbox settings', () => {
    const manifest = buildWorkspaceManifest({
      sandboxSettings: createSandboxSettings(),
    });

    expect(manifest).toMatchObject({
      enabled: true,
      envVars: {
        BAZ: 'qux',
        FOO: 'bar',
      },
      hasRuntimeAccess: true,
      provider: 'e2b',
      template: 'custom-template',
      toolPolicy: {
        allowCommands: true,
        allowFilesystem: true,
      },
      workspaceRoot: '/tmp/project',
    });
  });

  it('falls back to default template and workspace root when settings are blank', () => {
    const manifest = buildWorkspaceManifest({
      sandboxSettings: createSandboxSettings({
        apiKey: '',
        template: '   ',
        workingDirectory: '   ',
      }),
    });

    expect(manifest?.hasRuntimeAccess).toBe(false);
    expect(manifest?.template).toBe(SANDBOX_CONFIG.DEFAULT_TEMPLATE);
    expect(manifest?.workspaceRoot).toBe(SANDBOX_CONFIG.DEFAULT_WORKING_DIRECTORY);
  });

  it('maps the legacy /workspace default to the current working directory default', () => {
    const manifest = buildWorkspaceManifest({
      sandboxSettings: createSandboxSettings({
        workingDirectory: SANDBOX_CONFIG.LEGACY_DEFAULT_WORKING_DIRECTORY,
      }),
    });

    expect(manifest?.workspaceRoot).toBe(SANDBOX_CONFIG.DEFAULT_WORKING_DIRECTORY);
  });
});
