export const enUSSharedMessages = {
  common: {
    app_name: 'AI Agent Template',
    welcome: 'Welcome',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    delete: 'Delete',
    disabled: 'Disabled',
    enabled: 'Enabled',
    not_supported: 'Not supported',
    save: 'Save',
    supported: 'Supported',
  },
  theme: {
    switch_to_light: 'Switch to light mode',
    switch_to_dark: 'Switch to dark mode',
  },
  navigation: {
    models: 'Models',
    subagent: 'Subagents',
    sandbox: 'Sandbox',
    mcp: 'MCP',
    skills: 'Skills',
    rag: 'RAG',
    memory: 'Memory',
    settings: 'Settings',
    search: 'Search',
  },
  placeholders: {
    models: {
      title: 'Models Page',
      description: 'This is a placeholder for future model management and connection settings.',
    },
    subagent: {
      title: 'Subagents Page',
      description:
        'This is a placeholder for future subagent roles, strategies, and execution settings.',
    },
    sandbox: {
      title: 'Sandbox Page',
      description: 'This is a placeholder for future testing and debugging capabilities.',
    },
    mcp: {
      title: 'MCP Page',
      description: 'This is a placeholder for future MCP connections and tool management.',
    },
    skills: {
      title: 'Skills Page',
      description: 'This is a placeholder for future skill packs and workflow management.',
    },
    rag: {
      title: 'RAG Workspace',
      description:
        'This page is reserved for future retrieval pipelines, knowledge base indexing, recall controls, and grounding configuration.',
    },
    memory: {
      title: 'Memory Page',
      description: 'This is a placeholder for future memory controls and storage settings.',
    },
    settings: {
      title: 'Settings Page',
      description: 'This is a placeholder for future application preferences and settings.',
    },
    search: {
      title: 'Search Page',
      description: 'This is a placeholder for future search capabilities.',
    },
  },
  errors: {
    config_missing: 'System configuration missing, please contact administrator',
    config_invalid: 'Invalid system configuration, please contact administrator',
    api_key_invalid: 'Invalid API Key, please check configuration',
    api_rate_limit: 'Too many requests, please try again later',
    api_timeout: 'Request timeout, please retry',
    api_network: 'Network connection failed, please check network',
    input_invalid: 'Invalid input',
    input_too_long: 'Input too long',
    model_error: 'AI model service error',
    model_overload: 'AI service overloaded, please try again later',
    tool_execution_error: 'Tool execution failed',
    unknown: 'Unknown error, please try again later',
  },
} as const;
