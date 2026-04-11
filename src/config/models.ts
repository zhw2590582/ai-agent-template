export const MODEL_OPTIONS = [
  {
    id: 'deepseek-chat',
    translationKey: 'chat.models.deepseek_chat',
  },
  {
    id: 'deepseek-coder',
    translationKey: 'chat.models.deepseek_coder',
  },
] as const;

export type ModelId = (typeof MODEL_OPTIONS)[number]['id'];
