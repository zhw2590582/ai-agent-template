import { zhCNAuthMessages } from '@/i18n/locales/blocks/zh-CN/auth';
import { zhCNChatMessages } from '@/i18n/locales/blocks/zh-CN/chat';
import { zhCNModelsMessages } from '@/i18n/locales/blocks/zh-CN/models';
import { zhCNSharedMessages } from '@/i18n/locales/blocks/zh-CN/shared';

const zhCN = {
  ...zhCNSharedMessages,
  ...zhCNChatMessages,
  ...zhCNModelsMessages,
  ...zhCNAuthMessages,
};

type DeepStringify<T> = T extends string
  ? string
  : T extends object
    ? { [K in keyof T]: DeepStringify<T[K]> }
    : T;

export type Translations = DeepStringify<typeof zhCN>;

export { zhCN };
