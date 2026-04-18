export const STORAGE_KEYS = {
  LOCAL_CHAT_CONVERSATIONS: 'agent-local-chat-conversations',
  LOCAL_CHAT_MEMORIES: 'agent-local-chat-memories',
  LOCAL_INSTALLED_SKILLS: 'agent-local-installed-skills',
  LOCAL_SKILLS_SETTINGS: 'agent-local-skills-settings',
  LOCAL_MODEL_PROFILE: 'agent-model-profile',
} as const;

export const WINDOW_EVENTS = {
  LOCAL_CHAT_CONVERSATIONS_UPDATED: 'agent-local-chat-conversations-updated',
  LOCAL_CHAT_MEMORIES_UPDATED: 'agent-local-chat-memories-updated',
  LOCAL_INSTALLED_SKILLS_UPDATED: 'agent-local-installed-skills-updated',
  LOCAL_SKILLS_SETTINGS_UPDATED: 'agent-local-skills-settings-updated',
  MODEL_PROFILE_UPDATED: 'agent-model-profile-updated',
} as const;
