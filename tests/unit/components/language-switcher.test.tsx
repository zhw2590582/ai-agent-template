/**
 * 语言切换组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageSwitcher } from '@/components/language-switcher';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/zh-CN/test',
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'zh-CN',
}));

describe('LanguageSwitcher', () => {
  it('should render language selector', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole('button', { name: /简体中文/i })).toBeInTheDocument();
  });

  it('should display current language', () => {
    render(<LanguageSwitcher />);

    // 当前应该显示中文
    expect(screen.getByText('简体中文')).toBeInTheDocument();
  });

  // Note: 复杂的交互测试在 jsdom 环境下可能不稳定
  // 建议使用 Playwright/Cypress 进行 E2E 测试
});
