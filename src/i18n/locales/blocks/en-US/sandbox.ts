export const enUSSandboxMessages = {
  sandbox_page: {
    title: 'Sandbox',
    description:
      'Configure an isolated E2B runtime for file work, command execution, and future skill compatibility.',
    get_api_key: 'Get API key',
    test_connection: 'Test connection',
    enabled_label: 'Enable sandbox runtime',
    enabled_description:
      'Allow the assistant to use an isolated E2B environment for command execution and file work.',
    api_key_label: 'E2B API key',
    api_key_description: 'Saved to your profile and reserved for your own sandbox sessions.',
    api_key_placeholder: 'Enter your E2B API key',
    api_key_hint: 'Keep sandbox disabled until your runtime and policies are ready.',
    runtime_title: 'Runtime',
    runtime_description:
      'Configure the default timeout, working directory, and network access for sandbox sessions.',
    template_label: 'Template',
    template_description:
      'Optional. When your templates can be loaded, choose one from the list or keep a custom value.',
    template_placeholder: 'base',
    template_custom: 'Custom template',
    template_loading: 'Loading your available E2B templates.',
    timeout_label: 'Timeout (seconds)',
    timeout_description: 'How long a sandbox may stay active before it should expire or be paused.',
    working_directory_label: 'Working directory',
    working_directory_description:
      'The default directory for commands, generated files, and future skill execution.',
    working_directory_placeholder: '/workspace',
    advanced_title: 'Advanced',
    advanced_description:
      'Optional settings for custom templates and environment variables. Most users can leave these untouched.',
    access_title: 'Execution policy',
    access_description:
      'These switches define what the assistant may do inside the sandbox once execution tools are connected.',
    policy_badge: 'Policy',
    access_filesystem_label: 'Filesystem',
    access_filesystem_description: 'Allow reading and writing files inside the sandbox workspace.',
    access_commands_label: 'Commands',
    access_commands_description: 'Allow non-interactive shell commands and scripts.',
    access_terminal_label: 'PTY terminal',
    access_terminal_description:
      'Allow interactive terminal sessions when a workflow requires TTY.',
    access_network_label: 'Internet access',
    access_network_description:
      'Allow the sandbox to reach package registries, docs, and external APIs.',
    access_upload_label: 'File upload',
    access_upload_description: 'Allow copying local or generated files into the sandbox.',
    access_download_label: 'File download',
    access_download_description:
      'Allow copying artifacts, logs, and generated outputs back out of the sandbox.',
    environment_title: 'Environment',
    environment_description:
      'Store default environment variables and launch context that should be applied to future runs.',
    env_vars_label: 'Environment variables',
    env_vars_description: 'Use one KEY=VALUE entry per line. Blank lines are ignored.',
    env_vars_placeholder: 'OPENAI_API_KEY=...\nNODE_ENV=development',
    toast: {
      save_failed: 'Sandbox settings could not be saved.',
      save_success: 'Sandbox settings saved.',
      test_failed: 'Sandbox connection test failed.',
      test_success: 'Sandbox connection works. Template "{template}" is available.',
    },
  },
} as const;
