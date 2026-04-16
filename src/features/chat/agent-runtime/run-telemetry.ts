import type { FinishReason } from 'ai';

import { logger } from '@/lib/logger';
import {
  buildAgentRunMetadataContext,
  type AgentRunMetadata,
} from '@/features/chat/agent-runtime/run-metadata';

export function logAgentRunPrepared(options: {
  messageCount: number;
  runMetadata: AgentRunMetadata;
}) {
  logger.info('Agent run: prepared', {
    ...buildAgentRunMetadataContext(options.runMetadata),
    messageCount: options.messageCount,
  });
}

export function logAgentRunFinished(options: {
  finishReason?: FinishReason;
  isAborted: boolean;
  responseMessageCount: number;
  runMetadata: AgentRunMetadata;
}) {
  logger.info('Agent run: finished', {
    ...buildAgentRunMetadataContext(options.runMetadata),
    finishReason: options.finishReason ?? null,
    isAborted: options.isAborted,
    responseMessageCount: options.responseMessageCount,
  });
}

export function logAgentRunFailed(options: {
  error: unknown;
  runMetadata: AgentRunMetadata;
  stage: 'execute' | 'stream';
}) {
  logger.error('Agent run: failed', {
    ...buildAgentRunMetadataContext(options.runMetadata),
    error: options.error instanceof Error ? options.error.message : String(options.error),
    stage: options.stage,
  });
}
