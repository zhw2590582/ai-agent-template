/**
 * Next.js Proxy - 处理 i18n 路由
 *
 * 用途：
 * 1. 自动检测用户语言偏好
 * 2. 重定向到对应语言的路由
 * 3. 设置语言 cookie
 *
 * Note: Next.js 16+ 使用 proxy.ts 替代 middleware.ts
 */

import createMiddleware from 'next-intl/middleware';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/config/i18n';

export default createMiddleware({
  // 支持的语言列表
  locales: [...SUPPORTED_LOCALES],

  // 默认语言
  defaultLocale: DEFAULT_LOCALE,

  // 语言检测策略
  localeDetection: true,

  // 不在 URL 中显示默认语言（可选）
  // localePrefix: 'as-needed',
});

export const config = {
  // 匹配所有路径，除了 api, _next, static files
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
