import { convertToModelMessages, streamText, type UIMessage } from 'ai';

import { AI_CONFIG } from '@/config/app';
import { handleError } from '@/lib/errors';
import { defaultModel } from '@/server/ai/models';
import { DEFAULT_SYSTEM_PROMPT } from '@/server/ai/prompts';
import { agentTools } from '@/server/ai/tools';

export const maxDuration = 30;

export async function handleChatPost(request: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json();

    const result = streamText({
      model: defaultModel.chat,
      system: DEFAULT_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools: agentTools,
      maxOutputTokens: AI_CONFIG.DEFAULT_MAX_TOKENS,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onError: () => '请求失败，请检查模型配置或稍后重试。',
    });
  } catch (error) {
    return handleError(error);
  }
}
