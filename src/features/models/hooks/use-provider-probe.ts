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

  const probeProvider = useCallback(
    async (notifySuccess: boolean) => {
      if (!provider) {
        return null;
      }

      if (!provider.apiKey.trim() || !provider.baseUrl.trim()) {
        toast.error(t('models_page.toast.provider_config_required'));
        return null;
      }

      const response = await fetch(API_ROUTES.modelsProviders, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiFormat: provider.apiFormat,
          apiKey: provider.apiKey,
          baseUrl: provider.baseUrl,
        }),
      });

      if (!response.ok) {
        if (notifySuccess) {
          toast.error(
            await getApiErrorToastMessage(response, t, 'models_page.toast.test_connection_failed')
          );
        }
        return null;
      }

      const result = (await response.json()) as ProviderProbeResult;

      if (notifySuccess) {
        updateProvider(provider.id, (currentProvider) => ({
          ...currentProvider,
          models: mergeProviderModels(currentProvider.models, result.models),
        }));
        toast.success(
          t('models_page.toast.test_connection_success', {
            count: String(result.models.length),
          })
        );
      }

      return result;
    },
    [mergeProviderModels, provider, t, updateProvider]
  );

  const handleTestConnection = useCallback(async () => {
    setIsTestingConnection(true);
    try {
      await probeProvider(true);
    } finally {
      setIsTestingConnection(false);
    }
  }, [probeProvider]);

  return {
    handleTestConnection,
    isTestingConnection,
  };
}
