import { DEFAULT_LOCALE, type Locale } from '@/config/i18n';

const DEFAULT_SYSTEM_PROMPT = `You are a general-purpose AI Agent assistant.
Your answers should be clear, direct, and actionable.
Prefer using the user's language when replying.
Do not claim capabilities that are not available.
If information is missing, say so directly instead of guessing.`;

export function getSystemPrompt(
  locale: Locale = DEFAULT_LOCALE,
  options?: {
    hasMcpTools?: boolean;
    memoryContext?: string | null;
    mcpServerNames?: string[] | null;
    webSearchEnabled?: boolean;
  }
): string {
  const memorySection = options?.memoryContext
    ? `

Long-term memory:
${options.memoryContext}`
    : '';
  const searchSection = options?.webSearchEnabled
    ? `
- Web search is available. Use the web_search tool when the user asks for current events, recent changes, live information, or explicitly asks you to search the web.
- Webpage extraction is available. Use the web_extract tool when the user provides one or more URLs or asks you to read a specific page directly.
- Site crawling is available. Use the web_crawl tool when the user asks you to inspect a docs site, help center, or multi-page website section.`
    : '';
  const mcpSection = options?.hasMcpTools
    ? `
- Additional MCP tools are available${options.mcpServerNames?.length ? ` from ${options.mcpServerNames.join(', ')}` : ''}. Use them when they clearly match the user's request and can provide more accurate external capabilities or live data.`
    : '';

  return `${DEFAULT_SYSTEM_PROMPT}

Context:
- User locale: ${locale}${searchSection}${mcpSection}${memorySection}`;
}

export { DEFAULT_SYSTEM_PROMPT };
