'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import { useMcpSettings } from '@/features/mcp/hooks/use-mcp-settings';
import { McpServerEditorDialog } from '@/features/mcp/components/mcp-server-editor-dialog';
import { McpServerList } from '@/features/mcp/components/mcp-server-list';
import { McpTestResultDialog } from '@/features/mcp/components/mcp-test-result-dialog';
import type { McpServerSettings, McpSettings } from '@/features/mcp/types';
import type { McpTestResult } from '@/features/mcp/hooks/use-mcp-settings';

interface McpContentProps {
  onClose?: () => void;
  onMcpSettingsChange: (updater: (settings: McpSettings) => McpSettings) => Promise<boolean> | void;
  settings: McpSettings;
}

export function McpContent({ onClose, onMcpSettingsChange, settings }: McpContentProps) {
  const t = useTranslations();
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [editingServerDraft, setEditingServerDraft] = useState<McpServerSettings | null>(null);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('edit');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [testResultDialog, setTestResultDialog] = useState<McpTestResult | null>(null);
  const {
    createServerDraft,
    isDirty,
    isSaving,
    localSettings,
    removeServer,
    resetAndClose,
    runConnectionTest,
    save,
    showSaved,
    testResults,
    testingServerId,
    updateServer,
    updateSettings,
  } = useMcpSettings({
    onClose,
    onMcpSettingsChange,
    saveFailedMessage: t('mcp_page.toast.save_failed'),
    saveSuccessMessage: t('mcp_page.toast.save_success'),
    settings,
    testFailedMessage: t('mcp_page.toast.test_failed'),
    testSuccessMessage: (count, serverName) =>
      t('mcp_page.toast.test_success', { count, serverName }),
  });

  const editingServer =
    editingServerDraft ??
    localSettings.servers.find((server) => server.id === editingServerId) ??
    null;

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
              <h3 className="text-sm font-medium">{t('mcp_page.enabled_label')}</h3>
              <p className="text-muted-foreground text-sm">{t('mcp_page.enabled_description')}</p>
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

        <McpServerList
          clearDeleteTarget={() => setDeleteTargetId(null)}
          deleteTargetId={deleteTargetId}
          servers={localSettings.servers}
          testResults={testResults}
          testingServerId={testingServerId}
          onAddServer={() => {
            setEditorMode('add');
            setEditingServerDraft(createServerDraft());
            setEditingServerId(null);
          }}
          onConfirmDelete={async () => {
            if (!deleteTargetId) {
              return;
            }

            removeServer(deleteTargetId);
            setDeleteTargetId(null);
          }}
          onDeleteServer={(serverId) => setDeleteTargetId(serverId)}
          onEditServer={(serverId) => {
            setEditorMode('edit');
            setEditingServerDraft(null);
            setEditingServerId(serverId);
          }}
          onRunConnectionTest={async (serverId) => {
            const server = localSettings.servers.find((item) => item.id === serverId);

            if (!server) {
              return;
            }

            const result = await runConnectionTest(server);

            if (result) {
              setTestResultDialog(result);
            }
          }}
          onToggleServerEnabled={(serverId, enabled) => {
            updateServer(serverId, (server) => ({
              ...server,
              enabled,
            }));
          }}
        />
      </div>

      <McpServerEditorDialog
        key={editingServer?.id ?? 'mcp-server-editor'}
        initialServer={editingServer}
        mode={editorMode}
        open={editingServer != null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingServerId(null);
            setEditingServerDraft(null);
          }
        }}
        onSave={async (server) => {
          if (editorMode === 'add') {
            updateSettings((current) => ({
              ...current,
              selectedServerId: server.id,
              servers: [...current.servers, server],
            }));
            return true;
          } else {
            updateServer(server.id, () => server);
            return true;
          }
        }}
      />

      <McpTestResultDialog
        open={testResultDialog != null}
        result={testResultDialog}
        onOpenChange={(open) => {
          if (!open) {
            setTestResultDialog(null);
          }
        }}
      />
    </WorkbenchDialogPanel>
  );
}
