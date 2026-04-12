import Link from 'next/link';
import type { TFunction } from '@/types/i18n';
import {
  BotIcon,
  BrainIcon,
  FlaskConicalIcon,
  PlugIcon,
  ServerIcon,
  SettingsIcon,
  ShieldEllipsisIcon,
} from 'lucide-react';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { HEADER_NAV_ITEMS, type HeaderNavItemId } from '@/config/navigation';
import { AuthDialog } from '@/features/auth/components/auth-dialog';

const NAV_ICONS = {
  providers: PlugIcon,
  agents: BotIcon,
  sandbox: FlaskConicalIcon,
  mcp: ServerIcon,
  skills: ShieldEllipsisIcon,
  memory: BrainIcon,
} as const;

type WorkbenchView = 'chat' | HeaderNavItemId | 'settings';

interface ChatTopBarProps {
  activeView: WorkbenchView;
  locale: string;
  t: TFunction;
}

export function ChatTopBar({ activeView, locale, t }: ChatTopBarProps) {
  return (
    <div className="border-border h-12 border-b px-4 py-2">
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {HEADER_NAV_ITEMS.map((item) => {
              const Icon = NAV_ICONS[item.id];
              return (
                <Button
                  key={item.id}
                  asChild
                  size="sm"
                  variant={activeView === item.id ? 'secondary' : 'ghost'}
                >
                  <Link href={`/${locale}/${item.id}`}>
                    <Icon data-icon="inline-start" />
                    {t(item.translationKey)}
                  </Link>
                </Button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher triggerClassName="w-10" />
            <ThemeToggle />
            <Button asChild size="icon" type="button" variant="outline">
              <Link aria-label={t('navigation.settings')} href={`/${locale}/settings`}>
                <SettingsIcon />
              </Link>
            </Button>
            <AuthDialog
              closeLabel={t('common.cancel')}
              configurationMissingDescription={t('auth.configuration_missing_description')}
              configurationMissingTitle={t('auth.configuration_missing_title')}
              description={t('auth.dialog_description')}
              githubLabel={t('auth.sign_in_with_github')}
              googleLabel={t('auth.sign_in_with_google')}
              signInLabel={t('auth.sign_in')}
              signInFailedLabel={t('auth.errors.sign_in_failed')}
              signOutLabel={t('auth.sign_out')}
              signOutFailedLabel={t('auth.errors.sign_out_failed')}
              signOutSuccessLabel={t('auth.toast.sign_out_success')}
              signedInAsLabel={t('auth.signed_in_as')}
              title={t('auth.title')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
