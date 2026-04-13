'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2Icon,
  CircleIcon,
  EyeIcon,
  EyeOffIcon,
  LinkIcon,
  PlusCircleIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { useModelProfile } from '@/features/models/hooks/use-model-profile';
import type { ProviderModelItem, ProviderProbeResult } from '@/features/models/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ModelsPageProps {
  embedded?: boolean;
}

export function ModelsPage({ embedded = false }: ModelsPageProps) {
  const t = useTranslations();
  const { user } = useAuthUser();
  const {
    isLoading,
    isSaving,
    presetProviders,
    profile,
    saveProfile,
    selectedProvider,
    updateProvider,
    updateSelectedProviderId,
  } = useModelProfile(user);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);

  const activePreset = useMemo(
    () =>
      presetProviders.find((provider) => provider.id === selectedProvider.id) ?? presetProviders[0],
    [presetProviders, selectedProvider.id]
  );

  const handleAddModel = () => {
    updateProvider(selectedProvider.id, (provider) => ({
      ...provider,
      models: [
        ...provider.models,
        {
          enabled: true,
          id: '',
          isCustom: true,
          name: '',
        },
      ],
    }));
  };

  const updateModel = (index: number, nextModel: ProviderModelItem) => {
    updateProvider(selectedProvider.id, (provider) => ({
      ...provider,
      models: provider.models.map((model, modelIndex) =>
        modelIndex === index ? nextModel : model
      ),
    }));
  };

  const removeModel = (index: number) => {
    updateProvider(selectedProvider.id, (provider) => ({
      ...provider,
      models: provider.models.filter((_, modelIndex) => modelIndex !== index),
    }));
  };

  const applyProviderModels = (
    providerId: string,
    incomingModels: Array<Pick<ProviderModelItem, 'id' | 'name'>>
  ) => {
    if (incomingModels.length === 0) {
      return;
    }

    updateProvider(providerId, (provider) => {
      const existingModels = new Map(provider.models.map((model) => [model.id, model]));
      const syncedModels: ProviderModelItem[] = incomingModels.map((model) => {
        const existing = existingModels.get(model.id);
        return {
          enabled: existing?.enabled ?? true,
          id: model.id,
          name: model.name,
        };
      });

      const customModels = provider.models.filter((model) => model.isCustom);

      return {
        ...provider,
        models: [...syncedModels, ...customModels],
      };
    });
  };

  const probeProvider = async (notifySuccess: boolean) => {
    if (!selectedProvider.apiKey.trim() || !selectedProvider.baseUrl.trim()) {
      toast.error(t('models_page.toast.provider_config_required'));
      return null;
    }

    const response = await fetch('/api/models/providers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiFormat: selectedProvider.apiFormat,
        apiKey: selectedProvider.apiKey,
        baseUrl: selectedProvider.baseUrl,
      }),
    });

    if (!response.ok) {
      if (notifySuccess) {
        toast.error(t('models_page.toast.test_connection_failed'));
      }
      return null;
    }

    const result = (await response.json()) as ProviderProbeResult;
    applyProviderModels(selectedProvider.id, result.models);

    if (notifySuccess) {
      toast.success(
        t('models_page.toast.test_connection_success', {
          count: String(result.models.length),
        })
      );
    }

    return result;
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!selectedProvider.apiKey.trim() || !selectedProvider.baseUrl.trim()) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsRefreshingModels(true);
      void probeProvider(false).finally(() => {
        setIsRefreshingModels(false);
      });
    }, 600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    isLoading,
    selectedProvider.apiFormat,
    selectedProvider.apiKey,
    selectedProvider.baseUrl,
    selectedProvider.id,
  ]);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      await probeProvider(true);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div
      className={cn(
        'bg-background text-foreground',
        embedded ? 'h-full overflow-y-auto px-6 py-6' : 'min-h-screen px-6 py-8'
      )}
    >
      <div className={cn('mx-auto', embedded ? 'max-w-none' : 'max-w-7xl')}>
        <section className="border-border/70 bg-card rounded-[2rem] border">
          <div className="relative flex flex-col gap-8 p-6 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
              <div
                className={cn(
                  'flex flex-col gap-4',
                  embedded ? 'min-h-[calc(100vh-16rem)]' : 'min-h-[640px]'
                )}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">{t('models_page.sidebar.title')}</h2>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {presetProviders.map((provider) => {
                    const providerSettings = profile.settings.models.providers[provider.id];
                    const isSelected = provider.id === selectedProvider.id;

                    return (
                      <div
                        key={provider.id}
                        className={cn(
                          'border-border/70 bg-muted/35 hover:bg-muted/55 flex w-full items-center gap-4 rounded-[1.65rem] border px-4 py-4 text-left transition-colors',
                          isSelected && 'border-blue-500/60 bg-blue-500/10'
                        )}
                      >
                        <button
                          className="flex min-w-0 flex-1 items-center gap-4 text-left"
                          type="button"
                          onClick={() => updateSelectedProviderId(provider.id)}
                        >
                          <div className="border-border bg-muted text-foreground flex size-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold">
                            {provider.monogram}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="truncate text-lg font-medium">{provider.name}</div>
                              {providerSettings.enabled ? (
                                <CheckCircle2Icon className="size-4 text-emerald-400" />
                              ) : null}
                            </div>
                            <div className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5">
                              {provider.description}
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          aria-label={t('models_page.sidebar.toggle_provider')}
                          className={cn(
                            'relative inline-flex h-8 w-14 shrink-0 rounded-full transition-colors',
                            providerSettings.enabled ? 'bg-blue-500' : 'bg-muted'
                          )}
                          onClick={(event) => {
                            event.stopPropagation();
                            updateProvider(provider.id, (current) => ({
                              ...current,
                              enabled: !current.enabled,
                            }));
                          }}
                        >
                          <span
                            className={cn(
                              'absolute top-1 size-6 rounded-full bg-white shadow transition-transform',
                              providerSettings.enabled ? 'translate-x-7' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className={cn(
                  'border-border/70 bg-background flex flex-col rounded-[1.75rem] border p-6',
                  embedded ? 'min-h-[calc(100vh-16rem)]' : 'min-h-[640px]'
                )}
              >
                {activePreset ? (
                  <>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <h2 className="truncate text-3xl font-semibold tracking-tight">
                            {activePreset.name} {t('models_page.detail.title_suffix')}
                          </h2>
                          <a
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            href={activePreset.docsUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <LinkIcon className="size-4" />
                          </a>
                        </div>
                        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-7">
                          {t('models_page.detail.helper')}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-base font-medium">
                            {t('models_page.fields.api_key')}
                          </label>
                          <a
                            className="text-sm text-blue-400 transition-colors hover:text-blue-300"
                            href={activePreset.docsUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {t('models_page.fields.get_api_key')}
                          </a>
                        </div>
                        <div className="border-border bg-muted/50 flex items-center gap-2 rounded-[1.2rem] border px-4 py-2">
                          <Input
                            className="h-11 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
                            placeholder={t('models_page.fields.api_key_placeholder')}
                            type={isApiKeyVisible ? 'text' : 'password'}
                            value={selectedProvider.apiKey}
                            onChange={(event) =>
                              updateProvider(selectedProvider.id, (provider) => ({
                                ...provider,
                                apiKey: event.target.value,
                              }))
                            }
                          />
                          {selectedProvider.apiKey ? (
                            <Button
                              size="icon-sm"
                              type="button"
                              variant="ghost"
                              onClick={() =>
                                updateProvider(selectedProvider.id, (provider) => ({
                                  ...provider,
                                  apiKey: '',
                                }))
                              }
                            >
                              <XIcon />
                            </Button>
                          ) : null}
                          <Button
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                            onClick={() => setIsApiKeyVisible((value) => !value)}
                          >
                            {isApiKeyVisible ? <EyeOffIcon /> : <EyeIcon />}
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-base font-medium">
                          {t('models_page.fields.base_url')}
                        </label>
                        <div className="border-border bg-muted/50 flex items-center gap-2 rounded-[1.2rem] border px-4 py-2">
                          <Input
                            className="h-11 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
                            placeholder={activePreset.defaultBaseUrl}
                            value={selectedProvider.baseUrl}
                            onChange={(event) =>
                              updateProvider(selectedProvider.id, (provider) => ({
                                ...provider,
                                baseUrl: event.target.value,
                              }))
                            }
                          />
                          <Button
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              updateProvider(selectedProvider.id, (provider) => ({
                                ...provider,
                                baseUrl: activePreset.defaultBaseUrl,
                              }))
                            }
                          >
                            <XIcon />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <label className="text-base font-medium">
                          {t('models_page.fields.api_format')}
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {(['anthropic', 'openai'] as const).map((format) => (
                            <button
                              key={format}
                              type="button"
                              className={cn(
                                'border-border hover:bg-muted flex items-center gap-3 rounded-full border px-4 py-3 text-sm transition-colors',
                                selectedProvider.apiFormat === format &&
                                  'border-blue-500/70 bg-blue-500/10'
                              )}
                              onClick={() =>
                                updateProvider(selectedProvider.id, (provider) => ({
                                  ...provider,
                                  apiFormat: format,
                                }))
                              }
                            >
                              {selectedProvider.apiFormat === format ? (
                                <CheckCircle2Icon className="size-4 text-blue-400" />
                              ) : (
                                <CircleIcon className="text-muted-foreground size-4" />
                              )}
                              {format === 'anthropic'
                                ? t('models_page.formats.anthropic')
                                : t('models_page.formats.openai')}
                            </button>
                          ))}
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {t('models_page.fields.api_format_hint')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          disabled={
                            isTestingConnection ||
                            !selectedProvider.apiKey.trim() ||
                            !selectedProvider.baseUrl.trim()
                          }
                          type="button"
                          variant="outline"
                          onClick={() => void handleTestConnection()}
                        >
                          {isTestingConnection
                            ? t('models_page.actions.testing_connection')
                            : t('models_page.actions.test_connection')}
                        </Button>
                        {isRefreshingModels ? (
                          <span className="text-muted-foreground text-sm">
                            {t('models_page.models.syncing')}
                          </span>
                        ) : null}
                      </div>

                      <Separator className="my-2" />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-medium">{t('models_page.models.title')}</h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                              {t('models_page.models.description')}
                            </p>
                          </div>
                          <Button type="button" variant="ghost" onClick={handleAddModel}>
                            <PlusCircleIcon data-icon="inline-start" />
                            {t('models_page.actions.add_model')}
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {selectedProvider.models.map((model, index) => (
                            <div
                              key={`${model.id || 'custom'}-${index}`}
                              className="border-border/70 bg-muted/30 rounded-[1.25rem] border p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <span
                                    className={cn(
                                      'mt-1 size-3 rounded-full',
                                      model.enabled ? 'bg-emerald-400' : 'bg-muted-foreground/40'
                                    )}
                                  />
                                  <div className="min-w-0">
                                    <Input
                                      className="h-auto border-0 bg-transparent px-0 py-0 text-lg font-medium shadow-none focus-visible:ring-0"
                                      placeholder={t('models_page.models.name_placeholder')}
                                      value={model.name}
                                      onChange={(event) =>
                                        updateModel(index, {
                                          ...model,
                                          name: event.target.value,
                                        })
                                      }
                                    />
                                    <Input
                                      className="text-muted-foreground mt-1 h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
                                      placeholder={t('models_page.models.id_placeholder')}
                                      value={model.id}
                                      onChange={(event) =>
                                        updateModel(index, {
                                          ...model,
                                          id: event.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                      updateModel(index, {
                                        ...model,
                                        enabled: !model.enabled,
                                      })
                                    }
                                  >
                                    {model.enabled
                                      ? t('models_page.status.enabled')
                                      : t('models_page.status.disabled')}
                                  </Button>
                                  {model.isCustom ? (
                                    <Button
                                      size="icon-sm"
                                      type="button"
                                      variant="ghost"
                                      onClick={() => removeModel(index)}
                                    >
                                      <Trash2Icon />
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t pt-6">
              <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                {t('models_page.actions.reset')}
              </Button>
              <Button
                disabled={isSaving || isLoading}
                type="button"
                onClick={() => void saveProfile()}
              >
                {isLoading
                  ? t('models_page.actions.loading')
                  : isSaving
                    ? t('models_page.actions.saving')
                    : t('models_page.actions.save')}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
