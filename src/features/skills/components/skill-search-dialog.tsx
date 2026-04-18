'use client';

import { SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { API_ROUTES } from '@/config/api';
import type { SkillCatalogItem } from '@/features/skills/types';

interface SkillSearchDialogProps {
  installedSkillIds: string[];
  onOpenChange: (open: boolean) => void;
  onSelectSkill: (skill: SkillCatalogItem) => void;
  open: boolean;
}

export function SkillSearchDialog({
  installedSkillIds,
  onOpenChange,
  onSelectSkill,
  open,
}: SkillSearchDialogProps) {
  const t = useTranslations();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SkillCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setIsLoading(false);
      return;
    }

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setIsLoading(true);

        try {
          const response = await fetch(
            `${API_ROUTES.skillsSearch}?q=${encodeURIComponent(trimmedQuery)}&limit=20`,
            {
              signal: controller.signal,
            }
          );

          if (!response.ok) {
            setResults([]);
            return;
          }

          const data = (await response.json()) as {
            skills?: SkillCatalogItem[];
          };

          setResults(data.skills ?? []);
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            setResults([]);
          }
        } finally {
          setIsLoading(false);
        }
      })();
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [open, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('skills_page.search_dialog.title')}</DialogTitle>
          <DialogDescription>{t('skills_page.search_dialog.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              placeholder={t('skills_page.search_dialog.placeholder')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="border-border overflow-hidden rounded-md border">
            <ScrollArea className="max-h-96">
              <div className="flex flex-col">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`skill-search-skeleton-${index}`}
                      className="border-border flex flex-col gap-2 border-b px-4 py-3 last:border-b-0"
                    >
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-full max-w-sm" />
                    </div>
                  ))
                ) : query.trim().length === 0 ? (
                  <div className="text-muted-foreground px-4 py-10 text-sm">
                    {t('skills_page.search_dialog.empty_query')}
                  </div>
                ) : results.length === 0 ? (
                  <div className="text-muted-foreground px-4 py-10 text-sm">
                    {t('skills_page.search_dialog.empty_results')}
                  </div>
                ) : (
                  results.map((skill) => {
                    const isInstalled = installedSkillIds.includes(skill.id);

                    return (
                      <button
                        key={skill.id}
                        className="border-border hover:bg-accent flex w-full flex-col items-start gap-2 border-b px-4 py-3 text-left last:border-b-0"
                        type="button"
                        onClick={() => onSelectSkill(skill)}
                      >
                        <div className="flex w-full items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">{skill.name}</span>
                              {isInstalled ? (
                                <Badge variant="secondary">
                                  {t('skills_page.search_dialog.installed_badge')}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-muted-foreground truncate text-xs">{skill.source}</p>
                          </div>
                          <span className="text-muted-foreground shrink-0 text-xs">
                            {t('skills_page.search_dialog.installs', {
                              count: skill.installs,
                            })}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
