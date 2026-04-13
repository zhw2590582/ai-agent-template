'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { ThemeMode } from '@/config/app';

type ThemeContextValue = {
  setTheme: (theme: ThemeMode) => void;
  theme: ThemeMode;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  initialTheme: ThemeMode;
};

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  const value = useMemo(
    () => ({
      setTheme,
      theme,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
