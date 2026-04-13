export const enUSMemoryMessages = {
  memory_page: {
    controls: {
      title: 'Memory Controls',
      description:
        'Memory configuration will build on Supabase-backed summaries and long-term records.',
      enabled: 'Enabled',
      disabled: 'Disabled',
      scope_account: 'Account memory',
      scope_guest: 'Guest mode',
      notice_title: 'Memory V1',
      notice_authenticated:
        'Conversation summaries are starting to power context compression. Long-term memories and controls will be connected next.',
      notice_guest:
        'Guest mode can keep local conversations, but long-term memory will only be available for signed-in accounts.',
    },
    saved_memories: {
      title: 'Saved Memories',
      description:
        'Long-term user preferences and facts will appear here once memory writing is enabled.',
      empty_title: 'No saved memories yet',
      empty_description:
        'Memory V1 will store stable user preferences and facts in Supabase instead of keeping them only in prompts.',
    },
    summaries: {
      title: 'Conversation Summaries',
      description:
        'These summaries are the compressed context that can later be injected back into chat.',
      empty_title: 'No summaries yet',
      empty_description:
        'Conversation summaries appear after a thread grows beyond the short context window and the assistant finishes a reply.',
    },
  },
} as const;
