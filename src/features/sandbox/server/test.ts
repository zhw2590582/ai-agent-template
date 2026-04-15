import type { SandboxSettings } from '@/features/sandbox/types';
import { testSandboxConnection } from '@/features/sandbox/server/e2b-client';

export async function runSandboxConnectionTest(settings: SandboxSettings) {
  return testSandboxConnection(settings);
}
