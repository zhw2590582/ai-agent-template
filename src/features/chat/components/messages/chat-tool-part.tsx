'use client';

import type { UIMessage } from 'ai';
import { AlertCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  isDelegateToSubagentInput,
  isDelegateToSubagentOutput,
} from '@/features/subagent/delegation';
import { cn } from '@/lib/utils';

interface ChatToolPartProps {
  getToolTitle: (toolName: string) => string;
  isSidebarOpen: boolean;
  messageKey: string;
  part: Extract<UIMessage['parts'][number], { type: `tool-${string}` | 'dynamic-tool' }>;
  partIndex: number;
}

export function ChatToolPart({
  getToolTitle,
  isSidebarOpen,
  messageKey,
  part,
  partIndex,
}: ChatToolPartProps) {
  const t = useTranslations('chat.tools.subagent');
  const toolName = part.type === 'dynamic-tool' ? part.toolName : part.type.replace('tool-', '');
  const errorText = 'errorText' in part ? part.errorText : undefined;
  const output = 'output' in part ? part.output : undefined;
  const input = 'input' in part ? part.input : undefined;
  const delegateInput = isDelegateToSubagentInput(input) ? input : null;
  const delegateOutput = isDelegateToSubagentOutput(output) ? output : null;
  const isDelegateToSubagent = toolName === 'delegate_to_subagent';
  const toolKey =
    'toolCallId' in part && part.toolCallId != null && String(part.toolCallId).trim() !== ''
      ? part.toolCallId
      : `tool-${messageKey}-${partIndex}`;
  const toolStateKey = `${toolKey}:${part.state}`;

  return (
    <div className={cn('ml-0', isSidebarOpen ? 'max-w-4xl' : 'max-w-6xl')} key={toolStateKey}>
      <div className="pt-3">
        <Tool
          className="border-border/80 bg-card/60"
          defaultOpen={part.state !== 'output-available'}
        >
          {part.type === 'dynamic-tool' ? (
            <ToolHeader
              state={part.state}
              title={getToolTitle(toolName)}
              toolName={toolName}
              type={part.type}
            />
          ) : (
            <ToolHeader state={part.state} title={getToolTitle(toolName)} type={part.type} />
          )}
          <ToolContent>
            {delegateInput && isDelegateToSubagent ? (
              <div className="space-y-2 overflow-hidden">
                <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {t('delegation')}
                </h4>
                <div className="bg-muted/40 space-y-3 rounded-xl border p-4">
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      {t('delegated_to')}
                    </div>
                    <div className="font-medium">{delegateInput.subagentId}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      {t('task')}
                    </div>
                    <p className="text-sm leading-6">{delegateInput.task}</p>
                  </div>
                </div>
              </div>
            ) : 'input' in part && part.input !== undefined ? (
              <ToolInput input={part.input} />
            ) : null}
            {errorText ? (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>{getToolTitle(toolName)} failed</AlertTitle>
                <AlertDescription>{errorText}</AlertDescription>
              </Alert>
            ) : null}
            {delegateOutput && isDelegateToSubagent ? (
              <div className="space-y-2">
                <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {t('result')}
                </h4>
                <div
                  className="bg-muted/40 space-y-3 rounded-xl border p-4"
                  style={
                    delegateOutput.subagentThemeColor
                      ? { borderColor: delegateOutput.subagentThemeColor }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: delegateOutput.subagentThemeColor }}
                    />
                    <div className="min-w-0">
                      <div className="font-medium">{delegateOutput.subagentName}</div>
                      {delegateOutput.subagentDescription ? (
                        <p className="text-muted-foreground text-sm leading-6">
                          {delegateOutput.subagentDescription}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      {t('task')}
                    </div>
                    <p className="text-sm leading-6">{delegateOutput.task}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      {t('summary')}
                    </div>
                    <p className="text-sm leading-6 whitespace-pre-wrap">
                      {delegateOutput.summary}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <ToolOutput errorText={undefined} output={output} />
            )}
          </ToolContent>
        </Tool>
      </div>
    </div>
  );
}
