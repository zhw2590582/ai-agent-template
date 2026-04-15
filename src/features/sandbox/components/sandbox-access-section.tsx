'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import type { SandboxSettings } from '@/features/sandbox/types';

interface SandboxAccessSectionProps {
  onUpdateSettings: (updater: (settings: SandboxSettings) => SandboxSettings) => void;
  settings: SandboxSettings;
}

const ACCESS_ITEMS = [
  {
    key: 'allowFilesystem',
    titleKey: 'sandbox_page.access_filesystem_label',
    descriptionKey: 'sandbox_page.access_filesystem_description',
  },
  {
    key: 'allowCommands',
    titleKey: 'sandbox_page.access_commands_label',
    descriptionKey: 'sandbox_page.access_commands_description',
  },
  {
    key: 'allowPty',
    titleKey: 'sandbox_page.access_terminal_label',
    descriptionKey: 'sandbox_page.access_terminal_description',
  },
  {
    key: 'allowInternetAccess',
    titleKey: 'sandbox_page.access_network_label',
    descriptionKey: 'sandbox_page.access_network_description',
  },
  {
    key: 'allowFileUpload',
    titleKey: 'sandbox_page.access_upload_label',
    descriptionKey: 'sandbox_page.access_upload_description',
  },
  {
    key: 'allowFileDownload',
    titleKey: 'sandbox_page.access_download_label',
    descriptionKey: 'sandbox_page.access_download_description',
  },
] as const;

type AccessKey = (typeof ACCESS_ITEMS)[number]['key'];

export function SandboxAccessSection({ onUpdateSettings, settings }: SandboxAccessSectionProps) {
  const t = useTranslations();

  return (
    <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{t('sandbox_page.access_title')}</h3>
          <Badge variant="secondary">{t('sandbox_page.policy_badge')}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">{t('sandbox_page.access_description')}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {ACCESS_ITEMS.map((item) => {
          const checked = settings.access[item.key];

          return (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 rounded-md border px-4 py-3"
            >
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-medium">{t(item.titleKey)}</h4>
                <p className="text-muted-foreground text-xs">{t(item.descriptionKey)}</p>
              </div>
              <Switch
                checked={checked}
                className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
                onCheckedChange={(value) => {
                  onUpdateSettings((current) => ({
                    ...current,
                    access: {
                      ...current.access,
                      [item.key as AccessKey]: value,
                    },
                  }));
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
