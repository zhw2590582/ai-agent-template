import type { ToolSet } from 'ai';

import { createSandboxReadFileTool } from '@/features/chat/ai/tools/sandbox_read_file';
import { createSandboxRunCommandTool } from '@/features/chat/ai/tools/sandbox_run_command';
import { createSandboxWriteFileTool } from '@/features/chat/ai/tools/sandbox_write_file';
import { createWebCrawlTool } from '@/features/chat/ai/tools/web_crawl';
import { createWebExtractTool } from '@/features/chat/ai/tools/web_extract';
import { createWebSearchTool } from '@/features/chat/ai/tools/web_search';
import type { McpInjectedToolMetadata } from '@/features/chat/agent-runtime/types';
import type { AgentWorkspaceSession } from '@/features/chat/agent-runtime/workspace-session';
import { createWorkspaceSession } from '@/features/chat/agent-runtime/workspace-session';
import type { AgentWorkspaceTelemetry } from '@/features/chat/agent-runtime/workspace-session';
import { createMcpAgentToolBundles } from '@/features/mcp/server/mcp-client';
import type { McpSettings } from '@/features/mcp/types';
import type { AgentWorkspaceManifest } from '@/features/chat/agent-runtime/workspace-manifest';
import type { SandboxSettings } from '@/features/sandbox/types';
import type { SearchSettings } from '@/features/search/types';
import { logger } from '@/lib/logger';

export function buildSearchAgentTools(options: {
  searchSettings?: SearchSettings | null;
}): ToolSet {
  if (!options.searchSettings?.enabled) {
    return {};
  }

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
  workspaceSession: AgentWorkspaceSession;
}): ToolSet {
  const { workspaceSession } = options;
  const { manifest, sandboxSession } = workspaceSession;

  if (!sandboxSession || !manifest?.enabled) {
    return {};
  }

  const toolPolicy = manifest.toolPolicy;
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

interface BuildAgentToolsetOptions {
  mcpSettings?: McpSettings | null;
  sandboxSettings?: SandboxSettings | null;
  searchSettings?: SearchSettings | null;
}

interface BuildAgentToolsetResult {
  agentTools: ToolSet;
  closeAgentResources: () => Promise<void>;
  closeAgentResourcesOnError: () => Promise<void>;
  hasSearchTools: boolean;
  mcpInjectedTools: McpInjectedToolMetadata[];
  mcpServerNames: string[];
  workspaceManifest: AgentWorkspaceManifest | null;
  workspaceTelemetry: AgentWorkspaceTelemetry;
}

export async function buildAgentToolset({
  mcpSettings,
  sandboxSettings,
  searchSettings,
}: BuildAgentToolsetOptions): Promise<BuildAgentToolsetResult> {
  const searchAgentTools = buildSearchAgentTools({
    searchSettings,
  });
  const workspaceSession = createWorkspaceSession({
    sandboxSettings,
  });
  const sandboxAgentTools = buildSandboxAgentTools({
    workspaceSession,
  });
  let agentTools: ToolSet = {
    ...searchAgentTools,
    ...sandboxAgentTools,
  };
  let mcpInjectedTools: McpInjectedToolMetadata[] = [];
  let mcpServerNames: string[] = [];
  let closeAgentResources = async () => {
    await workspaceSession.close('completed');
  };
  let closeAgentResourcesOnError = async () => {
    await workspaceSession.close('error');
  };

  if (mcpSettings?.enabled && mcpSettings.servers.some((server) => server.enabled)) {
    try {
      const mcpBundle = await createMcpAgentToolBundles(mcpSettings);
      agentTools = {
        ...searchAgentTools,
        ...sandboxAgentTools,
        ...mcpBundle.tools,
      };
      mcpInjectedTools = mcpBundle.injectedTools;
      mcpServerNames = mcpBundle.serverNames;
      closeAgentResources = async () => {
        await workspaceSession.close('completed');
        await Promise.all(mcpBundle.clients.map((client) => client.close()));
      };
      closeAgentResourcesOnError = async () => {
        await workspaceSession.close('error');
        await Promise.all(mcpBundle.clients.map((client) => client.close()));
      };

      logger.info('Chat request: initialized MCP tools', {
        injectedToolNames: mcpBundle.injectedTools.map((tool) => tool.injectedToolName),
        mcpServerNames: mcpBundle.serverNames,
        serverCount: mcpBundle.serverNames.length,
        toolCount: mcpBundle.injectedTools.length,
      });
    } catch (error) {
      logger.warn('Chat request: failed to initialize MCP tools', {
        error: error instanceof Error ? error.message : String(error),
        serverCount: mcpSettings.servers.length,
      });
    }
  }

  return {
    agentTools,
    closeAgentResources,
    closeAgentResourcesOnError,
    hasSearchTools: Object.keys(searchAgentTools).length > 0,
    mcpInjectedTools,
    mcpServerNames,
    workspaceManifest: workspaceSession.manifest,
    workspaceTelemetry: workspaceSession.telemetry,
  };
}
