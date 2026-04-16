'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { SearchSettings } from '@/features/search/types';

interface SearchConnectionSectionProps {
  isApiKeyVisible: boolean;
  onToggleApiKeyVisibility: () => void;
  onUpdateSettings: (updater: (settings: SearchSettings) => SearchSettings) => void;
  settings: SearchSettings;
}

export function SearchConnectionSection({
  isApiKeyVisible,
  onToggleApiKeyVisibility,
  onUpdateSettings,
  settings,
}: SearchConnectionSectionProps) {
  const t = useTranslations();

  return (
    <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">{t('search_page.enabled_label')}</h3>
          <p className="text-muted-foreground text-sm">{t('search_page.enabled_description')}</p>
        </div>
        <Switch
          checked={settings.enabled}
          className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
          onCheckedChange={(checked) => {
            onUpdateSettings((current) => ({
              ...current,
              enabled: checked,
            }));
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="search-tavily-api-key">
              {t('search_page.api_key_label')}
            </label>
            <p className="text-muted-foreground text-sm">{t('search_page.api_key_description')}</p>
          </div>
          <Button size="icon" type="button" variant="outline" onClick={onToggleApiKeyVisibility}>
            {isApiKeyVisible ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </div>

        <Input
          autoCapitalize="none"
          autoCorrect="off"
          id="search-tavily-api-key"
          placeholder={t('search_page.api_key_placeholder')}
          spellCheck={false}
          type={isApiKeyVisible ? 'text' : 'password'}
          value={settings.apiKey}
          onChange={(event) => {
            const value = event.target.value;
            onUpdateSettings((current) => ({
              ...current,
              apiKey: value,
            }));
          }}
        />

        <p className="text-muted-foreground text-xs">{t('search_page.api_key_hint')}</p>
      </div>
    </div>
  );
}
