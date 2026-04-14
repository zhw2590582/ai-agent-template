'use client';

import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SEARCH_CONFIG } from '@/config/search';
import type { SearchSettings } from '@/features/search/types';

interface SearchWebSectionProps {
  onUpdateSettings: (updater: (settings: SearchSettings) => SearchSettings) => void;
  settings: SearchSettings;
}

export function SearchWebSection({ onUpdateSettings, settings }: SearchWebSectionProps) {
  const t = useTranslations();

  return (
    <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{t('search_page.search_title')}</h3>
        <p className="text-muted-foreground text-sm">{t('search_page.search_description')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('search_page.depth_label')}</label>
          <Select
            value={settings.search.searchDepth}
            onValueChange={(value: SearchSettings['search']['searchDepth']) => {
              onUpdateSettings((current) => ({
                ...current,
                search: {
                  ...current.search,
                  searchDepth: value,
                },
              }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">{t('search_page.depth_basic')}</SelectItem>
              <SelectItem value="advanced">{t('search_page.depth_advanced')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">{t('search_page.depth_description')}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('search_page.topic_label')}</label>
          <Select
            value={settings.search.topic}
            onValueChange={(value: SearchSettings['search']['topic']) => {
              onUpdateSettings((current) => ({
                ...current,
                search: {
                  ...current.search,
                  topic: value,
                },
              }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">{t('search_page.topic_general')}</SelectItem>
              <SelectItem value="news">{t('search_page.topic_news')}</SelectItem>
              <SelectItem value="finance">{t('search_page.topic_finance')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">{t('search_page.topic_description')}</p>
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
            value={String(settings.search.maxResults)}
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10);
              onUpdateSettings((current) => ({
                ...current,
                search: {
                  ...current.search,
                  maxResults: Number.isFinite(parsed)
                    ? Math.min(
                        SEARCH_CONFIG.MAX_RESULTS_MAX,
                        Math.max(SEARCH_CONFIG.MAX_RESULTS_MIN, parsed)
                      )
                    : current.search.maxResults,
                },
              }));
            }}
          />
          <p className="text-muted-foreground text-xs">
            {t('search_page.max_results_description')}
          </p>
        </div>
      </div>
    </div>
  );
}
