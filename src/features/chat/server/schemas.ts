/**
 * Zod schemas for all API request bodies.
 *
 * Centralised here so route handlers and tests can import the same shapes.
 * Message schemas are intentionally loose (passthrough) because the AI SDK
 * defines its own rich UIMessage type — we validate structure, not every field.
 */

import { z } from 'zod';
import { TEXT_LIMITS } from '@/config/limits';
import { SUPPORTED_LOCALES } from '@/config/i18n';

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
  conversationSummary: z.string().trim().min(1).optional(),
  messages: z.array(messageSchema).min(1),
  searchSettings: z
    .object({
      enabled: z.boolean(),
      maxResults: z.number().int(),
      searchDepth: z.enum(['advanced', 'basic']),
      tavilyApiKey: z.string(),
      topic: z.enum(['finance', 'general', 'news']),
    })
    .optional(),
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
  locale: z.enum(SUPPORTED_LOCALES).optional(),
  runtimeModel: z.object({
    apiFormat: z.enum(['anthropic', 'openai']),
    apiKey: z.string().min(1),
    baseUrl: z.string().min(1),
    modelId: z.string().min(1),
    providerId: z.string().min(1),
  }),
});

export type ChatTitlePostInput = z.infer<typeof chatTitlePostSchema>;

export const chatSummaryPostSchema = z.object({
  existingSummary: z.string().trim().min(1).optional(),
  locale: z.enum(SUPPORTED_LOCALES).optional(),
  messages: z.array(messageSchema).min(1),
  runtimeModel: z.object({
    apiFormat: z.enum(['anthropic', 'openai']),
    apiKey: z.string().min(1),
    baseUrl: z.string().min(1),
    modelId: z.string().min(1),
    providerId: z.string().min(1),
  }),
});

export type ChatSummaryPostInput = z.infer<typeof chatSummaryPostSchema>;

/* ---------- Conversations ---------- */

export const createConversationSchema = z.object({
  initialMessage: z
    .string()
    .min(1, 'Initial message is required')
    .max(TEXT_LIMITS.INITIAL_MESSAGE, 'Initial message is too long')
    .transform((v) => v.trim()),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const patchConversationSchema = z
  .object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
    messages: z.array(messageSchema).min(1, 'Messages are required').optional(),
    summary: z
      .string()
      .trim()
      .max(TEXT_LIMITS.CONVERSATION_SUMMARY, 'Summary is too long')
      .nullable()
      .optional(),
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(TEXT_LIMITS.CONVERSATION_TITLE, 'Title is too long')
      .optional(),
  })
  .refine((value) => value.messages || value.title || value.summary !== undefined, {
    message: 'Either messages, title, or summary is required',
    path: ['messages'],
  });

export type PatchConversationInput = z.infer<typeof patchConversationSchema>;

export const deleteConversationSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
});

export type DeleteConversationInput = z.infer<typeof deleteConversationSchema>;
