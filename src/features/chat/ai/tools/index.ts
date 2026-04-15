import type { ToolSet } from 'ai';

import { createSandboxReadFileTool } from '@/features/chat/ai/tools/sandbox_read_file';
import { createSandboxRunCommandTool } from '@/features/chat/ai/tools/sandbox_run_command';
import { createSandboxWriteFileTool } from '@/features/chat/ai/tools/sandbox_write_file';
import { createWebCrawlTool } from '@/features/chat/ai/tools/web_crawl';
import { createWebExtractTool } from '@/features/chat/ai/tools/web_extract';
import { createWebSearchTool } from '@/features/chat/ai/tools/web_search';
import { getSandboxToolPolicy } from '@/features/sandbox/settings';
import type { SandboxSession } from '@/features/sandbox/server/e2b-client';
import type { SandboxSettings } from '@/features/sandbox/types';
import type { SearchSettings } from '@/features/search/types';

export function buildSearchAgentTools(options: {
  searchSettings?: SearchSettings | null;
}): ToolSet {
  const webCrawlTool = createWebCrawlTool(options.searchSettings);
  const webExtractTool = createWebExtractTool(options.searchSettings);
  const webSearchTool = createWebSearchTool(options.searchSettings);

  return {
    ...(webCrawlTool ? { web_crawl: webCrawlTool } : {}),
    ...(webExtractTool ? { web_extract: webExtractTool } : {}),
    ...(webSearchTool ? { web_search: webSearchTool } : {}),
  };
}

export function buildSandboxAgentTools(options: {
  sandboxSession: SandboxSession | null;
  sandboxSettings?: SandboxSettings | null;
}): ToolSet {
  const { sandboxSession, sandboxSettings } = options;

  if (!sandboxSession || !sandboxSettings?.enabled) {
    return {};
  }

  const toolPolicy = getSandboxToolPolicy(sandboxSettings);
  const sandboxReadFileTool = toolPolicy.allowFilesystem
    ? createSandboxReadFileTool(sandboxSession)
    : null;
  const sandboxRunCommandTool = toolPolicy.allowCommands
    ? createSandboxRunCommandTool(sandboxSession)
    : null;
  const sandboxWriteFileTool = toolPolicy.allowFilesystem
    ? createSandboxWriteFileTool(sandboxSession)
    : null;

  return {
    ...(sandboxReadFileTool ? { sandbox_read_file: sandboxReadFileTool } : {}),
    ...(sandboxRunCommandTool ? { sandbox_run_command: sandboxRunCommandTool } : {}),
    ...(sandboxWriteFileTool ? { sandbox_write_file: sandboxWriteFileTool } : {}),
  };
}
