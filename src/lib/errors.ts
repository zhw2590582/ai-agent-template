/**
 * Error handling utilities.
 *
 * Responsibilities:
 * 1. Classify application errors consistently
 * 2. Return user-facing error responses
 * 3. Keep logging and user-facing responses consistent
 */

import { DEFAULT_LOCALE, type Locale } from '@/config/i18n';
import { SERVER_MESSAGES } from '@/config/strings';
import { logger } from './logger';
import { t } from './i18n';

/**
 * Application error codes.
 */
export enum ErrorCode {
  // Configuration
  CONFIG_MISSING = 'CONFIG_MISSING',
  CONFIG_INVALID = 'CONFIG_INVALID',

  // API
  API_KEY_INVALID = 'API_KEY_INVALID',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_TIMEOUT = 'API_TIMEOUT',
  API_NETWORK = 'API_NETWORK',

  // Input
  INPUT_INVALID = 'INPUT_INVALID',
  INPUT_TOO_LONG = 'INPUT_TOO_LONG',

  // Model
  MODEL_ERROR = 'MODEL_ERROR',
  MODEL_OVERLOAD = 'MODEL_OVERLOAD',

  // Tooling
  TOOL_EXECUTION_ERROR = 'TOOL_EXECUTION_ERROR',

  // Unknown
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom application error.
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
   * Convert the error into an HTTP response.
   */
  toResponse(locale: Locale = DEFAULT_LOCALE): Response {
    const fallbackMessage = t(locale, `errors.${this.code.toLowerCase()}` as never);
    const message = this.message || fallbackMessage;
    const headers = new Headers({ 'Content-Type': 'application/json' });

    if (
      this.code === ErrorCode.API_RATE_LIMIT &&
      typeof this.details === 'object' &&
      this.details != null &&
      'retryAfterSeconds' in this.details &&
      typeof this.details.retryAfterSeconds === 'number'
    ) {
      headers.set('Retry-After', String(this.details.retryAfterSeconds));
    }

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
        headers,
      }
    );
  }
}

/**
 * Error handling helpers.
 */
export const handleError = (error: unknown): Response => {
  return handleErrorWithLocale(error, DEFAULT_LOCALE);
};

function isLikelyModelProviderError(error: Error) {
  const normalizedMessage = `${error.name} ${error.message}`.toLowerCase();

  return [
    'anthropic',
    'api key',
    'fetch failed',
    'gemini',
    'google',
    'model',
    'network request',
    'openai',
    'overload',
    'provider',
    'quota',
    'rate limit',
    'timed out',
    'timeout',
  ].some((hint) => normalizedMessage.includes(hint));
}

export const handleErrorWithLocale = (error: unknown, locale: Locale): Response => {
  // Known application errors
  if (error instanceof AppError) {
    logger.error(`[${error.code}] ${error.message}`, { details: error.details });
    return error.toResponse(locale);
  }

  // Likely AI SDK / provider errors
  if (error instanceof Error && isLikelyModelProviderError(error)) {
    logger.error('[API_ERROR] Model request failed', { message: error.message });
    return new AppError(
      ErrorCode.MODEL_ERROR,
      t(locale, 'errors.model_error'),
      500,
      error.message
    ).toResponse(locale);
  }

  // Unknown errors
  logger.error('[UNKNOWN_ERROR] Unexpected error', { error });
  return new AppError(ErrorCode.UNKNOWN, t(locale, 'errors.unknown'), 500).toResponse(locale);
};

/**
 * Fallback user-facing messages.
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.CONFIG_MISSING]: 'Required configuration is missing. Contact the administrator.',
  [ErrorCode.CONFIG_INVALID]: 'Configuration is invalid. Contact the administrator.',
  [ErrorCode.API_KEY_INVALID]: 'The API key is invalid. Check your configuration.',
  [ErrorCode.API_RATE_LIMIT]: SERVER_MESSAGES.TOO_MANY_REQUESTS,
  [ErrorCode.API_TIMEOUT]: 'The request timed out. Please try again.',
  [ErrorCode.API_NETWORK]: 'Network request failed. Check your connection.',
  [ErrorCode.INPUT_INVALID]: 'The input is invalid.',
  [ErrorCode.INPUT_TOO_LONG]: 'The input is too long.',
  [ErrorCode.MODEL_ERROR]: 'The AI model request failed.',
  [ErrorCode.MODEL_OVERLOAD]: 'The AI service is overloaded. Please try again later.',
  [ErrorCode.TOOL_EXECUTION_ERROR]: 'Tool execution failed.',
  [ErrorCode.UNKNOWN]: 'An unknown error occurred. Please try again later.',
};
