/**
 * 环境变量配置和验证
 *
 * 用途：
 * 1. 在应用启动时验证所有必需的环境变量
 * 2. 提供类型安全的环境变量访问
 * 3. 避免运行时才发现配置错误
 */

import { z } from 'zod';

/**
 * 环境变量 Schema
 *
 * 根据不同环境和功能模块定义验证规则
 */
const envSchema = z.object({
  // Node 环境
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // 应用配置（可选，有默认值）
  NEXT_PUBLIC_APP_URL: z.url().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Upstash
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // Sentry
  SENTRY_ORG: z.string().min(1).optional(),
  SENTRY_PROJECT: z.string().min(1).optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
});

/**
 * 解析和验证环境变量
 */
const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ 环境变量验证失败：');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
};

/**
 * 导出验证后的环境变量
 *
 * 使用方式：
 * ```ts
 * import { env } from '@/config/env';
 * const appUrl = env.NEXT_PUBLIC_APP_URL; // 类型安全
 * ```
 */
export const env = parseEnv();

export function isSupabaseConfigured() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function getSupabaseEnv() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      'Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  return {
    url,
    publishableKey,
  };
}

export function hasSupabaseAdminEnv() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdminEnv() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase admin environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return {
    serviceRoleKey,
    url,
  };
}

export function isSentryConfigured() {
  return Boolean(env.NEXT_PUBLIC_SENTRY_DSN);
}

export function getSentryEnv() {
  const dsn = env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    throw new Error('Sentry DSN is missing. Please set NEXT_PUBLIC_SENTRY_DSN.');
  }

  return {
    authToken: env.SENTRY_AUTH_TOKEN,
    dsn,
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,
  };
}

/**
 * 环境变量类型（供其他模块使用）
 */
export type Env = z.infer<typeof envSchema>;
