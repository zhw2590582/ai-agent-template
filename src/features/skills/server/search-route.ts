import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { DEFAULT_LOCALE } from '@/config/i18n';
import { AppError, ErrorCode, handleErrorWithLocale } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import type { SkillCatalogItem } from '@/features/skills/types';

const skillCatalogResponseSchema = z.object({
  count: z.number().int().nonnegative().optional(),
  query: z.string().optional(),
  skills: z.array(
    z.object({
      id: z.string().min(1),
      installs: z.number().int().nonnegative().default(0),
      name: z.string().min(1),
      skillId: z.string().min(1),
      source: z.string().min(1),
    })
  ),
});

export async function handleSkillSearchGet(request: Request) {
  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.SKILLS_SEARCH,
      namespace: API_NAMESPACES.SKILLS_SEARCH,
    });

    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.trim() ?? '';
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') ?? '20') || 20));

    if (!query) {
      return Response.json({
        count: 0,
        query,
        skills: [] satisfies SkillCatalogItem[],
      });
    }

    const response = await fetch(
      `https://skills.sh/api/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new AppError(
        ErrorCode.API_NETWORK,
        `Failed to search remote skills catalog (${response.status}).`,
        502
      );
    }

    const payload = skillCatalogResponseSchema.parse(await response.json());

    return Response.json({
      count: payload.count ?? payload.skills.length,
      query: payload.query ?? query,
      skills: payload.skills,
    });
  } catch (error) {
    return handleErrorWithLocale(error, DEFAULT_LOCALE);
  }
}
