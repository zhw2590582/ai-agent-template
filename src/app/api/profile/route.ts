import { z } from 'zod';

import { AppError, ErrorCode, handleError } from '@/lib/errors';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import {
  getProfileById,
  updateProfileSettings,
  upsertProfileFromAuthUser,
} from '@/features/auth/storage/profiles';
import { normalizeProfileSettings } from '@/features/models/utils/profile';

async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ErrorCode.INPUT_INVALID, 'Authentication required.', 401);
  }

  return { supabase, user };
}

const profilePatchSchema = z.object({
  settings: z.object({
    models: z.object({
      providers: z.record(z.string(), z.unknown()),
      selectedChatModelId: z.string().nullable().optional(),
      selectedProviderId: z.string().min(1),
    }),
  }),
});

export async function GET() {
  try {
    const { supabase, user } = await requireAuth();
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
