import type {
  ChatModelOption,
  ChatRuntimeModel,
  ProviderModelItem,
  ProviderSettings,
} from '@/features/models/types';
import type { AppProfileSettings } from '@/features/auth/profile/types';

export function normalizeProviderBaseUrl(
  apiFormat: ProviderSettings['apiFormat'],
  baseUrl: string
) {
  const trimmedBaseUrl = baseUrl.trim().replace(/\/+$/, '');

  if (!trimmedBaseUrl) {
    return '';
  }

  if (apiFormat === 'anthropic' && !trimmedBaseUrl.endsWith('/v1')) {
    return `${trimmedBaseUrl}/v1`;
  }

  return trimmedBaseUrl;
}

function isProviderConfigured(provider: ProviderSettings) {
  return (
    provider.enabled && provider.apiKey.trim().length > 0 && provider.baseUrl.trim().length > 0
  );
}

function isModelConfigured(model: ProviderModelItem) {
  return model.enabled && model.id.trim().length > 0;
}

export function getChatModelOptions(settings: AppProfileSettings): ChatModelOption[] {
  return Object.values(settings.models.providers).flatMap((provider) => {
    if (!isProviderConfigured(provider)) {
      return [];
    }

    return provider.models.filter(isModelConfigured).map((model) => ({
      id: `${provider.id}::${model.id.trim()}`,
      modelId: model.id.trim(),
      providerId: provider.id,
      providerName: provider.name.trim() || provider.id,
      title: model.name.trim() || model.id.trim(),
    }));
  });
}

export function resolveChatRuntimeModel(
  settings: AppProfileSettings,
  requestedModelId?: string | null
): ChatRuntimeModel | null {
  const availableModels = getChatModelOptions(settings);
  const selectedOption =
    availableModels.find(
      (model) => model.id === requestedModelId || model.modelId === requestedModelId
    ) ?? availableModels[0];

  if (!selectedOption) {
    return null;
  }

  const provider = settings.models.providers[selectedOption.providerId];

  if (!provider || !isProviderConfigured(provider)) {
    return null;
  }

  return {
    apiFormat: provider.apiFormat,
    apiKey: provider.apiKey.trim(),
    baseUrl: normalizeProviderBaseUrl(provider.apiFormat, provider.baseUrl),
    modelId: selectedOption.modelId,
    providerId: selectedOption.providerId,
  };
}
