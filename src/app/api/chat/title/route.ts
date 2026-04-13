import { generateConversationTitle } from '@/features/chat/ai/title';
import { chatTitlePostSchema } from '@/features/chat/server/schemas';
import { handleErrorWithLocale } from '@/lib/errors';
import { validateRequest } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const { input, locale, runtimeModel } = await validateRequest(request, chatTitlePostSchema);
    const title = await generateConversationTitle(input, {
      locale: locale ?? 'zh-CN',
      runtimeModel,
    });

    return Response.json({ title });
  } catch (error) {
    return handleErrorWithLocale(error, 'zh-CN');
  }
}
