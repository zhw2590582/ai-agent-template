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
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { SubagentDefinition } from '@/features/subagent/types';

interface SubagentEditorDialogProps {
  initialAgent: SubagentDefinition | null;
  mode: 'add' | 'edit';
  onOpenChange: (open: boolean) => void;
  onSave: (agent: SubagentDefinition) => Promise<boolean> | boolean;
  open: boolean;
}

export function SubagentEditorDialog({
  initialAgent,
  mode,
  onOpenChange,
  onSave,
  open,
}: SubagentEditorDialogProps) {
  const t = useTranslations();
  const [agent, setAgent] = useState<SubagentDefinition | null>(initialAgent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isInvalid = useMemo(() => {
    if (!agent) {
      return true;
    }

    return agent.name.trim().length === 0 || agent.systemPrompt.trim().length === 0;
  }, [agent]);

  if (!agent) {
    return null;
  }

  const isEditing = mode === 'edit';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t('subagent_page.edit_subagent_title')
              : t('subagent_page.add_subagent_title')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('subagent_page.edit_subagent_description')
              : t('subagent_page.add_subagent_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="border-border flex items-center justify-between gap-4 rounded-md border px-4 py-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">{t('subagent_page.agent_enabled_label')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('subagent_page.agent_enabled_description')}
              </p>
            </div>
            <Switch
              checked={agent.enabled}
              className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
              onCheckedChange={(checked) => {
                setAgent((current) => (current ? { ...current, enabled: checked } : current));
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="subagent-name">
              {t('subagent_page.name_label')}
            </label>
            <Input
              id="subagent-name"
              placeholder={t('subagent_page.name_placeholder')}
              value={agent.name}
              onChange={(event) => {
                const value = event.target.value;
                setAgent((current) => (current ? { ...current, name: value } : current));
              }}
            />
            <p className="text-muted-foreground text-xs">{t('subagent_page.name_description')}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="subagent-description">
              {t('subagent_page.description_label')}
            </label>
            <Textarea
              className="min-h-22"
              id="subagent-description"
              placeholder={t('subagent_page.description_placeholder')}
              value={agent.description}
              onChange={(event) => {
                const value = event.target.value;
                setAgent((current) => (current ? { ...current, description: value } : current));
              }}
            />
            <p className="text-muted-foreground text-xs">
              {t('subagent_page.description_description')}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="subagent-system-prompt">
              {t('subagent_page.system_prompt_label')}
            </label>
            <Textarea
              className="min-h-42"
              id="subagent-system-prompt"
              placeholder={t('subagent_page.system_prompt_placeholder')}
              value={agent.systemPrompt}
              onChange={(event) => {
                const value = event.target.value;
                setAgent((current) => (current ? { ...current, systemPrompt: value } : current));
              }}
            />
            <p className="text-muted-foreground text-xs">
              {t('subagent_page.system_prompt_description')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="subagent-temperature">
                {t('subagent_page.temperature_label')}
              </label>
              <Input
                id="subagent-temperature"
                inputMode="decimal"
                max="2"
                min="0"
                step="0.1"
                type="number"
                value={String(agent.temperature)}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setAgent((current) =>
                    current && !Number.isNaN(value)
                      ? { ...current, temperature: value }
                      : current
                  );
                }}
              />
              <p className="text-muted-foreground text-xs">
                {t('subagent_page.temperature_description')}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="subagent-max-tokens">
                {t('subagent_page.max_tokens_label')}
              </label>
              <Input
                id="subagent-max-tokens"
                inputMode="numeric"
                min="128"
                step="1"
                type="number"
                value={String(agent.maxTokens)}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setAgent((current) =>
                    current && !Number.isNaN(value)
                      ? { ...current, maxTokens: value }
                      : current
                  );
                }}
              />
              <p className="text-muted-foreground text-xs">
                {t('subagent_page.max_tokens_description')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="subagent-theme-color">
                  {t('subagent_page.theme_color_label')}
                </label>
                <p className="text-muted-foreground text-sm">
                  {t('subagent_page.theme_color_description')}
                </p>
              </div>
              <Badge variant={agent.enabled ? 'secondary' : 'outline'}>
                {t('subagent_page.color_preview_badge')}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Input
                className="h-10 w-16 p-1"
                id="subagent-theme-color"
                type="color"
                value={agent.themeColor}
                onChange={(event) => {
                  const value = event.target.value;
                  setAgent((current) => (current ? { ...current, themeColor: value } : current));
                }}
              />
              <Input
                className="flex-1"
                placeholder={t('subagent_page.theme_color_placeholder')}
                value={agent.themeColor}
                onChange={(event) => {
                  const value = event.target.value;
                  setAgent((current) => (current ? { ...current, themeColor: value } : current));
                }}
              />
              <span
                aria-hidden
                className="border-border size-8 shrink-0 rounded-full border"
                style={{ backgroundColor: agent.themeColor }}
              />
            </div>
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
                  ...agent,
                  description: agent.description.trim(),
                  name: agent.name.trim(),
                  systemPrompt: agent.systemPrompt.trim(),
                  themeColor: agent.themeColor.trim(),
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
