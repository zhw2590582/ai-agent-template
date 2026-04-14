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

  const currentLocale = locale as Locale;
  const currentShortLabel = currentLocale.split('-')[1] ?? currentLocale.toUpperCase();

  const handleLanguageChange = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={triggerClassName ?? 'min-w-10'} size="sm" variant="outline">
          <span className="text-xs font-semibold">{currentShortLabel}</span>
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
