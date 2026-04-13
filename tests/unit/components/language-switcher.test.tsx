// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LanguageSwitcher } from '@/components/ui-settings/language-switcher';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/zh-CN/test',
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'zh-CN',
}));

describe('LanguageSwitcher', () => {
  it('renders the current locale trigger', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole('button')).toHaveTextContent('CN');
  });

  it('shows the locale options when opened', async () => {
    render(<LanguageSwitcher />);

    const trigger = screen.getByRole('button');
    trigger.click();

    expect(await screen.findByText('简体中文')).toBeInTheDocument();
    expect(await screen.findByText('English')).toBeInTheDocument();
  });
});
