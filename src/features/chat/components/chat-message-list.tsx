'use client';

import type { UIMessage } from 'ai';
import { CopyIcon, RefreshCcwIcon } from 'lucide-react';

import { getTextContent, getToolParts } from '@/features/chat/lib/message-utils';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { cn } from '@/lib/utils';

interface ChatMessageListProps {
  error?: Error;
  messages: UIMessage[];
  onRetry: () => void;
}

export function ChatMessageList({ error, messages, onRetry }: ChatMessageListProps) {
  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant')?.id;

  return (
    <Conversation className="min-h-0 flex-1">
      <ConversationContent className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
        {messages.length === 1 ? (
          <div className="flex min-h-[42vh] items-center justify-center">
            <div className="max-w-2xl text-center">
              <h3 className="text-3xl font-semibold tracking-tight">今天想让 agent 帮你做什么？</h3>
              <p className="text-muted-foreground mt-3 text-base leading-7">
                你可以直接聊天，也可以让它查时间、做计算，或者触发工具完成更具体的任务。
              </p>
            </div>
          </div>
        ) : null}

        {messages.map((message) => {
          const toolParts = getToolParts(message);
          const textContent = getTextContent(message);
          const isLastAssistantMessage = message.id === lastAssistantMessageId;

          return (
            <div key={message.id} className="w-full">
              {textContent ? (
                <Message from={message.role}>
                  <MessageContent
                    className={cn(
                      message.role === 'user' ? 'max-w-[85%] rounded-[1.6rem]' : 'max-w-none'
                    )}
                  >
                    <MessageResponse>{textContent}</MessageResponse>
                  </MessageContent>
                </Message>
              ) : null}

              {toolParts.length > 0 ? (
                <div className="mt-3 ml-0 max-w-3xl">
                  {toolParts.map((part) => {
                    const toolName = part.type.replace('tool-', '');

                    return (
                      <Tool
                        key={part.toolCallId}
                        className="border-border/80 bg-card/60"
                        defaultOpen={part.state !== 'output-available'}
                      >
                        <ToolHeader state={part.state} title={toolName} type={part.type} />
                        <ToolContent>
                          {'input' in part && part.input !== undefined ? (
                            <ToolInput input={part.input} />
                          ) : null}
                          <ToolOutput
                            errorText={'errorText' in part ? part.errorText : undefined}
                            output={'output' in part ? part.output : undefined}
                          />
                        </ToolContent>
                      </Tool>
                    );
                  })}
                </div>
              ) : null}

              {message.role === 'assistant' && isLastAssistantMessage && textContent ? (
                <MessageActions className="mt-2">
                  <MessageAction label="Retry" onClick={onRetry} tooltip="重新生成">
                    <RefreshCcwIcon className="size-3.5" />
                  </MessageAction>
                  <MessageAction
                    label="Copy"
                    onClick={() => navigator.clipboard.writeText(textContent)}
                    tooltip="复制回答"
                  >
                    <CopyIcon className="size-3.5" />
                  </MessageAction>
                </MessageActions>
              ) : null}
            </div>
          );
        })}

        {error ? (
          <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl border px-5 py-4 text-sm">
            请求失败。请检查 `DEEPSEEK_API_KEY` 配置，或稍后重试。
          </div>
        ) : null}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
