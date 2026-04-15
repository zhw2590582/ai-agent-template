'use client';

import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { SANDBOX_CONFIG } from '@/config/sandbox';
import type { SandboxSettings } from '@/features/sandbox/types';

interface SandboxRuntimeSectionProps {
  onUpdateSettings: (updater: (settings: SandboxSettings) => SandboxSettings) => void;
  settings: SandboxSettings;
}

export function SandboxRuntimeSection({ onUpdateSettings, settings }: SandboxRuntimeSectionProps) {
  const t = useTranslations();

  return (
    <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{t('sandbox_page.runtime_title')}</h3>
        <p className="text-muted-foreground text-sm">{t('sandbox_page.runtime_description')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="sandbox-timeout">
            {t('sandbox_page.timeout_label')}
          </label>
          <Input
            id="sandbox-timeout"
            max={SANDBOX_CONFIG.TIMEOUT_MAX_SECONDS}
            min={SANDBOX_CONFIG.TIMEOUT_MIN_SECONDS}
            type="number"
            value={String(settings.timeoutSeconds)}
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10);
              onUpdateSettings((current) => ({
                ...current,
                timeoutSeconds: Number.isFinite(parsed)
                  ? Math.min(
                      SANDBOX_CONFIG.TIMEOUT_MAX_SECONDS,
                      Math.max(SANDBOX_CONFIG.TIMEOUT_MIN_SECONDS, parsed)
                    )
                  : current.timeoutSeconds,
              }));
            }}
          />
          <p className="text-muted-foreground text-xs">{t('sandbox_page.timeout_description')}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="sandbox-working-directory">
            {t('sandbox_page.working_directory_label')}
          </label>
          <Input
            id="sandbox-working-directory"
            placeholder={t('sandbox_page.working_directory_placeholder')}
            value={settings.workingDirectory}
            onChange={(event) => {
              const value = event.target.value;
              onUpdateSettings((current) => ({
                ...current,
                workingDirectory: value,
              }));
            }}
          />
          <p className="text-muted-foreground text-xs">
            {t('sandbox_page.working_directory_description')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <div className="flex items-center justify-between gap-4 rounded-md border px-4 py-3">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-medium">{t('sandbox_page.access_network_label')}</h4>
            <p className="text-muted-foreground text-xs">
              {t('sandbox_page.access_network_description')}
            </p>
          </div>
          <Switch
            checked={settings.access.allowInternetAccess}
            className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
            onCheckedChange={(checked) => {
              onUpdateSettings((current) => ({
                ...current,
                access: {
                  ...current.access,
                  allowInternetAccess: checked,
                },
              }));
            }}
          />
        </div>
      </div>
    </div>
  );
}
