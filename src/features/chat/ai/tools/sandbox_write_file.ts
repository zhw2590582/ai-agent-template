import { tool } from 'ai';
import { z } from 'zod';

import type { SandboxRuntimeSession } from '@/features/sandbox/server/providers/sandbox-provider';

export function createSandboxWriteFileTool(session: SandboxRuntimeSession | null) {
  if (!session) {
    return null;
  }

  return tool({
    description:
      'Write a text file into the configured E2B sandbox. Use this to create scripts, config files, or source files before running commands.',
    inputSchema: z.object({
      content: z
        .string()
        .max(100_000)
        .describe('Text content to write into the file. Maximum 100,000 characters.'),
      path: z
        .string()
        .min(1)
        .describe(
          'Workspace-relative path, or an absolute path that stays inside the workspace root'
        ),
    }),
    execute: async ({ content, path }) => {
      return session.writeFile({
        content,
        path,
      });
    },
  });
}
