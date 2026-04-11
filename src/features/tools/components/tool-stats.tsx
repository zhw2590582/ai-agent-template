/**
 * 工具统计组件
 *
 * 功能:
 * 1. 从当前会话消息中统计工具调用次数
 * 2. 帮助学习者观察 agent 何时选择调用工具
 * 3. 为首页提供简洁的会话概览
 */

'use client';

import type { UIMessage } from 'ai';
import { useMemo } from 'react';

interface ToolStatsProps {
  messages: UIMessage[];
}

const TOOL_LABELS: Record<string, string> = {
  getWeatherInformation: '天气查询',
  calculate: '数学计算',
  getDateTime: '时间服务',
};

export function ToolStats({ messages }: ToolStatsProps) {
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;

    for (const message of messages) {
      for (const part of message.parts) {
        if (!part.type.startsWith('tool-')) {
          continue;
        }

        if (!('state' in part) || part.state !== 'output-available') {
          continue;
        }

        const toolName = part.type.replace('tool-', '');
        counts[toolName] = (counts[toolName] || 0) + 1;
        total += 1;
      }
    }

    return { counts, total };
  }, [messages]);

  return (
    <div className="rounded-[1.8rem] border border-stone-200/80 bg-white/80 p-4 shadow-[0_14px_35px_rgba(28,25,23,0.08)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
            Session
          </div>
          <div className="text-base font-semibold text-stone-900">工具调用统计</div>
        </div>
        <div className="text-sm text-stone-500">
          共 <span className="font-semibold text-stone-900">{stats.total}</span> 次
        </div>
      </div>

      {stats.total === 0 ? (
        <p className="mt-4 text-sm leading-6 text-stone-600">
          还没有触发工具。你可以尝试问天气、时间，或让它做一个简单计算。
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {Object.entries(stats.counts).map(([toolName, count]) => (
            <div key={toolName} className="space-y-1">
              <div className="flex items-center justify-between text-sm text-stone-700">
                <span>{TOOL_LABELS[toolName] ?? toolName}</span>
                <span className="font-mono text-stone-900">{count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-stone-900"
                  style={{ width: `${Math.max(18, Math.min(100, count * 22))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

