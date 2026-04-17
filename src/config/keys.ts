export const STORAGE_KEYS = {
  LOCAL_CHAT_CONVERSATIONS: 'agent-local-chat-conversations',
  LOCAL_CHAT_MEMORIES: 'agent-local-chat-memories',
  LOCAL_MODEL_PROFILE: 'agent-model-profile',
} as const;

export const WINDOW_EVENTS = {
  LOCAL_CHAT_CONVERSATIONS_UPDATED: 'agent-local-chat-conversations-updated',
  LOCAL_CHAT_MEMORIES_UPDATED: 'agent-local-chat-memories-updated',
  MODEL_PROFILE_UPDATED: 'agent-model-profile-updated',
} as const;
