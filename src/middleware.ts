/**
 * Next.js Middleware - 处理 i18n 路由
 *
 * Cloudflare OpenNext 当前不支持 Next.js 16 的 Node.js proxy runtime，
 * 这里继续使用 Edge-compatible middleware.ts 以保持部署兼容性。
 */

import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/config/i18n';
import { updateSession } from '@/lib/supabase/proxy';

const handleI18nRouting = createMiddleware({
  // 支持的语言列表
  locales: [...SUPPORTED_LOCALES],

  // 默认语言
  defaultLocale: DEFAULT_LOCALE,

  // 语言检测策略
  localeDetection: true,

  // 不在 URL 中显示默认语言（可选）
  // localePrefix: 'as-needed',
});

export async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);

  return updateSession(request, response);
}

export const config = {
  // 匹配所有路径，除了 api, _next, static files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
