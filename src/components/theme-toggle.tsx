'use client';

import { useEffect } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useTheme } from '@/components/theme-provider';
import { THEME_COOKIE_KEY, THEME_STORAGE_KEY, type ThemeMode } from '@/config/theme';
import { Button } from '@/components/ui/button';

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  root.style.colorScheme = theme;
}

export function ThemeToggle() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.cookie = `${THEME_COOKIE_KEY}=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <Button
      aria-label={t(theme === 'dark' ? 'theme.switch_to_light' : 'theme.switch_to_dark')}
      onClick={toggleTheme}
      size="icon"
      type="button"
      variant="outline"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
