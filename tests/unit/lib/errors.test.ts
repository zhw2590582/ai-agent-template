/**
 * 错误处理工具函数测试
 */

import { describe, expect, it } from 'vitest';
import { AppError, ErrorCode, ERROR_MESSAGES, handleErrorWithLocale } from '@/lib/errors';

describe('errors', () => {
  describe('AppError', () => {
    it('should create error with code and message', () => {
      const error = new AppError(ErrorCode.CONFIG_MISSING, 'Test message');

      expect(error.code).toBe(ErrorCode.CONFIG_MISSING);
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('AppError');
      expect(error.statusCode).toBe(500); // default
    });

    it('should include details when provided', () => {
      const details = { key: 'value' };
      const error = new AppError(ErrorCode.API_KEY_INVALID, 'Test', 400, details);

      expect(error.details).toEqual(details);
      expect(error.statusCode).toBe(400);
    });

    it('should be instance of Error', () => {
      const error = new AppError(ErrorCode.UNKNOWN, 'Test');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });

    it('should convert to HTTP Response', () => {
      const error = new AppError(ErrorCode.CONFIG_MISSING, 'Test', 400);
      const response = error.toResponse();

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(400);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have message for every error code', () => {
      const allCodes = Object.values(ErrorCode);

      allCodes.forEach((code) => {
        expect(ERROR_MESSAGES[code]).toBeDefined();
        expect(typeof ERROR_MESSAGES[code]).toBe('string');
      });
    });

    it('should return correct messages', () => {
      expect(ERROR_MESSAGES[ErrorCode.CONFIG_MISSING]).toBe(
        'Required configuration is missing. Contact the administrator.'
      );
      expect(ERROR_MESSAGES[ErrorCode.API_KEY_INVALID]).toBe(
        'The API key is invalid. Check your configuration.'
      );
      expect(ERROR_MESSAGES[ErrorCode.API_NETWORK]).toBe(
        'Network request failed. Check your connection.'
      );
    });
  });

  describe('handleErrorWithLocale', () => {
    it('maps likely provider failures to MODEL_ERROR', async () => {
      const response = handleErrorWithLocale(new Error('OpenAI rate limit exceeded'), 'en-US');
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error.code).toBe(ErrorCode.MODEL_ERROR);
      expect(json.error.details).toBe(
        'Model provider rate limit or quota exceeded. Try again later or check your account limits.'
      );
    });

    it('does not treat generic API wording as a model error', async () => {
      const response = handleErrorWithLocale(new Error('Profile API route failed'), 'en-US');
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error.code).toBe(ErrorCode.UNKNOWN);
    });

    it('normalizes provider network failures into user-facing details', async () => {
      const response = handleErrorWithLocale(new Error('fetch failed'), 'en-US');
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error.code).toBe(ErrorCode.MODEL_ERROR);
      expect(json.error.details).toBe(
        'Network request to the model provider failed. Check the provider base URL and network access.'
      );
    });

    it('normalizes Tavily search failures into clearer details', async () => {
      const response = handleErrorWithLocale(
        new Error('Tavily search request failed: fetch failed'),
        'en-US'
      );
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error.code).toBe(ErrorCode.MODEL_ERROR);
      expect(json.error.details).toBe(
        'Web search request failed. Check Tavily network access and try again.'
      );
    });

    it('normalizes insufficient balance failures into clearer details', async () => {
      const response = handleErrorWithLocale(
        new Error(
          'Failed after 3 attempts. Last error: Your account is suspended due to insufficient balance, please recharge your account or check your plan and billing details'
        ),
        'en-US'
      );
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error.code).toBe(ErrorCode.MODEL_ERROR);
      expect(json.error.details).toBe(
        'Model provider account has insufficient balance or billing is suspended. Recharge the account or check the current plan and billing details.'
      );
    });
  });
});
