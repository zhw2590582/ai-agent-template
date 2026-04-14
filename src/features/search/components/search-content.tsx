'use client';

import { useEffect, useState } from 'react';
import { EyeIcon, EyeOffIcon, ExternalLinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { CHAT_UI_CONFIG } from '@/config/chat';
import { SEARCH_CONFIG } from '@/config/search';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import type { SearchSettings } from '@/features/search/types';

interface SearchContentProps {
  onClose?: () => void;
  onSearchSettingsChange: (
    updater: (settings: SearchSettings) => SearchSettings
  ) => Promise<boolean> | void;
  settings: SearchSettings;
}

export function SearchContent({ onClose, onSearchSettingsChange, settings }: SearchContentProps) {
  const t = useTranslations();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!showSaved) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowSaved(false);
    }, CHAT_UI_CONFIG.SAVE_FEEDBACK_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [showSaved]);

  const isDirty = JSON.stringify(localSettings) !== JSON.stringify(settings);

  return (
    <WorkbenchDialogPanel
      bodyClassName="overflow-y-auto"
      footer={
        <>
          <Button
            className="min-w-24"
            type="button"
            variant="outline"
            onClick={() => {
              setLocalSettings(settings);
              onClose?.();
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            className="min-w-24"
            disabled={!isDirty || isSaving}
            type="button"
            onClick={async () => {
              setIsSaving(true);
              try {
                const success = await onSearchSettingsChange(() => localSettings);
                if (success === false) {
                  toast.error(t('search_page.toast.save_failed'));
                  return;
                }

                setShowSaved(true);
                toast.success(t('search_page.toast.save_success'));
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? <Spinner data-icon="inline-start" /> : null}
            {showSaved ? t('models_page.actions.saved') : t('common.save')}
          </Button>
        </>
      }
    >
      <div className="text-foreground mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-8">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{t('search_page.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('search_page.description')}</p>
          </div>

          <div className="border-border overflow-hidden rounded-md border">
            <div className="border-border flex items-center justify-between gap-4 border-b px-5 py-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium">{t('search_page.enabled_label')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('search_page.enabled_description')}
                </p>
              </div>
              <Switch
                checked={localSettings.enabled}
                className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
                onCheckedChange={(checked) => {
                  setLocalSettings((current) => ({
                    ...current,
                    enabled: checked,
                  }));
                }}
              />
            </div>

            <div className="flex flex-col gap-3 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" htmlFor="search-tavily-api-key">
                    {t('search_page.api_key_label')}
                  </label>
                  <p className="text-muted-foreground text-sm">
                    {t('search_page.api_key_description')}
                  </p>
                </div>
                <Button
                  size="icon"
                  type="button"
                  variant="outline"
                  onClick={() => setIsApiKeyVisible((current) => !current)}
                >
                  {isApiKeyVisible ? <EyeOffIcon /> : <EyeIcon />}
                </Button>
              </div>

              <Input
                id="search-tavily-api-key"
                placeholder={t('search_page.api_key_placeholder')}
                type={isApiKeyVisible ? 'text' : 'password'}
                value={localSettings.tavilyApiKey}
                onChange={(event) => {
                  setLocalSettings((current) => ({
                    ...current,
                    tavilyApiKey: event.target.value,
                  }));
                }}
              />

              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs">{t('search_page.api_key_hint')}</p>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={!localSettings.tavilyApiKey.trim() || isTesting}
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      setIsTesting(true);
                      try {
                        const response = await fetch('/api/search/test', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            apiKey: localSettings.tavilyApiKey,
                            maxResults: localSettings.maxResults,
                            searchDepth: localSettings.searchDepth,
                            topic: localSettings.topic,
                          }),
                        });

                        if (!response.ok) {
                          toast.error(t('search_page.toast.test_failed'));
                          return;
                        }

                        const data = (await response.json()) as { resultCount?: number };
                        toast.success(
                          t('search_page.toast.test_success', {
                            count: String(data.resultCount ?? 0),
                          })
                        );
                      } finally {
                        setIsTesting(false);
                      }
                    }}
                  >
                    {isTesting ? <Spinner data-icon="inline-start" /> : null}
                    {t('search_page.test_connection')}
                  </Button>
                  <a
                    className="text-sm font-medium underline underline-offset-4"
                    href="https://app.tavily.com/home"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLinkIcon data-icon="inline-start" />
                    {t('search_page.get_api_key')}
                  </a>
                </div>
              </div>
            </div>

            <div className="border-border border-t px-5 py-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">{t('search_page.depth_label')}</label>
                  <Select
                    value={localSettings.searchDepth}
                    onValueChange={(value: SearchSettings['searchDepth']) => {
                      setLocalSettings((current) => ({
                        ...current,
                        searchDepth: value,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">{t('search_page.depth_basic')}</SelectItem>
                      <SelectItem value="advanced">{t('search_page.depth_advanced')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    {t('search_page.depth_description')}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">{t('search_page.topic_label')}</label>
                  <Select
                    value={localSettings.topic}
                    onValueChange={(value: SearchSettings['topic']) => {
                      setLocalSettings((current) => ({
                        ...current,
                        topic: value,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{t('search_page.topic_general')}</SelectItem>
                      <SelectItem value="news">{t('search_page.topic_news')}</SelectItem>
                      <SelectItem value="finance">{t('search_page.topic_finance')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    {t('search_page.topic_description')}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="search-max-results">
                    {t('search_page.max_results_label')}
                  </label>
                  <Input
                    id="search-max-results"
                    max={SEARCH_CONFIG.MAX_RESULTS_MAX}
                    min={SEARCH_CONFIG.MAX_RESULTS_MIN}
                    type="number"
                    value={String(localSettings.maxResults)}
                    onChange={(event) => {
                      const parsed = Number.parseInt(event.target.value, 10);
                      setLocalSettings((current) => ({
                        ...current,
                        maxResults: Number.isFinite(parsed)
                          ? Math.min(
                              SEARCH_CONFIG.MAX_RESULTS_MAX,
                              Math.max(SEARCH_CONFIG.MAX_RESULTS_MIN, parsed)
                            )
                          : current.maxResults,
                      }));
                    }}
                  />
                  <p className="text-muted-foreground text-xs">
                    {t('search_page.max_results_description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </WorkbenchDialogPanel>
  );
}
