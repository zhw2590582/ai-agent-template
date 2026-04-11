# Roadmap

这份路线图不是“教学步骤清单”，而是未来功能接入的推荐顺序。

## Phase 1: Solidify Chat Core

目标：把当前聊天骨架稳定下来。

建议动作：

1. 拆分 `server/ai/tools.ts`
2. 抽离 `server/ai/prompts.ts`
3. 引入消息与工具结果的共享类型
4. 明确错误处理和空状态策略

完成后你会得到：

- 更稳定的 chat handler
- 更清晰的工具注册方式
- 后续接 memory / rag 时更少重构

## Phase 2: Memory

目标：支持短期记忆与历史会话。

推荐接入点：

- `features/chat`: 左侧会话列表、会话切换
- `server/storage`: 历史消息读写
- `server/ai/memory`: memory 组装逻辑

建议先做：

1. 会话 ID
2. 历史消息持久化
3. 最近上下文回放
4. 简单摘要压缩

## Phase 3: RAG

目标：让 agent 能基于外部知识源回答问题。

推荐接入点：

- `server/ai/rag`
- `server/storage`
- `features/chat` 中的来源展示

建议先做：

1. 文档切片
2. 向量检索
3. retrieval 注入 prompt
4. sources UI

## Phase 4: Planning

目标：支持多步骤任务拆解和执行。

推荐接入点：

- `server/ai/planners`
- `server/ai/tools`
- `features/chat` 中的计划展示

建议先做：

1. plan schema
2. 计划生成
3. 步骤执行
4. 执行状态回传 UI

## Phase 5: Multi-Agent

目标：支持多个 specialized agents 协作。

推荐接入点：

- `server/ai/agents`
- `server/ai/prompts`
- `features/chat` 的 agent 状态与结果展示

建议先做：

1. 主 agent / worker agent 分层
2. agent handoff 协议
3. 中间结果展示
4. 安全与失败回退

## Phase 6: Production Readiness

目标：让应用具备长期维护能力。

建议动作：

1. env 校验
2. 日志与 tracing
3. 限流与错误分级
4. 权限与审计
5. 测试与 CI

## Current Recommendation

如果你接下来要继续跟着 `docs/ai-agents-for-beginners/` 实现功能，建议先做这三件事：

1. 拆工具文件
2. 抽 prompts
3. 增加共享 types

这是当前投入最小、后续收益最大的整理。

