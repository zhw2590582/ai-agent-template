/**
 * 错误处理工具函数测试
 */

import { describe, it, expect } from 'vitest';
import { AppError, ErrorCode, ERROR_MESSAGES } from '@/lib/errors';

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
      expect(ERROR_MESSAGES[ErrorCode.CONFIG_MISSING]).toBe('系统配置缺失，请联系管理员');
      expect(ERROR_MESSAGES[ErrorCode.API_KEY_INVALID]).toBe('API Key 无效，请检查配置');
      expect(ERROR_MESSAGES[ErrorCode.API_NETWORK]).toBe('网络连接失败，请检查网络');
    });
  });
});
