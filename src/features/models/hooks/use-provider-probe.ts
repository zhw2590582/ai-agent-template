'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { API_ROUTES } from '@/config/api';
import type { ProviderProbeResult, ProviderSettings } from '@/features/models/types';
import { getApiErrorToastMessage } from '@/lib/api-client';

export function useProviderProbe({
  provider,
  updateProvider,
}: {
  provider: ProviderSettings | null;
  updateProvider: (
    providerId: string,
    updater: (provider: ProviderSettings) => ProviderSettings
  ) => void;
}) {
  const t = useTranslations();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const mergeProviderModels = useCallback(
    (
      existingModels: ProviderSettings['models'],
      incomingModels: Array<
        Pick<ProviderSettings['models'][number], 'capabilities' | 'id' | 'name'>
      >
    ) => {
      if (incomingModels.length === 0) {
        return existingModels;
      }

      const existingModelMap = new Map(existingModels.map((model) => [model.id, model]));
      const syncedModels: ProviderSettings['models'] = incomingModels.map((model) => {
        const existing = existingModelMap.get(model.id);
        return {
          capabilities: model.capabilities,
          enabled: existing?.enabled ?? true,
          id: model.id,
          name: model.name,
        };
      });

      const customModels = existingModels.filter((model) => model.isCustom);
      return [...syncedModels, ...customModels];
    },
    []
  );

  const loadProviderModels = useCallback(
    async (options?: {
      applyResult?: boolean;
      providerOverride?: ProviderSettings;
      notifyFailure?: boolean;
      notifySuccess?: boolean;
    }) => {
      const targetProvider = options?.providerOverride ?? provider;

      if (!targetProvider) {
        return null;
      }

      if (!targetProvider.apiKey.trim() || !targetProvider.baseUrl.trim()) {
        toast.error(t('models_page.toast.provider_config_required'));
        return null;
      }

      const response = await fetch(API_ROUTES.modelsProviders, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiFormat: targetProvider.apiFormat,
          apiKey: targetProvider.apiKey,
          baseUrl: targetProvider.baseUrl,
        }),
      });

      if (!response.ok) {
        if (options?.notifyFailure ?? true) {
          toast.error(
            await getApiErrorToastMessage(response, t, 'models_page.toast.test_connection_failed')
          );
        }
        return null;
      }

      const result = (await response.json()) as ProviderProbeResult;
      const mergedModels = mergeProviderModels(targetProvider.models, result.models);

      if (options?.applyResult ?? true) {
        updateProvider(targetProvider.id, (currentProvider) => ({
          ...currentProvider,
          models: mergeProviderModels(currentProvider.models, result.models),
        }));
      }

      if (options?.notifySuccess) {
        toast.success(
          t('models_page.toast.test_connection_success', {
            count: String(result.models.length),
          })
        );
      }

      return {
        mergedModels,
        result,
      };
    },
    [mergeProviderModels, provider, t, updateProvider]
  );

  const handleTestConnection = useCallback(async () => {
    setIsTestingConnection(true);
    try {
      await loadProviderModels({
        notifySuccess: true,
      });
    } finally {
      setIsTestingConnection(false);
    }
  }, [loadProviderModels]);

  return {
    handleTestConnection,
    isTestingConnection,
    loadProviderModels,
  };
}
