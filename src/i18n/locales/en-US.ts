import type { Translations } from './zh-CN';
import { enUSAuthMessages } from '@/i18n/locales/blocks/en-US/auth';
import { enUSChatMessages } from '@/i18n/locales/blocks/en-US/chat';
import { enUSModelsMessages } from '@/i18n/locales/blocks/en-US/models';
import { enUSSharedMessages } from '@/i18n/locales/blocks/en-US/shared';

export const enUS: Translations = {
  ...enUSSharedMessages,
  ...enUSChatMessages,
  ...enUSModelsMessages,
  ...enUSAuthMessages,
};
