/**
 * 数学计算工具
 *
 * 说明:
 * - 只允许数字、空格、括号和基础四则运算符
 * - 通过白名单校验降低表达式执行风险
 */

import { tool } from 'ai';
import { z } from 'zod';

export const calculate = tool({
  description: '执行数学表达式计算，适合处理加减乘除、括号和小数运算。',
  inputSchema: z.object({
    expression: z.string().min(1).describe('需要计算的数学表达式，例如 (24 * 6) / 3。'),
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
