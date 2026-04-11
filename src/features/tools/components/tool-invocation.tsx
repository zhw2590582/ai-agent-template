/**
 * 工具调用展示组件
 *
 * 功能:
 * 1. 渲染 AI SDK 新版消息结构中的 typed tool parts
 * 2. 展示工具调用过程、参数和结果
 * 3. 为首页聊天界面提供清晰的工具可视化反馈
 */

import type { UIMessage } from 'ai';

type ChatPart = UIMessage['parts'][number];
type ToolPart = Extract<ChatPart, { type: `tool-${string}` }>;

interface ToolInvocationDisplayProps {
  parts: ToolPart[];
}

const TOOL_LABELS: Record<string, string> = {
  getWeatherInformation: '天气查询',
  calculate: '数学计算',
  getDateTime: '时间服务',
};

const TOOL_ICONS: Record<string, string> = {
  getWeatherInformation: 'Weather',
  calculate: 'Math',
  getDateTime: 'Time',
};

function prettify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function ToolResultBlock({
  toolName,
  output,
}: {
  toolName: string;
  output: unknown;
}) {
  const data = output as Record<string, unknown>;

  if (toolName === 'getWeatherInformation' && data) {
    return (
      <div className="grid gap-2 text-sm text-stone-800 sm:grid-cols-2">
        <div>城市: {String(data.city ?? '-')}</div>
        <div>天气: {String(data.condition ?? '-')}</div>
        <div>温度: {String(data.temperature ?? '-')}°C</div>
        <div>湿度: {String(data.humidity ?? '-')}%</div>
        <div className="sm:col-span-2 text-stone-600">
          建议: {String(data.advice ?? '-')}
        </div>
      </div>
    );
  }

  if (toolName === 'calculate' && data) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-950 px-4 py-3 font-mono text-sm text-stone-100">
        {String(data.formatted ?? data.result ?? '-')}
      </div>
    );
  }

  if (toolName === 'getDateTime' && data) {
    return (
      <div className="space-y-1 text-sm text-stone-800">
        <div>{String(data.formatted ?? '-')}</div>
        <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
          {String(data.timezone ?? 'local')}
        </div>
      </div>
    );
  }

  return (
    <pre className="overflow-x-auto rounded-2xl bg-stone-950/95 p-4 text-xs text-stone-100">
      {prettify(output)}
    </pre>
  );
}

export function ToolInvocationDisplay({
  parts,
}: ToolInvocationDisplayProps) {
  if (parts.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      {parts.map((part) => {
        const toolName = part.type.replace('tool-', '');
        const title = TOOL_LABELS[toolName] ?? toolName;
        const icon = TOOL_ICONS[toolName] ?? 'Tool';
        const state = (part as { state: string }).state;

        return (
          <div
            key={part.toolCallId}
            className="rounded-[1.6rem] border border-stone-200/80 bg-stone-50/90 p-4 shadow-[0_10px_30px_rgba(28,25,23,0.08)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
                  {icon}
                </div>
                <div className="text-sm font-semibold text-stone-900">{title}</div>
              </div>
              <div className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-stone-500">
                {state === 'output-available'
                  ? 'Done'
                  : state === 'output-error'
                    ? 'Error'
                    : 'Running'}
              </div>
            </div>

            {'input' in part && part.input !== undefined ? (
              <div className="mt-3">
                <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-stone-500">
                  Input
                </div>
                <pre className="overflow-x-auto rounded-2xl bg-white p-3 text-xs text-stone-700">
                  {prettify(part.input)}
                </pre>
              </div>
            ) : null}

            {state === 'output-available' && 'output' in part ? (
              <div className="mt-3">
                <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-stone-500">
                  Output
                </div>
                <ToolResultBlock toolName={toolName} output={part.output} />
              </div>
            ) : null}

            {state === 'output-error' && 'errorText' in part ? (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {part.errorText}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

