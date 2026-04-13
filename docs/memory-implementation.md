# Memory Implementation

最后更新：2026-04-13

## 目标

这份文档描述当前项目准备采用的 Memory 管理思路，以及 Memory V1 的实现流程。

重点回答这几个问题：

1. Memory 的 source of truth 是什么
2. 哪些数据算 memory，哪些不算
3. guest 和已登录用户分别怎么处理
4. 会话摘要和长期记忆怎么协作
5. 未来如何扩展到 RAG、外部 memory provider、导入导出

## 核心原则

### 1. Supabase 是唯一 source of truth

当前 Memory 方案不接 Mem0，也不做双主存储。

结论：

- `Supabase` 是唯一 source of truth
- 未来即使接入 `Mem0` 这类 memory provider，也只能作为增强层或可选 adapter
- 不能同时把完整 memory 的 ownership 交给 Supabase 和第三方 provider

### 2. Models 和 Memory 是两层不同配置

- `Models` 管的是 `LLM model source`
- `Memory` 管的是 `LLM context source`

更准确地说：

- `Models` 决定“调用哪个模型”
- `Memory` 决定“给模型注入哪些长期上下文和压缩上下文”

所以 Memory 不是单纯的另一个 prompt 配置页，而是 context pipeline 的上游数据层。

### 3. 先做 provider-agnostic memory

Memory V1 不绑定任何单一模型供应商，也不绑定外部 memory 平台。

当前优先做：

- conversation summary
- long-term user memory
- memory controls

暂不优先做：

- vector memory
- graph memory
- provider-defined memory tools
- external memory backend switching

## Memory 分层

当前我们把 Memory 拆成两层：

### A. Conversation Summary

这是短期记忆 / 会话压缩层。

用途：

- 避免长会话持续膨胀
- 让未来消息生成时不必总是带完整历史
- 为 Memory 页面提供“会话摘要”可视化

当前存储位置：

- `public.conversations.summary`
- `public.conversations.summary_updated_at`

### B. Long-Term Memories

这是长期记忆层。

用途：

- 保存稳定的用户偏好
- 保存稳定事实
- 保存可跨会话复用的默认工作方式

当前存储位置：

- `public.memories`

## 数据结构

### `conversations`

新增字段：

- `summary text`
- `summary_updated_at timestamptz`

角色：

- conversation-level compressed memory
- 只用于当前会话历史压缩

### `memories`

核心字段：

- `id`
- `user_id`
- `conversation_id`
- `kind`
- `content`
- `source`
- `status`
- `metadata`
- `created_at`
- `updated_at`

当前字段语义：

- `kind`
  - `preference`
  - `fact`
  - `profile`
  - `workflow`
  - `manual`
- `source`
  - `auto`
  - `manual`
  - 后续可扩展
- `status`
  - 当前只使用 `active`
  - 后续可扩展 `archived` / `deleted`

### `profiles.settings.memory`

这是配置，不是数据本体。

当前结构：

```ts
memory: {
  enabled: boolean;
  autoWrite: boolean;
  crossConversation: boolean;
}
```

作用：

- 是否启用 memory
- 是否允许自动写入长期记忆
- 是否允许跨会话读回长期记忆

## 当前实现流程

## 1. 聊天请求前：上下文压缩注入

入口：

- `src/features/chat/server/chat.ts`

当前逻辑：

1. 收到 `/api/chat`
2. 如果是已登录用户且有 `conversationId`
   - 从数据库读取该 conversation
   - 优先拿数据库中的 `summary`
3. 如果前端请求体里带了 `conversationSummary`
   - guest 场景可使用这份 summary
4. 如果存在 summary，并且消息超过 recent window
   - 用：
     - `summary`
     - 最近 N 条消息
   - 替代“完整历史消息”

这一步的目标是：

- 把 `Memory` 先作为 conversation compression 能力接起来
- 先解决上下文窗口膨胀问题

## 2. 聊天完成后：更新 conversation summary

已登录用户：

- `src/features/chat/storage/conversations.ts`

流程：

1. `saveConversationMessages(...)`
2. 构建最新 analysis
3. 如有需要生成标题
4. 调用 `generateConversationSummary(...)`
5. 把 summary 写回 `conversations`

guest 用户：

- `src/features/chat/storage/local-conversation-summary.ts`
- `src/features/chat/hooks/use-conversation-records.ts`

流程：

1. 流式回复完成后
2. 对本地线程触发 `/api/chat/summary`
3. 生成 summary
4. 回写到本地 thread store

为什么放在“回复完成后”而不是流式中：

- 避免和消息流写入互相覆盖
- 保证 summary 基于完整一次回复结果

## 3. 聊天完成后：尝试写入长期记忆

入口：

- `src/features/chat/server/chat.ts`
- `src/features/memory/storage/memories.ts`

当前逻辑：

1. 仅对已登录用户生效
2. 读取 `profile.settings.memory`
3. 只有当：
   - `memory.enabled === true`
   - `memory.autoWrite === true`
     才执行长期记忆写入
4. 从最近一段对话抽取少量 durable memories
5. 去重后插入 `memories`

当前抽取策略非常克制：

- 只尝试提取稳定偏好、稳定事实、工作流默认值
- 不记录临时请求
- 不记录一次性任务内容
- 最多提取少量条目

## guest 与已登录用户的分流

### guest

支持：

- 本地会话
- 本地标题
- 本地 summary

不支持：

- 长期 memories
- 跨会话长期记忆
- 账号级 memory 管理

原因：

- guest 没有稳定用户身份
- 长期记忆没有可靠归属
- 先避免过早引入本地长期 memory store

### authenticated user

支持：

- conversations 持久化
- summaries 持久化
- long-term memories 持久化
- Memory 页面查看

## 当前触发阈值

当前 summary 触发逻辑是显式配置，不依赖 provider 返回的模型上下文长度。

配置位置：

- `src/config/app.ts`

当前参数：

- `MEMORY_CONFIG.SUMMARY_MIN_MESSAGES`
- `MEMORY_CONFIG.SUMMARY_RECENT_MESSAGE_WINDOW`

为什么不依赖 provider `/models` 返回的 metadata：

- 现有 provider 返回模型列表时，通常只给：
  - `id`
  - `name`
- 并不稳定返回：
  - `context_window`
  - `max_input_tokens`
  - `max_output_tokens`

所以第一版结论是：

- 压缩阈值由项目自己维护
- 不等待 provider 返回能力元数据

## Memory 页面应该展示什么

Memory 页面不是 provider-first，而是 memory-first。

当前页面分成三块：

1. `Memory Controls`
2. `Saved Memories`
3. `Conversation Summaries`

原因：

- 用户关心的是“记住了什么”和“怎么记”
- 而不是先关心底层 memory backend

## 为什么不把所有 memory 都放进 `profiles.settings`

因为长期记忆需要：

- 独立记录
- 列表查询
- 删除
- 去重
- source tracking
- 后续导入/导出

所以：

- 配置放 `profiles.settings.memory`
- 数据放 `public.memories`

## 当前不做的部分

以下能力明确不属于当前阶段：

- knowledge agent
- graph memory
- vector retrieval
- external memory provider integration
- guest long-term memory
- memory import/export
- model-specific context window tuning

## 未来扩展顺序

### Stage 1

- conversation summary
- long-term memory writing
- Memory page basic visibility

### Stage 2

- memory controls 真实可写
- memory deletion
- cross-conversation memory injection

### Stage 3

- memory import/export
- manual memory editing
- filtering / pinning / tagging

### Stage 4

- vector retrieval
- RAG integration
- external memory provider adapter

## 与未来 RAG 的关系

未来很可能会用 Supabase 的 pgvector / RAG 能力，但不在当前阶段实现。

关系是：

- `Memory`
  更强调长期偏好、历史事实、跨会话个性化
- `RAG`
  更强调外部知识检索

工程上它们后面可能共享一部分基础设施，但当前阶段要先分开实现。

## 与未来 Mem0 的关系

如果未来接入 `Mem0` 这类工具，推荐方式是：

- Supabase 仍是 canonical source of truth
- `Mem0` 作为可选增强层或 adapter
- 不做双主存储

也就是说：

- 我们管理 memory
- provider 帮助增强 memory

而不是：

- provider 拥有 memory
- 我们只是 UI
