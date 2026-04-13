/**
 * Zod schemas for all API request bodies.
 *
 * Centralised here so route handlers and tests can import the same shapes.
 * Message schemas are intentionally loose (passthrough) because the AI SDK
 * defines its own rich UIMessage type — we validate structure, not every field.
 */

import { z } from 'zod';

/**
 * A single message part. We only enforce it is a non-empty object with a `type` field.
 */
const messagePartSchema = z.object({ type: z.string() }).passthrough();

/**
 * A single chat message — role + parts, with passthrough for extra AI SDK fields.
 */
const messageSchema = z
  .object({
    id: z.string().optional(),
    role: z.enum(['user', 'assistant', 'system']),
    parts: z.array(messagePartSchema).min(1),
  })
  .passthrough();

/* ---------- Chat ---------- */

export const chatPostSchema = z.object({
  conversationId: z.string().min(1).optional(),
  messages: z.array(messageSchema).min(1),
  runtimeModel: z
    .object({
      apiFormat: z.enum(['anthropic', 'openai']),
      apiKey: z.string().min(1),
      baseUrl: z.string().min(1),
      modelId: z.string().min(1),
      providerId: z.string().min(1),
    })
    .optional(),
});

export type ChatPostInput = z.infer<typeof chatPostSchema>;

export const chatTitlePostSchema = z.object({
  input: z.string().min(1),
  locale: z.enum(['zh-CN', 'en-US']).optional(),
  runtimeModel: z.object({
    apiFormat: z.enum(['anthropic', 'openai']),
    apiKey: z.string().min(1),
    baseUrl: z.string().min(1),
    modelId: z.string().min(1),
    providerId: z.string().min(1),
  }),
});

export type ChatTitlePostInput = z.infer<typeof chatTitlePostSchema>;

/* ---------- Conversations ---------- */

export const createConversationSchema = z.object({
  initialMessage: z
    .string()
    .min(1, 'Initial message is required')
    .max(10000, 'Initial message is too long')
    .transform((v) => v.trim()),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const patchConversationSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  messages: z.array(messageSchema).min(1, 'Messages are required'),
});

export type PatchConversationInput = z.infer<typeof patchConversationSchema>;
