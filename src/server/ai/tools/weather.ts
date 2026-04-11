/**
 * 天气查询工具
 *
 * 说明:
 * - 这里返回模拟数据，避免学习阶段额外引入第三方天气 API
 * - 模拟数据已经足够展示工具调用、参数传递和结果渲染的完整链路
 */

import { tool } from 'ai';
import { z } from 'zod';

export const getWeatherInformation = tool({
  description: '查询指定城市的天气信息，适合回答天气、气温、体感和出行建议相关问题。',
  inputSchema: z.object({
    city: z.string().min(1).describe('城市名称，例如北京、上海、Tokyo。'),
  }),
  execute: async ({ city }) => {
    const conditions = ['晴朗', '多云', '小雨', '阵风', '薄雾'];
    const seed = city.split('').reduce((total, char) => total + char.charCodeAt(0), 0);

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
