import { SANDBOX_CONFIG } from '@/config/sandbox';
import { E2BSandboxSession, testE2BSandboxConnection } from '@/features/sandbox/server/e2b-client';
import type {
  SandboxRuntimeProvider,
  SandboxRuntimeSessionOptions,
} from '@/features/sandbox/server/providers/sandbox-provider';
import type { SandboxProviderId, SandboxSettings } from '@/features/sandbox/types';

const sandboxProviderDefinitions: Record<SandboxProviderId, SandboxRuntimeProvider> = {
  e2b: {
    createSession: (settings, options) => new E2BSandboxSession(settings, options),
    testConnection: testE2BSandboxConnection,
  },
};

export function resolveSandboxProvider(provider?: SandboxProviderId | null): SandboxProviderId {
  return provider === 'e2b' ? provider : SANDBOX_CONFIG.DEFAULT_PROVIDER;
}

function getSandboxProviderDefinition(provider?: SandboxProviderId | null) {
  return sandboxProviderDefinitions[resolveSandboxProvider(provider)];
}

export function createSandboxRuntimeSession(
  settings: SandboxSettings,
  options?: SandboxRuntimeSessionOptions
) {
  return getSandboxProviderDefinition(settings.provider).createSession(settings, options);
}

export async function runSandboxConnectionTest(settings: SandboxSettings) {
  return getSandboxProviderDefinition(settings.provider).testConnection(settings);
}
