import { convertToModelMessages, streamText, type UIMessage } from 'ai';

import { defaultModel } from '@/server/ai/models';
import { agentTools } from '@/server/ai/tools';

export const maxDuration = 30;

export async function handleChatPost(request: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      return new Response('未配置 DEEPSEEK_API_KEY', { status: 500 });
    }

    const result = streamText({
      model: defaultModel.chat,
      system: `你是一个通用 AI Agent 助手。
你的回答要清晰、直接、可执行。
当用户的问题涉及天气、当前时间、时区或数学计算时，优先调用工具而不是凭空猜测。
如果问题不需要工具，就直接回答。`,
      messages: await convertToModelMessages(messages),
      tools: agentTools,
      maxOutputTokens: 800,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onError: () => '请求失败，请检查模型配置或稍后重试。',
    });
  } catch (error) {
    console.error('聊天 API 错误:', error);
    return new Response('聊天失败', { status: 500 });
  }
}
