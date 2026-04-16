'use client';

import { EyeIcon, EyeOffIcon, LinkIcon, PlugZapIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { MODEL_PROVIDER_DEFAULTS } from '@/config/models';
import { ProviderDeleteDialog } from '@/features/models/components/provider-delete-dialog';
import { ProviderIcon } from '@/features/models/components/provider-icon';
import { ProviderModelList } from '@/features/models/components/provider-model-list';
import type { ProviderModelItem, ProviderSettings } from '@/features/models/types';
import { cn } from '@/lib/utils';

interface ProviderSettingsPanelProps {
  isApiKeyVisible: boolean;
  isTestingConnection: boolean;
  provider: ProviderSettings;
  onAddModel: (model: Pick<ProviderModelItem, 'id' | 'name'>) => void;
  onApiKeyVisibilityChange: (nextVisible: boolean) => void;
  onBaseUrlChange: (value: string) => void;
  onFormatChange: (value: 'anthropic' | 'openai') => void;
  onModelRemove: (index: number) => void;
  onModelUpdate: (index: number, nextModel: ProviderModelItem) => void;
  onProviderApiKeyChange: (value: string) => void;
  onDeleteProvider: () => Promise<void> | void;
  onTestConnection: () => void;
}

export function ProviderSettingsPanel({
  isApiKeyVisible,
  isTestingConnection,
  provider,
  onAddModel,
  onApiKeyVisibilityChange,
  onBaseUrlChange,
  onFormatChange,
  onModelRemove,
  onModelUpdate,
  onProviderApiKeyChange,
  onDeleteProvider,
  onTestConnection,
}: ProviderSettingsPanelProps) {
  const t = useTranslations();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingProvider, setIsDeletingProvider] = useState(false);

  return (
    <>
      <div className="mb-12 flex flex-col">
        <header className="flex flex-col items-start justify-between gap-4 border-b px-2 py-5 lg:flex-row lg:items-center lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <ProviderIcon
              docsUrl={provider.docsUrl}
              fallbackClassName="flex size-10 shrink-0 items-center justify-center border text-sm font-semibold"
              logoId={provider.logoId}
              monogram={provider.monogram}
              name={provider.name}
              providerId={provider.id}
            />
            <h2 className="truncate text-xl font-semibold">{provider.name}</h2>
            {provider.docsUrl ? (
              <a
                className="text-muted-foreground hover:text-foreground transition-colors"
                href={provider.docsUrl}
                rel="noreferrer"
                target="_blank"
              >
                <LinkIcon className="size-4" />
              </a>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {provider.isCustom ? (
              <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2Icon data-icon="inline-start" />
                {t('models_page.actions.delete_provider')}
              </Button>
            ) : null}
            <Button
              disabled={isTestingConnection || !provider.apiKey.trim() || !provider.baseUrl.trim()}
              type="button"
              variant="outline"
              onClick={onTestConnection}
            >
              {isTestingConnection ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <PlugZapIcon data-icon="inline-start" />
              )}
              {isTestingConnection
                ? t('models_page.actions.testing_connection')
                : t('models_page.actions.test_connection')}
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 px-2 py-5 lg:px-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('models_page.fields.api_key')}</label>
              {provider.docsUrl ? (
                <a
                  className="text-primary hover:text-primary/80 text-sm transition-colors"
                  href={provider.docsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {t('models_page.fields.get_api_key')}
                </a>
              ) : null}
            </div>
            <InputGroup>
              <InputGroupInput
                autoCapitalize="none"
                autoCorrect="off"
                className="h-10"
                placeholder={t('models_page.fields.api_key_placeholder')}
                spellCheck={false}
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
                autoCapitalize="none"
                autoComplete="url"
                autoCorrect="off"
                className="h-10"
                data-form-type="other"
                name={`${provider.id}-base-url`}
                placeholder={
                  provider.defaultBaseUrl || MODEL_PROVIDER_DEFAULTS.PLACEHOLDER_BASE_URL
                }
                spellCheck={false}
                value={provider.baseUrl}
                onChange={(event) => onBaseUrlChange(event.target.value)}
              />
            </InputGroup>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('models_page.fields.api_format')}</label>
            <RadioGroup
              className="flex flex-wrap gap-3"
              value={provider.apiFormat}
              onValueChange={(value) => onFormatChange(value as 'anthropic' | 'openai')}
            >
              <label
                className={cn(
                  'flex min-w-48 flex-1 items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors',
                  provider.apiFormat === 'anthropic' && 'border-emerald-500/50 bg-emerald-500/10'
                )}
              >
                <RadioGroupItem
                  className="data-checked:border-emerald-500 data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
                  id={`${provider.id}-format-anthropic`}
                  value="anthropic"
                />
                <span>{t('models_page.formats.anthropic')}</span>
              </label>
              <label
                className={cn(
                  'flex min-w-48 flex-1 items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors',
                  provider.apiFormat === 'openai' && 'border-emerald-500/50 bg-emerald-500/10'
                )}
              >
                <RadioGroupItem
                  className="data-checked:border-emerald-500 data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
                  id={`${provider.id}-format-openai`}
                  value="openai"
                />
                <span>{t('models_page.formats.openai')}</span>
              </label>
            </RadioGroup>
            <p className="text-muted-foreground max-w-2xl text-sm">
              {t('models_page.fields.api_format_hint')}
            </p>
          </div>

          <Separator />

          <ProviderModelList
            key={provider.id}
            models={provider.models}
            onAddModel={onAddModel}
            onRemoveModel={onModelRemove}
            onUpdateModel={onModelUpdate}
          />
        </div>
      </div>
      <ProviderDeleteDialog
        isDeleting={isDeletingProvider}
        open={isDeleteDialogOpen}
        providerName={provider.name}
        t={t}
        onConfirm={async () => {
          setIsDeletingProvider(true);
          try {
            await onDeleteProvider();
            setIsDeleteDialogOpen(false);
          } finally {
            setIsDeletingProvider(false);
          }
        }}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
