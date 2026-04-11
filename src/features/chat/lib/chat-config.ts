import type { UIMessage } from 'ai';

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

export function getStarterPrompts(t: TranslateFn): string[] {
  return [
    t('chat.quick_prompts.items.time'),
    t('chat.quick_prompts.items.calculate'),
    t('chat.quick_prompts.items.weather'),
    t('chat.quick_prompts.items.todo'),
  ];
}

export function getInitialMessages(t: TranslateFn): UIMessage[] {
  return [
    {
      id: 'welcome-message',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: t('chat.welcome_message'),
        },
      ],
    },
  ];
}
