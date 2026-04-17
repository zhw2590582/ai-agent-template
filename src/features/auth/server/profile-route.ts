import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { requireAuthenticatedUser } from '@/features/auth/server/session';
import {
  getProfileById,
  updateProfileSettings,
  upsertProfileFromAuthUser,
} from '@/features/auth/storage/profiles';
import { normalizeAppProfileSettings } from '@/features/settings/app-settings';
import { appProfileSettingsSchema } from '@/features/settings/schema';
import { handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';

const profilePatchSchema = z.object({
  settings: appProfileSettingsSchema,
});

async function loadNormalizedProfile(
  userId: string,
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>['supabase']
) {
  const profile = await getProfileById(userId, supabase);

  return profile
    ? {
        ...profile,
        settings: normalizeAppProfileSettings(profile.settings),
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

    const normalizedSettings = normalizeAppProfileSettings(settings);
    await updateProfileSettings(user.id, normalizedSettings as Record<string, unknown>, supabase);

    return Response.json({
      profile: await loadNormalizedProfile(user.id, supabase),
    });
  } catch (error) {
    return handleError(error);
  }
}
