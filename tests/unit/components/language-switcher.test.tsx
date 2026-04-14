import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { LanguageSwitcher } from '@/features/chat/components/preferences/language-switcher';

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
    const html = renderToStaticMarkup(<LanguageSwitcher />);

    expect(html).toContain('CN');
  });

  it('applies the custom trigger class name', () => {
    const html = renderToStaticMarkup(<LanguageSwitcher triggerClassName="w-10" />);

    expect(html).toContain('w-10');
    expect(html).toContain('aria-haspopup="menu"');
  });
});
