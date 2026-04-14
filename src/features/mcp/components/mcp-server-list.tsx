'use client';

import { PencilIcon, PlusIcon, PlugZapIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
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
import { Switch } from '@/components/ui/switch';
import type { McpServerSettings } from '@/features/mcp/types';

interface McpServerListProps {
  clearDeleteTarget: () => void;
  deleteTargetId: string | null;
  onAddServer: () => void;
  onConfirmDelete: () => Promise<void> | void;
  onDeleteServer: (serverId: string) => void;
  onEditServer: (serverId: string) => void;
  onRunConnectionTest: (serverId: string) => Promise<void> | void;
  onToggleServerEnabled: (serverId: string, enabled: boolean) => void;
  servers: McpServerSettings[];
  testResults: Record<
    string,
    {
      serverName: string | null;
      serverVersion: string | null;
      toolNames: string[];
    }
  >;
  testingServerId: string | null;
}

export function McpServerList({
  clearDeleteTarget,
  deleteTargetId,
  onAddServer,
  onConfirmDelete,
  onDeleteServer,
  onEditServer,
  onRunConnectionTest,
  onToggleServerEnabled,
  servers,
  testResults: _testResults,
  testingServerId,
}: McpServerListProps) {
  const t = useTranslations();
  const deleteTarget = servers.find((server) => server.id === deleteTargetId) ?? null;

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{t('mcp_page.servers_title')}</h2>
            <p className="text-muted-foreground text-sm">{t('mcp_page.servers_description')}</p>
          </div>
          <Button type="button" variant="outline" onClick={onAddServer}>
            <PlusIcon data-icon="inline-start" />
            {t('mcp_page.add_server')}
          </Button>
        </div>

        <div className="border-border overflow-hidden rounded-md border">
          {servers.map((server) => {
            return (
              <article
                className="border-border flex flex-col gap-3 border-b px-5 py-4 last:border-b-0"
                key={server.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-medium">{server.serverName}</h3>
                      <Badge variant="outline">{server.transport.toUpperCase()}</Badge>
                      <Badge variant={server.enabled ? 'secondary' : 'outline'}>
                        {server.enabled ? t('common.enabled') : t('common.disabled')}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground truncate text-sm">
                      {server.serverUrl || t('mcp_page.server_url_empty')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={server.enabled}
                      className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
                      onCheckedChange={(checked) => onToggleServerEnabled(server.id, checked)}
                    />
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => onEditServer(server.id)}
                    >
                      <PencilIcon />
                      {t('mcp_page.edit_server')}
                    </Button>
                    <Button
                      disabled={!server.serverUrl.trim() || testingServerId != null}
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => void onRunConnectionTest(server.id)}
                    >
                      {testingServerId !== server.id ? <PlugZapIcon /> : null}
                      {testingServerId === server.id ? <Spinner data-icon="inline-start" /> : null}
                      {t('mcp_page.test')}
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => onDeleteServer(server.id)}
                    >
                      <Trash2Icon />
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
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
            <AlertDialogTitle>{t('mcp_page.delete_server_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('mcp_page.delete_server_description', {
                serverName: deleteTarget?.serverName ?? '',
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
