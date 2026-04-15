'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { RagSettings } from '@/features/rag/types';

interface RagConnectionSectionProps {
  isApiKeyVisible: boolean;
  onToggleApiKeyVisibility: () => void;
  onUpdateSettings: (updater: (settings: RagSettings) => RagSettings) => void;
  settings: RagSettings;
}

export function RagConnectionSection({
  isApiKeyVisible,
  onToggleApiKeyVisibility,
  onUpdateSettings,
  settings,
}: RagConnectionSectionProps) {
  const t = useTranslations();

  return (
    <section className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">{t('rag_page.enabled_label')}</h3>
          <p className="text-muted-foreground text-sm">{t('rag_page.enabled_description')}</p>
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
            <label className="text-sm font-medium" htmlFor="rag-api-key">
              {t('rag_page.api_key_label')}
            </label>
            <p className="text-muted-foreground text-sm">{t('rag_page.api_key_description')}</p>
          </div>
          <Button size="icon" type="button" variant="outline" onClick={onToggleApiKeyVisibility}>
            {isApiKeyVisible ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </div>

        <Input
          id="rag-api-key"
          placeholder={t('rag_page.api_key_placeholder')}
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

        <p className="text-muted-foreground text-xs">{t('rag_page.api_key_hint')}</p>
      </div>
    </section>
  );
}
