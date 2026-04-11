/**
 * 时间查询工具
 *
 * 说明:
 * - 默认返回当前环境时区的时间
 * - 用户提供时区时，尝试按 IANA 时区格式化
 */

import { tool } from 'ai';
import { z } from 'zod';

export const getDateTime = tool({
  description: '获取当前日期和时间，可选传入时区，用于时间查询、时差说明和计划安排。',
  inputSchema: z.object({
    timezone: z.string().optional().describe('可选时区，例如 Asia/Shanghai、Europe/London。'),
  }),
  execute: async ({ timezone }) => {
    const now = new Date();
    const resolvedTimezone = timezone?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatter = new Intl.DateTimeFormat('zh-CN', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: resolvedTimezone,
    });

    return {
      timezone: resolvedTimezone,
      iso: now.toISOString(),
      formatted: formatter.format(now),
    };
  },
});
