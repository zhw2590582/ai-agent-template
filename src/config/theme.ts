export const THEME_STORAGE_KEY = 'theme-preference';
export const THEME_COOKIE_KEY = 'theme-preference';

export type ThemeMode = 'dark' | 'light';

export function resolveThemeMode(value: string | null | undefined): ThemeMode {
  return value === 'light' ? 'light' : 'dark';
}
