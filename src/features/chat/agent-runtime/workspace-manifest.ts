import { posix as pathPosix } from 'node:path';

import { SANDBOX_CONFIG } from '@/config/sandbox';
import {
  getSandboxToolPolicy,
  hasSandboxAccess,
  parseSandboxEnvVars,
  resolveSandboxWorkingDirectory,
} from '@/features/sandbox/settings';
import type { SandboxAccessSettings, SandboxSettings } from '@/features/sandbox/types';

export interface AgentWorkspaceToolPolicy {
  allowCommands: boolean;
  allowFilesystem: boolean;
}

export interface AgentWorkspaceManifest {
  access: SandboxAccessSettings;
  autoPause: boolean;
  enabled: boolean;
  envVars: Record<string, string>;
  hasRuntimeAccess: boolean;
  provider: SandboxSettings['provider'];
  secure: boolean;
  template: string;
  timeoutSeconds: number;
  toolPolicy: AgentWorkspaceToolPolicy;
  workspaceRoot: string;
}

function resolveWorkspaceRoot(workingDirectory: string) {
  return pathPosix.resolve(resolveSandboxWorkingDirectory(workingDirectory));
}

export function buildWorkspaceManifest(options: {
  sandboxSettings?: SandboxSettings | null;
}): AgentWorkspaceManifest | null {
  const { sandboxSettings } = options;

  if (!sandboxSettings) {
    return null;
  }

  return {
    access: sandboxSettings.access,
    autoPause: sandboxSettings.autoPause,
    enabled: sandboxSettings.enabled,
    envVars: parseSandboxEnvVars(sandboxSettings.envVarsText),
    hasRuntimeAccess: hasSandboxAccess(sandboxSettings),
    provider: sandboxSettings.provider,
    secure: sandboxSettings.secure,
    template: sandboxSettings.template.trim() || SANDBOX_CONFIG.DEFAULT_TEMPLATE,
    timeoutSeconds: sandboxSettings.timeoutSeconds,
    toolPolicy: getSandboxToolPolicy(sandboxSettings),
    workspaceRoot: resolveWorkspaceRoot(sandboxSettings.workingDirectory),
  };
}
