import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

import type { ChatRuntimeModel } from '@/features/models/types';
import { normalizeProviderBaseUrl } from '@/features/models/utils/runtime-model';

export function getRuntimeChatModel(runtimeModel: ChatRuntimeModel) {
  const baseURL = normalizeProviderBaseUrl(runtimeModel.apiFormat, runtimeModel.baseUrl);

  if (runtimeModel.apiFormat === 'anthropic') {
    const provider = createAnthropic({
      apiKey: runtimeModel.apiKey,
      baseURL,
      name: `${runtimeModel.providerId}.messages`,
    });

    return provider.chat(runtimeModel.modelId);
  }

  const provider = createOpenAI({
    apiKey: runtimeModel.apiKey,
    baseURL,
    name: runtimeModel.providerId,
  });

  return provider.chat(runtimeModel.modelId);
}
