import { tool } from 'ai';
import { z } from 'zod';

import type { SandboxRuntimeSession } from '@/features/sandbox/server/providers/sandbox-provider';

export function createSandboxReadFileTool(session: SandboxRuntimeSession | null) {
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
