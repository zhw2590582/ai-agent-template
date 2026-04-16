import type { SandboxSettings } from '@/features/sandbox/types';

export type SandboxRuntimeCloseReason = 'completed' | 'error' | 'idle_timeout';

export type SandboxRuntimeLifecycleEvent =
  | { type: 'connect_failed' }
  | { type: 'connected'; sandboxId: string }
  | { type: 'connecting' }
  | { type: 'recovering' }
  | { reason: SandboxRuntimeCloseReason; type: 'closed' };

export interface SandboxRuntimeSessionOptions {
  onLifecycleEvent?: (event: SandboxRuntimeLifecycleEvent) => void;
}

export interface SandboxRuntimeSession {
  close: (reason?: SandboxRuntimeCloseReason) => Promise<void>;
  readFile: (path: string) => Promise<{
    content: string;
    path: string;
  }>;
  resolveWorkingDirectory: (cwd?: string | null) => string;
  resolveWorkspacePath: (path: string) => string;
  runCommand: (input: {
    command: string;
    cwd?: string | null;
    envs?: Record<string, string>;
    timeoutMs?: number;
  }) => Promise<{
    cwd: string;
    exitCode: number;
    stderr: string;
    stdout: string;
    timeoutSeconds: number;
  }>;
  writeFile: (input: { content: string; path: string }) => Promise<{
    path: string;
    writtenPath: string;
  }>;
}

export interface SandboxRuntimeProvider {
  createSession: (
    settings: SandboxSettings,
    options?: SandboxRuntimeSessionOptions
  ) => SandboxRuntimeSession;
  testConnection: (settings: SandboxSettings) => Promise<{
    sandboxId: string;
    template: string;
  }>;
}
