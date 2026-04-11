/**
 * 日志工具
 *
 * 用途：
 * 1. 提供结构化日志
 * 2. 便于后续集成 Sentry / Datadog 等监控工具
 * 3. 开发环境友好的日志输出
 */

import { DEV_CONFIG } from '@/config/app';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * 日志上下文
 */
interface LogContext {
  [key: string]: unknown;
}

/**
 * 基础日志函数
 */
const log = (level: LogLevel, message: string, context?: LogContext) => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...context,
  };

  // 开发环境：彩色输出
  if (DEV_CONFIG.ENABLE_DEBUG_LOGS) {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${message}`, context || '');
  } else {
    // 生产环境：JSON 格式（便于日志收集）
    console.log(JSON.stringify(logData));
  }
};

/**
 * 导出的日志工具
 */
export const logger = {
  debug: (message: string, context?: LogContext) => {
    if (DEV_CONFIG.ENABLE_DEBUG_LOGS) {
      log(LogLevel.DEBUG, message, context);
    }
  },

  info: (message: string, context?: LogContext) => {
    log(LogLevel.INFO, message, context);
  },

  warn: (message: string, context?: LogContext) => {
    log(LogLevel.WARN, message, context);
  },

  error: (message: string, context?: LogContext) => {
    log(LogLevel.ERROR, message, context);
  },

  /**
   * 记录聊天请求
   */
  chatRequest: (messageCount: number, toolsUsed: string[] = []) => {
    logger.info('Chat request received', {
      messageCount,
      toolsUsed,
    });
  },

  /**
   * 记录工具调用
   */
  toolCall: (toolName: string, success: boolean, duration?: number) => {
    logger.info('Tool called', {
      toolName,
      success,
      duration,
    });
  },

  /**
   * 记录模型调用
   */
  modelCall: (model: string, tokens?: number, duration?: number) => {
    logger.info('Model called', {
      model,
      tokens,
      duration,
    });
  },
};
