'use client';

import { useMemo, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import type { McpServerSettings } from '@/features/mcp/types';

interface McpServerEditorDialogProps {
  initialServer: McpServerSettings | null;
  mode: 'add' | 'edit';
  onOpenChange: (open: boolean) => void;
  onSave: (server: McpServerSettings) => Promise<boolean> | boolean;
  open: boolean;
}

export function McpServerEditorDialog({
  initialServer,
  mode,
  onOpenChange,
  onSave,
  open,
}: McpServerEditorDialogProps) {
  const t = useTranslations();
  const [server, setServer] = useState<McpServerSettings | null>(initialServer);
  const [isTokenVisible, setIsTokenVisible] = useState(false);

  const isInvalid = useMemo(() => {
    if (!server) {
      return true;
    }

    return server.serverName.trim().length === 0 || server.serverUrl.trim().length === 0;
  }, [server]);

  if (!server) {
    return null;
  }

  const isEditing = mode === 'edit';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('mcp_page.edit_server_title') : t('mcp_page.add_server_title')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('mcp_page.edit_server_description')
              : t('mcp_page.add_server_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="border-border flex items-center justify-between gap-4 rounded-md border px-4 py-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">{t('mcp_page.server_enabled_label')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('mcp_page.server_enabled_description')}
              </p>
            </div>
            <Switch
              checked={server.enabled}
              className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
              onCheckedChange={(checked) => {
                setServer((current) => (current ? { ...current, enabled: checked } : current));
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="mcp-server-name">
              {t('mcp_page.server_name_label')}
            </label>
            <Input
              id="mcp-server-name"
              placeholder={t('mcp_page.server_name_placeholder')}
              value={server.serverName}
              onChange={(event) => {
                const value = event.target.value;
                setServer((current) => (current ? { ...current, serverName: value } : current));
              }}
            />
            <p className="text-muted-foreground text-xs">{t('mcp_page.server_name_description')}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="mcp-transport">
              {t('mcp_page.transport_label')}
            </label>
            <Select
              value={server.transport}
              onValueChange={(value: 'http' | 'sse') => {
                setServer((current) => (current ? { ...current, transport: value } : current));
              }}
            >
              <SelectTrigger className="w-full" id="mcp-transport">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="http">{t('mcp_page.transport_http')}</SelectItem>
                <SelectItem value="sse">{t('mcp_page.transport_sse')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">{t('mcp_page.transport_description')}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="mcp-server-url">
              {t('mcp_page.server_url_label')}
            </label>
            <Input
              id="mcp-server-url"
              placeholder={t('mcp_page.server_url_placeholder')}
              value={server.serverUrl}
              onChange={(event) => {
                const value = event.target.value;
                setServer((current) => (current ? { ...current, serverUrl: value } : current));
              }}
            />
            <p className="text-muted-foreground text-xs">{t('mcp_page.server_url_description')}</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="mcp-bearer-token">
                  {t('mcp_page.bearer_token_label')}
                </label>
                <p className="text-muted-foreground text-sm">
                  {t('mcp_page.bearer_token_description')}
                </p>
              </div>
              <Button
                size="icon"
                type="button"
                variant="outline"
                onClick={() => setIsTokenVisible((current) => !current)}
              >
                {isTokenVisible ? <EyeOffIcon /> : <EyeIcon />}
              </Button>
            </div>

            <Input
              id="mcp-bearer-token"
              placeholder={t('mcp_page.bearer_token_placeholder')}
              type={isTokenVisible ? 'text' : 'password'}
              value={server.bearerToken}
              onChange={(event) => {
                const value = event.target.value;
                setServer((current) => (current ? { ...current, bearerToken: value } : current));
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            disabled={isInvalid}
            type="button"
            onClick={async () => {
              const success = await onSave(server);
              if (success !== false) {
                onOpenChange(false);
              }
            }}
          >
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
