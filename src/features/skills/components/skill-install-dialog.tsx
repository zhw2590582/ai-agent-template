'use client';

import { Badge } from '@/components/ui/badge';
import { ExternalLinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { MessageResponse } from '@/components/ai-elements/message';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { API_ROUTES } from '@/config/api';
import { buildResolvedSkillCatalogItemFromPackage } from '@/features/skills/catalog';
import { SkillCapabilityBadges } from '@/features/skills/components/skill-capability-badges';
import type {
  InstalledSkillPackage,
  ResolvedSkillCatalogItem,
  SkillCatalogItem,
} from '@/features/skills/types';

interface CatalogSkillDialogTarget {
  kind: 'catalog';
  skill: SkillCatalogItem;
}

interface InstalledSkillDialogTarget {
  kind: 'installed';
  skillPackage: InstalledSkillPackage;
}

export type SkillDialogTarget = CatalogSkillDialogTarget | InstalledSkillDialogTarget;

interface SkillInstallDialogProps {
  isInstalled: boolean;
  onInstall: (skill: ResolvedSkillCatalogItem) => Promise<boolean | void> | boolean | void;
  onRequestDeleteInstalledSkill?: (skillId: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  target: SkillDialogTarget | null;
}

function buildResolveQuery(target: SkillDialogTarget, includeFiles: boolean) {
  const skill =
    target.kind === 'catalog'
      ? target.skill
      : {
          id: target.skillPackage.id,
          installs: 0,
          name: target.skillPackage.name,
          skillId: target.skillPackage.skillId,
          source: target.skillPackage.source,
        };

  const params = new URLSearchParams({
    id: skill.id,
    includeFiles: includeFiles ? 'true' : 'false',
    installs: String(skill.installs),
    name: skill.name,
    skillId: skill.skillId,
    source: skill.source,
  });

  return params.toString();
}

export function SkillInstallDialog({
  isInstalled,
  onInstall,
  onRequestDeleteInstalledSkill,
  onOpenChange,
  open,
  target,
}: SkillInstallDialogProps) {
  const t = useTranslations();
  const [resolvedSkill, setResolvedSkill] = useState<ResolvedSkillCatalogItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (!open || !target) {
      setResolvedSkill(null);
      setIsLoading(false);
      return;
    }

    if (target.kind === 'installed') {
      setResolvedSkill(buildResolvedSkillCatalogItemFromPackage(target.skillPackage));
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    void (async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `${API_ROUTES.skillsResolve}?${buildResolveQuery(target, false)}`,
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
  }, [open, target]);

  const installLabel = isInstalled
    ? t('skills_page.install_dialog.update')
    : t('skills_page.install_dialog.install');
  const title =
    target?.kind === 'installed'
      ? target.skillPackage.name
      : (target?.skill.name ?? t('skills_page.install_dialog.title'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,52rem)] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t('skills_page.install_dialog.description')}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : resolvedSkill ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 text-sm">
                  {resolvedSkill.version ? (
                    <span className="text-muted-foreground">
                      {t('skills_page.install_dialog.version', {
                        version: resolvedSkill.version,
                      })}
                    </span>
                  ) : null}
                  {resolvedSkill.installs > 0 ? (
                    <span className="text-muted-foreground">
                      {t('skills_page.search_dialog.installs', {
                        count: resolvedSkill.installs,
                      })}
                    </span>
                  ) : null}
                  <SkillCapabilityBadges
                    capabilities={resolvedSkill.capabilities}
                    className="gap-2"
                  />
                  {isInstalled ? (
                    <Badge variant="secondary">
                      {t('skills_page.search_dialog.installed_badge')}
                    </Badge>
                  ) : null}
                </div>
                <Button
                  asChild
                  className="ml-auto shrink-0 whitespace-nowrap"
                  size="sm"
                  variant="outline"
                >
                  <a href={resolvedSkill.githubUrl} rel="noreferrer" target="_blank">
                    <ExternalLinkIcon className="size-4" />
                    <span>{t('skills_page.install_dialog.open_github')}</span>
                  </a>
                </Button>
              </div>

              <div className="border-border overflow-hidden rounded-md border">
                <div className="border-border bg-muted/30 px-4 py-2 text-xs font-medium tracking-wide uppercase">
                  {t('skills_page.install_dialog.description_label')}
                </div>
                <div className="bg-card min-w-0 p-4">
                  <p className="text-sm leading-6">{resolvedSkill.description}</p>
                </div>
              </div>
              <div className="border-border overflow-hidden rounded-md border">
                <div className="border-border bg-muted/30 px-4 py-2 text-xs font-medium tracking-wide uppercase">
                  SKILL.md
                </div>
                <div className="bg-card min-w-0 p-4">
                  <MessageResponse
                    className={`[&_pre]:border-border text-sm leading-6 [&_code]:text-[0.8125rem] [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:shadow-none`}
                    isAnimating={false}
                  >
                    {resolvedSkill.markdown}
                  </MessageResponse>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground rounded-md border px-4 py-8 text-sm">
              {t('skills_page.install_dialog.load_failed')}
            </div>
          )}
        </div>

        <DialogFooter>
          {target?.kind === 'installed' ? (
            <Button
              className="mr-auto"
              type="button"
              variant="destructive"
              onClick={() => {
                onOpenChange(false);
                onRequestDeleteInstalledSkill?.(target.skillPackage.id);
              }}
            >
              {t('common.delete')}
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            disabled={!resolvedSkill || isInstalling}
            type="button"
            onClick={async () => {
              if (!resolvedSkill || !target) {
                return;
              }

              setIsInstalling(true);
              try {
                const response = await fetch(
                  `${API_ROUTES.skillsResolve}?${buildResolveQuery(target, true)}`
                );

                if (!response.ok) {
                  toast.error(t('skills_page.toast.install_failed'));
                  return;
                }

                const data = (await response.json()) as {
                  skill?: ResolvedSkillCatalogItem;
                };

                if (!data.skill) {
                  toast.error(t('skills_page.toast.install_failed'));
                  return;
                }

                const success = await onInstall(data.skill);
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
