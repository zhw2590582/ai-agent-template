/**
 * Unified request validation layer.
 *
 * Wraps Zod schemas for use in API routes:
 * - Parses request body against a schema
 * - Returns a typed result on success
 * - Throws AppError(INPUT_INVALID) with structured details on failure
 */

import { z } from 'zod';

import { AppError, ErrorCode } from '@/lib/errors';

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Throws AppError on invalid JSON or schema mismatch.
 */
export async function validateRequest<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new AppError(ErrorCode.INPUT_INVALID, 'Invalid JSON body', 400);
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    throw new AppError(ErrorCode.INPUT_INVALID, 'Request validation failed', 400, details);
  }

  return result.data;
}

/**
 * Validate arbitrary data (not from a request) against a Zod schema.
 */
export function validate<T extends z.ZodTypeAny>(data: unknown, schema: T): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new AppError(
      ErrorCode.INPUT_INVALID,
      result.error.issues[0]?.message ?? 'Validation failed',
      400
    );
  }

  return result.data;
}
