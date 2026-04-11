/**
 * TypeScript 路径别名配置
 *
 * 用途：集中管理所有模块路径，便于重构时统一修改
 */

/**
 * 模块路径常量
 *
 * 使用这些常量而不是硬编码路径，便于未来调整目录结构
 */
export const PATHS = {
  // 配置
  CONFIG: '@/config',
  CONFIG_ENV: '@/config/env',
  CONFIG_APP: '@/config/app',

  // 工具库
  LIB: '@/lib',
  LIB_UTILS: '@/lib/utils',
  LIB_ERRORS: '@/lib/errors',
  LIB_LOGGER: '@/lib/logger',

  // 服务端
  SERVER: '@/server',
  SERVER_TYPES: '@/server/types',
  SERVER_AI: '@/server/ai',
  SERVER_AI_MODELS: '@/server/ai/models',
  SERVER_AI_PROMPTS: '@/server/ai/prompts',
  SERVER_AI_TOOLS: '@/server/ai/tools',

  // 组件
  COMPONENTS: '@/components',
  COMPONENTS_UI: '@/components/ui',
  COMPONENTS_AI: '@/components/ai-elements',

  // 功能模块
  FEATURES: '@/features',
  FEATURES_CHAT: '@/features/chat',

  // 未来扩展预留
  // SERVER_AI_MEMORY: '@/server/ai/memory',
  // SERVER_AI_RAG: '@/server/ai/rag',
  // SERVER_AI_PLANNERS: '@/server/ai/planners',
  // SERVER_AI_AGENTS: '@/server/ai/agents',
  // SERVER_STORAGE: '@/server/storage',
} as const;

/**
 * 路径类型
 */
export type PathName = keyof typeof PATHS;
