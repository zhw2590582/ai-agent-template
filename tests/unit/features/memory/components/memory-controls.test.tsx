/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { MemorySettings } from '@/features/auth/profile/types';
import { MemoryControls } from '@/features/memory/components/memory-controls';

const SETTINGS: MemorySettings = {
  autoWrite: true,
  contextMaxItems: 8,
  crossConversation: true,
  enabled: true,
  recentMessageWindow: 10,
  summaryMinMessages: 8,
};

describe('MemoryControls', () => {
  it('keeps guest controls editable for local-first memory', () => {
    const { container } = render(
      <MemoryControls onSettingsChange={vi.fn()} settings={SETTINGS} t={(key) => key} />
    );

    for (const toggle of screen.getAllByRole('switch')) {
      expect(toggle).not.toBeDisabled();
    }

    expect(container.querySelector('#memory-summary-min-messages')).not.toBeDisabled();
    expect(container.querySelector('#memory-recent-message-window')).not.toBeDisabled();
    expect(container.querySelector('#memory-context-max-items')).not.toBeDisabled();
  });
});
