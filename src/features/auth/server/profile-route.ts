import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { RAG_CONFIG } from '@/config/rag';
import { SEARCH_CONFIG } from '@/config/search';
import { API_NAMESPACES } from '@/config/namespaces';
import { requireAuthenticatedUser } from '@/features/auth/server/session';
import {
  getProfileById,
  updateProfileSettings,
  upsertProfileFromAuthUser,
} from '@/features/auth/storage/profiles';
import { normalizeProfileSettings } from '@/features/auth/profile/profile-settings';
import { handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';

const profilePatchSchema = z.object({
  settings: z.object({
    memory: z.object({
      autoWrite: z.boolean().optional(),
      contextMaxItems: z.number().int().optional(),
      crossConversation: z.boolean().optional(),
      enabled: z.boolean().optional(),
      recentMessageWindow: z.number().int().optional(),
      summaryMinMessages: z.number().int().optional(),
    }),
    mcp: z.object({
      enabled: z.boolean().optional(),
      servers: z
        .array(
          z.object({
            bearerToken: z.string().optional(),
            enabled: z.boolean().optional(),
            id: z.string().optional(),
            serverName: z.string().optional(),
            serverUrl: z.string().optional(),
            transport: z.enum(['http', 'sse']).optional(),
          })
        )
        .optional(),
    }),
    sandbox: z.object({
      access: z.object({
        allowCommands: z.boolean().optional(),
        allowFileDownload: z.boolean().optional(),
        allowFileUpload: z.boolean().optional(),
        allowFilesystem: z.boolean().optional(),
        allowInternetAccess: z.boolean().optional(),
        allowPty: z.boolean().optional(),
      }),
      apiKey: z.string().optional(),
      autoPause: z.boolean().optional(),
      enabled: z.boolean().optional(),
      envVarsText: z.string().optional(),
      secure: z.boolean().optional(),
      template: z.string().optional(),
      timeoutSeconds: z.number().int().optional(),
      workingDirectory: z.string().optional(),
    }),
    models: z.object({
      providers: z.record(z.string(), z.unknown()),
      selectedChatModelId: z.string().nullable().optional(),
      selectedProviderId: z.string().min(1),
    }),
    rag: z.object({
      apiKey: z.string().optional(),
      enabled: z.boolean().optional(),
      matchCount: z.number().int().optional(),
      matchThreshold: z.number().optional(),
      maxContextCharacters: z.number().int().optional(),
      provider: z.enum(RAG_CONFIG.PROVIDER_IDS).optional(),
    }),
    search: z.object({
      crawl: z
        .object({
          allowExternal: z.boolean().optional(),
          maxDepth: z.number().int().optional(),
          pageLimit: z.number().int().optional(),
        })
        .optional(),
      enabled: z.boolean().optional(),
      extract: z
        .object({
          chunksPerSource: z.number().int().optional(),
          extractDepth: z.enum(['advanced', 'basic']).optional(),
          format: z.enum(['markdown', 'text']).optional(),
        })
        .optional(),
      search: z
        .object({
          maxResults: z.number().int().optional(),
          searchDepth: z.enum(['advanced', 'basic']).optional(),
          topic: z.enum(['finance', 'general', 'news']).optional(),
        })
        .optional(),
      apiKey: z.string().optional(),
      provider: z.enum(SEARCH_CONFIG.PROVIDER_IDS).optional(),
    }),
    skills: z.object({
      enabled: z.boolean().optional(),
      skills: z
        .array(
          z.object({
            capabilities: z
              .array(z.enum(['browser', 'fs', 'git', 'http', 'mcp', 'prompt', 'shell']))
              .optional(),
            description: z.string().optional(),
            enabled: z.boolean().optional(),
            id: z.string().optional(),
            name: z.string().optional(),
            sourceUrl: z.string().optional(),
          })
        )
        .optional(),
    }),
  }),
});

async function loadNormalizedProfile(
  userId: string,
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>['supabase']
) {
  const profile = await getProfileById(userId, supabase);

  return profile
    ? {
        ...profile,
        settings: normalizeProfileSettings(profile.settings),
      }
    : null;
}

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser();

    enforceRateLimit(request, {
      config: API_RATE_LIMITS.PROFILE_READ,
      identityKey: user.id,
      namespace: API_NAMESPACES.PROFILE_READ,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    return Response.json({
      profile: await loadNormalizedProfile(user.id, supabase),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { settings } = await validateRequest(request, profilePatchSchema);
    const { supabase, user } = await requireAuthenticatedUser();

    enforceRateLimit(request, {
      config: API_RATE_LIMITS.PROFILE_WRITE,
      identityKey: user.id,
      namespace: API_NAMESPACES.PROFILE_WRITE,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    const normalizedSettings = normalizeProfileSettings(settings);
    await updateProfileSettings(user.id, normalizedSettings as Record<string, unknown>, supabase);

    return Response.json({
      profile: await loadNormalizedProfile(user.id, supabase),
    });
  } catch (error) {
    return handleError(error);
  }
}
