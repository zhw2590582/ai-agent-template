import { DEFAULT_LOCALE, type Locale } from '@/config/i18n';

const DEFAULT_SYSTEM_PROMPT = `You are a general-purpose AI Agent assistant.
Your answers should be clear, direct, and actionable.
Prefer using the user's language when replying.
Do not claim capabilities that are not available.
If information is missing, say so directly instead of guessing.`;

export function getSystemPrompt(
  locale: Locale = DEFAULT_LOCALE,
  options?: {
    memoryContext?: string | null;
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
- Web search is available. Use the web_search tool when the user asks for current events, recent changes, live information, or explicitly asks you to search the web.`
    : '';

  return `${DEFAULT_SYSTEM_PROMPT}

Context:
- User locale: ${locale}${searchSection}${memorySection}`;
}

export { DEFAULT_SYSTEM_PROMPT };
