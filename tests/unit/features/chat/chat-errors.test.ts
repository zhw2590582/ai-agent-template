import { describe, expect, it } from 'vitest';

import {
  CHAT_RATE_LIMIT_ERROR_CODE,
  ChatRequestError,
  getChatDisplayErrorMessage,
  isChatRateLimitError,
} from '@/features/chat/utils/chat-errors';

describe('chat-errors', () => {
  it('detects rate limit errors by code', () => {
    const error = new ChatRequestError(CHAT_RATE_LIMIT_ERROR_CODE, 'Too many requests');

    expect(isChatRateLimitError(error)).toBe(true);
  });

  it('prefers provider details for model errors', () => {
    const error = new ChatRequestError(
      'MODEL_ERROR',
      'AI model service error',
      'Tavily search request failed: fetch failed'
    );

    expect(getChatDisplayErrorMessage(error, 'fallback')).toBe(
      'Tavily search request failed: fetch failed'
    );
  });

  it('falls back to the API message for non-model app errors', () => {
    const error = new ChatRequestError(
      'INPUT_INVALID',
      'The selected model does not support text chat.'
    );

    expect(getChatDisplayErrorMessage(error, 'fallback')).toBe(
      'The selected model does not support text chat.'
    );
  });

  it('falls back to generic error message when no structured error is available', () => {
    expect(getChatDisplayErrorMessage(new Error('fetch failed'), 'fallback')).toBe('fetch failed');
  });
});
