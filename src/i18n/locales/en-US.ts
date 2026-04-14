import type { Translations } from './zh-CN';
import { enUSAuthMessages } from '@/i18n/locales/blocks/en-US/auth';
import { enUSChatMessages } from '@/i18n/locales/blocks/en-US/chat';
import { enUSMemoryMessages } from '@/i18n/locales/blocks/en-US/memory';
import { enUSMcpMessages } from '@/i18n/locales/blocks/en-US/mcp';
import { enUSModelsMessages } from '@/i18n/locales/blocks/en-US/models';
import { enUSSearchMessages } from '@/i18n/locales/blocks/en-US/search';
import { enUSSharedMessages } from '@/i18n/locales/blocks/en-US/shared';

export const enUS: Translations = {
  ...enUSSharedMessages,
  ...enUSChatMessages,
  ...enUSMemoryMessages,
  ...enUSMcpMessages,
  ...enUSModelsMessages,
  ...enUSSearchMessages,
  ...enUSAuthMessages,
};
