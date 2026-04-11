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
    app_name: 'AI Agent App',
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
      enter_hint: 'Press Enter to send, Shift + Enter for newline',
    },
    header: {
      show_sidebar: 'Show sidebar',
      hide_sidebar: 'Hide sidebar',
    },
    sidebar: {
      agent_workspace: 'Agent Workspace',
      messages: '{count} messages',
      new_chat: 'New chat',
      history: 'History',
      history_item: 'Item {index}',
      no_history: 'No history yet. Send a message and it will appear here.',
      dark_mode_only: 'Dark mode only',
    },
    empty_state: {
      title: 'What do you want the agent to help with today?',
      description:
        'You can chat directly, ask it to check time, do calculations, or trigger tools for more specific tasks.',
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
      request_failed: 'Request failed. Please check DEEPSEEK_API_KEY or try again later.',
      unknown: 'Unknown error',
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

  auth: {
    sign_in: 'Sign in',
    title: 'Sign-in entry',
    description:
      'Authentication is not wired in yet. This page is reserved for a future login flow.',
    back_to_chat: 'Back to chat',
  },

  navigation: {
    providers: 'Providers',
    agents: 'Agents',
    plugins: 'Plugins',
    tools: 'Tools',
    skills: 'Skills',
    memory: 'Memory',
    settings: 'Settings',
  },

  placeholders: {
    providers: {
      title: 'Providers Page',
      description:
        'This is a placeholder for future provider management and model connection settings.',
    },
    agents: {
      title: 'Agents Page',
      description:
        'This is a placeholder for future agent roles, strategies, and execution settings.',
    },
    plugins: {
      title: 'Plugins Page',
      description: 'This is a placeholder for future plugin browsing and management.',
    },
    tools: {
      title: 'Tools Page',
      description: 'This is a placeholder for future tool configuration and availability.',
    },
    skills: {
      title: 'Skills Page',
      description: 'This is a placeholder for future skill packs and workflow management.',
    },
    memory: {
      title: 'Memory Page',
      description: 'This is a placeholder for future memory controls and storage settings.',
    },
    settings: {
      title: 'Settings Page',
      description: 'This is a placeholder for future application preferences and settings.',
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
