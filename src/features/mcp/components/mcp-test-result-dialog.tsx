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
    capabilities: {
      elicitation: boolean;
      logging: boolean;
      prompts: boolean;
      resources: boolean;
      roots: boolean;
      sampling: boolean;
      tools: boolean;
    };
    prompts: Array<{
      arguments: Array<{
        description?: string;
        name: string;
        required: boolean;
      }>;
      description?: string;
      name: string;
      title?: string;
    }>;
    resources: Array<{
      description?: string;
      mimeType?: string;
      name: string;
      title?: string;
      uri: string;
    }>;
    serverName: string | null;
    serverVersion: string | null;
    toolNames: string[];
  } | null;
}

export function McpTestResultDialog({ open, onOpenChange, result }: McpTestResultDialogProps) {
  const t = useTranslations();
  const capabilityLabels = {
    elicitation: t('mcp_page.capability_elicitation'),
    logging: t('mcp_page.capability_logging'),
    prompts: t('mcp_page.capability_prompts'),
    resources: t('mcp_page.capability_resources'),
    roots: t('mcp_page.capability_roots'),
    sampling: t('mcp_page.capability_sampling'),
    tools: t('mcp_page.capability_tools'),
  } as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('mcp_page.test_result_title')}</DialogTitle>
          <DialogDescription>{t('mcp_page.test_result_description')}</DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex max-h-[calc(85vh-10rem)] flex-col gap-6 overflow-y-auto pr-1">
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
              <p className="text-sm font-medium">{t('mcp_page.capabilities_label')}</p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {(
                  [
                    ['tools', result.capabilities.tools],
                    ['resources', result.capabilities.resources],
                    ['prompts', result.capabilities.prompts],
                    ['logging', result.capabilities.logging],
                    ['elicitation', result.capabilities.elicitation],
                    ['sampling', result.capabilities.sampling],
                    ['roots', result.capabilities.roots],
                  ] as const
                ).map(([capability, supported]) => (
                  <div
                    key={capability}
                    className="border-border flex items-center justify-between rounded-md border px-4 py-3"
                  >
                    <p className="text-sm font-medium">{capabilityLabels[capability]}</p>
                    <Badge variant={supported ? 'default' : 'secondary'}>
                      {supported ? t('common.supported') : t('common.not_supported')}
                    </Badge>
                  </div>
                ))}
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

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">
                {t('mcp_page.resources_label', { count: result.resources.length })}
              </p>

              {result.resources.length > 0 ? (
                <div className="grid gap-3">
                  {result.resources.map((resource) => (
                    <div key={resource.uri} className="border-border rounded-md border px-4 py-3">
                      <p className="text-sm font-medium">{resource.title || resource.name}</p>
                      <p className="text-muted-foreground mt-1 break-all text-xs">{resource.uri}</p>
                      {resource.description ? (
                        <p className="text-muted-foreground mt-2 text-sm">{resource.description}</p>
                      ) : null}
                      {resource.mimeType ? (
                        <p className="text-muted-foreground mt-2 text-xs">{resource.mimeType}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{t('mcp_page.no_resources')}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">
                {t('mcp_page.prompts_label', { count: result.prompts.length })}
              </p>

              {result.prompts.length > 0 ? (
                <div className="grid gap-3">
                  {result.prompts.map((prompt) => (
                    <div key={prompt.name} className="border-border rounded-md border px-4 py-3">
                      <p className="text-sm font-medium">{prompt.title || prompt.name}</p>
                      {prompt.description ? (
                        <p className="text-muted-foreground mt-2 text-sm">{prompt.description}</p>
                      ) : null}
                      <p className="text-muted-foreground mt-2 text-xs">
                        {t('mcp_page.prompt_arguments_label', {
                          count: prompt.arguments.length,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{t('mcp_page.no_prompts')}</p>
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
