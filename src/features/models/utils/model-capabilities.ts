import { AppError, ErrorCode } from '@/lib/errors';
import type { ChatRuntimeModel, ModelCapability, ProviderModelItem } from '@/features/models/types';

export type NonChatModelCapability = 'audio' | 'embedding' | 'image' | 'moderation' | 'unknown';

const NON_CHAT_SEGMENT_RULES: Array<{
  capability: NonChatModelCapability;
  segments: string[];
}> = [
  {
    capability: 'embedding',
    segments: ['embedding'],
  },
  {
    capability: 'moderation',
    segments: ['moderation'],
  },
  {
    capability: 'audio',
    segments: ['audio', 'speech', 'transcription', 'transcribe', 'tts', 'asr', 'whisper'],
  },
  {
    capability: 'image',
    segments: ['image', 'vision-preview', 'text-to-image'],
  },
  {
    capability: 'unknown',
    segments: ['rerank', 'realtime'],
  },
] as const;

export function inferModelCapabilities(modelId: string): ModelCapability[] {
  const normalizedId = modelId.trim().toLowerCase();
  const nonChatCapabilities = NON_CHAT_SEGMENT_RULES.flatMap((rule) =>
    rule.segments.some((segment) => normalizedId.includes(segment)) ? [rule.capability] : []
  );

  if (nonChatCapabilities.length > 0) {
    return [...new Set(nonChatCapabilities)] as ModelCapability[];
  }

  return ['chat'];
}

export function inferProviderModelItemCapabilities(
  model: Pick<ProviderModelItem, 'capabilities' | 'id'>
) {
  return model.capabilities?.length ? model.capabilities : [...inferModelCapabilities(model.id)];
}

export function isChatCapableModel(model: Pick<ProviderModelItem, 'capabilities' | 'id'>) {
  return inferProviderModelItemCapabilities(model).includes('chat');
}

export function assertChatCapableRuntimeModel(runtimeModel: ChatRuntimeModel | null | undefined) {
  if (!runtimeModel) {
    return;
  }

  if (inferModelCapabilities(runtimeModel.modelId).includes('chat')) {
    return;
  }

  throw new AppError(
    ErrorCode.INPUT_INVALID,
    `Model "${runtimeModel.modelId}" is not supported for text chat in the current pipeline.`,
    400
  );
}
