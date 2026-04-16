import { zhCNAuthMessages } from '@/i18n/locales/blocks/zh-CN/auth';
import { zhCNChatMessages } from '@/i18n/locales/blocks/zh-CN/chat';
import { zhCNMemoryMessages } from '@/i18n/locales/blocks/zh-CN/memory';
import { zhCNMcpMessages } from '@/i18n/locales/blocks/zh-CN/mcp';
import { zhCNModelsMessages } from '@/i18n/locales/blocks/zh-CN/models';
import { zhCNRagMessages } from '@/i18n/locales/blocks/zh-CN/rag';
import { zhCNSandboxMessages } from '@/i18n/locales/blocks/zh-CN/sandbox';
import { zhCNSearchMessages } from '@/i18n/locales/blocks/zh-CN/search';
import { zhCNSkillsMessages } from '@/i18n/locales/blocks/zh-CN/skills';
import { zhCNSubagentMessages } from '@/i18n/locales/blocks/zh-CN/subagent';
import { zhCNSharedMessages } from '@/i18n/locales/blocks/zh-CN/shared';

const zhCN = {
  ...zhCNSharedMessages,
  ...zhCNChatMessages,
  ...zhCNMemoryMessages,
  ...zhCNMcpMessages,
  ...zhCNModelsMessages,
  ...zhCNRagMessages,
  ...zhCNSandboxMessages,
  ...zhCNSearchMessages,
  ...zhCNSkillsMessages,
  ...zhCNSubagentMessages,
  ...zhCNAuthMessages,
};

type DeepStringify<T> = T extends string
  ? string
  : T extends object
    ? { [K in keyof T]: DeepStringify<T[K]> }
    : T;

export type Translations = DeepStringify<typeof zhCN>;

export { zhCN };
