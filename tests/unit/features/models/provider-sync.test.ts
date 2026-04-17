import { describe, expect, it } from 'vitest';

import { normalizeProfileSettings } from '@/features/auth/profile/profile-settings';
import { getOrderedProviders } from '@/features/models/utils/provider-order';
import {
  getProvidersRequiringCatalogRefresh,
  shouldRefreshProviderCatalog,
} from '@/features/models/utils/provider-sync';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('model provider sync helpers', () => {
  it('refreshes a provider when its catalog is empty but connection settings are present', () => {
    const settings = normalizeProfileSettings();
    const savedModels = settings.models;
    const draftModels = clone(savedModels);
    const provider = clone(getOrderedProviders(settings)[0]);

    provider.apiKey = 'test-key';
    provider.baseUrl = 'https://example.com/v1';
    provider.models = [];
    draftModels.providers[provider.id] = provider;

    expect(
      getProvidersRequiringCatalogRefresh({
        draftModels,
        savedModels,
      }).map((item) => item.id)
    ).toEqual([provider.id]);
  });

  it('refreshes a provider when its connection signature changed', () => {
    const settings = normalizeProfileSettings();
    const provider = clone(getOrderedProviders(settings)[0]);

    provider.apiKey = 'test-key';
    provider.baseUrl = 'https://example.com/v1';

    const savedProvider = clone(provider);
    provider.baseUrl = 'https://different.example.com/v1';

    expect(
      shouldRefreshProviderCatalog({
        draftProvider: provider,
        savedProvider,
      })
    ).toBe(true);
  });

  it('does not refresh a provider without a usable connection', () => {
    const settings = normalizeProfileSettings();
    const savedModels = settings.models;
    const provider = clone(getOrderedProviders(settings)[0]);

    provider.apiKey = '   ';
    provider.baseUrl = 'https://example.com/v1';

    expect(
      shouldRefreshProviderCatalog({
        draftProvider: provider,
        savedProvider: savedModels.providers[provider.id],
      })
    ).toBe(false);
  });
});
