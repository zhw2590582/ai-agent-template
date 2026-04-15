'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import { SkillEditorDialog } from '@/features/skills/components/skill-editor-dialog';
import { SkillList } from '@/features/skills/components/skill-list';
import { useSkillsSettings } from '@/features/skills/hooks/use-skills-settings';
import { createSkillDraft } from '@/features/skills/settings';
import type { SkillDefinition, SkillsSettings } from '@/features/skills/types';

interface SkillsContentProps {
  onClose?: () => void;
  onSkillsSettingsChange: (
    updater: (settings: SkillsSettings) => SkillsSettings
  ) => Promise<boolean> | void;
  settings: SkillsSettings;
}

export function SkillsContent({ onClose, onSkillsSettingsChange, settings }: SkillsContentProps) {
  const t = useTranslations();
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingSkillDraft, setEditingSkillDraft] = useState<SkillDefinition | null>(null);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('edit');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const {
    deleteSkill,
    isDirty,
    isSaving,
    localSettings,
    resetAndClose,
    save,
    saveSkill,
    showSaved,
    updateSettings,
  } = useSkillsSettings({
    onClose,
    onSkillsSettingsChange,
    saveFailedMessage: t('skills_page.toast.save_failed'),
    saveSuccessMessage: t('skills_page.toast.save_success'),
    settings,
  });

  const editingSkill =
    editingSkillDraft ?? localSettings.skills.find((skill) => skill.id === editingSkillId) ?? null;

  return (
    <WorkbenchDialogPanel
      bodyClassName="overflow-y-auto"
      footer={
        <>
          <Button className="min-w-24" type="button" variant="outline" onClick={resetAndClose}>
            {t('common.cancel')}
          </Button>
          <Button
            className="min-w-24"
            disabled={!isDirty || isSaving}
            type="button"
            onClick={() => void save()}
          >
            {isSaving ? <Spinner data-icon="inline-start" /> : null}
            {showSaved ? t('models_page.actions.saved') : t('common.save')}
          </Button>
        </>
      }
    >
      <div className="text-foreground mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <section className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">{t('skills_page.enabled_label')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('skills_page.enabled_description')}
              </p>
            </div>
            <Switch
              checked={localSettings.enabled}
              className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
              onCheckedChange={(checked) => {
                updateSettings((current) => ({
                  ...current,
                  enabled: checked,
                }));
              }}
            />
          </div>
        </section>

        <SkillList
          clearDeleteTarget={() => setDeleteTargetId(null)}
          deleteTargetId={deleteTargetId}
          skills={localSettings.skills}
          onAddSkill={() => {
            setEditorMode('add');
            setEditingSkillDraft(createSkillDraft(localSettings.skills.length + 1));
            setEditingSkillId(null);
          }}
          onConfirmDelete={async () => {
            if (!deleteTargetId) {
              return;
            }
            const success = await deleteSkill(deleteTargetId);
            if (success) {
              setDeleteTargetId(null);
            }
          }}
          onDeleteSkill={(skillId) => setDeleteTargetId(skillId)}
          onEditSkill={(skillId) => {
            setEditorMode('edit');
            setEditingSkillDraft(null);
            setEditingSkillId(skillId);
          }}
          onToggleSkillEnabled={(skillId, enabled) => {
            updateSettings((current) => ({
              ...current,
              skills: current.skills.map((skill) =>
                skill.id === skillId ? { ...skill, enabled } : skill
              ),
            }));
          }}
        />
      </div>

      <SkillEditorDialog
        key={editingSkill?.id ?? 'skills-editor'}
        initialSkill={editingSkill}
        mode={editorMode}
        open={editingSkill != null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSkillId(null);
            setEditingSkillDraft(null);
          }
        }}
        onSave={(skill) => saveSkill(skill, editorMode)}
      />
    </WorkbenchDialogPanel>
  );
}
