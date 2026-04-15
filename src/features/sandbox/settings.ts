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
    allowCommands: Boolean(settings?.enabled),
    allowFilesystem: Boolean(settings?.enabled),
  };
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
    workingDirectory:
      typeof existing?.workingDirectory === 'string' && existing.workingDirectory.trim().length > 0
        ? existing.workingDirectory
        : SANDBOX_CONFIG.DEFAULT_WORKING_DIRECTORY,
  };
}
