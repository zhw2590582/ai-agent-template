'use client';

import { ExternalLinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { API_ROUTES } from '@/config/api';
import { SkillCapabilityBadges } from '@/features/skills/components/skill-capability-badges';
import type { ResolvedSkillCatalogItem, SkillCatalogItem } from '@/features/skills/types';

interface SkillInstallDialogProps {
  isInstalled: boolean;
  onInstall: (skill: ResolvedSkillCatalogItem) => Promise<boolean | void> | boolean | void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  skill: SkillCatalogItem | null;
}

export function SkillInstallDialog({
  isInstalled,
  onInstall,
  onOpenChange,
  open,
  skill,
}: SkillInstallDialogProps) {
  const t = useTranslations();
  const [resolvedSkill, setResolvedSkill] = useState<ResolvedSkillCatalogItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (!open || !skill) {
      setResolvedSkill(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    void (async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `${API_ROUTES.skillsResolve}?id=${encodeURIComponent(skill.id)}&name=${encodeURIComponent(
            skill.name
          )}&skillId=${encodeURIComponent(skill.skillId)}&source=${encodeURIComponent(
            skill.source
          )}&installs=${skill.installs}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          setResolvedSkill(null);
          return;
        }

        const data = (await response.json()) as {
          skill?: ResolvedSkillCatalogItem;
        };

        setResolvedSkill(data.skill ?? null);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setResolvedSkill(null);
        }
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [open, skill]);

  const installLabel = isInstalled
    ? t('skills_page.install_dialog.reinstall')
    : t('skills_page.install_dialog.install');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{skill?.name ?? t('skills_page.install_dialog.title')}</DialogTitle>
          <DialogDescription>{t('skills_page.install_dialog.description')}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : resolvedSkill ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {resolvedSkill.version ? (
                <span className="text-muted-foreground">
                  {t('skills_page.install_dialog.version', {
                    version: resolvedSkill.version,
                  })}
                </span>
              ) : null}
              <span className="text-muted-foreground">
                {t('skills_page.search_dialog.installs', {
                  count: resolvedSkill.installs,
                })}
              </span>
              <a
                className="text-sm underline underline-offset-4"
                href={resolvedSkill.githubUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLinkIcon data-icon="inline-start" />
                {t('skills_page.install_dialog.open_github')}
              </a>
            </div>

            <div className="border-border bg-muted/20 rounded-md border px-4 py-3">
              <p className="text-sm font-medium">{resolvedSkill.description}</p>
              {resolvedSkill.summary ? (
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {resolvedSkill.summary}
                </p>
              ) : null}
            </div>

            <SkillCapabilityBadges capabilities={resolvedSkill.capabilities} />

            <div className="border-border overflow-hidden rounded-md border">
              <div className="border-border bg-muted/30 px-4 py-2 text-xs font-medium tracking-wide uppercase">
                SKILL.md
              </div>
              <ScrollArea className="max-h-72">
                <pre className="text-foreground overflow-x-auto p-4 text-xs whitespace-pre-wrap">
                  {resolvedSkill.markdown}
                </pre>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground rounded-md border px-4 py-8 text-sm">
            {t('skills_page.install_dialog.load_failed')}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            disabled={!resolvedSkill || isInstalling}
            type="button"
            onClick={async () => {
              if (!resolvedSkill) {
                return;
              }

              setIsInstalling(true);
              try {
                const success = await onInstall(resolvedSkill);
                if (success !== false) {
                  onOpenChange(false);
                }
              } finally {
                setIsInstalling(false);
              }
            }}
          >
            {isInstalling ? <Spinner data-icon="inline-start" /> : null}
            {installLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
