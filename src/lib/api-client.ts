type TranslationFn = (key: string) => string;

type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export async function readApiError(response: Response) {
  try {
    const data = (await response.clone().json()) as ApiErrorResponse;
    return {
      code: data.error?.code ?? null,
      message: data.error?.message ?? null,
      retryAfter: response.headers.get('Retry-After'),
    };
  } catch {
    return {
      code: null,
      message: null,
      retryAfter: response.headers.get('Retry-After'),
    };
  }
}

export async function getApiErrorToastMessage(
  response: Response,
  t: TranslationFn,
  fallbackKey: string
) {
  const error = await readApiError(response);

  if (error.code === 'API_RATE_LIMIT') {
    return t('errors.api_rate_limit');
  }

  return t(fallbackKey);
}
