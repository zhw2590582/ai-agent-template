import { handleSkillResolveGet } from '@/features/skills/server/resolve-route';

export async function GET(request: Request) {
  return handleSkillResolveGet(request);
}
