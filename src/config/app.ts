/**
 * 应用配置
 *
 * 用途：集中管理所有应用级配置常量
 * 避免配置散落在各个文件中
 */

/**
 * AI 相关配置
 */
export const AI_CONFIG = {
  // 默认模型设置
  DEFAULT_MODEL: 'deepseek-chat',
  DEFAULT_MAX_TOKENS: 800,
  DEFAULT_TEMPERATURE: 0.7,

  // 流式响应配置
  STREAM_TIMEOUT: 30000, // 30秒

  // Token 限制（未来用于成本控制）
  MAX_CONTEXT_TOKENS: 4000,
  MAX_OUTPUT_TOKENS: 2000,
} as const;

/**
 * 聊天相关配置
 */
export const CHAT_CONFIG = {
  // 消息历史保留数量（未来 Memory 功能用）
  MAX_HISTORY_MESSAGES: 50,

  // UI 配置
  TYPING_INDICATOR_DELAY: 100,
  MESSAGE_ANIMATION_DURATION: 200,

  // 输入限制
  MAX_INPUT_LENGTH: 4000,
} as const;

/**
 * 特性开关（Feature Flags）
 *
 * 用于灰度发布和 A/B 测试
 */
export const FEATURES = {
  // 当前已实现
  TOOL_CALLING: true,
  STREAMING: true,

  // 未来功能（暂时关闭）
  MEMORY: false,
  RAG: false,
  PLANNING: false,
  MULTI_AGENT: false,

  // i18n 支持（Phase 2-3 后启用）
  I18N: false,

  // 实验性功能
  VOICE_INPUT: false,
  IMAGE_UPLOAD: false,
} as const;

/**
 * API 配置
 */
export const API_CONFIG = {
  // 超时设置
  REQUEST_TIMEOUT: 30000,
  CHAT_TIMEOUT: 60000,

  // 重试配置
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  // 速率限制（Phase 10 Production 需要）
  RATE_LIMIT_WINDOW: 60000, // 1分钟
  RATE_LIMIT_MAX_REQUESTS: 20,
} as const;

/**
 * 开发环境配置
 */
export const DEV_CONFIG = {
  // 是否启用调试日志
  ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development',

  // 是否显示性能指标
  SHOW_PERFORMANCE_METRICS: process.env.NODE_ENV === 'development',
} as const;
