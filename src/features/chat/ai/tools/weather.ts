/**
 * Weather query tool (mock data).
 *
 * Returns deterministic mock data based on city name hash.
 * Sufficient for demonstrating tool calling, parameter passing, and result rendering.
 */

import { tool } from 'ai';
import { z } from 'zod';

const CONDITIONS = {
  'zh-CN': ['晴朗', '多云', '小雨', '阵风', '薄雾'],
  'en-US': ['Clear', 'Cloudy', 'Light Rain', 'Gusty', 'Misty'],
} as const;

function getAdvice(temperature: number, locale: string) {
  if (locale === 'en-US') {
    if (temperature >= 28) return 'Avoid going out at noon and stay hydrated.';
    if (temperature <= 18) return 'It may be cool in the morning and evening — bring a jacket.';
    return 'Comfortable weather, suitable for going out.';
  }
  if (temperature >= 28) return '建议减少中午外出并注意补水。';
  if (temperature <= 18) return '早晚偏凉，建议带一件外套。';
  return '体感舒适，适合正常出行。';
}

export const getWeatherInformation = tool({
  description:
    'Query weather information for a city. Useful for weather, temperature, and travel advice questions.',
  inputSchema: z.object({
    city: z.string().min(1).describe('City name, e.g. Beijing, Shanghai, Tokyo.'),
    locale: z.string().optional().describe('Locale for the response (zh-CN or en-US).'),
  }),
  execute: async ({ city, locale = 'zh-CN' }) => {
    const conditions = CONDITIONS[locale as keyof typeof CONDITIONS] ?? CONDITIONS['zh-CN'];
    const seed = city.split('').reduce((total, char) => total + char.charCodeAt(0), 0);

    const temperature = 16 + (seed % 13);
    const humidity = 42 + (seed % 35);
    const condition = conditions[seed % conditions.length];

    return {
      city,
      temperature,
      humidity,
      condition,
      advice: getAdvice(temperature, locale),
    };
  },
});
