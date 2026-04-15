export const enUSModelsMessages = {
  models_page: {
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
      capabilities: {
        audio: 'Audio',
        chat: 'Text chat',
        embedding: 'Embedding',
        image: 'Image generation',
        moderation: 'Moderation',
        unknown: 'Specialized or unknown',
      },
      name_placeholder: 'Display name',
      id_placeholder: 'Model ID, for example gpt-4.1-mini',
      duplicate_id: 'This model ID already exists.',
      delete_title: 'Delete Custom Model',
      delete_description:
        'Delete “{model}”? This custom model entry will be removed from the provider.',
      syncing: 'Syncing models...',
    },
    actions: {
      add_model: 'Add Model',
      add_provider: 'Add Custom Provider',
      delete_provider: 'Delete Provider',
      edit_model: 'Edit Model',
      test_connection: 'Test Connection',
      testing_connection: 'Testing...',
      saved: 'Saved',
      saving: 'Saving...',
    },
    toast: {
      load_failed: 'Failed to load model settings.',
      provider_config_required: 'Enter the API key and base URL first.',
      save_failed: 'Failed to save model settings.',
      save_success: 'Model settings saved.',
      test_connection_success: 'Connection succeeded and synced {count} models.',
      test_connection_failed:
        'Connection failed. Check the API key, base URL, and protocol format.',
    },
  },
} as const;
