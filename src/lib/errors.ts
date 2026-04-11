/**
 * 错误处理工具
 *
 * 用途：
 * 1. 统一错误分类和处理
 * 2. 提供清晰的错误信息给用户
 * 3. 便于日志记录和监控
 */

import { logger } from './logger';
import { t } from './i18n';

type Locale = 'zh-CN' | 'en-US';

/**
 * 应用错误类型
 */
export enum ErrorCode {
  // 配置错误
  CONFIG_MISSING = 'CONFIG_MISSING',
  CONFIG_INVALID = 'CONFIG_INVALID',

  // API 错误
  API_KEY_INVALID = 'API_KEY_INVALID',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_TIMEOUT = 'API_TIMEOUT',
  API_NETWORK = 'API_NETWORK',

  // 输入错误
  INPUT_INVALID = 'INPUT_INVALID',
  INPUT_TOO_LONG = 'INPUT_TOO_LONG',

  // 模型错误
  MODEL_ERROR = 'MODEL_ERROR',
  MODEL_OVERLOAD = 'MODEL_OVERLOAD',

  // 工具错误
  TOOL_EXECUTION_ERROR = 'TOOL_EXECUTION_ERROR',

  // 未知错误
  UNKNOWN = 'UNKNOWN',
}

/**
 * 自定义应用错误类
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  /**
   * 转换为 HTTP Response
   */
  toResponse(locale: Locale = 'zh-CN'): Response {
    const fallbackMessage = t(locale, `errors.${this.code.toLowerCase()}` as never);
    const message = this.message || fallbackMessage;

    return new Response(
      JSON.stringify({
        error: {
          code: this.code,
          message,
          details: this.details,
        },
      }),
      {
        status: this.statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * 错误处理辅助函数
 */
export const handleError = (error: unknown): Response => {
  return handleErrorWithLocale(error, 'zh-CN');
};

export const handleErrorWithLocale = (error: unknown, locale: Locale): Response => {
  // 已知的应用错误
  if (error instanceof AppError) {
    logger.error(`[${error.code}] ${error.message}`, { details: error.details });
    return error.toResponse(locale);
  }

  // AI SDK 错误
  if (error instanceof Error && error.message.includes('API')) {
    logger.error('[API_ERROR] 模型请求失败', { message: error.message });
    return new AppError(
      ErrorCode.MODEL_ERROR,
      t(locale, 'errors.model_error'),
      500,
      error.message
    ).toResponse(locale);
  }

  // 未知错误
  logger.error('[UNKNOWN_ERROR] 未知错误', { error });
  return new AppError(ErrorCode.UNKNOWN, t(locale, 'errors.unknown'), 500).toResponse(locale);
};

/**
 * 错误消息映射（用户友好的提示）
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.CONFIG_MISSING]: '系统配置缺失，请联系管理员',
  [ErrorCode.CONFIG_INVALID]: '系统配置无效，请联系管理员',
  [ErrorCode.API_KEY_INVALID]: 'API Key 无效，请检查配置',
  [ErrorCode.API_RATE_LIMIT]: '请求过于频繁，请稍后再试',
  [ErrorCode.API_TIMEOUT]: '请求超时，请重试',
  [ErrorCode.API_NETWORK]: '网络连接失败，请检查网络',
  [ErrorCode.INPUT_INVALID]: '输入内容无效',
  [ErrorCode.INPUT_TOO_LONG]: '输入内容过长',
  [ErrorCode.MODEL_ERROR]: 'AI 模型服务异常',
  [ErrorCode.MODEL_OVERLOAD]: 'AI 服务负载过高，请稍后重试',
  [ErrorCode.TOOL_EXECUTION_ERROR]: '工具执行失败',
  [ErrorCode.UNKNOWN]: '未知错误，请稍后重试',
};
