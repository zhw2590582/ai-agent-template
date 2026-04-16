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
import type { SubagentDefinition } from '@/features/subagent/types';

interface SubagentListProps {
  agents: SubagentDefinition[];
  clearDeleteTarget: () => void;
  deleteTargetId: string | null;
  onAddAgent: () => void;
  onConfirmDelete: () => Promise<void> | void;
  onDeleteAgent: (agentId: string) => void;
  onEditAgent: (agentId: string) => void;
  onToggleAgentEnabled: (agentId: string, enabled: boolean) => void;
}

export function SubagentList({
  agents,
  clearDeleteTarget,
  deleteTargetId,
  onAddAgent,
  onConfirmDelete,
  onDeleteAgent,
  onEditAgent,
  onToggleAgentEnabled,
}: SubagentListProps) {
  const t = useTranslations();
  const deleteTarget = agents.find((agent) => agent.id === deleteTargetId) ?? null;

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{t('subagent_page.subagents_title')}</h2>
            <p className="text-muted-foreground text-sm">
              {t('subagent_page.subagents_description')}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onAddAgent}>
            <PlusIcon data-icon="inline-start" />
            {t('subagent_page.add_subagent')}
          </Button>
        </div>

        <div className="border-border overflow-hidden rounded-md border">
          {agents.length === 0 ? (
            <div className="text-muted-foreground px-5 py-8 text-sm">
              {t('subagent_page.empty_state')}
            </div>
          ) : (
            agents.map((agent) => (
              <article
                className="border-border flex flex-col gap-3 border-b px-5 py-4 last:border-b-0"
                key={agent.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="border-border size-3 shrink-0 rounded-full border"
                        style={{ backgroundColor: agent.themeColor }}
                      />
                      <h3 className="truncate text-sm font-medium">{agent.name}</h3>
                      <Badge variant={agent.enabled ? 'secondary' : 'outline'}>
                        {agent.enabled ? t('common.enabled') : t('common.disabled')}
                      </Badge>
                      <Badge variant="outline">
                        {t('subagent_page.temperature_badge', {
                          value: agent.temperature,
                        })}
                      </Badge>
                      <Badge variant="outline">
                        {t('subagent_page.max_tokens_badge', {
                          value: agent.maxTokens,
                        })}
                      </Badge>
                    </div>
                    {agent.description ? (
                      <p className="text-sm leading-6">{agent.description}</p>
                    ) : null}
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-6">
                      {agent.systemPrompt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={agent.enabled}
                      className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
                      onCheckedChange={(checked) => onToggleAgentEnabled(agent.id, checked)}
                    />
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => onEditAgent(agent.id)}
                    >
                      <PencilIcon />
                      {t('subagent_page.edit_subagent')}
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => onDeleteAgent(agent.id)}
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
            <AlertDialogTitle>{t('subagent_page.delete_subagent_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('subagent_page.delete_subagent_description', {
                subagentName: deleteTarget?.name ?? '',
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
