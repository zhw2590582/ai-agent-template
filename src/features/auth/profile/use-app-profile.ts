'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { useTheme } from '@/features/chat/components/preferences/theme-provider';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import { createProfileActions } from '@/features/auth/profile/profile-actions';
import { createPersistProfile } from '@/features/auth/profile/profile-persistence';
import {
  getOrderedProviders,
  normalizeProfileSettings,
} from '@/features/auth/profile/profile-settings';
import type { AppProfile } from '@/features/auth/profile/types';
import { useProfileSource } from '@/features/auth/profile/use-profile-source';

export function useAppProfile(user: AuthUserSnapshot | null) {
  const t = useTranslations();
  const locale = useLocale();
  const { theme } = useTheme();
  const { isLoading, profile, setProfile } = useProfileSource({
    locale,
    t,
    theme,
    user,
  });
  const profileRef = useRef(profile);
  const saveInFlightRef = useRef<Promise<boolean> | null>(null);
  const queuedSaveRef = useRef<{
    nextProfile: AppProfile;
    options?: { silent?: boolean };
  } | null>(null);
  const persistProfileRef = useRef<
    (nextProfile: AppProfile, options?: { silent?: boolean }) => Promise<boolean>
  >(async () => false);
  const actionsRef = useRef<ReturnType<typeof createProfileActions> | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const orderedProviders = useMemo(() => getOrderedProviders(profile.settings), [profile.settings]);

  const selectedProvider = useMemo(
    () =>
      profile.settings.models.providers[profile.settings.models.selectedProviderId] ??
      orderedProviders[0],
    [
      orderedProviders,
      profile.settings.models.providers,
      profile.settings.models.selectedProviderId,
    ]
  );

  const buildNextProfile = useMemo(
    () => (current: AppProfile, nextModels: AppProfile['settings']['models']) => ({
      ...current,
      locale,
      settings: normalizeProfileSettings({
        memory: current.settings.memory,
        mcp: current.settings.mcp,
        models: nextModels,
        rag: current.settings.rag,
        sandbox: current.settings.sandbox,
        search: current.settings.search,
        skills: current.settings.skills,
        subagent: current.settings.subagent,
      }),
      theme,
      updated_at: new Date().toISOString(),
    }),
    [locale, theme]
  );

  useEffect(() => {
    persistProfileRef.current = createPersistProfile({
      locale,
      queuedSaveRef,
      saveInFlightRef,
      setProfile,
      t,
      theme,
      user,
    });
  }, [locale, setProfile, t, theme, user]);

  const persistProfile = useCallback(
    (nextProfile: AppProfile, options?: { silent?: boolean }) =>
      persistProfileRef.current(nextProfile, options),
    []
  );

  useEffect(() => {
    actionsRef.current = createProfileActions({
      buildNextProfile,
      persistProfile,
      profileRef,
      setProfile,
    });
  }, [buildNextProfile, persistProfile, setProfile]);

  const addCustomProvider = useCallback((name: string) => {
    const actions = actionsRef.current;
    return actions ? actions.addCustomProvider(name) : Promise.resolve(null);
  }, []);

  const removeCustomProvider = useCallback((providerId: string) => {
    const actions = actionsRef.current;
    return actions ? actions.removeCustomProvider(providerId) : Promise.resolve(false);
  }, []);

  const saveProfile = useCallback(
    (
      updater?: (models: AppProfile['settings']['models']) => AppProfile['settings']['models'],
      options?: { silent?: boolean }
    ) => {
      const actions = actionsRef.current;
      return actions ? actions.saveProfile(updater, options) : Promise.resolve(false);
    },
    []
  );

  const saveProviderEnabled = useCallback((providerId: string, enabled: boolean) => {
    const actions = actionsRef.current;
    return actions ? actions.saveProviderEnabled(providerId, enabled) : Promise.resolve(false);
  }, []);

  const updateProvider = useCallback(
    (
      providerId: string,
      updater: (
        provider: AppProfile['settings']['models']['providers'][string]
      ) => AppProfile['settings']['models']['providers'][string]
    ) => {
      actionsRef.current?.updateProvider(providerId, updater);
    },
    []
  );

  const updateSelectedChatModelId = useCallback(
    (selectedChatModelId: string | null, options?: { persist?: boolean; silent?: boolean }) => {
      const actions = actionsRef.current;
      return actions
        ? actions.updateSelectedChatModelId(selectedChatModelId, options)
        : Promise.resolve(false);
    },
    []
  );

  const updateSelectedProviderId = useCallback((providerId: string) => {
    actionsRef.current?.updateSelectedProviderId(providerId);
  }, []);

  const updateSettingsSection = useCallback(
    async <K extends Exclude<keyof AppProfile['settings'], 'models'>>(
      section: K,
      updater: (value: AppProfile['settings'][K]) => AppProfile['settings'][K],
      options?: { silent?: boolean }
    ) => {
      const current = profileRef.current;
      const nextProfile = {
        ...current,
        locale,
        settings: normalizeProfileSettings({
          ...current.settings,
          [section]: updater(current.settings[section]),
        }),
        theme,
        updated_at: new Date().toISOString(),
      };

      profileRef.current = nextProfile;
      setProfile(nextProfile);

      return persistProfile(nextProfile, { silent: options?.silent });
    },
    [locale, persistProfile, setProfile, theme]
  );

  const updateMemorySettings = useCallback(
    (
      updater: (memory: AppProfile['settings']['memory']) => AppProfile['settings']['memory'],
      options?: { silent?: boolean }
    ) => updateSettingsSection('memory', updater, options),
    [updateSettingsSection]
  );

  const updateSearchSettings = useCallback(
    (
      updater: (search: AppProfile['settings']['search']) => AppProfile['settings']['search'],
      options?: { silent?: boolean }
    ) => updateSettingsSection('search', updater, options),
    [updateSettingsSection]
  );

  const updateMcpSettings = useCallback(
    (
      updater: (mcp: AppProfile['settings']['mcp']) => AppProfile['settings']['mcp'],
      options?: { silent?: boolean }
    ) => updateSettingsSection('mcp', updater, options),
    [updateSettingsSection]
  );

  const updateSandboxSettings = useCallback(
    (
      updater: (sandbox: AppProfile['settings']['sandbox']) => AppProfile['settings']['sandbox'],
      options?: { silent?: boolean }
    ) => updateSettingsSection('sandbox', updater, options),
    [updateSettingsSection]
  );

  const updateRagSettings = useCallback(
    (
      updater: (rag: AppProfile['settings']['rag']) => AppProfile['settings']['rag'],
      options?: { silent?: boolean }
    ) => updateSettingsSection('rag', updater, options),
    [updateSettingsSection]
  );

  const updateSkillsSettings = useCallback(
    (
      updater: (skills: AppProfile['settings']['skills']) => AppProfile['settings']['skills'],
      options?: { silent?: boolean }
    ) => updateSettingsSection('skills', updater, options),
    [updateSettingsSection]
  );

  const updateSubagentSettings = useCallback(
    (
      updater: (subagent: AppProfile['settings']['subagent']) => AppProfile['settings']['subagent'],
      options?: { silent?: boolean }
    ) => updateSettingsSection('subagent', updater, options),
    [updateSettingsSection]
  );

  return {
    addCustomProvider,
    isLoading,
    profile,
    providers: orderedProviders,
    removeCustomProvider,
    saveProfile,
    saveProviderEnabled,
    selectedProvider,
    updateMcpSettings,
    updateMemorySettings,
    updateProvider,
    updateRagSettings,
    updateSearchSettings,
    updateSelectedChatModelId,
    updateSelectedProviderId,
    updateSandboxSettings,
    updateSkillsSettings,
    updateSubagentSettings,
  };
}
