/**
 * i18n 配置
 *
 * 用途：
 * 1. 定义支持的语言
 * 2. 配置默认语言
 * 3. 为将来集成 next-intl 做准备
 */

/**
 * 支持的语言列表
 */
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;

/**
 * 语言类型
 */
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * 默认语言
 */
export const DEFAULT_LOCALE: Locale = 'zh-CN';

/**
 * 语言配置
 */
export const LOCALE_CONFIG: Record<Locale, { name: string; flag: string }> = {
  'zh-CN': {
    name: '简体中文',
    flag: '🇨🇳',
  },
  'en-US': {
    name: 'English',
    flag: '🇺🇸',
  },
};

/**
 * i18n 特性开关
 *
 * 当前阶段保持关闭，待 Phase 2-3 完成后再启用
 */
export const I18N_ENABLED = false;

/**
 * 语言检测策略
 *
 * 未来可以根据以下优先级检测语言：
 * 1. URL 参数 (?lang=en-US)
 * 2. Cookie (preferred-locale)
 * 3. Accept-Language header
 * 4. 默认语言
 */
export const LOCALE_DETECTION_STRATEGY = {
  urlParam: 'lang',
  cookieName: 'preferred-locale',
  useAcceptLanguage: true,
  fallback: DEFAULT_LOCALE,
} as const;
