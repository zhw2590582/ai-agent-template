import { tool } from 'ai';
import { z } from 'zod';

import type { SandboxSession } from '@/features/sandbox/server/e2b-client';

export function createSandboxReadFileTool(session: SandboxSession | null) {
  if (!session) {
    return null;
  }

  return tool({
    description:
      'Read a text file from the configured E2B sandbox. Use this after writing files or when a command created output that should be inspected.',
    inputSchema: z.object({
      path: z
        .string()
        .min(1)
        .describe(
          'Workspace-relative path, or an absolute path that stays inside the workspace root'
        ),
    }),
    execute: async ({ path }) => {
      return session.readFile(path);
    },
  });
}
