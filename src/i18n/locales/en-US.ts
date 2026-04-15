import type { Translations } from './zh-CN';
import { enUSAuthMessages } from '@/i18n/locales/blocks/en-US/auth';
import { enUSChatMessages } from '@/i18n/locales/blocks/en-US/chat';
import { enUSMemoryMessages } from '@/i18n/locales/blocks/en-US/memory';
import { enUSMcpMessages } from '@/i18n/locales/blocks/en-US/mcp';
import { enUSModelsMessages } from '@/i18n/locales/blocks/en-US/models';
import { enUSRagMessages } from '@/i18n/locales/blocks/en-US/rag';
import { enUSSandboxMessages } from '@/i18n/locales/blocks/en-US/sandbox';
import { enUSSearchMessages } from '@/i18n/locales/blocks/en-US/search';
import { enUSSkillsMessages } from '@/i18n/locales/blocks/en-US/skills';
import { enUSSharedMessages } from '@/i18n/locales/blocks/en-US/shared';

export const enUS: Translations = {
  ...enUSSharedMessages,
  ...enUSChatMessages,
  ...enUSMemoryMessages,
  ...enUSMcpMessages,
  ...enUSModelsMessages,
  ...enUSRagMessages,
  ...enUSSandboxMessages,
  ...enUSSearchMessages,
  ...enUSSkillsMessages,
  ...enUSAuthMessages,
};
