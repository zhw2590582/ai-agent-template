import type { SandboxSettings } from '@/features/sandbox/types';
import { listE2BTemplates, testSandboxConnection } from '@/features/sandbox/server/e2b-client';

export async function runSandboxConnectionTest(settings: SandboxSettings) {
  return testSandboxConnection(settings);
}

export async function listSandboxTemplates(apiKey: string) {
  return listE2BTemplates(apiKey);
}
