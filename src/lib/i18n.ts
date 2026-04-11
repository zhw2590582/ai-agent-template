/**
 * i18n 工具函数
 *
 * 用途：
 * 1. 提供类型安全的翻译函数
 * 2. 支持嵌套键访问
 * 3. 为将来集成 next-intl 提供兼容层
 */

import type { Locale } from '@/config/i18n';
import { DEFAULT_LOCALE } from '@/config/i18n';
import { zhCN } from '@/locales/zh-CN';
import { enUS } from '@/locales/en-US';
import type { Translations } from '@/locales/zh-CN';

/**
 * 语言包映射
 */
const translations: Record<Locale, Translations> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

/**
 * 翻译键类型
 */
type NestedTranslationKey<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedTranslationKey<T[K]>}` | K
          : K
        : never;
    }[keyof T]
  : never;

type AllTranslationKeys = NestedTranslationKey<Translations>;

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return (
    (path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object') {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj as unknown) as string) || path
  );
}

/**
 * 翻译函数
 *
 * @param locale 语言
 * @param key 翻译键（支持嵌套，如 'chat.status.ready'）
 * @returns 翻译后的文本
 *
 * @example
 * t('zh-CN', 'common.app_name') // => 'AI Agent 应用'
 * t('en-US', 'chat.status.ready') // => 'Ready'
 */
export function t(locale: Locale, key: AllTranslationKeys): string {
  const messages = translations[locale] || translations[DEFAULT_LOCALE];
  return getNestedValue(messages, key);
}

/**
 * 创建带语言的翻译函数
 *
 * @param locale 语言
 * @returns 绑定了语言的翻译函数
 *
 * @example
 * const t = createTranslator('zh-CN');
 * t('common.app_name') // => 'AI Agent 应用'
 */
export function createTranslator(locale: Locale) {
  return (key: AllTranslationKeys) => t(locale, key);
}

/**
 * 获取当前语言包
 *
 * @param locale 语言
 * @returns 完整的语言包
 */
export function getMessages(locale: Locale): Translations {
  return translations[locale] || translations[DEFAULT_LOCALE];
}

/**
 * 检查语言是否支持
 */
export function isLocaleSupported(locale: string): locale is Locale {
  return locale in translations;
}
