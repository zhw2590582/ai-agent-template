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
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

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
  const sandbox = await createE2BSandbox(settings);

  try {
    return {
      sandboxId: sandbox.sandboxId,
      template: settings.template.trim() || SANDBOX_CONFIG.DEFAULT_TEMPLATE,
    };
  } finally {
    await sandbox.kill();
  }
}

export class SandboxSession {
  private idleCloseTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly workspaceRoot: string;

  private sandboxPromise: Promise<Sandbox> | null = null;

  constructor(private readonly settings: SandboxSettings) {
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
      this.sandboxPromise = createE2BSandbox(this.settings);
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

    return this.withSessionRecovery('run_command', async (sandbox) => {
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
  }

  async readFile(path: string) {
    const resolvedPath = this.resolveWorkspacePath(path);

    return this.withSessionRecovery(
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
  }

  async writeFile(input: { content: string; path: string }) {
    if (input.content.length > SANDBOX_CONFIG.MAX_WRITE_FILE_CHARS) {
      throw new Error(
        `Sandbox write limit exceeded. Maximum supported content size is ${SANDBOX_CONFIG.MAX_WRITE_FILE_CHARS} characters.`
      );
    }

    const resolvedPath = this.resolveWorkspacePath(input.path);

    return this.withSessionRecovery(
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
  }

  async close(reason: 'completed' | 'error' | 'idle_timeout' = 'completed') {
    this.clearIdleCloseTimer();

    if (!this.sandboxPromise) {
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
    }
  }
}
