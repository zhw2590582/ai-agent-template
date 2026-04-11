import { streamText } from 'ai';
import { NextRequest } from 'next/server';

import { defaultModel } from '@/server/ai/providers/models';

export async function handleTestDeepseekPost(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: '请提供有效的消息' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({
          error: '未配置 DEEPSEEK_API_KEY',
          hint: '请在 .env.local 中添加你的 DeepSeek API Key',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const result = streamText({
      model: defaultModel.chat,
      system: `你是一个友好的 AI 助手，正在帮助测试 DeepSeek API 集成。
请用简洁的语言回答问题，并在回答最后说明你是 DeepSeek 模型。`,
      prompt: message,
      temperature: 0.7,
      maxOutputTokens: 500,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[DeepSeek 测试] 错误:', error);

    return new Response(
      JSON.stringify({
        error: '调用 DeepSeek API 失败',
        message: errorMessage,
        hint: '请检查: 1) API Key 是否正确 2) 网络连接是否正常 3) API 配额是否充足',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

export function handleTestDeepseekGet() {
  return Response.json({
    status: 'ok',
    provider: 'DeepSeek',
    configured: !!process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    timestamp: new Date().toISOString(),
  });
}

