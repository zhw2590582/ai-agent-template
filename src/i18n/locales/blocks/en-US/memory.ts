export const enUSMemoryMessages = {
  memory_page: {
    controls: {
      title: 'Memory Settings',
      description: 'Choose how the app remembers important details from your chats.',
      export: 'Export JSON',
      enable_label: 'Enable memory',
      enable_description: 'Let the app remember summaries and important details for this account.',
      auto_write_label: 'Auto-write memories',
      auto_write_description: 'Save useful preferences and facts after a conversation ends.',
      cross_conversation_label: 'Use memories across conversations',
      cross_conversation_description:
        'Reuse saved memories in future chats when they are relevant.',
      advanced_title: 'Advanced thresholds',
      advanced_description:
        'Fine-tune when summaries are created and how much past context is reused.',
      summary_min_messages_label: 'Summary trigger messages',
      summary_min_messages_description:
        'Generate or refresh a conversation summary once the thread reaches this many messages.',
      recent_message_window_label: 'Recent messages window',
      recent_message_window_description:
        'Keep this many latest messages alongside the stored summary.',
      context_max_items_label: 'Memory reuse limit',
      context_max_items_description:
        'Limit how many saved memories can be reused in a single chat.',
    },
    saved_memories: {
      title: 'Saved Memories',
      description: 'Review and edit the details the app can remember for future chats.',
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
      description: 'These summaries help the app keep track of longer conversations.',
      empty_title: 'No summaries yet',
      empty_description: 'Summaries appear after a conversation becomes long enough to need one.',
    },
    toast: {
      delete_failed: 'Failed to delete memory.',
      settings_update_failed: 'Failed to update memory settings.',
      update_failed: 'Failed to update memory.',
    },
  },
} as const;
