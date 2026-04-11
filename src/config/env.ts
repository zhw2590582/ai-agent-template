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

  // AI 模型配置
  DEEPSEEK_API_KEY: z.string().min(1, 'DEEPSEEK_API_KEY is required'),
  OPENAI_API_KEY: z.string().optional(),

  // 应用配置（可选，有默认值）
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // 未来扩展预留（Phase 2+）
  // DATABASE_URL: z.string().url().optional(),
  // REDIS_URL: z.string().url().optional(),
  // UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  // UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
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
 * const apiKey = env.DEEPSEEK_API_KEY; // 类型安全
 * ```
 */
export const env = parseEnv();

/**
 * 环境变量类型（供其他模块使用）
 */
export type Env = z.infer<typeof envSchema>;
