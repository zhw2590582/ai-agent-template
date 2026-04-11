'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';

type AuthUserContextValue = {
  setUser: (user: AuthUserSnapshot | null) => void;
  user: AuthUserSnapshot | null;
};

const AuthUserContext = createContext<AuthUserContextValue | null>(null);

type AuthUserProviderProps = {
  children: ReactNode;
  initialUser: AuthUserSnapshot | null;
};

export function AuthUserProvider({ children, initialUser }: AuthUserProviderProps) {
  const [user, setUser] = useState<AuthUserSnapshot | null>(initialUser);

  const value = useMemo(
    () => ({
      setUser,
      user,
    }),
    [user]
  );

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>;
}

export function useAuthUser() {
  const context = useContext(AuthUserContext);

  if (!context) {
    throw new Error('useAuthUser must be used within AuthUserProvider');
  }

  return context;
}
