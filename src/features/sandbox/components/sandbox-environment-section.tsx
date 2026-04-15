'use client';

import { useTranslations } from 'next-intl';

import { Textarea } from '@/components/ui/textarea';
import type { SandboxSettings } from '@/features/sandbox/types';

interface SandboxEnvironmentSectionProps {
  onUpdateSettings: (updater: (settings: SandboxSettings) => SandboxSettings) => void;
  settings: SandboxSettings;
}

export function SandboxEnvironmentSection({
  onUpdateSettings,
  settings,
}: SandboxEnvironmentSectionProps) {
  const t = useTranslations();

  return (
    <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{t('sandbox_page.environment_title')}</h3>
        <p className="text-muted-foreground text-sm">{t('sandbox_page.environment_description')}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="sandbox-env-vars">
          {t('sandbox_page.env_vars_label')}
        </label>
        <Textarea
          id="sandbox-env-vars"
          className="min-h-36 font-mono text-sm"
          placeholder={t('sandbox_page.env_vars_placeholder')}
          value={settings.envVarsText}
          onChange={(event) => {
            const value = event.target.value;
            onUpdateSettings((current) => ({
              ...current,
              envVarsText: value,
            }));
          }}
        />
        <p className="text-muted-foreground text-xs">{t('sandbox_page.env_vars_description')}</p>
      </div>
    </div>
  );
}
