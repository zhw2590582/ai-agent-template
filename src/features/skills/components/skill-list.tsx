'use client';

import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SkillCapabilityBadges } from '@/features/skills/components/skill-capability-badges';
import type { SkillDefinition } from '@/features/skills/types';

interface SkillListProps {
  clearDeleteTarget: () => void;
  deleteTargetId: string | null;
  onAddSkill: () => void;
  onConfirmDelete: () => Promise<void> | void;
  onDeleteSkill: (skillId: string) => void;
  onEditSkill: (skillId: string) => void;
  onToggleSkillEnabled: (skillId: string, enabled: boolean) => void;
  skills: SkillDefinition[];
}

export function SkillList({
  clearDeleteTarget,
  deleteTargetId,
  onAddSkill,
  onConfirmDelete,
  onDeleteSkill,
  onEditSkill,
  onToggleSkillEnabled,
  skills,
}: SkillListProps) {
  const t = useTranslations();
  const deleteTarget = skills.find((skill) => skill.id === deleteTargetId) ?? null;

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{t('skills_page.skills_title')}</h2>
            <p className="text-muted-foreground text-sm">{t('skills_page.skills_description')}</p>
          </div>
          <Button type="button" variant="outline" onClick={onAddSkill}>
            <PlusIcon data-icon="inline-start" />
            {t('skills_page.add_skill')}
          </Button>
        </div>

        <div className="border-border overflow-hidden rounded-md border">
          {skills.length === 0 ? (
            <div className="text-muted-foreground px-5 py-8 text-sm">
              {t('skills_page.empty_state')}
            </div>
          ) : (
            skills.map((skill) => (
              <article
                key={skill.id}
                className="border-border flex flex-col gap-3 border-b px-5 py-4 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-medium">{skill.name}</h3>
                      <Badge variant={skill.enabled ? 'secondary' : 'outline'}>
                        {skill.enabled ? t('common.enabled') : t('common.disabled')}
                      </Badge>
                    </div>
                    {skill.description ? (
                      <p className="text-sm leading-6">{skill.description}</p>
                    ) : null}
                    <p className="text-muted-foreground truncate text-sm">{skill.sourceUrl}</p>
                    <SkillCapabilityBadges capabilities={skill.capabilities} />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={skill.enabled}
                      className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
                      onCheckedChange={(checked) => onToggleSkillEnabled(skill.id, checked)}
                    />
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => onEditSkill(skill.id)}
                    >
                      <PencilIcon />
                      {t('skills_page.edit_skill')}
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => onDeleteSkill(skill.id)}
                    >
                      <Trash2Icon />
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) {
            clearDeleteTarget();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('skills_page.delete_skill_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('skills_page.delete_skill_description', {
                skillName: deleteTarget?.name ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(event) => {
                event.preventDefault();
                void onConfirmDelete();
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
