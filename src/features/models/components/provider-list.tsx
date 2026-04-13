'use client';

import { PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { ProviderIcon } from '@/features/models/components/provider-icon';
import type { ProviderSettings } from '@/features/models/types';
import { cn } from '@/lib/utils';

interface ProviderListProps {
  providers: ProviderSettings[];
  selectedProviderId: string;
  onAddCustomProvider: (providerName: string) => void;
  onSelectProvider: (providerId: string) => void;
  onToggleProvider: (providerId: string) => void;
}

export function ProviderList({
  providers,
  selectedProviderId,
  onAddCustomProvider,
  onSelectProvider,
  onToggleProvider,
}: ProviderListProps) {
  const t = useTranslations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [providerName, setProviderName] = useState('');

  const normalizedProviderName = providerName.trim();
  const hasDuplicateName = useMemo(
    () =>
      providers.some(
        (provider) => provider.name.trim().toLowerCase() === normalizedProviderName.toLowerCase()
      ),
    [normalizedProviderName, providers]
  );

  const canSubmit = normalizedProviderName.length > 0 && !hasDuplicateName;

  const resetDialog = () => {
    setProviderName('');
    setIsDialogOpen(false);
  };

  return (
    <>
      <ScrollArea className="h-full overflow-hidden">
        <div className="space-y-2 p-2">
          {providers.map((provider) => {
            const isSelected = provider.id === selectedProviderId;

            return (
              <div
                key={provider.id}
                className={cn(
                  'hover:bg-accent/15 flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors',
                  isSelected && 'border-primary/35 bg-accent hover:bg-accent'
                )}
                onClick={() => onSelectProvider(provider.id)}
              >
                <div className="flex h-auto min-w-0 flex-1 items-center justify-start gap-3 px-0 py-0 font-normal">
                  <ProviderIcon
                    docsUrl={provider.docsUrl}
                    fallbackClassName="flex size-10 shrink-0 items-center justify-center border text-lg font-semibold"
                    logoId={provider.logoId}
                    monogram={provider.monogram}
                    name={provider.name}
                    providerId={provider.id}
                  />
                  <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
                    {provider.name}
                  </span>
                </div>
                <Switch
                  aria-label={`${provider.name} ${provider.enabled ? t('models_page.status.enabled') : t('models_page.status.disabled')}`}
                  checked={provider.enabled}
                  className="shrink-0 data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
                  onCheckedChange={() => onToggleProvider(provider.id)}
                />
              </div>
            );
          })}

          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusIcon data-icon="inline-start" />
            {t('models_page.actions.add_provider')}
          </Button>
        </div>
      </ScrollArea>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => (!open ? resetDialog() : setIsDialogOpen(true))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('models_page.providers.dialog_title')}</DialogTitle>
            <DialogDescription>{t('models_page.providers.dialog_description')}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="custom-provider-name">
              {t('models_page.providers.name_label')}
            </label>
            <Input
              autoFocus
              id="custom-provider-name"
              placeholder={t('models_page.providers.name_placeholder')}
              value={providerName}
              onChange={(event) => setProviderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && canSubmit) {
                  event.preventDefault();
                  onAddCustomProvider(normalizedProviderName);
                  resetDialog();
                }
              }}
            />
            {hasDuplicateName ? (
              <p className="text-destructive text-sm">
                {t('models_page.providers.duplicate_name')}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={!canSubmit}
              onClick={() => {
                onAddCustomProvider(normalizedProviderName);
                resetDialog();
              }}
            >
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
