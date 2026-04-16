import { posix as pathPosix } from 'node:path';

import { Sandbox } from 'e2b';

import { SANDBOX_CONFIG } from '@/config/sandbox';
import { logger } from '@/lib/logger';
import type { SandboxSettings } from '@/features/sandbox/types';

const SESSION_RECOVERY_ERROR_PATTERNS = [
  'sandbox is not running',
  'sandbox not found',
  'connection closed',
  'socket hang up',
  'session closed',
];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function toSandboxUserErrorMessage(
  operation: 'connect' | 'read_file' | 'run_command' | 'write_file',
  error: unknown,
  options?: {
    path?: string;
    timeoutMs?: number;
  }
) {
  const message = getErrorMessage(error);
  const normalized = message.toLowerCase();

  if (normalized.includes('api key') || normalized.includes('unauthorized')) {
    return 'Sandbox authentication failed. Check your E2B API key.';
  }

  if (normalized.includes('template') && normalized.includes('not found')) {
    return 'Sandbox template not found. Check the configured template name.';
  }

  if (normalized.includes('must stay inside the workspace root')) {
    return `Sandbox paths must stay inside the working directory: ${options?.path ?? 'requested path'}`;
  }

  if (normalized.includes('no such file') || normalized.includes('not found')) {
    if (operation === 'read_file') {
      return `Sandbox file not found: ${options?.path ?? 'requested file'}`;
    }
  }

  if (normalized.includes('write limit exceeded')) {
    return message;
  }

  if (normalized.includes('timed out') || normalized.includes('deadline_exceeded')) {
    if (operation === 'run_command') {
      const timeoutSeconds = Math.round((options?.timeoutMs ?? 0) / 1000);
      return `Sandbox command timed out after ${timeoutSeconds || SANDBOX_CONFIG.TOOL_COMMAND_TIMEOUT_DEFAULT_SECONDS} seconds.`;
    }

    return 'Sandbox request timed out. Please try again.';
  }

  if (operation === 'connect') {
    return 'Sandbox connection failed. Check your API key, template, and network settings.';
  }

  if (operation === 'run_command') {
    return `Sandbox command failed to start or complete. ${message}`;
  }

  if (operation === 'read_file') {
    return `Sandbox could not read the requested file. ${message}`;
  }

  return `Sandbox could not write the requested file. ${message}`;
}

function trimOutput(value: string, maxChars: number) {
  if (value.length <= maxChars) {
    return value;
  }

  return `${value.slice(0, maxChars)}\n...[truncated]`;
}

function clampToolTimeoutMs(timeoutMs?: number) {
  const requestedSeconds =
    typeof timeoutMs === 'number' && Number.isFinite(timeoutMs) ? timeoutMs / 1000 : undefined;
  const timeoutSeconds = requestedSeconds
    ? Math.max(1, Math.round(requestedSeconds))
    : SANDBOX_CONFIG.TOOL_COMMAND_TIMEOUT_DEFAULT_SECONDS;

  return Math.min(timeoutSeconds, SANDBOX_CONFIG.TOOL_COMMAND_TIMEOUT_MAX_SECONDS) * 1000;
}

function getIdleReuseWindowMs() {
  return SANDBOX_CONFIG.TOOL_IDLE_REUSE_WINDOW_SECONDS * 1000;
}

function isRecoverableSandboxError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  return SESSION_RECOVERY_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

function getWorkspaceRoot(settings: SandboxSettings) {
  return pathPosix.resolve(
    settings.workingDirectory.trim() || SANDBOX_CONFIG.DEFAULT_WORKING_DIRECTORY
  );
}

function ensureWorkspacePath(path: string, workspaceRoot: string) {
  const trimmedPath = path.trim();

  if (!trimmedPath) {
    throw new Error('Sandbox path cannot be empty.');
  }

  const resolvedPath = trimmedPath.startsWith('/')
    ? pathPosix.resolve(trimmedPath)
    : pathPosix.resolve(workspaceRoot, trimmedPath);

  if (resolvedPath !== workspaceRoot && !resolvedPath.startsWith(`${workspaceRoot}/`)) {
    throw new Error(`Sandbox paths must stay inside the workspace root: ${workspaceRoot}`);
  }

  return resolvedPath;
}

export function parseSandboxEnvVars(envVarsText: string) {
  const result: Record<string, string> = {};

  for (const line of envVarsText.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1);

    if (!key) {
      continue;
    }

    result[key] = value;
  }

  return result;
}

function buildSandboxCreateOptions(settings: SandboxSettings) {
  return {
    allowInternetAccess: settings.access.allowInternetAccess,
    apiKey: settings.apiKey.trim(),
    envs: parseSandboxEnvVars(settings.envVarsText),
    lifecycle: {
      onTimeout: settings.autoPause ? 'pause' : 'kill',
    } as const,
    metadata: {
      source: 'ai-agent-template',
    },
    secure: settings.secure,
    timeoutMs: settings.timeoutSeconds * 1000,
  };
}

export async function createE2BSandbox(settings: SandboxSettings) {
  const template = settings.template.trim() || SANDBOX_CONFIG.DEFAULT_TEMPLATE;

  return Sandbox.create(template, buildSandboxCreateOptions(settings));
}

export async function testSandboxConnection(settings: SandboxSettings) {
  try {
    const sandbox = await createE2BSandbox(settings);

    try {
      return {
        sandboxId: sandbox.sandboxId,
        template: settings.template.trim() || SANDBOX_CONFIG.DEFAULT_TEMPLATE,
      };
    } finally {
      await closeSandboxQuietly(sandbox);
    }
  } catch (error) {
    throw new Error(toSandboxUserErrorMessage('connect', error));
  }
}

export type SandboxSessionCloseReason = 'completed' | 'error' | 'idle_timeout';

export type SandboxSessionLifecycleEvent =
  | { type: 'connect_failed' }
  | { type: 'connected'; sandboxId: string }
  | { type: 'connecting' }
  | { type: 'recovering' }
  | { reason: SandboxSessionCloseReason; type: 'closed' };

interface SandboxSessionOptions {
  onLifecycleEvent?: (event: SandboxSessionLifecycleEvent) => void;
}

async function closeSandboxQuietly(sandbox: Sandbox) {
  try {
    await sandbox.kill();
  } catch {
    // Ignore teardown failures for user-facing operations.
  }
}

export class SandboxSession {
  private idleCloseTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly options?: SandboxSessionOptions;

  private readonly workspaceRoot: string;

  private sandboxPromise: Promise<Sandbox> | null = null;

  constructor(
    private readonly settings: SandboxSettings,
    options?: SandboxSessionOptions
  ) {
    this.options = options;
    this.workspaceRoot = getWorkspaceRoot(settings);
  }

  private clearIdleCloseTimer() {
    if (this.idleCloseTimer) {
      clearTimeout(this.idleCloseTimer);
      this.idleCloseTimer = null;
    }
  }

  private scheduleIdleClose() {
    this.clearIdleCloseTimer();
    this.idleCloseTimer = setTimeout(() => {
      void this.close('idle_timeout');
    }, getIdleReuseWindowMs());
  }

  private async withSessionRecovery<T>(
    operationName: string,
    callback: (sandbox: Sandbox) => Promise<T>,
    options?: {
      retryOnRecoverableError?: boolean;
    }
  ) {
    const sandbox = await this.getSandbox();
    this.clearIdleCloseTimer();

    try {
      const result = await callback(sandbox);
      this.scheduleIdleClose();
      return result;
    } catch (error) {
      if (!options?.retryOnRecoverableError || !isRecoverableSandboxError(error)) {
        this.scheduleIdleClose();
        throw error;
      }

      logger.warn('Sandbox session: recoverable runtime error, recreating sandbox', {
        error: error instanceof Error ? error.message : String(error),
        operationName,
      });

      this.options?.onLifecycleEvent?.({
        type: 'recovering',
      });
      await this.resetBrokenSession();

      const recoveredSandbox = await this.getSandbox();
      const result = await callback(recoveredSandbox);
      this.scheduleIdleClose();
      return result;
    }
  }

  private async resetBrokenSession() {
    this.clearIdleCloseTimer();

    if (!this.sandboxPromise) {
      return;
    }

    const previousPromise = this.sandboxPromise;
    this.sandboxPromise = null;

    try {
      const sandbox = await previousPromise;
      await sandbox.kill();
    } catch {
      // Ignore teardown failures while replacing a broken sandbox.
    }
  }

  async getSandbox() {
    if (!this.sandboxPromise) {
      this.options?.onLifecycleEvent?.({
        type: 'connecting',
      });
      this.sandboxPromise = createE2BSandbox(this.settings)
        .then((sandbox) => {
          this.options?.onLifecycleEvent?.({
            sandboxId: sandbox.sandboxId,
            type: 'connected',
          });

          return sandbox;
        })
        .catch((error) => {
          this.sandboxPromise = null;
          this.options?.onLifecycleEvent?.({
            type: 'connect_failed',
          });
          throw error;
        });
    }

    return this.sandboxPromise;
  }

  resolveWorkspacePath(path: string) {
    return ensureWorkspacePath(path, this.workspaceRoot);
  }

  resolveWorkingDirectory(cwd?: string | null) {
    return ensureWorkspacePath(cwd ?? this.workspaceRoot, this.workspaceRoot);
  }

  async runCommand(input: {
    command: string;
    cwd?: string | null;
    envs?: Record<string, string>;
    timeoutMs?: number;
  }) {
    const cwd = this.resolveWorkingDirectory(input.cwd);
    const timeoutMs = clampToolTimeoutMs(input.timeoutMs);

    try {
      return await this.withSessionRecovery('run_command', async (sandbox) => {
        const result = await sandbox.commands.run(input.command, {
          cwd,
          envs: input.envs,
          timeoutMs,
        });

        return {
          cwd,
          exitCode: result.exitCode,
          stderr: trimOutput(result.stderr ?? '', SANDBOX_CONFIG.MAX_COMMAND_OUTPUT_CHARS),
          stdout: trimOutput(result.stdout ?? '', SANDBOX_CONFIG.MAX_COMMAND_OUTPUT_CHARS),
          timeoutSeconds: Math.round(timeoutMs / 1000),
        };
      });
    } catch (error) {
      throw new Error(toSandboxUserErrorMessage('run_command', error, { timeoutMs }));
    }
  }

  async readFile(path: string) {
    const resolvedPath = this.resolveWorkspacePath(path);

    try {
      return await this.withSessionRecovery(
        'read_file',
        async (sandbox) => {
          const content = await sandbox.files.read(resolvedPath, {
            format: 'text',
          });

          return {
            content: trimOutput(content, SANDBOX_CONFIG.MAX_FILE_CONTENT_CHARS),
            path: resolvedPath,
          };
        },
        {
          retryOnRecoverableError: true,
        }
      );
    } catch (error) {
      throw new Error(
        toSandboxUserErrorMessage('read_file', error, {
          path: resolvedPath,
        })
      );
    }
  }

  async writeFile(input: { content: string; path: string }) {
    if (input.content.length > SANDBOX_CONFIG.MAX_WRITE_FILE_CHARS) {
      throw new Error(
        `Sandbox write limit exceeded. Maximum supported content size is ${SANDBOX_CONFIG.MAX_WRITE_FILE_CHARS} characters.`
      );
    }

    const resolvedPath = this.resolveWorkspacePath(input.path);

    try {
      return await this.withSessionRecovery(
        'write_file',
        async (sandbox) => {
          const writeInfo = await sandbox.files.write(resolvedPath, input.content);

          return {
            path: resolvedPath,
            writtenPath: writeInfo.path,
          };
        },
        {
          retryOnRecoverableError: true,
        }
      );
    } catch (error) {
      throw new Error(
        toSandboxUserErrorMessage('write_file', error, {
          path: resolvedPath,
        })
      );
    }
  }

  async close(reason: SandboxSessionCloseReason = 'completed') {
    this.clearIdleCloseTimer();

    if (!this.sandboxPromise) {
      this.options?.onLifecycleEvent?.({
        reason,
        type: 'closed',
      });
      return;
    }

    const sandboxPromise = this.sandboxPromise;
    this.sandboxPromise = null;

    try {
      const sandbox = await sandboxPromise;
      await sandbox.kill();
    } catch (error) {
      logger.warn('Sandbox session: close failed', {
        error: error instanceof Error ? error.message : String(error),
        reason,
      });
    } finally {
      this.options?.onLifecycleEvent?.({
        reason,
        type: 'closed',
      });
    }
  }
}
