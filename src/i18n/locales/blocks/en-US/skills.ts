export const enUSSkillsMessages = {
  skills_page: {
    enabled_label: 'Enable Skills',
    enabled_description:
      'Manage reusable local-first skill installs here. Skills are installed into local storage first, then saved as enabled settings.',
    skills_title: 'Installed Skills',
    skills_description:
      'Search the remote catalog, inspect the skill details, and install the package into local IndexedDB.',
    empty_state: 'No skills installed yet. Start by searching the skill catalog.',
    add_skill: 'Add Skill',
    view_details: 'Details',
    local_badge: 'Local',
    add_skill_title: 'Import Skill',
    add_skill_description:
      'Save a skill source URL first. The system will derive the display metadata for now.',
    edit_skill: 'Edit Skill',
    edit_skill_title: 'Edit Skill',
    edit_skill_description: 'Update the source URL and enabled state for this entry.',
    delete_skill_title: 'Delete Skill',
    delete_skill_description:
      'Delete "{skillName}"? This removes the installed package and local enabled state.',
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
    search_dialog: {
      title: 'Search Skills',
      description:
        'Search the public skills catalog by keyword, then inspect the details before installing.',
      placeholder: 'Search skills...',
      empty_query_title: 'Search the catalog',
      empty_query: 'Start typing to look up installable skills.',
      empty_results_title: 'No matching skills',
      empty_results: 'Try a different keyword or broaden the query.',
      installed_badge: 'Installed',
      installs: '{count, number} installs',
    },
    install_dialog: {
      title: 'Skill Details',
      description: 'Review the skill metadata and GitHub source before installing it locally.',
      description_label: 'Description',
      install: 'Install',
      update: 'Update',
      load_failed: 'Failed to load this skill from GitHub.',
      open_github: 'Open GitHub',
      version: 'Version {version}',
    },
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
      install_failed: 'Failed to install this skill locally.',
      install_success: 'Skill installed locally.',
      reinstall_success: 'Skill reinstalled locally.',
      save_failed: 'Failed to save skill settings.',
      save_success: 'Skill settings saved.',
    },
  },
} as const;
