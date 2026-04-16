import { tool } from 'ai';
import { z } from 'zod';

import type { SandboxRuntimeSession } from '@/features/sandbox/server/providers/sandbox-provider';

export function createSandboxRunCommandTool(session: SandboxRuntimeSession | null) {
  if (!session) {
    return null;
  }

  return tool({
    description:
      'Run a shell command inside the configured E2B sandbox. Use this for project inspection, tests, package installation, and build commands that must run in an isolated environment.',
    inputSchema: z.object({
      command: z.string().min(1).describe('The shell command to execute in the sandbox'),
      cwd: z
        .string()
        .optional()
        .describe(
          'Optional workspace-relative or workspace-rooted directory. Defaults to the configured sandbox working directory.'
        ),
      timeoutSeconds: z
        .number()
        .int()
        .min(1)
        .max(120)
        .optional()
        .describe('Optional command timeout in seconds. Maximum 120 seconds.'),
    }),
    execute: async ({ command, cwd, timeoutSeconds }) => {
      return session.runCommand({
        command,
        cwd,
        timeoutMs: timeoutSeconds ? timeoutSeconds * 1000 : undefined,
      });
    },
  });
}
