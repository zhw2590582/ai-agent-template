import { generateText } from 'ai';

import { defaultModel } from '@/features/chat/ai/models';

function cleanTitle(value: string) {
  return value
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

export async function generateConversationTitle(input: string) {
  const result = await generateText({
    maxOutputTokens: 24,
    model: defaultModel.chat,
    prompt: `Generate a short chat title for the user's first message.

Rules:
- Output only the title
- 4 to 12 words
- No quotes
- No trailing punctuation
- Match the user's language

User message:
${input}`,
    temperature: 0.2,
  });

  return cleanTitle(result.text);
}
