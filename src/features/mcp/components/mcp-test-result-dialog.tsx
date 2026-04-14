'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface McpTestResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: {
    serverName: string | null;
    serverVersion: string | null;
    toolNames: string[];
  } | null;
}

export function McpTestResultDialog({ open, onOpenChange, result }: McpTestResultDialogProps) {
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('mcp_page.test_result_title')}</DialogTitle>
          <DialogDescription>{t('mcp_page.test_result_description')}</DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-border rounded-md border px-4 py-3">
                <p className="text-muted-foreground text-xs">{t('mcp_page.test_server_label')}</p>
                <p className="mt-1 text-sm font-medium">{result.serverName ?? '—'}</p>
              </div>
              <div className="border-border rounded-md border px-4 py-3">
                <p className="text-muted-foreground text-xs">{t('mcp_page.test_version_label')}</p>
                <p className="mt-1 text-sm font-medium">{result.serverVersion ?? '—'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">
                {t('mcp_page.tools_label', { count: result.toolNames.length })}
              </p>

              {result.toolNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.toolNames.map((toolName) => (
                    <Badge key={toolName} variant="secondary">
                      {toolName}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{t('mcp_page.no_tools')}</p>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
