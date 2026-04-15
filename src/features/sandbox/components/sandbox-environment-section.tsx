'use client';

import { ChevronDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
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
    <Collapsible className="border-border rounded-md border" defaultOpen={false}>
      <CollapsibleTrigger className="group hover:bg-muted/40 flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">{t('sandbox_page.advanced_title')}</h3>
          <p className="text-muted-foreground text-sm">{t('sandbox_page.advanced_description')}</p>
        </div>
        <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t px-5 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="sandbox-template">
              {t('sandbox_page.template_label')}
            </label>
            <Input
              id="sandbox-template"
              placeholder={t('sandbox_page.template_placeholder')}
              value={settings.template}
              onChange={(event) => {
                const value = event.target.value;
                onUpdateSettings((current) => ({
                  ...current,
                  template: value,
                }));
              }}
            />
            <p className="text-muted-foreground text-xs">
              {t('sandbox_page.template_description')}
            </p>
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
            <p className="text-muted-foreground text-xs">
              {t('sandbox_page.env_vars_description')}
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
