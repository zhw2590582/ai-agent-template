import type { UIMessage } from 'ai';

export interface ProfileRecord {
  avatar_url: string | null;
  created_at: string;
  display_name: string | null;
  email: string | null;
  id: string;
  locale: string | null;
  memory_summary: string | null;
  settings: Record<string, unknown>;
  theme: string | null;
  updated_at: string;
}

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
