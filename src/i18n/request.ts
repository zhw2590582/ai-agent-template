/**
 * next-intl 请求配置
 *
 * 用途：
 * 1. 为 Server Components 提供 i18n 实例
 * 2. 加载对应语言的翻译文件
 */

import { getRequestConfig } from 'next-intl/server';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/config/i18n';
import { DEFAULT_LOCALE } from '@/config/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  // 从请求中获取 locale，fallback 到默认语言
  let locale = await requestLocale;

  // 验证 locale 有效性
  if (!locale || !['zh-CN', 'en-US'].includes(locale)) {
    locale = DEFAULT_LOCALE;
  }

  // 获取对应语言的翻译
  const messages = getMessages(locale as Locale);

  return {
    locale,
    messages,
  };
});
