export const enUSSubagentMessages = {
  subagent_page: {
    description:
      'Define reusable subagent profiles here. This version only stores configuration and display metadata.',
    enabled_label: 'Enable Subagents',
    enabled_description:
      'Store subagent profiles in your settings and mark whether they should be considered available.',
    subagents_title: 'Saved Subagents',
    subagents_description:
      'Each subagent keeps its own prompt, generation settings, and theme color for future orchestration.',
    empty_state: 'No subagents saved yet. Add one to start building your specialist roster.',
    add_subagent: 'Add Subagent',
    add_subagent_title: 'Add Subagent',
    add_subagent_description:
      'Create a reusable subagent profile with its own prompt and generation settings.',
    edit_subagent: 'Edit',
    edit_subagent_title: 'Edit Subagent',
    edit_subagent_description: 'Update the prompt, limits, and theme color for this subagent.',
    delete_subagent_title: 'Delete Subagent',
    delete_subagent_description:
      'Delete "{subagentName}"? This only removes the saved entry from your profile settings.',
    agent_enabled_label: 'Enable This Subagent',
    agent_enabled_description:
      'Disabled subagents stay saved, but they will not be considered active.',
    name_label: 'Name',
    name_placeholder: 'Research Reviewer',
    name_description: 'Use a short role name that is easy to recognize in the list.',
    description_label: 'Description',
    description_placeholder: 'Reviews outputs for factual risk, missing context, and weak claims.',
    description_description: 'Keep this brief. It should explain when this subagent is useful.',
    system_prompt_label: 'System Prompt',
    system_prompt_placeholder:
      'You are a meticulous reviewer. Focus on gaps, unsupported claims, and risky assumptions.',
    system_prompt_description:
      'This prompt defines the subagent role. Runtime delegation will be layered in later.',
    temperature_label: 'Temperature',
    temperature_description:
      'Lower values are more deterministic; higher values are more flexible.',
    max_tokens_label: 'Max Tokens',
    max_tokens_description: 'Caps the response budget for this subagent profile.',
    theme_color_label: 'Theme Color',
    theme_color_description: 'Used as the visual accent for this saved subagent.',
    theme_color_placeholder: '#14b8a6',
    color_preview_badge: 'Theme',
    temperature_badge: 'Temp {value}',
    max_tokens_badge: 'Max {value}',
    toast: {
      save_failed: 'Failed to save subagent settings.',
      save_success: 'Subagent settings saved.',
    },
  },
} as const;
