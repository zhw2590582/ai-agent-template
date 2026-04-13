'use client';

import { CheckCircle2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ProviderPreset, ProviderSettings } from '@/features/models/types';
import { cn } from '@/lib/utils';

interface ProviderListProps {
  embedded?: boolean;
  providers: ProviderPreset[];
  selectedProviderId: string;
  settings: Record<string, ProviderSettings>;
  onSelectProvider: (providerId: string) => void;
  onToggleProvider: (providerId: string) => void;
}

export function ProviderList({
  embedded = false,
  providers,
  selectedProviderId,
  settings,
  onSelectProvider,
  onToggleProvider,
}: ProviderListProps) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        embedded ? 'min-h-[calc(100vh-16rem)]' : 'min-h-[640px]'
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{t('models_page.sidebar.title')}</h2>
      </div>

      <ScrollArea className="flex-1 border">
        <div className="space-y-2 p-1">
          {providers.map((provider) => {
            const providerSettings = settings[provider.id];
            const isSelected = provider.id === selectedProviderId;

            return (
              <div
                key={provider.id}
                className={cn(
                  'border-border flex items-center gap-3 border p-3',
                  isSelected && 'border-primary bg-accent/40'
                )}
              >
                <Button
                  className="h-auto flex-1 justify-start px-0 py-0 hover:bg-transparent"
                  type="button"
                  variant="ghost"
                  onClick={() => onSelectProvider(provider.id)}
                >
                  <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center border text-sm font-semibold">
                    {provider.monogram}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{provider.name}</span>
                      {providerSettings.enabled ? (
                        <CheckCircle2Icon className="size-4 text-emerald-500" />
                      ) : null}
                    </div>
                    <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                      {provider.description}
                    </div>
                  </div>
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant={providerSettings.enabled ? 'default' : 'outline'}
                  onClick={() => onToggleProvider(provider.id)}
                >
                  {providerSettings.enabled
                    ? t('models_page.status.enabled')
                    : t('models_page.status.disabled')}
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
