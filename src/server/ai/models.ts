/**
 * AI 模型配置
 *
 * 功能: 统一管理所有 AI 模型的配置
 *
 * 学习要点:
 * 1. DeepSeek 兼容 OpenAI API 格式
 * 2. 通过 baseURL 配置不同的 API 端点
 * 3. 环境变量管理 API Key
 */

import { createOpenAI } from '@ai-sdk/openai';
import { AI_CONFIG } from '@/config/app';
import type { ModelId } from '@/config/models';
import { env } from '@/config/env';

/**
 * DeepSeek 配置
 *
 * DeepSeek 提供与 OpenAI 兼容的 API
 * 使用标准的 OpenAI Chat Completions 端点
 */
export const deepseek = createOpenAI({
  name: 'deepseek',
  baseURL: 'https://api.deepseek.com/v1', // 必须带 /v1
  apiKey: env.DEEPSEEK_API_KEY,
});

/**
 * OpenAI 配置（备用）
 */
export const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/**
 * 默认模型配置
 *
 * 在测试阶段使用 DeepSeek（成本更低）
 */
export const defaultModel = {
  chat: deepseek.chat(AI_CONFIG.DEFAULT_MODEL),

  // 备选：OpenAI 模型
  // chat: openai.chat('gpt-4-turbo'),
};

/**
 * 可用的模型列表
 */
export const availableModels = {
  // DeepSeek 模型
  'deepseek-chat': deepseek.chat('deepseek-chat'),
  'deepseek-coder': deepseek.chat('deepseek-coder'),

  // OpenAI 模型（需要配置 OPENAI_API_KEY）
  // 'gpt-4-turbo': openai.chat('gpt-4-turbo'),
  // 'gpt-3.5-turbo': openai.chat('gpt-3.5-turbo'),
};

/**
 * 导出类型定义
 */
export type ModelName = keyof typeof availableModels;

export function isModelName(value: string): value is ModelName {
  return value in availableModels;
}

export function getChatModel(modelName?: string) {
  if (modelName && isModelName(modelName)) {
    return availableModels[modelName];
  }
  return availableModels[AI_CONFIG.DEFAULT_MODEL as ModelId];
}
