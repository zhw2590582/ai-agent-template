'use client';

import { EyeIcon, EyeOffIcon, LinkIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
        'border-border/70 bg-background flex flex-col border p-6',
        embedded ? 'min-h-[calc(100vh-16rem)]' : 'min-h-160'
      )}
    >
      {activePreset ? (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="truncate text-2xl font-semibold">
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
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                {t('models_page.detail.helper')}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-6">
            <div className="grid gap-2">
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

            <div className="grid gap-2">
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

            <div className="grid gap-3">
              <label className="text-sm font-medium">{t('models_page.fields.api_format')}</label>
              <Select
                value={provider.apiFormat}
                onValueChange={(value) => onFormatChange(value as 'anthropic' | 'openai')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anthropic">{t('models_page.formats.anthropic')}</SelectItem>
                  <SelectItem value="openai">{t('models_page.formats.openai')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-sm">
                {t('models_page.fields.api_format_hint')}
              </p>
            </div>

            <div className="flex items-center gap-3">
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

            <Separator className="my-2" />

            <ProviderModelList
              models={provider.models}
              onAddModel={onAddModel}
              onRemoveModel={onModelRemove}
              onUpdateModel={onModelUpdate}
            />
          </div>

          <div className="mt-auto flex items-center justify-end gap-3 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              {t('models_page.actions.reset')}
            </Button>
            <Button disabled={isSaving || isLoading} type="button" onClick={onSave}>
              {isLoading
                ? t('models_page.actions.loading')
                : isSaving
                  ? t('models_page.actions.saving')
                  : t('models_page.actions.save')}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
