/**
 * 语言切换组件
 *
 * 用途：
 * 1. 显示当前语言
 * 2. 切换到其他语言
 */

'use client';

import { LanguagesIcon } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SUPPORTED_LOCALES, LOCALE_CONFIG } from '@/config/i18n';
import type { Locale } from '@/config/i18n';

interface LanguageSwitcherProps {
  triggerClassName?: string;
}

export function LanguageSwitcher({ triggerClassName }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    const currentLocale = locale;
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={triggerClassName ?? 'min-w-28'} size="sm" variant="outline">
          <LanguagesIcon data-icon="inline-start" />
          <span>{LOCALE_CONFIG[locale as Locale].flag}</span>
          <span>{LOCALE_CONFIG[locale as Locale].name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {SUPPORTED_LOCALES.map((loc) => (
          <DropdownMenuItem key={loc} onClick={() => handleLanguageChange(loc)}>
            <span className="flex items-center gap-2">
              <span>{LOCALE_CONFIG[loc].flag}</span>
              <span>{LOCALE_CONFIG[loc].name}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
