import type { UIMessage } from 'ai';

export const STARTER_PROMPTS = [
  '现在上海时间几点？',
  '帮我算一下 (24 * 8) / 3',
  '北京今天适合出门吗？',
  '给我一份今天的工作启动清单',
];

export const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: 'welcome-message',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: '我是一个通用 AI Agent。你可以直接聊天，也可以让我查时间、做计算，或调用工具来辅助回答。',
      },
    ],
  },
];
