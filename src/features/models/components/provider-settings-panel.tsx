'use client';

import { EyeIcon, EyeOffIcon, LinkIcon, PlugZapIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InputGroup, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { ProviderIcon } from '@/features/models/components/provider-icon';
import { ProviderModelList } from '@/features/models/components/provider-model-list';
import type { ProviderModelItem, ProviderSettings } from '@/features/models/types';
import { cn } from '@/lib/utils';

interface ProviderSettingsPanelProps {
  autoSaveStatus?: 'idle' | 'saving' | 'saved';
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
  autoSaveStatus = 'idle',
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
      <div className="bg-background mb-24 flex flex-col">
        <header className="bg-background sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-6 py-5">
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
            {autoSaveStatus === 'saving' ? (
              <Badge variant="secondary">
                <Spinner data-icon="inline-start" />
                {t('models_page.actions.saving')}
              </Badge>
            ) : autoSaveStatus === 'saved' ? (
              <Badge variant="secondary">{t('models_page.actions.saved')}</Badge>
            ) : null}
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

        <div className="flex flex-1 flex-col gap-6 px-6 py-5">
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
                autoComplete="new-password"
                autoCorrect="off"
                className="h-10"
                data-1p-ignore="true"
                data-lpignore="true"
                name={`${provider.id}-api-token`}
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
                name={`${provider.id}-base-url`}
                placeholder={provider.defaultBaseUrl || 'https://api.example.com/v1'}
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
            models={provider.models}
            onAddModel={onAddModel}
            onRemoveModel={onModelRemove}
            onUpdateModel={onModelUpdate}
          />
        </div>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent size="default">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('models_page.providers.delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('models_page.providers.delete_description', {
                provider: provider.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingProvider}
              variant="destructive"
              onClick={async (event) => {
                event.preventDefault();
                setIsDeletingProvider(true);
                try {
                  await onDeleteProvider();
                  setIsDeleteDialogOpen(false);
                } finally {
                  setIsDeletingProvider(false);
                }
              }}
            >
              {isDeletingProvider ? <Spinner data-icon="inline-start" /> : null}
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
