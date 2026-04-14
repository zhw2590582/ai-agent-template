export const enUSSearchMessages = {
  search_page: {
    title: 'Web Search',
    description:
      'Connect your Tavily key so the assistant can look up current information on the web.',
    enabled_label: 'Enable web search',
    enabled_description:
      'Allow the assistant to call Tavily when a question needs current or web-based information.',
    api_key_label: 'Tavily API key',
    api_key_description:
      'This key is stored in your profile settings and used only for your chat requests.',
    api_key_placeholder: 'Enter your Tavily API key',
    api_key_hint: 'You can keep search disabled until a key is configured.',
    get_api_key: 'Get API key',
    toast: {
      save_failed: 'Search settings could not be saved.',
      save_success: 'Search settings saved.',
    },
  },
} as const;
