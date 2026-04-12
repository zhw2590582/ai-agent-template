# Roadmap

这份路线图只保留当前建议顺序，不复述已经完成的历史细节。

## Now

### 1. Memory

目标：让聊天从“演示骨架”变成“可持续使用”。

优先做：

1. 会话 ID
2. 消息持久化
3. 会话列表和切换
4. 最近上下文回放
5. 简单摘要压缩

推荐落点：

- `src/server/storage/`
- `src/server/ai/memory/`
- `src/features/chat/`

### 2. Provider 整理

目标：把当前较浅的模型配置整理成更可扩展的 provider abstraction。

优先做：

1. 统一模型定义
2. provider 配置和默认策略
3. 模型可用性检查
4. 失败回退策略

推荐落点：

- `src/server/ai/models.ts`
- `src/config/models.ts`

## Next

### 3. RAG

目标：让回答可以基于外部知识源。

优先做：

1. 文档切片
2. 向量存储
3. retrieval 注入
4. 来源展示 UI

### 4. 页面去占位化

目标：让导航中的关键页面变成真实页面，而不是 workbench 占位视图。

优先做：

1. `Models`
2. `Tools`
3. `Settings`

## Later

### 5. Planning

目标：支持多步骤任务拆解与执行。

### 6. Multi-Agent

目标：支持多个 specialized agents 协作。

### 7. Production Readiness

目标：补齐 tracing、权限、限流、审计、E2E。

## 当前不建议优先做

- 复杂多代理系统
- 过早引入数据库抽象层
- 为占位页面设计完整 UI 系统
- 在没有真实需求前引入重型 agent framework
