import { SANDBOX_CONFIG } from '@/config/sandbox';
import type { SandboxSettings } from '@/features/sandbox/types';

function clamp(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

export function hasSandboxAccess(settings: SandboxSettings | null | undefined) {
  return Boolean(settings?.enabled && settings.apiKey.trim().length > 0);
}

export function getSandboxToolPolicy(settings: SandboxSettings | null | undefined) {
  return {
    allowCommands: Boolean(settings?.enabled && settings?.access.allowCommands),
    allowFilesystem: Boolean(settings?.enabled && settings?.access.allowFilesystem),
  };
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

export function resolveSandboxWorkingDirectory(workingDirectory: string | null | undefined) {
  const trimmed = workingDirectory?.trim();

  if (!trimmed || trimmed === SANDBOX_CONFIG.LEGACY_DEFAULT_WORKING_DIRECTORY) {
    return SANDBOX_CONFIG.DEFAULT_WORKING_DIRECTORY;
  }

  return trimmed;
}

export function normalizeSandboxSettings(input: unknown): SandboxSettings {
  const existing =
    typeof input === 'object' && input != null ? (input as Partial<SandboxSettings>) : undefined;

  return {
    access: {
      allowCommands: existing?.access?.allowCommands ?? true,
      allowFileDownload: existing?.access?.allowFileDownload ?? true,
      allowFileUpload: existing?.access?.allowFileUpload ?? true,
      allowFilesystem: existing?.access?.allowFilesystem ?? true,
      allowInternetAccess: existing?.access?.allowInternetAccess ?? true,
      allowPty: existing?.access?.allowPty ?? false,
    },
    apiKey: typeof existing?.apiKey === 'string' ? existing.apiKey : '',
    autoPause: existing?.autoPause ?? false,
    enabled: existing?.enabled ?? false,
    envVarsText:
      typeof existing?.envVarsText === 'string'
        ? existing.envVarsText
        : SANDBOX_CONFIG.DEFAULT_ENV_VARS_TEXT,
    provider: existing?.provider === 'e2b' ? existing.provider : SANDBOX_CONFIG.DEFAULT_PROVIDER,
    secure: existing?.secure ?? true,
    template:
      typeof existing?.template === 'string' && existing.template.trim().length > 0
        ? existing.template
        : SANDBOX_CONFIG.DEFAULT_TEMPLATE,
    timeoutSeconds: clamp(
      existing?.timeoutSeconds,
      SANDBOX_CONFIG.DEFAULT_TIMEOUT_SECONDS,
      SANDBOX_CONFIG.TIMEOUT_MIN_SECONDS,
      SANDBOX_CONFIG.TIMEOUT_MAX_SECONDS
    ),
    workingDirectory: resolveSandboxWorkingDirectory(existing?.workingDirectory),
  };
}
