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

interface SearchCrawlSectionProps {
  onUpdateSettings: (updater: (settings: SearchSettings) => SearchSettings) => void;
  settings: SearchSettings;
}

export function SearchCrawlSection({ onUpdateSettings, settings }: SearchCrawlSectionProps) {
  const t = useTranslations();

  return (
    <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{t('search_page.crawl_title')}</h3>
        <p className="text-muted-foreground text-sm">{t('search_page.crawl_description')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="crawl-max-depth">
            {t('search_page.crawl_max_depth_label')}
          </label>
          <Input
            id="crawl-max-depth"
            max={SEARCH_CONFIG.CRAWL_MAX_DEPTH_MAX}
            min={SEARCH_CONFIG.CRAWL_MAX_DEPTH_MIN}
            type="number"
            value={String(settings.crawl.maxDepth)}
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10);
              onUpdateSettings((current) => ({
                ...current,
                crawl: {
                  ...current.crawl,
                  maxDepth: Number.isFinite(parsed)
                    ? Math.min(
                        SEARCH_CONFIG.CRAWL_MAX_DEPTH_MAX,
                        Math.max(SEARCH_CONFIG.CRAWL_MAX_DEPTH_MIN, parsed)
                      )
                    : current.crawl.maxDepth,
                },
              }));
            }}
          />
          <p className="text-muted-foreground text-xs">
            {t('search_page.crawl_max_depth_description')}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="crawl-page-limit">
            {t('search_page.crawl_page_limit_label')}
          </label>
          <Input
            id="crawl-page-limit"
            max={SEARCH_CONFIG.CRAWL_PAGE_LIMIT_MAX}
            min={SEARCH_CONFIG.CRAWL_PAGE_LIMIT_MIN}
            type="number"
            value={String(settings.crawl.pageLimit)}
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10);
              onUpdateSettings((current) => ({
                ...current,
                crawl: {
                  ...current.crawl,
                  pageLimit: Number.isFinite(parsed)
                    ? Math.min(
                        SEARCH_CONFIG.CRAWL_PAGE_LIMIT_MAX,
                        Math.max(SEARCH_CONFIG.CRAWL_PAGE_LIMIT_MIN, parsed)
                      )
                    : current.crawl.pageLimit,
                },
              }));
            }}
          />
          <p className="text-muted-foreground text-xs">
            {t('search_page.crawl_page_limit_description')}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('search_page.crawl_external_label')}</label>
          <Select
            value={settings.crawl.allowExternal ? 'enabled' : 'disabled'}
            onValueChange={(value: 'disabled' | 'enabled') => {
              onUpdateSettings((current) => ({
                ...current,
                crawl: {
                  ...current.crawl,
                  allowExternal: value === 'enabled',
                },
              }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enabled">{t('common.enabled')}</SelectItem>
              <SelectItem value="disabled">{t('common.disabled')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            {t('search_page.crawl_external_description')}
          </p>
        </div>
      </div>
    </div>
  );
}
