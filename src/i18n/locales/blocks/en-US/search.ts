export const enUSSearchMessages = {
  search_page: {
    title: 'Web Search',
    description:
      'Choose when the assistant can search the web and how Tavily requests should behave.',
    connection_title: 'Connection',
    connection_description:
      'Add your Tavily API key and decide whether web search is available in chat.',
    search_title: 'Web search',
    search_description:
      'Set the default Tavily options the assistant should use when it searches the web for you.',
    enabled_label: 'Enable web search',
    enabled_description:
      'Allow the assistant to call Tavily when a question needs current or web-based information.',
    api_key_label: 'Tavily API key',
    api_key_description:
      'This key is stored in your profile settings and used only for your chat requests.',
    api_key_placeholder: 'Enter your Tavily API key',
    api_key_hint: 'You can keep search disabled until a key is configured.',
    get_api_key: 'Get API key',
    test_connection: 'Test connection',
    depth_label: 'Search depth',
    depth_description: 'Use basic for speed and advanced for broader search coverage.',
    depth_basic: 'Basic',
    depth_advanced: 'Advanced',
    topic_label: 'Default topic',
    topic_description: 'Used when the assistant searches the web without a more specific category.',
    topic_general: 'General',
    topic_news: 'News',
    topic_finance: 'Finance',
    max_results_label: 'Max results',
    max_results_description: 'How many Tavily results to return for each web search.',
    extract_title: 'Page extract',
    extract_description:
      'Control how the assistant reads specific webpages when you provide direct URLs.',
    extract_depth_label: 'Extract depth',
    extract_depth_description:
      'Use basic for faster extraction and advanced for richer page capture.',
    extract_format_label: 'Output format',
    extract_format_description:
      'Choose whether extracted page content should come back as markdown or plain text.',
    extract_format_markdown: 'Markdown',
    extract_format_text: 'Plain text',
    extract_chunks_label: 'Chunks per page',
    extract_chunks_description:
      'How many relevant content chunks to keep from each extracted page.',
    crawl_title: 'Site crawl',
    crawl_description:
      'Control how deeply the assistant can explore a documentation site or multi-page website section.',
    crawl_max_depth_label: 'Max depth',
    crawl_max_depth_description:
      'How many link levels the assistant may follow from the starting page.',
    crawl_page_limit_label: 'Page limit',
    crawl_page_limit_description: 'The maximum number of pages to collect in a single crawl.',
    crawl_external_label: 'Allow external pages',
    crawl_external_description: 'Permit the crawl to follow links that leave the starting domain.',
    toast: {
      save_failed: 'Search settings could not be saved.',
      save_success: 'Search settings saved.',
      test_failed: 'Tavily connection test failed.',
      test_success: 'Tavily connection works. {count} results returned.',
    },
  },
} as const;
