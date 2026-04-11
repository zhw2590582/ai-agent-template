/**
 * 语言切换组件
 *
 * 用途：
 * 1. 显示当前语言
 * 2. 切换到其他语言
 */

'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_LOCALES, LOCALE_CONFIG } from '@/config/i18n';
import type { Locale } from '@/config/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // 移除当前 locale 前缀并添加新的
    const currentLocale = locale;
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    router.push(newPath);
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-36">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{LOCALE_CONFIG[locale as Locale].flag}</span>
            <span>{LOCALE_CONFIG[locale as Locale].name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LOCALES.map((loc) => (
          <SelectItem key={loc} value={loc}>
            <span className="flex items-center gap-2">
              <span>{LOCALE_CONFIG[loc].flag}</span>
              <span>{LOCALE_CONFIG[loc].name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
