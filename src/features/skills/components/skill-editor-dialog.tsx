'use client';

import { useMemo, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { deriveSkillMetadataFromUrl } from '@/features/skills/settings';
import type { SkillDefinition } from '@/features/skills/types';

interface SkillEditorDialogProps {
  initialSkill: SkillDefinition | null;
  mode: 'add' | 'edit';
  onOpenChange: (open: boolean) => void;
  onSave: (skill: SkillDefinition) => Promise<boolean> | boolean;
  open: boolean;
}

export function SkillEditorDialog({
  initialSkill,
  mode,
  onOpenChange,
  onSave,
  open,
}: SkillEditorDialogProps) {
  const t = useTranslations();
  const [skill, setSkill] = useState<SkillDefinition | null>(initialSkill);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isInvalid = useMemo(() => {
    if (!skill) {
      return true;
    }

    return skill.sourceUrl.trim().length === 0;
  }, [skill]);

  if (!skill) {
    return null;
  }

  const isEditing = mode === 'edit';
  const derivedMetadata = deriveSkillMetadataFromUrl(skill.sourceUrl);
  const resolvedName = skill.name.trim() || derivedMetadata.name;
  const resolvedDescription = skill.description.trim() || derivedMetadata.description;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('skills_page.edit_skill_title') : t('skills_page.add_skill_title')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('skills_page.edit_skill_description')
              : t('skills_page.add_skill_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="border-border flex items-center justify-between gap-4 rounded-md border px-4 py-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">{t('skills_page.skill_enabled_label')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('skills_page.skill_enabled_description')}
              </p>
            </div>
            <Switch
              checked={skill.enabled}
              className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
              onCheckedChange={(checked) => {
                setSkill((current) => (current ? { ...current, enabled: checked } : current));
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="skill-source-url">
              {t('skills_page.skill_source_url_label')}
            </label>
            <Input
              id="skill-source-url"
              placeholder={t('skills_page.skill_source_url_placeholder')}
              value={skill.sourceUrl}
              onChange={(event) => {
                const value = event.target.value;
                setSkill((current) => (current ? { ...current, sourceUrl: value } : current));
              }}
            />
            <p className="text-muted-foreground text-xs">
              {t('skills_page.skill_source_url_description')}
            </p>
          </div>

          <div className="border-border bg-muted/20 flex flex-col gap-3 rounded-md border px-4 py-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{t('skills_page.parsed_name_label')}</span>
              <p className="text-sm">{resolvedName || t('skills_page.parsed_empty')}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {t('skills_page.parsed_description_label')}
              </span>
              <p className="text-muted-foreground text-sm">
                {resolvedDescription || t('skills_page.parsed_empty')}
              </p>
            </div>
            <p className="text-muted-foreground text-xs">
              {t('skills_page.parsed_description_hint')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            disabled={isInvalid || isSubmitting}
            type="button"
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const success = await onSave({
                  ...skill,
                  description: resolvedDescription,
                  name: resolvedName,
                });
                if (success !== false) {
                  onOpenChange(false);
                }
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
