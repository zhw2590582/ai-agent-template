/**
 * 计算器工具测试
 */

import { describe, it, expect } from 'vitest';
import { runCalculation } from '@/server/ai/tools/calculator';

describe('calculate tool', () => {
  it('should perform addition', async () => {
    const result = runCalculation('2 + 3');

    expect(result.result).toBe(5);
    expect(result.expression).toBe('2 + 3');
  });

  it('should perform subtraction', async () => {
    const result = runCalculation('10 - 4');

    expect(result.result).toBe(6);
  });

  it('should perform multiplication', async () => {
    const result = runCalculation('6 * 7');

    expect(result.result).toBe(42);
  });

  it('should perform division', async () => {
    const result = runCalculation('15 / 3');

    expect(result.result).toBe(5);
  });

  it('should handle complex expressions', async () => {
    const result = runCalculation('(2 + 3) * 4 - 1');

    expect(result.result).toBe(19);
  });

  it('should handle decimal numbers', async () => {
    const result = runCalculation('3.5 + 2.5');

    expect(result.result).toBe(6);
  });

  it('should throw error for invalid expression', async () => {
    expect(() => runCalculation('invalid math')).toThrow('仅支持');
  });

  it('should throw error for division by zero', async () => {
    // JavaScript 的 5/0 返回 Infinity，会被 isFinite 检测拦住并抛出错误
    expect(() => runCalculation('5 / 0')).toThrow('计算结果无效');
  });

  it('should normalize whitespace', async () => {
    const result = runCalculation('  2   +   3  ');

    expect(result.result).toBe(5);
    expect(result.expression).toBe('2 + 3');
  });

  it('should return formatted result', async () => {
    const result = runCalculation('10 + 5');

    expect(result.formatted).toBe('10 + 5 = 15');
  });
});
