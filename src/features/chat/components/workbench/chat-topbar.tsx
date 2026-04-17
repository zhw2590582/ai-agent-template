import { BotIcon, MenuIcon, PanelLeftIcon } from 'lucide-react';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/app-ui/drawer';
import { LanguageSwitcher } from '@/features/chat/components/preferences/language-switcher';
import { ThemeToggle } from '@/features/chat/components/preferences/theme-toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HEADER_NAV_ITEMS } from '@/config/navigation';
import { AuthDialog } from '@/features/auth/components/auth-dialog';
import type { WorkbenchView } from '@/features/chat/types';
import { getHeaderNavItem } from '@/config/navigation';
import { useState } from 'react';

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

interface ChatTopBarProps {
  activeView: WorkbenchView;
  onOpenSidebarDrawer: () => void;
  onOpenView: (view: Exclude<WorkbenchView, 'chat'>) => void;
  showAuthDialog: boolean;
  t: TranslateFn;
}

function getMobileTitle(activeView: WorkbenchView, t: TranslateFn) {
  if (activeView === 'chat') {
    return t('chat.sidebar.agent_workspace');
  }

  return t(getHeaderNavItem(activeView).translationKey);
}

export function ChatTopBar({
  activeView,
  onOpenSidebarDrawer,
  onOpenView,
  showAuthDialog,
  t,
}: ChatTopBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="border-border bg-muted/50 flex h-14 shrink-0 items-center border-b px-3 sm:px-4">
      <div className="hidden w-full flex-col gap-3 lg:flex lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
          {HEADER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <Button
                className="shrink-0"
                key={item.id}
                size="sm"
                type="button"
                variant={activeView === item.id ? 'secondary' : 'ghost'}
                onClick={() => onOpenView(item.id)}
              >
                <Icon data-icon="inline-start" />
                {t(item.translationKey)}
              </Button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <LanguageSwitcher triggerClassName="w-10" />
          <ThemeToggle />
          {showAuthDialog ? (
            <AuthDialog
              configurationMissingDescription={t('auth.configuration_missing_description')}
              configurationMissingTitle={t('auth.configuration_missing_title')}
              description={t('auth.description')}
              githubLabel={t('auth.sign_in_with_github')}
              googleLabel={t('auth.sign_in_with_google')}
              privacyPolicyLabel={t('auth.privacy_policy')}
              signInFailedLabel={t('auth.errors.sign_in_failed')}
              signInLabel={t('auth.sign_in')}
              signOutFailedLabel={t('auth.errors.sign_out_failed')}
              signOutLabel={t('auth.sign_out')}
              signOutSuccessLabel={t('auth.toast.sign_out_success')}
              signedInAsLabel={t('auth.signed_in_as')}
              supabaseConfigured={showAuthDialog}
              termsAgreementLabel={t('auth.terms_agreement')}
              termsOfServiceLabel={t('auth.terms_of_service')}
              title={t('auth.title')}
            />
          ) : null}
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-3 lg:hidden">
        <Button
          aria-label={t('chat.header.show_sidebar')}
          size="icon"
          type="button"
          variant="outline"
          onClick={onOpenSidebarDrawer}
        >
          <PanelLeftIcon />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-center gap-2">
            <BotIcon className="size-4 shrink-0" />
            <div className="truncate text-sm font-medium">{getMobileTitle(activeView, t)}</div>
          </div>
        </div>
        <Button
          aria-label={t('common.menu')}
          size="icon"
          type="button"
          variant="outline"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <MenuIcon />
        </Button>
      </div>

      <Drawer
        direction="right"
        open={isMobileMenuOpen}
        shouldScaleBackground={false}
        onOpenChange={setIsMobileMenuOpen}
      >
        <DrawerContent
          className="inset-y-0 right-0 h-dvh w-[min(24rem,calc(100vw-0.75rem))] rounded-none border-l px-4 py-4"
          showHandle={false}
        >
          <DrawerHeader className="sr-only">
            <DrawerTitle>{t('chat.sidebar.agent_workspace')}</DrawerTitle>
            <DrawerDescription>{t('common.menu')}</DrawerDescription>
          </DrawerHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {HEADER_NAV_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                  <Button
                    className="justify-start"
                    key={item.id}
                    type="button"
                    variant={activeView === item.id ? 'secondary' : 'ghost'}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenView(item.id);
                    }}
                  >
                    <Icon data-icon="inline-start" />
                    {t(item.translationKey)}
                  </Button>
                );
              })}
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-2">
              <LanguageSwitcher triggerClassName="w-12" />
              <ThemeToggle />
              {showAuthDialog ? (
                <AuthDialog
                  configurationMissingDescription={t('auth.configuration_missing_description')}
                  configurationMissingTitle={t('auth.configuration_missing_title')}
                  description={t('auth.description')}
                  githubLabel={t('auth.sign_in_with_github')}
                  googleLabel={t('auth.sign_in_with_google')}
                  privacyPolicyLabel={t('auth.privacy_policy')}
                  signInFailedLabel={t('auth.errors.sign_in_failed')}
                  signInLabel={t('auth.sign_in')}
                  signOutFailedLabel={t('auth.errors.sign_out_failed')}
                  signOutLabel={t('auth.sign_out')}
                  signOutSuccessLabel={t('auth.toast.sign_out_success')}
                  signedInAsLabel={t('auth.signed_in_as')}
                  supabaseConfigured={showAuthDialog}
                  termsAgreementLabel={t('auth.terms_agreement')}
                  termsOfServiceLabel={t('auth.terms_of_service')}
                  title={t('auth.title')}
                />
              ) : null}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
