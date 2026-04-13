'use client';

import { EyeIcon, EyeOffIcon, LinkIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ProviderIcon } from '@/features/models/components/provider-icon';
import { ProviderModelList } from '@/features/models/components/provider-model-list';
import type { ProviderModelItem, ProviderPreset, ProviderSettings } from '@/features/models/types';
import { cn } from '@/lib/utils';

interface ProviderSettingsPanelProps {
  activePreset: ProviderPreset | undefined;
  embedded?: boolean;
  isApiKeyVisible: boolean;
  isLoading: boolean;
  isRefreshingModels: boolean;
  isSaving: boolean;
  isTestingConnection: boolean;
  provider: ProviderSettings;
  onAddModel: () => void;
  onApiKeyVisibilityChange: (nextVisible: boolean) => void;
  onBaseUrlChange: (value: string) => void;
  onBaseUrlReset: () => void;
  onFormatChange: (value: 'anthropic' | 'openai') => void;
  onModelRemove: (index: number) => void;
  onModelUpdate: (index: number, nextModel: ProviderModelItem) => void;
  onProviderApiKeyChange: (value: string) => void;
  onProviderApiKeyReset: () => void;
  onSave: () => void;
  onTestConnection: () => void;
}

export function ProviderSettingsPanel({
  activePreset,
  embedded = false,
  isApiKeyVisible,
  isLoading,
  isRefreshingModels,
  isSaving,
  isTestingConnection,
  provider,
  onAddModel,
  onApiKeyVisibilityChange,
  onBaseUrlChange,
  onBaseUrlReset,
  onFormatChange,
  onModelRemove,
  onModelUpdate,
  onProviderApiKeyChange,
  onProviderApiKeyReset,
  onSave,
  onTestConnection,
}: ProviderSettingsPanelProps) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        'bg-background flex min-h-0 flex-col border',
        embedded ? 'min-h-[calc(100vh-16rem)]' : 'min-h-160'
      )}
    >
      {activePreset ? (
        <>
          <header className="flex items-start justify-between gap-4 px-6 py-5">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <ProviderIcon
                  fallbackClassName="flex size-10 shrink-0 items-center justify-center border text-sm font-semibold"
                  providerId={activePreset.id}
                />
                <h2 className="truncate text-xl font-semibold">
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
            </div>
            <Button
              className="shrink-0"
              disabled={isSaving || isLoading}
              type="button"
              onClick={onSave}
            >
              {isLoading
                ? t('models_page.actions.loading')
                : isSaving
                  ? t('models_page.actions.saving')
                  : t('models_page.actions.save')}
            </Button>
          </header>

          <Separator />

          <div className="flex flex-1 flex-col gap-6 px-6 py-5">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{t('models_page.fields.api_key')}</label>
                  <a
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    href={activePreset.docsUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {t('models_page.fields.get_api_key')}
                  </a>
                </div>
                <InputGroup>
                  <InputGroupInput
                    className="h-10"
                    placeholder={t('models_page.fields.api_key_placeholder')}
                    type={isApiKeyVisible ? 'text' : 'password'}
                    value={provider.apiKey}
                    onChange={(event) => onProviderApiKeyChange(event.target.value)}
                  />
                  {provider.apiKey ? (
                    <InputGroupButton
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                      onClick={onProviderApiKeyReset}
                    >
                      <XIcon />
                    </InputGroupButton>
                  ) : null}
                  <InputGroupButton
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                    onClick={() => onApiKeyVisibilityChange(!isApiKeyVisible)}
                  >
                    {isApiKeyVisible ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroup>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">{t('models_page.fields.base_url')}</label>
                <InputGroup>
                  <InputGroupInput
                    className="h-10"
                    placeholder={activePreset.defaultBaseUrl}
                    value={provider.baseUrl}
                    onChange={(event) => onBaseUrlChange(event.target.value)}
                  />
                  <InputGroupButton
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                    onClick={onBaseUrlReset}
                  >
                    <XIcon />
                  </InputGroupButton>
                </InputGroup>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    {t('models_page.fields.api_format')}
                  </label>
                  <RadioGroup
                    className="gap-3"
                    value={provider.apiFormat}
                    onValueChange={(value) => onFormatChange(value as 'anthropic' | 'openai')}
                  >
                    <label className="flex items-center gap-3 border px-4 py-3 text-sm">
                      <RadioGroupItem id={`${provider.id}-format-anthropic`} value="anthropic" />
                      <span>{t('models_page.formats.anthropic')}</span>
                    </label>
                    <label className="flex items-center gap-3 border px-4 py-3 text-sm">
                      <RadioGroupItem id={`${provider.id}-format-openai`} value="openai" />
                      <span>{t('models_page.formats.openai')}</span>
                    </label>
                  </RadioGroup>
                  <p className="text-muted-foreground max-w-2xl text-sm">
                    {t('models_page.fields.api_format_hint')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    disabled={
                      isTestingConnection || !provider.apiKey.trim() || !provider.baseUrl.trim()
                    }
                    type="button"
                    variant="outline"
                    onClick={onTestConnection}
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
              </div>
            </div>

            <Separator />

            <ProviderModelList
              models={provider.models}
              onAddModel={onAddModel}
              onRemoveModel={onModelRemove}
              onUpdateModel={onModelUpdate}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
