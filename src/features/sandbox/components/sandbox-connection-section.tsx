'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { SandboxSettings } from '@/features/sandbox/types';

interface SandboxConnectionSectionProps {
  isApiKeyVisible: boolean;
  onToggleApiKeyVisibility: () => void;
  onUpdateSettings: (updater: (settings: SandboxSettings) => SandboxSettings) => void;
  settings: SandboxSettings;
}

export function SandboxConnectionSection({
  isApiKeyVisible,
  onToggleApiKeyVisibility,
  onUpdateSettings,
  settings,
}: SandboxConnectionSectionProps) {
  const t = useTranslations();

  return (
    <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">{t('sandbox_page.enabled_label')}</h3>
          <p className="text-muted-foreground text-sm">{t('sandbox_page.enabled_description')}</p>
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
            <label className="text-sm font-medium" htmlFor="sandbox-api-key">
              {t('sandbox_page.api_key_label')}
            </label>
            <p className="text-muted-foreground text-sm">{t('sandbox_page.api_key_description')}</p>
          </div>
          <Button size="icon" type="button" variant="outline" onClick={onToggleApiKeyVisibility}>
            {isApiKeyVisible ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </div>

        <Input
          autoCapitalize="none"
          autoCorrect="off"
          id="sandbox-api-key"
          placeholder={t('sandbox_page.api_key_placeholder')}
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
        <p className="text-muted-foreground text-xs">{t('sandbox_page.api_key_hint')}</p>
      </div>
    </div>
  );
}
