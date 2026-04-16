import type { SandboxSettings } from '@/features/sandbox/types';
import { runSandboxConnectionTest as runSandboxProviderConnectionTest } from '@/features/sandbox/server/providers';

export async function runSandboxConnectionTest(settings: SandboxSettings) {
  return runSandboxProviderConnectionTest(settings);
}
