import { handleSkillSearchGet } from '@/features/skills/server/search-route';

export async function GET(request: Request) {
  return handleSkillSearchGet(request);
}
