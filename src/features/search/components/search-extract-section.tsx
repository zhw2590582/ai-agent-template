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

interface SearchExtractSectionProps {
  onUpdateSettings: (updater: (settings: SearchSettings) => SearchSettings) => void;
  settings: SearchSettings;
}

export function SearchExtractSection({ onUpdateSettings, settings }: SearchExtractSectionProps) {
  const t = useTranslations();

  return (
    <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{t('search_page.extract_title')}</h3>
        <p className="text-muted-foreground text-sm">{t('search_page.extract_description')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('search_page.extract_depth_label')}</label>
          <Select
            value={settings.extract.extractDepth}
            onValueChange={(value: SearchSettings['extract']['extractDepth']) => {
              onUpdateSettings((current) => ({
                ...current,
                extract: {
                  ...current.extract,
                  extractDepth: value,
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
          <p className="text-muted-foreground text-xs">
            {t('search_page.extract_depth_description')}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('search_page.extract_format_label')}</label>
          <Select
            value={settings.extract.format}
            onValueChange={(value: SearchSettings['extract']['format']) => {
              onUpdateSettings((current) => ({
                ...current,
                extract: {
                  ...current.extract,
                  format: value,
                },
              }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">{t('search_page.extract_format_markdown')}</SelectItem>
              <SelectItem value="text">{t('search_page.extract_format_text')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            {t('search_page.extract_format_description')}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="extract-chunks-per-source">
            {t('search_page.extract_chunks_label')}
          </label>
          <Input
            id="extract-chunks-per-source"
            max={SEARCH_CONFIG.EXTRACT_CHUNKS_PER_SOURCE_MAX}
            min={SEARCH_CONFIG.EXTRACT_CHUNKS_PER_SOURCE_MIN}
            type="number"
            value={String(settings.extract.chunksPerSource)}
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10);
              onUpdateSettings((current) => ({
                ...current,
                extract: {
                  ...current.extract,
                  chunksPerSource: Number.isFinite(parsed)
                    ? Math.min(
                        SEARCH_CONFIG.EXTRACT_CHUNKS_PER_SOURCE_MAX,
                        Math.max(SEARCH_CONFIG.EXTRACT_CHUNKS_PER_SOURCE_MIN, parsed)
                      )
                    : current.extract.chunksPerSource,
                },
              }));
            }}
          />
          <p className="text-muted-foreground text-xs">
            {t('search_page.extract_chunks_description')}
          </p>
        </div>
      </div>
    </div>
  );
}
