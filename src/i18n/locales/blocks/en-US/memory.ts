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
      advanced_title: 'Memory Limits',
      advanced_description:
        'Control when chat summaries start, how much recent chat is kept, and how many saved memories can be reused.',
      summary_min_messages_label: 'When to start summaries',
      summary_min_messages_description:
        'Start creating a summary after a conversation reaches this many messages.',
      recent_message_window_label: 'Recent messages to keep',
      recent_message_window_description:
        'Keep this many latest messages alongside the summary in longer chats.',
      context_max_items_label: 'Saved memories to reuse',
      context_max_items_description:
        'Limit how many saved memories can be brought into a new chat.',
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
      pagination: {
        summary: 'Showing {start}-{end} of {total} memories',
        previous: 'Previous',
        next: 'Next',
        page: 'Go to page {page}',
      },
    },
    summaries: {
      title: 'Conversation Summaries',
      description: 'These summaries help the app keep track of longer conversations.',
      edit_title: 'Edit summary',
      edit_description: 'Update the saved summary for this conversation.',
      delete_title: 'Delete Summary',
      delete_description:
        'Delete this conversation summary? A new one can be generated again later.',
      content_label: 'Summary',
      empty_title: 'No summaries yet',
      empty_description: 'Summaries appear after a conversation becomes long enough to need one.',
      pagination: {
        summary: 'Showing {start}-{end} of {total} summaries',
        previous: 'Previous',
        next: 'Next',
        page: 'Go to page {page}',
      },
    },
    toast: {
      load_failed: 'Failed to load saved memories.',
      delete_failed: 'Failed to delete memory.',
      summary_load_failed: 'Failed to load conversation summaries.',
      summary_delete_failed: 'Failed to delete summary.',
      summary_update_failed: 'Failed to update summary.',
      settings_update_success: 'Memory settings saved.',
      settings_update_failed: 'Failed to update memory settings.',
      update_failed: 'Failed to update memory.',
    },
  },
} as const;
