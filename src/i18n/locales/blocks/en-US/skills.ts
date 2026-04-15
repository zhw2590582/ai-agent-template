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
      'Save a skill source URL and basic metadata so it can be managed from this workspace.',
    edit_skill: 'Edit Skill',
    edit_skill_title: 'Edit Skill',
    edit_skill_description: 'Update the skill metadata and capability hints for this entry.',
    delete_skill_title: 'Delete Skill',
    delete_skill_description:
      'Delete "{skillName}"? This only removes the saved entry from your profile settings.',
    skill_enabled_label: 'Enable Skill',
    skill_enabled_description:
      'Disabled skills stay in the list but will not be considered active.',
    skill_name_label: 'Skill Name',
    skill_name_placeholder: 'For example Repository Reviewer',
    skill_source_url_label: 'Source URL',
    skill_source_url_placeholder: 'https://example.com/skills/repo-reviewer',
    skill_source_url_description:
      'Use the canonical skill URL. Real remote import will be added later.',
    skill_description_label: 'Description',
    skill_description_placeholder: 'Describe what this skill is for and when it should be used.',
    capabilities_label: 'Capabilities',
    capabilities_description:
      'These are compatibility hints only. They do not execute anything by themselves.',
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
