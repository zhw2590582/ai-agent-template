export const enUSMemoryMessages = {
  memory_page: {
    controls: {
      title: 'Memory Controls',
      description:
        'Memory configuration will build on Supabase-backed summaries and long-term records.',
      enabled: 'Enabled',
      disabled: 'Disabled',
      export: 'Export JSON',
      enable_label: 'Enable memory',
      enable_description:
        'Allow the app to maintain summaries and long-term memories for this account.',
      auto_write_label: 'Auto-write memories',
      auto_write_description:
        'Automatically extract stable preferences and facts after a conversation finishes.',
      cross_conversation_label: 'Use memories across conversations',
      cross_conversation_description:
        'Inject saved long-term memories into future chats when they are relevant.',
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
      edit: 'Edit',
      edit_title: 'Edit memory',
      edit_description: 'Update the stored content and kind for this memory record.',
      save: 'Save',
      delete: 'Delete',
      content_label: 'Content',
      kind_label: 'Kind',
      no_source: 'No conversation source',
      kind_fact: 'Fact',
      kind_manual: 'Manual',
      kind_preference: 'Preference',
      kind_profile: 'Profile',
      kind_workflow: 'Workflow',
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
    toast: {
      delete_failed: 'Failed to delete memory.',
      settings_update_failed: 'Failed to update memory settings.',
      update_failed: 'Failed to update memory.',
    },
  },
} as const;
