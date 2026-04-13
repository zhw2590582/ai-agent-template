/**
 * English translations
 *
 * Note:
 * - This file should mirror the structure of zh-CN.ts
 * - Keep the same nested object structure
 * - Each feature module has its own namespace
 */

import type { Translations } from './zh-CN';

export const enUS: Translations = {
  common: {
    app_name: 'AI Agent Template',
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    back_to_chat: 'Back to chat',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    reset: 'Reset',
    submit: 'Submit',
  },

  chat: {
    title: 'General AI Agent',
    subtitle: 'chatgpt.com inspired',
    welcome_message:
      'I am a general AI Agent. You can chat directly, ask me to check time, do calculations, or call tools for richer answers.',
    input_placeholder: 'Type a message...',
    send: 'Send',
    stop: 'Stop',
    actions: {
      retry: 'Retry',
      regenerate: 'Regenerate',
      copy: 'Copy',
      copy_response: 'Copy response',
    },
    composer: {
      placeholder: 'Send a message to AI Agent',
      workspace_hint: 'Wide workspace with streaming responses and tool calling',
      model_label: 'Model',
      model_missing: 'Configure a model first',
      model_selector_title: 'Select Model',
      model_selector_description:
        'Search providers and models to switch the current conversation model.',
      model_selector_search: 'Search models or providers',
      model_selector_empty: 'No matching models',
    },
    header: {
      show_sidebar: 'Show sidebar',
      hide_sidebar: 'Hide sidebar',
    },
    sidebar: {
      agent_workspace: 'AI Agent Template',
      messages: '{count} messages',
      current: 'Current',
      new_chat: 'New chat',
      history: 'History',
      history_item: 'Item {index}',
      history_empty_title: 'No history yet',
      no_history: 'No history yet. Send a message and it will appear here.',
      no_preview: 'This conversation does not have a preview yet.',
      dark_mode_only: 'Dark mode only',
      loading_more: 'Loading more…',
      search_placeholder: 'Search conversations…',
      options_label: 'Conversation options',
      rename: 'Rename',
      delete: 'Delete',
      rename_title: 'Rename Conversation',
      rename_description: 'Enter a new title for this conversation.',
      rename_confirm: 'Save Title',
      delete_title: 'Delete Conversation',
      delete_description: 'Delete "{title}"? This conversation cannot be recovered.',
      delete_confirm: 'Delete Conversation',
    },
    empty_state: {
      title: 'What do you want the agent to help with today?',
      description: '',
    },
    retry: 'Retry',
    regenerate: 'Regenerate',
    status: {
      ready: 'Ready',
      thinking: 'Thinking',
      error: 'Error',
    },
    errors: {
      network: 'Network error, please retry',
      rate_limit: 'Too many requests',
      server: 'Server error',
      request_failed: 'Request failed. Check the current model configuration or try again later.',
      unknown: 'Unknown error',
      invalid_conversation: 'Conversation not found or has been deleted',
      create_conversation_failed: 'Failed to create conversation',
      delete_conversation_failed: 'Failed to delete conversation',
      send_message_failed: 'Failed to send message',
      load_more_failed: 'Failed to load more conversations',
      model_not_configured: 'No model is available yet. Configure one on the Models page first.',
      rename_conversation_failed: 'Failed to rename conversation',
    },
    toast: {
      copied: 'Copied to clipboard',
      copy_failed: 'Failed to copy',
    },
    models: {
      deepseek_chat: 'DeepSeek Chat',
      deepseek_coder: 'DeepSeek Coder',
    },
  },

  tools: {
    weather: {
      name: 'Weather',
      description: 'Get weather information',
    },
    calculator: {
      name: 'Calculator',
      description: 'Perform calculations',
    },
    datetime: {
      name: 'Date & Time',
      description: 'Get current time',
    },
  },

  settings: {
    title: 'Settings',
    language: 'Language',
    theme: 'Theme',
  },

  models_page: {
    eyebrow: 'Models',
    title: 'Model Providers',
    description:
      'Use this page to manage third-party model connections. Guest settings stay on the current device, while signed-in users write the same settings shape into profile.settings so chat, sandbox, and future agent surfaces can reuse it.',
    storage: {
      local: 'Local Draft',
      database: 'Database Profile',
    },
    status: {
      enabled: 'Enabled',
      disabled: 'Disabled',
    },
    sidebar: {
      title: 'Providers',
      description: 'Choose a provider first, then fill in API details and models.',
      toggle_provider: 'Toggle provider enabled state',
    },
    providers: {
      dialog_title: 'Add Custom Provider',
      dialog_description:
        'Create a provider first, then continue with the API details and connection test on the right.',
      delete_title: 'Delete Custom Provider',
      delete_description:
        'Delete “{provider}”? This will remove the provider and all of its model settings.',
      name_label: 'Provider Name',
      name_placeholder: 'For example My OpenAI Gateway',
      duplicate_name: 'A provider with this name already exists.',
    },
    detail: {
      title_suffix: 'Provider Settings',
      helper:
        'After entering the API key, base URL, and protocol format, you can test the connection and sync the latest models from the provider.',
    },
    fields: {
      api_key: 'API Key',
      get_api_key: 'Get API Key',
      api_key_placeholder: 'Enter your API key',
      base_url: 'API Base URL',
      api_format: 'API Format',
      api_format_hint:
        'Choose the protocol format supported by the provider. This page currently focuses on OpenAI-compatible and Anthropic-compatible APIs.',
    },
    formats: {
      anthropic: 'Anthropic Compatible',
      openai: 'OpenAI Compatible',
    },
    models: {
      title: 'Available Models',
      description:
        'Synced models can be enabled directly, and you can add your own custom models too.',
      name_placeholder: 'Display name',
      id_placeholder: 'Model ID, for example gpt-4.1-mini',
      duplicate_id: 'This model ID already exists.',
      syncing: 'Syncing models...',
    },
    actions: {
      import: 'Import',
      export: 'Export',
      add_model: 'Add Model',
      add_provider: 'Add Custom Provider',
      delete_provider: 'Delete Provider',
      edit_model: 'Edit Model',
      test_connection: 'Test Connection',
      testing_connection: 'Testing...',
      saved: 'Saved',
      reset: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      loading: 'Loading...',
    },
    toast: {
      import_success: 'Settings imported successfully.',
      import_failed: 'Failed to import settings. Check the JSON format.',
      load_failed: 'Failed to load model settings.',
      provider_config_required: 'Enter the API key and base URL first.',
      save_local_success: 'Model settings saved locally.',
      save_success: 'Model settings saved.',
      save_failed: 'Failed to save model settings.',
      test_connection_success: 'Connection succeeded and synced {count} models.',
      test_connection_failed:
        'Connection failed. Check the API key, base URL, and protocol format.',
    },
  },

  theme: {
    switch_to_light: 'Switch to light mode',
    switch_to_dark: 'Switch to dark mode',
  },

  auth: {
    sign_in: 'Sign in',
    title: 'Sign in to AI Agent',
    description:
      'Supabase social sign-in is now wired in. Once you authenticate, upcoming session persistence and memory features will build on your account.',
    dialog_description:
      'Use a social account to sign in quickly. The dialog currently supports Google and GitHub.',
    back_to_chat: 'Back to chat',
    sign_in_with_google: 'Continue with Google',
    sign_in_with_github: 'Continue with GitHub',
    github_description:
      'You will be redirected to GitHub to authorize and then sent back to this app.',
    oauth_description:
      'You will be redirected to the provider to authorize and then sent back to this app.',
    signed_in_as: 'Signed in as',
    signed_in_description:
      'Your account is connected. You can go back to chat now, and the next storage and memory steps will build on this login state.',
    continue_to_chat: 'Continue to chat',
    sign_out: 'Sign out',
    configuration_missing_title: 'Supabase configuration missing',
    configuration_missing_description:
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY before using social sign-in.',
    errors: {
      oauth_callback:
        'OAuth callback failed. Check your Supabase redirect URL and your Google / GitHub OAuth configuration.',
      sign_in_failed: 'Sign in failed, please try again',
      sign_out_failed: 'Sign out failed, please try again',
    },
    toast: {
      sign_out_success: 'Signed out successfully',
    },
  },

  navigation: {
    models: 'Models',
    subagent: 'Subagent',
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
      title: 'Subagent Page',
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
};
