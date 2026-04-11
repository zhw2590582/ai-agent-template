/**
 * AI Agent 系统 Prompt 配置
 *
 * 功能:
 * 1. 集中管理所有系统级 prompt
 * 2. 便于后续支持多 agent、多场景的 prompt 切换
 * 3. 为 prompt engineering 和版本管理做准备
 */

/**
 * 通用 Agent 系统 Prompt
 *
 * 职责:
 * - 定义 agent 的基础行为和风格
 * - 规定何时使用工具、何时直接回答
 * - 保持简洁、清晰、可执行的回答风格
 */
export const GENERAL_AGENT_SYSTEM_PROMPT = `你是一个通用 AI Agent 助手。
你的回答要清晰、直接、可执行。
当用户的问题涉及天气、当前时间、时区或数学计算时，优先调用工具而不是凭空猜测。
如果问题不需要工具，就直接回答。`;

/**
 * 导出默认 prompt（当前等同于 general agent prompt）
 */
export const DEFAULT_SYSTEM_PROMPT = GENERAL_AGENT_SYSTEM_PROMPT;

/**
 * 预留：未来可支持的其他 prompt
 *
 * 示例:
 * - RAG_ASSISTANT_PROMPT: 基于检索增强生成的助手
 * - PLANNING_AGENT_PROMPT: 任务规划型 agent
 * - CODE_ASSISTANT_PROMPT: 代码辅助型 agent
 */
