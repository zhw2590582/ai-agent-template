export const CHAT_RATE_LIMIT_ERROR_CODE = 'API_RATE_LIMIT';

export class ChatRequestError extends Error {
  constructor(
    public code: string | null,
    message: string,
    public details?: unknown,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ChatRequestError';
  }
}

export function isChatRateLimitError(error: Error | undefined) {
  return (
    (error instanceof ChatRequestError && error.code === CHAT_RATE_LIMIT_ERROR_CODE) ||
    error?.message === CHAT_RATE_LIMIT_ERROR_CODE
  );
}

function stringifyChatErrorDetails(details: unknown) {
  if (typeof details === 'string' && details.trim() !== '') {
    return details.trim();
  }

  if (typeof details === 'number' || typeof details === 'boolean') {
    return String(details);
  }

  return null;
}

export function getChatDisplayErrorMessage(error: Error | undefined, fallbackMessage: string) {
  if (!error) {
    return fallbackMessage;
  }

  if (error instanceof ChatRequestError) {
    const detailsMessage = stringifyChatErrorDetails(error.details);

    if (error.code === 'MODEL_ERROR' && detailsMessage) {
      return detailsMessage;
    }

    if (error.message.trim() && error.message !== error.code) {
      return error.message;
    }

    if (detailsMessage) {
      return detailsMessage;
    }
  }

  return error.message?.trim() ? error.message : fallbackMessage;
}

export function isChatModelError(error: Error | undefined) {
  return error instanceof ChatRequestError && error.code === 'MODEL_ERROR';
}
