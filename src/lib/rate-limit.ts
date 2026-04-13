import { AppError, ErrorCode } from '@/lib/errors';

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var __appRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const rateLimitStore = globalThis.__appRateLimitStore ?? new Map<string, RateLimitEntry>();

if (!globalThis.__appRateLimitStore) {
  globalThis.__appRateLimitStore = rateLimitStore;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-vercel-forwarded-for') ??
    'unknown'
  );
}

function cleanupExpiredEntries(now: number) {
  if (rateLimitStore.size < 500) {
    return;
  }

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function enforceRateLimit(
  request: Request,
  options: {
    config: RateLimitConfig;
    identityKey?: string;
    namespace: string;
  }
) {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const subject = options.identityKey?.trim() || getClientIp(request);
  const bucketKey = `${options.namespace}:${subject}`;
  const existingEntry = rateLimitStore.get(bucketKey);

  if (!existingEntry || existingEntry.resetAt <= now) {
    rateLimitStore.set(bucketKey, {
      count: 1,
      resetAt: now + options.config.windowMs,
    });
    return;
  }

  if (existingEntry.count >= options.config.maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1000));

    throw new AppError(
      ErrorCode.API_RATE_LIMIT,
      'Too many requests. Please try again later.',
      429,
      {
        namespace: options.namespace,
        retryAfterSeconds,
      }
    );
  }

  existingEntry.count += 1;
  rateLimitStore.set(bucketKey, existingEntry);
}
