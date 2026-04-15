export const enUSSkillsMessages = {
  skills_page: {
    enabled_label: 'Enable Skills',
    enabled_description:
      'Manage reusable skill definitions here. This version only stores metadata and compatibility hints.',
    skills_title: 'Installed Skills',
    skills_description:
      'Add skill entries by URL first. Runtime import and execution will be layered in later.',
    empty_state: 'No skills added yet. Start by importing one skill URL.',
    add_skill: 'Import Skill',
    add_skill_title: 'Import Skill',
    add_skill_description:
      'Save a skill source URL first. The system will derive the display metadata for now.',
    edit_skill: 'Edit Skill',
    edit_skill_title: 'Edit Skill',
    edit_skill_description: 'Update the source URL and enabled state for this entry.',
    delete_skill_title: 'Delete Skill',
    delete_skill_description:
      'Delete "{skillName}"? This only removes the saved entry from your profile settings.',
    skill_enabled_label: 'Enable Skill',
    skill_enabled_description:
      'Disabled skills stay in the list but will not be considered active.',
    skill_source_url_label: 'Source URL',
    skill_source_url_placeholder: 'https://example.com/skills/repo-reviewer',
    skill_source_url_description:
      'Use the canonical skill URL. Name and description are derived automatically for now.',
    parsed_name_label: 'Parsed Name',
    parsed_description_label: 'Parsed Description',
    parsed_description_hint:
      'This is currently derived from the URL. Real remote metadata parsing will be added later.',
    parsed_empty: 'Waiting for a valid URL',
    capabilities: {
      browser: 'Browser',
      fs: 'Filesystem',
      git: 'Git',
      http: 'HTTP API',
      mcp: 'MCP',
      prompt: 'Prompt',
      shell: 'Shell',
    },
    toast: {
      save_failed: 'Failed to save skill settings.',
      save_success: 'Skill settings saved.',
    },
  },
} as const;
