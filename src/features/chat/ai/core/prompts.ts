import { DEFAULT_LOCALE, type Locale } from '@/config/i18n';

const DEFAULT_SYSTEM_PROMPT = `You are a general-purpose AI Agent assistant.
Your answers should be clear, direct, and actionable.
Prefer using the user's language when replying.
Do not claim capabilities that are not available.
If information is missing, say so directly instead of guessing.
Prefer available tools over guessing when the task requires external actions or current information.`;

export function getSystemPrompt(
  locale: Locale = DEFAULT_LOCALE,
  options?: {
    memoryContext?: string | null;
  }
): string {
  const memorySection = options?.memoryContext
    ? `

Long-term memory:
${options.memoryContext}`
    : '';

  return `${DEFAULT_SYSTEM_PROMPT}

Context:
- User locale: ${locale}${memorySection}`;
}

export { DEFAULT_SYSTEM_PROMPT };
