import { DEV_CONFIG } from '@/config/dev';
import { conversationListColumns } from '@/features/chat/storage/conversation-repository';
import type { ConversationRecord } from '@/features/chat/storage/types';
import type { MemoryRecord } from '@/features/memory/types';
import type { ProfileRecord } from '@/features/auth/storage/types';
import type { createAdminClient } from '@/lib/supabase/admin';

type SupabaseAdminClient = ReturnType<typeof createAdminClient>;

export async function inspectUserData(userId: string, client: SupabaseAdminClient) {
  const [
    { data: authUser, error: authError },
    { data: profile, error: profileError },
    { data: conversations, error: conversationsError },
    { data: memories, error: memoriesError },
  ] = await Promise.all([
    client.auth.admin.getUserById(userId),
    client
      .from('profiles')
      .select(
        'id, email, display_name, avatar_url, locale, theme, settings, memory_summary, created_at, updated_at'
      )
      .eq('id', userId)
      .maybeSingle<ProfileRecord>(),
    client
      .from('conversations')
      .select(conversationListColumns)
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false })
      .limit(DEV_CONFIG.SUPABASE_INSPECTOR_CONVERSATION_LIMIT)
      .returns<ConversationRecord[]>(),
    client
      .from('memories')
      .select(
        'id, user_id, conversation_id, kind, content, source, status, metadata, created_at, updated_at'
      )
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .returns<MemoryRecord[]>(),
  ]);

  return {
    authError: authError ? String(authError.message ?? authError) : null,
    authUser: authUser?.user ?? null,
    conversations: conversationsError ? [] : (conversations ?? []),
    conversationsError: conversationsError
      ? String(conversationsError.message ?? conversationsError)
      : null,
    memories: memoriesError ? [] : (memories ?? []),
    memoriesError: memoriesError ? String(memoriesError.message ?? memoriesError) : null,
    profile: profileError ? null : (profile ?? null),
    profileError: profileError ? String(profileError.message ?? profileError) : null,
  };
}

export async function inspectConversationData(conversationId: string, client: SupabaseAdminClient) {
  const { data: conversation, error: conversationError } = await client
    .from('conversations')
    .select(conversationListColumns)
    .eq('id', conversationId)
    .maybeSingle<ConversationRecord>();

  if (conversationError || !conversation) {
    return {
      conversation: null,
      conversationError: conversationError
        ? String(conversationError.message ?? conversationError)
        : 'Conversation not found.',
      profile: null,
      relatedMemories: [],
    };
  }

  const [{ data: profile, error: profileError }, { data: relatedMemories, error: memoriesError }] =
    await Promise.all([
      client
        .from('profiles')
        .select(
          'id, email, display_name, avatar_url, locale, theme, settings, memory_summary, created_at, updated_at'
        )
        .eq('id', conversation.user_id)
        .maybeSingle<ProfileRecord>(),
      client
        .from('memories')
        .select(
          'id, user_id, conversation_id, kind, content, source, status, metadata, created_at, updated_at'
        )
        .eq('conversation_id', conversationId)
        .order('updated_at', { ascending: false })
        .returns<MemoryRecord[]>(),
    ]);

  return {
    conversation,
    conversationError: null,
    profile: profileError ? null : (profile ?? null),
    profileError: profileError ? String(profileError.message ?? profileError) : null,
    relatedMemories: memoriesError ? [] : (relatedMemories ?? []),
    relatedMemoriesError: memoriesError ? String(memoriesError.message ?? memoriesError) : null,
  };
}
