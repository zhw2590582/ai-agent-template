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
    ragContext?: string | null;
    skillsRoster?: string | null;
    subagentRoster?: string | null;
  }
): string {
  const memorySection = options?.memoryContext
    ? `

Long-term memory:
${options.memoryContext}`
    : '';
  const ragSection = options?.ragContext
    ? `

Retrieved knowledge base:
${options.ragContext}`
    : '';
  const skillsSection = options?.skillsRoster
    ? `

Available skills:
${options.skillsRoster}

Skills marked as "Load on demand with load_skill" are lazy by default. When a task appears related to one of these skills, load it before writing specialized guidance, changing code in that area, or calling domain-specific tools. If the loaded skill references supporting files, use the read_skill_file tool with the returned relative path.`
    : '';
  const subagentSection = options?.subagentRoster
    ? `

Available subagents:
${options.subagentRoster}`
    : '';

  return `${DEFAULT_SYSTEM_PROMPT}

Context:
- User locale: ${locale}${memorySection}${ragSection}${skillsSection}${subagentSection}`;
}

export { DEFAULT_SYSTEM_PROMPT };
