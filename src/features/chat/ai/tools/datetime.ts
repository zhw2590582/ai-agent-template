/**
 * Date/time query tool.
 *
 * Returns the current date and time, optionally formatted in a given IANA timezone.
 * Validates timezone before use to avoid runtime exceptions.
 */

import { tool } from 'ai';
import { z } from 'zod';

/** Cached set of valid IANA timezones for fast lookup. */
const VALID_TIMEZONES = new Set(Intl.supportedValuesOf('timeZone'));

function isValidTimezone(tz: string): boolean {
  return VALID_TIMEZONES.has(tz);
}

export const getDateTime = tool({
  description: 'Get the current date and time, optionally in a specific timezone.',
  inputSchema: z.object({
    timezone: z
      .string()
      .optional()
      .describe('Optional IANA timezone, e.g. Asia/Shanghai, Europe/London.'),
    locale: z.string().optional().describe('Locale for formatting (zh-CN or en-US).'),
  }),
  execute: async ({ timezone, locale = 'zh-CN' }) => {
    const now = new Date();
    const trimmedTz = timezone?.trim();
    const resolvedTimezone =
      trimmedTz && isValidTimezone(trimmedTz)
        ? trimmedTz
        : Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatLocale = locale === 'en-US' ? 'en-US' : 'zh-CN';
    const formatter = new Intl.DateTimeFormat(formatLocale, {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: resolvedTimezone,
    });

    return {
      timezone: resolvedTimezone,
      iso: now.toISOString(),
      formatted: formatter.format(now),
      ...(trimmedTz && !isValidTimezone(trimmedTz)
        ? { warning: `Unknown timezone '${trimmedTz}', using ${resolvedTimezone} instead.` }
        : {}),
    };
  },
});
