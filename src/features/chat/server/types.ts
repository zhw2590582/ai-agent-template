/**
 * 服务端共享类型定义
 *
 * 功能:
 * 1. 为聊天服务端共享能力提供基础类型
 * 2. 保持类型定义与业务逻辑的清晰边界
 * 3. 便于后续扩展和重构
 */

/**
 * 消息角色
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/**
 * 基础消息类型
 *
 * 当前与 AI SDK 的 UIMessage 对齐，未来可在此基础上扩展
 */
export interface BaseMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt?: Date;
}

/**
 * 会话元数据
 *
 * 为 memory 功能预留的会话信息结构
 */
export interface ConversationMetadata {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount?: number;
}

/**
 * 工具调用结果
 *
 * 用于统一工具执行后的返回格式
 */
export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 检索文档片段（为 RAG 预留）
 *
 * 当接入向量检索时，该类型用于描述检索到的文档片段
 */
export interface DocumentChunk {
  id: string;
  content: string;
  source?: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Agent 配置
 *
 * 用于描述单个 agent 的配置信息，为后续扩展预留
 */
export interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  tools?: string[];
  modelName?: string;
}

/**
 * Agent 执行上下文
 *
 * 在 agent 执行时携带的上下文信息
 */
export interface AgentContext {
  conversationId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 导出类型工具函数
 */
export type ExtractToolResult<T> = T extends ToolResult<infer U> ? U : never;
