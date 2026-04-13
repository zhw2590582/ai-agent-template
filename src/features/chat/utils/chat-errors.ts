export const CHAT_RATE_LIMIT_ERROR_CODE = 'API_RATE_LIMIT';

export function isChatRateLimitError(error: Error | undefined) {
  return error?.message === CHAT_RATE_LIMIT_ERROR_CODE;
}
