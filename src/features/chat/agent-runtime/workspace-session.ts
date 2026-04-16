import {
  SandboxSession,
  type SandboxSessionCloseReason,
  type SandboxSessionLifecycleEvent,
} from '@/features/sandbox/server/e2b-client';
import type { SandboxSettings } from '@/features/sandbox/types';
import {
  buildWorkspaceManifest,
  type AgentWorkspaceManifest,
} from '@/features/chat/agent-runtime/workspace-manifest';

export type AgentWorkspaceCloseReason = SandboxSessionCloseReason;

export type AgentWorkspaceSessionState =
  | 'closed'
  | 'configured'
  | 'connecting'
  | 'ready'
  | 'recovering'
  | 'unavailable';

export interface AgentWorkspaceTelemetry {
  closeReason: AgentWorkspaceCloseReason | null;
  createdAt: string;
  lastEventAt: string;
  sandboxCreated: boolean;
  sandboxId: string | null;
  sessionState: AgentWorkspaceSessionState;
}

export interface AgentWorkspaceSession {
  close: (reason?: AgentWorkspaceCloseReason) => Promise<void>;
  manifest: AgentWorkspaceManifest | null;
  sandboxSession: SandboxSession | null;
  telemetry: AgentWorkspaceTelemetry;
}

function createTimestamp() {
  return new Date().toISOString();
}

function updateWorkspaceTelemetry(
  telemetry: AgentWorkspaceTelemetry,
  updates: Partial<AgentWorkspaceTelemetry>
) {
  Object.assign(telemetry, updates, {
    lastEventAt: createTimestamp(),
  });
}

function applyLifecycleEvent(
  telemetry: AgentWorkspaceTelemetry,
  event: SandboxSessionLifecycleEvent
) {
  switch (event.type) {
    case 'connecting':
      updateWorkspaceTelemetry(telemetry, {
        closeReason: null,
        sessionState: 'connecting',
      });
      return;
    case 'connected':
      updateWorkspaceTelemetry(telemetry, {
        closeReason: null,
        sandboxCreated: true,
        sandboxId: event.sandboxId,
        sessionState: 'ready',
      });
      return;
    case 'connect_failed':
      updateWorkspaceTelemetry(telemetry, {
        sandboxId: null,
        sessionState: 'configured',
      });
      return;
    case 'recovering':
      updateWorkspaceTelemetry(telemetry, {
        sessionState: 'recovering',
      });
      return;
    case 'closed':
      updateWorkspaceTelemetry(telemetry, {
        closeReason: event.reason,
        sessionState: 'closed',
      });
      return;
  }
}

export function createWorkspaceSession(options: {
  sandboxSettings?: SandboxSettings | null;
}): AgentWorkspaceSession {
  const { sandboxSettings } = options;
  const manifest = buildWorkspaceManifest({
    sandboxSettings,
  });
  const createdAt = createTimestamp();
  const telemetry: AgentWorkspaceTelemetry = {
    closeReason: null,
    createdAt,
    lastEventAt: createdAt,
    sandboxCreated: false,
    sandboxId: null,
    sessionState: manifest?.hasRuntimeAccess ? 'configured' : 'unavailable',
  };
  const sandboxSession =
    manifest?.hasRuntimeAccess && sandboxSettings
      ? new SandboxSession(sandboxSettings, {
          onLifecycleEvent: (event) => {
            applyLifecycleEvent(telemetry, event);
          },
        })
      : null;

  return {
    close: async (reason = 'completed') => {
      if (!sandboxSession) {
        updateWorkspaceTelemetry(telemetry, {
          closeReason: reason,
          sessionState: 'closed',
        });
        return;
      }

      await sandboxSession.close(reason);
    },
    manifest,
    sandboxSession,
    telemetry,
  };
}
