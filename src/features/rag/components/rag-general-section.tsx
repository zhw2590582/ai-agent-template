'use client';

import { useTranslations } from 'next-intl';

import { Switch } from '@/components/ui/switch';
import type { RagSettings } from '@/features/rag/types';

interface RagGeneralSectionProps {
  settings: RagSettings;
  onUpdateSettings: (updater: (settings: RagSettings) => RagSettings) => void;
}

export function RagGeneralSection({ settings, onUpdateSettings }: RagGeneralSectionProps) {
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
    </section>
  );
}
