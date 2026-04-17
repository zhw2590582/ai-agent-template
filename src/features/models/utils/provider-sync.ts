import type { ModelsSettings, ProviderSettings } from '@/features/models/types';

function getProviderConnectionSignature(
  provider: Pick<ProviderSettings, 'apiFormat' | 'apiKey' | 'baseUrl'>
) {
  return JSON.stringify({
    apiFormat: provider.apiFormat,
    apiKey: provider.apiKey.trim(),
    baseUrl: provider.baseUrl.trim(),
  });
}

export function shouldRefreshProviderCatalog({
  draftProvider,
  savedProvider,
}: {
  draftProvider: ProviderSettings;
  savedProvider?: ProviderSettings;
}) {
  if (!draftProvider.apiKey.trim() || !draftProvider.baseUrl.trim()) {
    return false;
  }

  if (draftProvider.models.length === 0) {
    return true;
  }

  if (!savedProvider) {
    return false;
  }

  return (
    getProviderConnectionSignature(draftProvider) !== getProviderConnectionSignature(savedProvider)
  );
}

export function getProvidersRequiringCatalogRefresh({
  draftModels,
  savedModels,
}: {
  draftModels: ModelsSettings;
  savedModels: ModelsSettings;
}) {
  return Object.values(draftModels.providers).filter((provider) =>
    shouldRefreshProviderCatalog({
      draftProvider: provider,
      savedProvider: savedModels.providers[provider.id],
    })
  );
}
