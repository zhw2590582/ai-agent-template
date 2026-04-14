import { useEffect, useRef, useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CHAT_UI_CONFIG, MEMORY_EXTRACTION_CONFIG } from '@/config/app';
import type { MemorySettings } from '@/features/models/types';

interface MemoryControlsProps {
  onExport?: () => void;
  isAuthenticated: boolean;
  onSettingsChange: (updater: (settings: MemorySettings) => MemorySettings) => void;
  settings: MemorySettings;
  t: (key: string) => string;
}

export function MemoryControls({
  onExport,
  isAuthenticated,
  onSettingsChange,
  settings,
  t,
}: MemoryControlsProps) {
  const [draftNumbers, setDraftNumbers] = useState({
    contextMaxItems: String(settings.contextMaxItems),
    recentMessageWindow: String(settings.recentMessageWindow),
    summaryMinMessages: String(settings.summaryMinMessages),
  });
  const debounceTimeoutsRef = useRef<
    Partial<Record<'contextMaxItems' | 'recentMessageWindow' | 'summaryMinMessages', number>>
  >({});
  const changeSourceRef = useRef<'pointer' | 'stepper' | 'typing' | null>(null);

  useEffect(() => {
    const timeouts = debounceTimeoutsRef.current;
    return () => {
      for (const timeoutId of Object.values(timeouts)) {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      }
    };
  }, []);

  const commitNumberSetting = (
    key: 'contextMaxItems' | 'recentMessageWindow' | 'summaryMinMessages',
    value: string
  ) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
      setDraftNumbers((current) => ({
        ...current,
        [key]: String(settings[key]),
      }));
      return false;
    }

    onSettingsChange((current) => ({
      ...current,
      [key]: parsed,
    }));
    return true;
  };

  const scheduleNumberSave = (
    key: 'contextMaxItems' | 'recentMessageWindow' | 'summaryMinMessages',
    value: string
  ) => {
    const existingTimeout = debounceTimeoutsRef.current[key];
    if (existingTimeout) {
      window.clearTimeout(existingTimeout);
    }

    debounceTimeoutsRef.current[key] = window.setTimeout(() => {
      commitNumberSetting(key, value);
      debounceTimeoutsRef.current[key] = undefined;
    }, CHAT_UI_CONFIG.MEMORY_SETTINGS_INPUT_DEBOUNCE_MS);
  };

  const updateDraftNumber = (
    key: 'contextMaxItems' | 'recentMessageWindow' | 'summaryMinMessages',
    value: string
  ) => {
    setDraftNumbers((current) => ({
      ...current,
      [key]: value,
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
              <DownloadIcon data-icon="inline-start" />
              {t('memory_page.controls.export')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="border-border overflow-hidden rounded-md border">
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
              disabled={!isAuthenticated}
              onCheckedChange={(checked) => {
                onSettingsChange((current) => ({
                  ...current,
                  [item.key]: checked,
                }));
              }}
            />
          </div>
        ))}
      </div>

      <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
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
              disabled={!isAuthenticated}
              id="memory-summary-min-messages"
              min={MEMORY_EXTRACTION_CONFIG.MIN_MESSAGES}
              onBlur={(event) => {
                const existingTimeout = debounceTimeoutsRef.current.summaryMinMessages;
                if (existingTimeout) {
                  window.clearTimeout(existingTimeout);
                  debounceTimeoutsRef.current.summaryMinMessages = undefined;
                }
                commitNumberSetting('summaryMinMessages', event.target.value);
              }}
              onChange={(event) => {
                updateDraftNumber('summaryMinMessages', event.target.value);
                if (
                  changeSourceRef.current === 'pointer' ||
                  changeSourceRef.current === 'stepper'
                ) {
                  scheduleNumberSave('summaryMinMessages', event.target.value);
                }
                changeSourceRef.current = null;
              }}
              onKeyDown={(event) => {
                changeSourceRef.current =
                  event.key === 'ArrowDown' || event.key === 'ArrowUp' ? 'stepper' : 'typing';
              }}
              onPointerDown={() => {
                changeSourceRef.current = 'pointer';
              }}
              type="number"
              value={draftNumbers.summaryMinMessages}
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
              disabled={!isAuthenticated}
              id="memory-recent-message-window"
              min={MEMORY_EXTRACTION_CONFIG.MIN_MESSAGES}
              onBlur={(event) => {
                const existingTimeout = debounceTimeoutsRef.current.recentMessageWindow;
                if (existingTimeout) {
                  window.clearTimeout(existingTimeout);
                  debounceTimeoutsRef.current.recentMessageWindow = undefined;
                }
                commitNumberSetting('recentMessageWindow', event.target.value);
              }}
              onChange={(event) => {
                updateDraftNumber('recentMessageWindow', event.target.value);
                if (
                  changeSourceRef.current === 'pointer' ||
                  changeSourceRef.current === 'stepper'
                ) {
                  scheduleNumberSave('recentMessageWindow', event.target.value);
                }
                changeSourceRef.current = null;
              }}
              onKeyDown={(event) => {
                changeSourceRef.current =
                  event.key === 'ArrowDown' || event.key === 'ArrowUp' ? 'stepper' : 'typing';
              }}
              onPointerDown={() => {
                changeSourceRef.current = 'pointer';
              }}
              type="number"
              value={draftNumbers.recentMessageWindow}
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
              disabled={!isAuthenticated}
              id="memory-context-max-items"
              min={1}
              onBlur={(event) => {
                const existingTimeout = debounceTimeoutsRef.current.contextMaxItems;
                if (existingTimeout) {
                  window.clearTimeout(existingTimeout);
                  debounceTimeoutsRef.current.contextMaxItems = undefined;
                }
                commitNumberSetting('contextMaxItems', event.target.value);
              }}
              onChange={(event) => {
                updateDraftNumber('contextMaxItems', event.target.value);
                if (
                  changeSourceRef.current === 'pointer' ||
                  changeSourceRef.current === 'stepper'
                ) {
                  scheduleNumberSave('contextMaxItems', event.target.value);
                }
                changeSourceRef.current = null;
              }}
              onKeyDown={(event) => {
                changeSourceRef.current =
                  event.key === 'ArrowDown' || event.key === 'ArrowUp' ? 'stepper' : 'typing';
              }}
              onPointerDown={() => {
                changeSourceRef.current = 'pointer';
              }}
              type="number"
              value={draftNumbers.contextMaxItems}
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
