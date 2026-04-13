export const enUSModelsMessages = {
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
      delete_title: 'Delete Custom Model',
      delete_description:
        'Delete “{model}”? This custom model entry will be removed from the provider.',
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
} as const;
