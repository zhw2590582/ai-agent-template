export const enUSSubagentMessages = {
  subagent_page: {
    description:
      'Create optional specialist assistants here. The main AI can delegate work to them when a task needs focused help.',
    enabled_label: 'Enable Subagents',
    enabled_description: 'When this is off, the main AI ignores all saved subagents.',
    subagents_title: 'Available Subagents',
    subagents_description:
      'A subagent is a specialist assistant with its own role prompt, temperature, token limit, and theme color.',
    empty_state: 'No subagents yet. Add one or start from the built-in presets.',
    add_subagent: 'Add Subagent',
    add_subagent_title: 'Add Subagent',
    add_subagent_description:
      'Create a specialist assistant the main AI can call when a task needs focused help.',
    edit_subagent: 'Edit',
    edit_subagent_title: 'Edit Subagent',
    edit_subagent_description:
      'Update this subagent’s role description, response limits, and theme color.',
    delete_subagent_title: 'Delete Subagent',
    delete_subagent_description:
      'Delete "{subagentName}"? This only removes the saved entry from your profile settings.',
    agent_enabled_label: 'Enable This Subagent',
    agent_enabled_description: 'Turn this off to keep it saved but unavailable for delegation.',
    name_label: 'Name',
    name_placeholder: 'Research Reviewer',
    name_description:
      'This is the display name shown in the list and used to identify the specialist.',
    description_label: 'Description',
    description_placeholder: 'Reviews outputs for factual risk, missing context, and weak claims.',
    description_description: 'Explain what this subagent is good at and when it should be used.',
    system_prompt_label: 'System Prompt',
    system_prompt_placeholder:
      'You are a meticulous reviewer. Focus on gaps, unsupported claims, and risky assumptions.',
    system_prompt_description:
      'This prompt is used when the main AI delegates a task to this subagent.',
    temperature_label: 'Temperature',
    temperature_description: 'Lower values are steadier; higher values allow more variation.',
    max_tokens_label: 'Max Tokens',
    max_tokens_description: 'Sets the maximum response budget for this subagent.',
    theme_color_label: 'Theme Color',
    theme_color_description: 'Used as the accent color for this subagent in the UI.',
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
