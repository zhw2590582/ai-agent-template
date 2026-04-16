'use client';

import type { UIMessage } from 'ai';
import { AlertCircleIcon } from 'lucide-react';

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  const toolName = part.type === 'dynamic-tool' ? part.toolName : part.type.replace('tool-', '');
  const errorText = 'errorText' in part ? part.errorText : undefined;
  const output = 'output' in part ? part.output : undefined;
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
            {'input' in part && part.input !== undefined ? <ToolInput input={part.input} /> : null}
            {errorText ? (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>{getToolTitle(toolName)} failed</AlertTitle>
                <AlertDescription>{errorText}</AlertDescription>
              </Alert>
            ) : null}
            <ToolOutput errorText={undefined} output={output} />
          </ToolContent>
        </Tool>
      </div>
    </div>
  );
}
