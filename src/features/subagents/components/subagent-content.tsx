'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import { SubagentEditorDialog } from '@/features/subagents/components/subagent-editor-dialog';
import { SubagentList } from '@/features/subagents/components/subagent-list';
import { useSubagentSettings } from '@/features/subagents/hooks/use-subagent-settings';
import { createSubagentDraft } from '@/features/subagents/settings';
import type { SubagentDefinition, SubagentSettings } from '@/features/subagents/types';

interface SubagentContentProps {
  onClose?: () => void;
  onSubagentSettingsChange: (
    updater: (settings: SubagentSettings) => SubagentSettings
  ) => Promise<boolean> | void;
  settings: SubagentSettings;
}

export function SubagentContent({
  onClose,
  onSubagentSettingsChange,
  settings,
}: SubagentContentProps) {
  const t = useTranslations();
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editingAgentDraft, setEditingAgentDraft] = useState<SubagentDefinition | null>(null);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const {
    deleteAgent,
    isDirty,
    isSaving,
    localSettings,
    resetAndClose,
    save,
    saveAgent,
    showSaved,
    updateSettings,
  } = useSubagentSettings({
    onClose,
    onSubagentSettingsChange,
    saveFailedMessage: t('subagent_page.toast.save_failed'),
    saveSuccessMessage: t('subagent_page.toast.save_success'),
    settings,
  });

  const editingAgent =
    editingAgentDraft ?? localSettings.agents.find((agent) => agent.id === editingAgentId) ?? null;

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
      <div className="text-foreground mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8">
        <section className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">{t('subagent_page.enabled_label')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('subagent_page.enabled_description')}
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

        <SubagentList
          agents={localSettings.agents}
          clearDeleteTarget={() => setDeleteTargetId(null)}
          deleteTargetId={deleteTargetId}
          onAddAgent={() => {
            setEditorMode('add');
            setEditingAgentDraft(createSubagentDraft());
            setEditingAgentId(null);
          }}
          onConfirmDelete={async () => {
            if (!deleteTargetId) {
              return;
            }
            const success = await deleteAgent(deleteTargetId);
            if (success) {
              setDeleteTargetId(null);
            }
          }}
          onDeleteAgent={(agentId) => setDeleteTargetId(agentId)}
          onEditAgent={(agentId) => {
            setEditorMode('edit');
            setEditingAgentDraft(null);
            setEditingAgentId(agentId);
          }}
          onToggleAgentEnabled={(agentId, enabled) => {
            updateSettings((current) => ({
              ...current,
              agents: current.agents.map((agent) =>
                agent.id === agentId ? { ...agent, enabled } : agent
              ),
            }));
          }}
        />
      </div>

      <SubagentEditorDialog
        key={editingAgent?.id ?? 'subagent-editor'}
        initialAgent={editingAgent}
        mode={editorMode}
        open={editingAgent != null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingAgentDraft(null);
            setEditingAgentId(null);
          }
        }}
        onSave={(agent) => saveAgent(agent, editorMode)}
      />
    </WorkbenchDialogPanel>
  );
}
