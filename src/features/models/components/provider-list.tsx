'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { ProviderIcon } from '@/features/models/components/provider-icon';
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
    <div className="flex min-h-0 flex-col gap-4">
      <ScrollArea
        className={cn('overflow-hidden border', embedded ? 'h-[calc(100vh-14rem)]' : 'h-168')}
      >
        <div className="space-y-2 p-2">
          {providers.map((provider) => {
            const providerSettings = settings[provider.id];
            const isSelected = provider.id === selectedProviderId;

            return (
              <div
                key={provider.id}
                className={cn(
                  'flex items-center gap-3 border px-4 py-3 transition-colors',
                  isSelected && 'border-primary/35 bg-accent/25'
                )}
              >
                <Button
                  className="h-auto min-w-0 flex-1 justify-start px-0 py-0 hover:bg-transparent"
                  type="button"
                  variant="ghost"
                  onClick={() => onSelectProvider(provider.id)}
                >
                  <ProviderIcon
                    fallbackClassName="flex size-10 shrink-0 items-center justify-center border text-sm font-semibold"
                    providerId={provider.id}
                  />
                  <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
                    {provider.name}
                  </span>
                </Button>
                <Switch
                  aria-label={`${provider.name} ${providerSettings.enabled ? t('models_page.status.enabled') : t('models_page.status.disabled')}`}
                  checked={providerSettings.enabled}
                  className="shrink-0"
                  onCheckedChange={() => onToggleProvider(provider.id)}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
