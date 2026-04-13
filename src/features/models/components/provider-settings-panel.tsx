'use client';

import { EyeIcon, EyeOffIcon, LinkIcon, PlugZapIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ProviderIcon } from '@/features/models/components/provider-icon';
import { ProviderModelList } from '@/features/models/components/provider-model-list';
import type { ProviderModelItem, ProviderPreset, ProviderSettings } from '@/features/models/types';

interface ProviderSettingsPanelProps {
  activePreset: ProviderPreset | undefined;
  autoSaveStatus?: 'idle' | 'saving' | 'saved';
  isApiKeyVisible: boolean;
  isRefreshingModels: boolean;
  isTestingConnection: boolean;
  provider: ProviderSettings;
  onAddModel: () => void;
  onApiKeyVisibilityChange: (nextVisible: boolean) => void;
  onBaseUrlChange: (value: string) => void;
  onFormatChange: (value: 'anthropic' | 'openai') => void;
  onModelRemove: (index: number) => void;
  onModelUpdate: (index: number, nextModel: ProviderModelItem) => void;
  onProviderApiKeyChange: (value: string) => void;
  onTestConnection: () => void;
}

export function ProviderSettingsPanel({
  activePreset,
  autoSaveStatus = 'idle',
  isApiKeyVisible,
  isRefreshingModels,
  isTestingConnection,
  provider,
  onAddModel,
  onApiKeyVisibilityChange,
  onBaseUrlChange,
  onFormatChange,
  onModelRemove,
  onModelUpdate,
  onProviderApiKeyChange,
  onTestConnection,
}: ProviderSettingsPanelProps) {
  const t = useTranslations();

  if (!activePreset) {
    return null;
  }

  return (
    <div className="bg-background flex flex-col">
      <header className="bg-background sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-6 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <ProviderIcon
            fallbackClassName="flex size-10 shrink-0 items-center justify-center border text-sm font-semibold"
            providerId={activePreset.id}
          />
          <h2 className="truncate text-xl font-semibold">{activePreset.name}</h2>
          <a
            className="text-muted-foreground hover:text-foreground transition-colors"
            href={activePreset.docsUrl}
            rel="noreferrer"
            target="_blank"
          >
            <LinkIcon className="size-4" />
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {autoSaveStatus === 'saving' ? (
            <span className="text-muted-foreground text-sm">{t('models_page.actions.saving')}</span>
          ) : autoSaveStatus === 'saved' ? (
            <span className="text-muted-foreground text-sm">{t('models_page.actions.saved')}</span>
          ) : null}
          <Button
            disabled={isTestingConnection || !provider.apiKey.trim() || !provider.baseUrl.trim()}
            type="button"
            variant="outline"
            onClick={onTestConnection}
          >
            <PlugZapIcon data-icon="inline-start" />
            {isTestingConnection
              ? t('models_page.actions.testing_connection')
              : t('models_page.actions.test_connection')}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-6 py-5">
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
          </InputGroup>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('models_page.fields.api_format')}</label>
            <RadioGroup
              className="flex flex-wrap gap-3"
              value={provider.apiFormat}
              onValueChange={(value) => onFormatChange(value as 'anthropic' | 'openai')}
            >
              <label className="flex min-w-48 flex-1 items-center gap-3 rounded-lg border px-4 py-3 text-sm">
                <RadioGroupItem id={`${provider.id}-format-anthropic`} value="anthropic" />
                <span>{t('models_page.formats.anthropic')}</span>
              </label>
              <label className="flex min-w-48 flex-1 items-center gap-3 rounded-lg border px-4 py-3 text-sm">
                <RadioGroupItem id={`${provider.id}-format-openai`} value="openai" />
                <span>{t('models_page.formats.openai')}</span>
              </label>
            </RadioGroup>
            <p className="text-muted-foreground max-w-2xl text-sm">
              {t('models_page.fields.api_format_hint')}
            </p>
          </div>

          {isRefreshingModels ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-muted-foreground text-sm">
                {t('models_page.models.syncing')}
              </span>
            </div>
          ) : null}
        </div>

        <Separator />

        <ProviderModelList
          models={provider.models}
          onAddModel={onAddModel}
          onRemoveModel={onModelRemove}
          onUpdateModel={onModelUpdate}
        />
      </div>
    </div>
  );
}
