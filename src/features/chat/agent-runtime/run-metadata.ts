import type { ChatRuntimeModel } from '@/features/models/types';
import type { AgentWorkspaceManifest } from '@/features/chat/agent-runtime/workspace-manifest';
import type { AgentWorkspaceTelemetry } from '@/features/chat/agent-runtime/workspace-session';

export interface AgentRunMetadataBase {
  conversationId: string | null;
  hasAgentTools: boolean;
  hasSearchTools: boolean;
  mcpServerNames: string[];
  runtimeModel: ChatRuntimeModel;
  userId: string | null;
  workspaceManifest: AgentWorkspaceManifest | null;
  workspaceTelemetry: AgentWorkspaceTelemetry;
}

export interface AgentRunMetadata extends AgentRunMetadataBase {
  ragSourceCount: number;
}

export function createAgentRunMetadataBase(metadata: AgentRunMetadataBase): AgentRunMetadataBase {
  return metadata;
}

export function createAgentRunMetadata(
  metadata: AgentRunMetadataBase,
  options: {
    ragSourceCount: number;
  }
): AgentRunMetadata {
  return {
    ...metadata,
    ragSourceCount: options.ragSourceCount,
  };
}

export function buildAgentRunMetadataContext(metadata: AgentRunMetadata) {
  return {
    conversationId: metadata.conversationId,
    hasAgentTools: metadata.hasAgentTools,
    hasSearchTools: metadata.hasSearchTools,
    mcpServerCount: metadata.mcpServerNames.length,
    mcpServerNames: metadata.mcpServerNames,
    modelId: metadata.runtimeModel.modelId,
    providerId: metadata.runtimeModel.providerId,
    ragSourceCount: metadata.ragSourceCount,
    userId: metadata.userId,
    workspaceCloseReason: metadata.workspaceTelemetry.closeReason,
    workspaceCreatedAt: metadata.workspaceTelemetry.createdAt,
    workspaceEnabled: metadata.workspaceManifest?.enabled ?? false,
    workspaceHasRuntimeAccess: metadata.workspaceManifest?.hasRuntimeAccess ?? false,
    workspaceLastEventAt: metadata.workspaceTelemetry.lastEventAt,
    workspaceProvider: metadata.workspaceManifest?.provider ?? null,
    workspaceRoot: metadata.workspaceManifest?.workspaceRoot ?? null,
    workspaceSandboxCreated: metadata.workspaceTelemetry.sandboxCreated,
    workspaceSandboxId: metadata.workspaceTelemetry.sandboxId,
    workspaceSessionState: metadata.workspaceTelemetry.sessionState,
    workspaceTemplate: metadata.workspaceManifest?.template ?? null,
    workspaceToolCommandsEnabled: metadata.workspaceManifest?.toolPolicy.allowCommands ?? false,
    workspaceToolFilesystemEnabled: metadata.workspaceManifest?.toolPolicy.allowFilesystem ?? false,
  };
}
