import { isSupabaseConfigured } from '@/config/env';
import { SERVER_MESSAGES } from '@/config/strings';
import { toAuthUserSnapshot } from '@/features/auth/lib/auth-user';
import { AppError, ErrorCode } from '@/lib/errors';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export async function requireAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ErrorCode.INPUT_INVALID, SERVER_MESSAGES.AUTHENTICATION_REQUIRED, 401);
  }

  return { supabase, user };
}

export async function getInitialAuthUserSnapshot() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return toAuthUserSnapshot(user);
}
