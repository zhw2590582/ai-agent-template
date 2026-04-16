import { describe, expect, it } from 'vitest';

import { SUBAGENT_CONFIG } from '@/config/subagent';
import { createSubagentDraft, normalizeSubagentSettings } from '@/features/subagent/settings';

describe('subagent settings', () => {
  it('creates a draft with project defaults', () => {
    const draft = createSubagentDraft();

    expect(draft.id).toMatch(/^subagent-/);
    expect(draft.enabled).toBe(SUBAGENT_CONFIG.DEFAULT_ENABLED);
    expect(draft.maxTokens).toBe(SUBAGENT_CONFIG.DEFAULT_MAX_TOKENS);
    expect(draft.systemPrompt).toBe(SUBAGENT_CONFIG.DEFAULT_SYSTEM_PROMPT);
    expect(draft.temperature).toBe(SUBAGENT_CONFIG.DEFAULT_TEMPERATURE);
    expect(draft.themeColor).toBe(SUBAGENT_CONFIG.DEFAULT_THEME_COLOR);
    expect(draft.toolAccess).toBe(SUBAGENT_CONFIG.DEFAULT_TOOL_ACCESS);
  });

  it('normalizes missing settings to a disabled empty state', () => {
    expect(normalizeSubagentSettings(undefined)).toEqual({
      agents: SUBAGENT_CONFIG.DEFAULT_SUBAGENTS,
      enabled: false,
    });
  });

  it('uses built-in subagents when settings exist but agents are omitted', () => {
    expect(normalizeSubagentSettings({ enabled: false })).toEqual({
      agents: SUBAGENT_CONFIG.DEFAULT_SUBAGENTS,
      enabled: false,
    });
  });

  it('filters unnamed agents and clamps invalid values', () => {
    expect(
      normalizeSubagentSettings({
        agents: [
          {
            maxTokens: 999_999,
            name: '  Reviewer  ',
            systemPrompt: '',
            temperature: 9,
            themeColor: 'invalid',
          },
          {
            name: '   ',
          },
        ],
        enabled: true,
      })
    ).toEqual({
      agents: [
        {
          description: '',
          enabled: true,
          id: 'subagent-1',
          maxTokens: SUBAGENT_CONFIG.MAX_TOKENS,
          name: 'Reviewer',
          systemPrompt: SUBAGENT_CONFIG.DEFAULT_SYSTEM_PROMPT,
          temperature: SUBAGENT_CONFIG.MAX_TEMPERATURE,
          themeColor: SUBAGENT_CONFIG.DEFAULT_THEME_COLOR,
          toolAccess: SUBAGENT_CONFIG.DEFAULT_TOOL_ACCESS,
        },
      ],
      enabled: true,
    });
  });
});
