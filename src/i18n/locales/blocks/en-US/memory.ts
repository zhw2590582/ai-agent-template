export const enUSMemoryMessages = {
  memory_page: {
    controls: {
      title: 'Memory Settings',
      description: 'Manage how summaries and long-term memories are written and reused.',
      export: 'Export JSON',
      enable_label: 'Enable memory',
      enable_description:
        'Allow the app to keep summaries and long-term memories for this account.',
      auto_write_label: 'Auto-write memories',
      auto_write_description: 'Save stable preferences and facts after a conversation finishes.',
      cross_conversation_label: 'Use memories across conversations',
      cross_conversation_description:
        'Reuse saved long-term memories in future chats when they are relevant.',
      advanced_title: 'Advanced thresholds',
      advanced_description: 'Control when summaries are created and how much memory is injected.',
      summary_min_messages_label: 'Summary trigger messages',
      summary_min_messages_description:
        'Generate or refresh a conversation summary once the thread reaches this many messages.',
      recent_message_window_label: 'Recent messages window',
      recent_message_window_description:
        'Keep this many latest messages alongside the stored summary.',
      context_max_items_label: 'Injected memories limit',
      context_max_items_description:
        'Limit how many long-term memories can be injected into chat context at once.',
    },
    saved_memories: {
      title: 'Saved Memories',
      description: 'Review and edit the long-term memories available for future chats.',
      edit: 'Edit',
      edit_title: 'Edit memory',
      edit_description: 'Update the stored content and kind for this memory record.',
      save: 'Save',
      delete: 'Delete',
      delete_title: 'Delete Memory',
      delete_description:
        'Delete this memory record? This action removes it from future cross-conversation recall.',
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
        'Stable preferences and facts from your conversations will appear here and can be reused in future chats.',
    },
    summaries: {
      title: 'Conversation Summaries',
      description: 'These summaries are the compressed context reused in longer conversations.',
      empty_title: 'No summaries yet',
      empty_description:
        'Summaries appear after a conversation grows beyond the short context window.',
    },
    toast: {
      delete_failed: 'Failed to delete memory.',
      settings_update_failed: 'Failed to update memory settings.',
      update_failed: 'Failed to update memory.',
    },
  },
} as const;
