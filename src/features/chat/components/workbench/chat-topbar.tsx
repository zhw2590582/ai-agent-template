import {
  BotIcon,
  BrainIcon,
  DatabaseIcon,
  FlaskConicalIcon,
  GlobeIcon,
  PlugIcon,
  ServerIcon,
  SettingsIcon,
  ShieldEllipsisIcon,
} from 'lucide-react';

import { LanguageSwitcher } from '@/components/ui-settings/language-switcher';
import { ThemeToggle } from '@/components/ui-settings/theme-toggle';
import { Button } from '@/components/ui/button';
import { HEADER_NAV_ITEMS } from '@/config/navigation';
import { AuthDialog } from '@/features/auth/components/auth-dialog';
import type { WorkbenchView } from '@/features/chat/types';

const NAV_ICONS = {
  models: PlugIcon,
  subagent: BotIcon,
  sandbox: FlaskConicalIcon,
  mcp: ServerIcon,
  skills: ShieldEllipsisIcon,
  rag: DatabaseIcon,
  memory: BrainIcon,
  search: GlobeIcon,
} as const;

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

interface ChatTopBarProps {
  activeView: WorkbenchView;
  onOpenView: (view: Exclude<WorkbenchView, 'chat'>) => void;
  t: TranslateFn;
}

export function ChatTopBar({ activeView, onOpenView, t }: ChatTopBarProps) {
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
          <div className="flex items-center gap-2">
            <LanguageSwitcher triggerClassName="w-10" />
            <ThemeToggle />
            <Button
              aria-label={t('navigation.settings')}
              size="icon"
              type="button"
              variant="outline"
              onClick={() => onOpenView('settings')}
            >
              <SettingsIcon />
            </Button>
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
              termsAgreementLabel={t('auth.terms_agreement')}
              termsOfServiceLabel={t('auth.terms_of_service')}
              title={t('auth.title')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
