import { describe, expect, it } from 'vitest';

import { isAllowedSkillTextFile } from '@/features/skills/server/resolve-route';

describe('skill resolve file filtering', () => {
  it('allows common text skill files', () => {
    expect(isAllowedSkillTextFile('skills/demo/SKILL.md')).toBe(true);
    expect(isAllowedSkillTextFile('skills/demo/references/example.ts')).toBe(true);
    expect(isAllowedSkillTextFile('skills/demo/scripts/setup.py')).toBe(true);
    expect(isAllowedSkillTextFile('skills/demo/.env.example')).toBe(true);
    expect(isAllowedSkillTextFile('skills/demo/Dockerfile')).toBe(true);
  });

  it('rejects binary and media files', () => {
    expect(isAllowedSkillTextFile('skills/demo/assets/preview.png')).toBe(false);
    expect(isAllowedSkillTextFile('skills/demo/assets/demo.mp4')).toBe(false);
    expect(isAllowedSkillTextFile('skills/demo/assets/archive.zip')).toBe(false);
    expect(isAllowedSkillTextFile('skills/demo/assets/font.woff2')).toBe(false);
  });
});
