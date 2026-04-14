import { MODEL_SYNC_CONFIG } from '@/config/models';
import { AppError, ErrorCode } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { ModelApiFormat, ProviderProbeResult } from '@/features/models/types';
import { normalizeProviderBaseUrl } from '@/features/models/utils/profile';

interface ProbeProviderOptions {
  apiFormat: ModelApiFormat;
  apiKey: string;
  baseUrl: string;
}

function getProbeUrl(apiFormat: ModelApiFormat, baseUrl: string) {
  const normalizedBaseUrl = normalizeProviderBaseUrl(apiFormat, baseUrl);

  if (!normalizedBaseUrl) {
    throw new AppError(ErrorCode.INPUT_INVALID, 'Base URL is required.', 400);
  }

  if (apiFormat === 'anthropic') {
    return normalizedBaseUrl.endsWith('/v1')
      ? `${normalizedBaseUrl}/models`
      : `${normalizedBaseUrl}/v1/models`;
  }

  return `${normalizedBaseUrl}/models`;
}

function getProbeHeaders(apiFormat: ModelApiFormat, apiKey: string): Record<string, string> {
  const normalizedApiKey = apiKey.trim();

  if (!normalizedApiKey) {
    throw new AppError(ErrorCode.INPUT_INVALID, 'API key is required.', 400);
  }

  if (apiFormat === 'anthropic') {
    return {
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'x-api-key': normalizedApiKey,
    };
  }

  return {
    authorization: `Bearer ${normalizedApiKey}`,
    'content-type': 'application/json',
  };
}

function normalizeModelName(id: string) {
  return id
    .split(/[/:_-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function isChatCapableModelId(id: string) {
  const normalizedId = id.trim().toLowerCase();

  return !MODEL_SYNC_CONFIG.EXCLUDED_MODEL_ID_SEGMENTS.some((segment) =>
    normalizedId.includes(segment)
  );
}

function parseModelsPayload(payload: unknown) {
  if (
    typeof payload !== 'object' ||
    payload == null ||
    !('data' in payload) ||
    !Array.isArray(payload.data)
  ) {
    return [];
  }

  return payload.data
    .map((item) => {
      if (typeof item !== 'object' || item == null || typeof item.id !== 'string') {
        return null;
      }

      const displayName =
        typeof item.display_name === 'string'
          ? item.display_name
          : typeof item.name === 'string'
            ? item.name
            : normalizeModelName(item.id);

      return {
        id: item.id,
        name: displayName,
      };
    })
    .filter((item): item is { id: string; name: string } => item != null);
}

export async function probeProviderModels({
  apiFormat,
  apiKey,
  baseUrl,
}: ProbeProviderOptions): Promise<ProviderProbeResult> {
  const startedAt = Date.now();
  const probeUrl = getProbeUrl(apiFormat, baseUrl);
  const response = await fetch(probeUrl, {
    headers: getProbeHeaders(apiFormat, apiKey),
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new AppError(
      response.status === 401 || response.status === 403
        ? ErrorCode.API_KEY_INVALID
        : ErrorCode.API_NETWORK,
      `Provider request failed with status ${response.status}.`,
      response.status
    );
  }

  const payload = (await response.json()) as unknown;
  const rawModels = parseModelsPayload(payload);
  const models = rawModels.filter((model) => isChatCapableModelId(model.id));
  const latencyMs = Date.now() - startedAt;

  logger.info('Provider models probed', {
    apiFormat,
    filteredModelCount: models.length,
    latencyMs,
    modelCount: rawModels.length,
    modelsPreview: models.slice(0, 10),
    probeUrl,
    responseStatus: response.status,
  });

  return {
    latencyMs,
    models,
  };
}
