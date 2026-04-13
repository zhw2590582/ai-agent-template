# Roadmap

这份路线图只保留当前建议顺序，不复述已经完成的历史细节。

## Now

### 1. Memory

目标：让聊天从“可持久化演示骨架”变成“可持续使用”的助手。

优先做：

1. 会话摘要压缩
2. 长期偏好和用户记忆
3. 跨会话上下文注入
4. 可控的记忆写入和读取策略

推荐落点：

- `src/features/chat/server/`
- `src/features/chat/storage/`
- `src/features/memory/`

### 2. Provider / Models 整理

目标：把当前较浅的模型配置整理成更可扩展的 provider abstraction。

优先做：

1. 统一模型定义
2. provider 配置和默认策略
3. 模型可用性检查
4. 失败回退策略

推荐落点：

- `src/features/chat/ai/models.ts`
- `src/config/app.ts`
- 需要时再拆新的模型配置文件

## Next

### 3. 页面去占位化

目标：让导航中的关键页面变成真实页面，而不是 workbench 占位视图。

优先做：

1. `Models`
2. `Sandbox`
3. `MCP`
4. `Settings`

### 4. RAG

目标：让回答可以基于外部知识源。

优先做：

1. 文档切片
2. 向量存储
3. retrieval 注入
4. 来源展示 UI

## Later

### 5. Planning

目标：支持多步骤任务拆解与执行。

### 6. Multi-Agent / Subagent

目标：支持多个 specialized agents 协作。

### 7. Production Readiness

目标：补齐 tracing、权限、限流、审计、E2E。

## 当前不建议优先做

- 重写现有聊天主链路
- 过早引入数据库抽象层
- 为占位页面设计完整 UI 系统
- 在没有真实需求前引入重型 agent framework
- 在 provider 抽象未理顺前同时接太多模型供应商
