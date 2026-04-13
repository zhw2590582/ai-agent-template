import { DownloadIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MemorySettings } from '@/features/models/types';

interface MemoryControlsProps {
  onExport?: () => void;
  isAuthenticated: boolean;
  isSaving?: boolean;
  onSettingsChange: (
    updater: (settings: MemorySettings) => MemorySettings
  ) => Promise<boolean> | void;
  settings: MemorySettings;
  t: (key: string) => string;
}

export function MemoryControls({
  onExport,
  isAuthenticated,
  isSaving = false,
  onSettingsChange,
  settings,
  t,
}: MemoryControlsProps) {
  const updateNumberSetting = (
    key: 'contextMaxItems' | 'recentMessageWindow' | 'summaryMinMessages',
    value: string
  ) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
      return;
    }

    void onSettingsChange((current) => ({
      ...current,
      [key]: parsed,
    }));
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{t('memory_page.controls.title')}</h2>
          <p className="text-muted-foreground text-sm">{t('memory_page.controls.description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onExport ? (
            <Button onClick={onExport} size="sm" type="button" variant="outline">
              <DownloadIcon />
              {t('memory_page.controls.export')}
            </Button>
          ) : null}
          <Badge variant={settings.enabled ? 'default' : 'secondary'}>
            {settings.enabled
              ? t('memory_page.controls.enabled')
              : t('memory_page.controls.disabled')}
          </Badge>
          <Badge variant="secondary">
            {isAuthenticated
              ? t('memory_page.controls.scope_account')
              : t('memory_page.controls.scope_guest')}
          </Badge>
        </div>
      </div>

      <Alert>
        <AlertTitle>{t('memory_page.controls.notice_title')}</AlertTitle>
        <AlertDescription>
          {isAuthenticated
            ? t('memory_page.controls.notice_authenticated')
            : t('memory_page.controls.notice_guest')}
        </AlertDescription>
      </Alert>

      <div className="border-border flex flex-col border">
        {(
          [
            {
              checked: settings.enabled,
              description: t('memory_page.controls.enable_description'),
              key: 'enabled',
              label: t('memory_page.controls.enable_label'),
            },
            {
              checked: settings.autoWrite,
              description: t('memory_page.controls.auto_write_description'),
              key: 'autoWrite',
              label: t('memory_page.controls.auto_write_label'),
            },
            {
              checked: settings.crossConversation,
              description: t('memory_page.controls.cross_conversation_description'),
              key: 'crossConversation',
              label: t('memory_page.controls.cross_conversation_label'),
            },
          ] as const
        ).map((item) => (
          <div
            className="border-border flex items-center justify-between gap-4 border-b px-5 py-4 last:border-b-0"
            key={item.key}
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">{item.label}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>
            <Switch
              checked={item.checked}
              className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
              disabled={!isAuthenticated || isSaving}
              onCheckedChange={(checked) => {
                void onSettingsChange((current) => ({
                  ...current,
                  [item.key]: checked,
                }));
              }}
            />
          </div>
        ))}
      </div>

      <div className="border-border flex flex-col gap-4 border px-5 py-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">{t('memory_page.controls.advanced_title')}</h3>
          <p className="text-muted-foreground text-sm">
            {t('memory_page.controls.advanced_description')}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="memory-summary-min-messages">
              {t('memory_page.controls.summary_min_messages_label')}
            </label>
            <Input
              disabled={!isAuthenticated || isSaving}
              id="memory-summary-min-messages"
              min={2}
              onChange={(event) => updateNumberSetting('summaryMinMessages', event.target.value)}
              type="number"
              value={settings.summaryMinMessages}
            />
            <p className="text-muted-foreground text-xs">
              {t('memory_page.controls.summary_min_messages_description')}
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="memory-recent-message-window">
              {t('memory_page.controls.recent_message_window_label')}
            </label>
            <Input
              disabled={!isAuthenticated || isSaving}
              id="memory-recent-message-window"
              min={2}
              onChange={(event) => updateNumberSetting('recentMessageWindow', event.target.value)}
              type="number"
              value={settings.recentMessageWindow}
            />
            <p className="text-muted-foreground text-xs">
              {t('memory_page.controls.recent_message_window_description')}
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="memory-context-max-items">
              {t('memory_page.controls.context_max_items_label')}
            </label>
            <Input
              disabled={!isAuthenticated || isSaving}
              id="memory-context-max-items"
              min={1}
              onChange={(event) => updateNumberSetting('contextMaxItems', event.target.value)}
              type="number"
              value={settings.contextMaxItems}
            />
            <p className="text-muted-foreground text-xs">
              {t('memory_page.controls.context_max_items_description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
