import { getUserFacingModelErrorDetails } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { executeAgentRun } from '@/features/chat/agent-runtime/execute-agent-run';
import { createAgentRunFinishHandler } from '@/features/chat/agent-runtime/finish-agent-run';
import { createAgentRunMetadata } from '@/features/chat/agent-runtime/run-metadata';
import {
  logAgentRunFailed,
  logAgentRunPrepared,
} from '@/features/chat/agent-runtime/run-telemetry';
import type { CreateAgentRunResponseOptions } from '@/features/chat/agent-runtime/types';

export async function createAgentRunResponse({
  closeAgentResources,
  hasAgentTools,
  locale,
  memorySettings,
  ragSources = [],
  runMetadataBase,
  supabase,
  user,
  ...executeOptions
}: CreateAgentRunResponseOptions) {
  let result;
  const runMetadata = createAgentRunMetadata(runMetadataBase, {
    ragSourceCount: ragSources.length,
  });

  logAgentRunPrepared({
    messageCount: executeOptions.messages.length,
    runMetadata,
  });

  try {
    result = await executeAgentRun({
      ...executeOptions,
      hasAgentTools,
      locale,
      memorySettings,
    });
  } catch (error) {
    await closeAgentResources?.();
    logAgentRunFailed({
      error,
      runMetadata,
      stage: 'execute',
    });
    throw error;
  }

  if (typeof result.consumeStream === 'function') {
    result.consumeStream();
  }

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type !== 'finish' || ragSources.length === 0) {
        return undefined;
      }

      return {
        ragSources,
      };
    },
    originalMessages: executeOptions.messages,
    onFinish: createAgentRunFinishHandler({
      closeAgentResources,
      locale,
      memorySettings,
      runMetadata,
      supabase,
      user,
    }),
    onError: (error) => {
      logAgentRunFailed({
        error,
        runMetadata,
        stage: 'stream',
      });

      if (error instanceof Error) {
        return getUserFacingModelErrorDetails(error.message);
      }

      return t(locale, 'chat.errors.request_failed');
    },
  });
}
