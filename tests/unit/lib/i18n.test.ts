/**
 * i18n 工具函数测试
 */

import { describe, it, expect } from 'vitest';
import { t, createTranslator, getMessages, isLocaleSupported } from '@/lib/i18n';

describe('i18n', () => {
  describe('t', () => {
    it('should translate simple key', () => {
      const result = t('zh-CN', 'common.app_name');
      expect(result).toBe('AI Agent 应用');
    });

    it('should translate nested key', () => {
      const result = t('zh-CN', 'chat.status.ready');
      expect(result).toBe('就绪');
    });

    it('should return English translation', () => {
      const result = t('en-US', 'common.app_name');
      expect(result).toBe('AI Agent App');
    });

    it('should return key if translation not found', () => {
      const result = t('zh-CN', 'non.existent.key' as never);
      expect(result).toBe('non.existent.key');
    });

    it('should fallback to default locale if invalid locale', () => {
      const result = t('invalid' as never, 'common.welcome');
      expect(result).toBe('欢迎'); // 默认语言是中文
    });
  });

  describe('createTranslator', () => {
    it('should create translator bound to locale', () => {
      const translator = createTranslator('en-US');
      const result = translator('common.confirm');

      expect(result).toBe('Confirm');
    });

    it('should work with nested keys', () => {
      const translator = createTranslator('zh-CN');
      const result = translator('chat.status.thinking');

      expect(result).toBe('思考中');
    });
  });

  describe('getMessages', () => {
    it('should return full message object for locale', () => {
      const messages = getMessages('zh-CN');

      expect(messages).toHaveProperty('common');
      expect(messages).toHaveProperty('chat');
      expect(messages).toHaveProperty('tools');
      expect(messages).toHaveProperty('errors');
    });

    it('should return default locale messages if invalid', () => {
      const messages = getMessages('invalid' as never);

      expect(messages).toHaveProperty('common');
      expect(messages.common.app_name).toBe('AI Agent 应用');
    });
  });

  describe('isLocaleSupported', () => {
    it('should return true for supported locales', () => {
      expect(isLocaleSupported('zh-CN')).toBe(true);
      expect(isLocaleSupported('en-US')).toBe(true);
    });

    it('should return false for unsupported locales', () => {
      expect(isLocaleSupported('ja-JP')).toBe(false);
      expect(isLocaleSupported('invalid')).toBe(false);
    });
  });
});
