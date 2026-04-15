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
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { SKILL_CAPABILITIES } from '@/features/skills/settings';
import type { SkillCapability, SkillDefinition } from '@/features/skills/types';
import { cn } from '@/lib/utils';

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

    return skill.name.trim().length === 0 || skill.sourceUrl.trim().length === 0;
  }, [skill]);

  if (!skill) {
    return null;
  }

  const toggleCapability = (capability: SkillCapability) => {
    setSkill((current) => {
      if (!current) {
        return current;
      }

      const capabilities = current.capabilities.includes(capability)
        ? current.capabilities.filter((item) => item !== capability)
        : [...current.capabilities, capability];

      return {
        ...current,
        capabilities: capabilities.length > 0 ? capabilities : ['prompt'],
      };
    });
  };

  const isEditing = mode === 'edit';

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
            <label className="text-sm font-medium" htmlFor="skill-name">
              {t('skills_page.skill_name_label')}
            </label>
            <Input
              id="skill-name"
              placeholder={t('skills_page.skill_name_placeholder')}
              value={skill.name}
              onChange={(event) => {
                const value = event.target.value;
                setSkill((current) => (current ? { ...current, name: value } : current));
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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="skill-description">
              {t('skills_page.skill_description_label')}
            </label>
            <Textarea
              id="skill-description"
              placeholder={t('skills_page.skill_description_placeholder')}
              value={skill.description}
              onChange={(event) => {
                const value = event.target.value;
                setSkill((current) => (current ? { ...current, description: value } : current));
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('skills_page.capabilities_label')}</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_CAPABILITIES.map((capability) => {
                const active = skill.capabilities.includes(capability);

                return (
                  <Button
                    key={capability}
                    className={cn('h-8 px-3', !active && 'text-muted-foreground')}
                    size="sm"
                    type="button"
                    variant={active ? 'secondary' : 'outline'}
                    onClick={() => toggleCapability(capability)}
                  >
                    {t(`skills_page.capabilities.${capability}`)}
                  </Button>
                );
              })}
            </div>
            <p className="text-muted-foreground text-xs">
              {t('skills_page.capabilities_description')}
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
                const success = await onSave(skill);
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
