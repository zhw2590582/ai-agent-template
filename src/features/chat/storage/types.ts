import type { UIMessage } from 'ai';

export type { ProfileRecord } from '@/features/auth/storage/types';

export interface ConversationAnalysis {
  first_user_message: string | null;
  last_message_preview: string | null;
  message_count: number;
  title_generated: boolean;
  updated_from: 'chat-finish' | 'create';
}

export interface ConversationRecord {
  analysis: ConversationAnalysis;
  created_at: string;
  id: string;
  last_message_at: string;
  messages: UIMessage[];
  title: string;
  updated_at: string;
  user_id: string;
}

export interface ConversationSummary {
  id: string;
  lastMessageAt: string;
  preview: string | null;
  title: string;
}
