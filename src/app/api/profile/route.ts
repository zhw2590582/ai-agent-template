import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { SERVER_MESSAGES } from '@/config/strings';
import { AppError, ErrorCode, handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import {
  getProfileById,
  updateProfileSettings,
  upsertProfileFromAuthUser,
} from '@/features/auth/storage/profiles';
import { normalizeProfileSettings } from '@/features/auth/profile/profile-settings';

async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ErrorCode.INPUT_INVALID, SERVER_MESSAGES.AUTHENTICATION_REQUIRED, 401);
  }

  return { supabase, user };
}

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
    models: z.object({
      providers: z.record(z.string(), z.unknown()),
      selectedChatModelId: z.string().nullable().optional(),
      selectedProviderId: z.string().min(1),
    }),
    search: z.object({
      enabled: z.boolean().optional(),
      maxResults: z.number().int().optional(),
      searchDepth: z.enum(['advanced', 'basic']).optional(),
      tavilyApiKey: z.string().optional(),
      topic: z.enum(['finance', 'general', 'news']).optional(),
    }),
  }),
});

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.PROFILE_READ,
      identityKey: user.id,
      namespace: API_NAMESPACES.PROFILE_READ,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);
    const profile = await getProfileById(user.id, supabase);

    return Response.json({
      profile: profile
        ? {
            ...profile,
            settings: normalizeProfileSettings(profile.settings),
          }
        : null,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { settings } = await validateRequest(request, profilePatchSchema);
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.PROFILE_WRITE,
      identityKey: user.id,
      namespace: API_NAMESPACES.PROFILE_WRITE,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    const normalizedSettings = normalizeProfileSettings(settings);
    await updateProfileSettings(user.id, normalizedSettings as Record<string, unknown>, supabase);

    const profile = await getProfileById(user.id, supabase);

    return Response.json({
      profile: profile
        ? {
            ...profile,
            settings: normalizeProfileSettings(profile.settings),
          }
        : null,
    });
  } catch (error) {
    return handleError(error);
  }
}
