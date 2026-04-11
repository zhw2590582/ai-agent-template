/**
 * AI Agent 工具集
 *
 * 功能:
 * 1. 为首页聊天界面提供一组通用的服务器端工具
 * 2. 演示 AI SDK 的工具调用能力
 * 3. 为工具调用可视化组件提供真实数据来源
 */

import { tool } from 'ai';
import { z } from 'zod';

/**
 * 天气查询工具
 *
 * 说明:
 * - 这里返回模拟数据，避免学习阶段额外引入第三方天气 API
 * - 模拟数据已经足够展示工具调用、参数传递和结果渲染的完整链路
 */
const getWeatherInformation = tool({
  description: '查询指定城市的天气信息，适合回答天气、气温、体感和出行建议相关问题。',
  inputSchema: z.object({
    city: z.string().min(1).describe('城市名称，例如北京、上海、Tokyo。'),
  }),
  execute: async ({ city }) => {
    const conditions = ['晴朗', '多云', '小雨', '阵风', '薄雾'];
    const seed = city
      .split('')
      .reduce((total, char) => total + char.charCodeAt(0), 0);

    const temperature = 16 + (seed % 13);
    const humidity = 42 + (seed % 35);
    const condition = conditions[seed % conditions.length];

    return {
      city,
      temperature,
      humidity,
      condition,
      advice:
        temperature >= 28
          ? '建议减少中午外出并注意补水。'
          : temperature <= 18
            ? '早晚偏凉，建议带一件外套。'
            : '体感舒适，适合正常出行。',
    };
  },
});

/**
 * 数学计算工具
 *
 * 说明:
 * - 只允许数字、空格、括号和基础四则运算符
 * - 通过白名单校验降低表达式执行风险
 */
const calculate = tool({
  description: '执行数学表达式计算，适合处理加减乘除、括号和小数运算。',
  inputSchema: z.object({
    expression: z
      .string()
      .min(1)
      .describe('需要计算的数学表达式，例如 (24 * 6) / 3。'),
  }),
  execute: async ({ expression }) => {
    const normalized = expression.replace(/\s+/g, ' ').trim();

    if (!/^[\d\s+\-*/().]+$/.test(normalized)) {
      throw new Error('仅支持数字、括号和 + - * / 运算符。');
    }

    const result = Function(`"use strict"; return (${normalized});`)();

    if (typeof result !== 'number' || !Number.isFinite(result)) {
      throw new Error('计算结果无效，请检查表达式。');
    }

    return {
      expression: normalized,
      result,
      formatted: `${normalized} = ${result}`,
    };
  },
});

/**
 * 时间查询工具
 *
 * 说明:
 * - 默认返回当前环境时区的时间
 * - 用户提供时区时，尝试按 IANA 时区格式化
 */
const getDateTime = tool({
  description: '获取当前日期和时间，可选传入时区，用于时间查询、时差说明和计划安排。',
  inputSchema: z.object({
    timezone: z
      .string()
      .optional()
      .describe('可选时区，例如 Asia/Shanghai、Europe/London。'),
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

/**
 * 导出统一工具集合，便于在 API 路由中直接注册。
 */
export const agentTools = {
  getWeatherInformation,
  calculate,
  getDateTime,
};

